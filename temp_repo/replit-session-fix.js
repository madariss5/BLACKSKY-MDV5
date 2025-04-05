/**
 * BLACKSKY-MD SESSION FIX FOR REPLIT
 * 
 * This script helps recover from session issues on Replit by:
 * 1. Detecting corrupted session files
 * 2. Cleaning up problematic session data
 * 3. Backing up and restoring sessions
 * 4. Fixing encryption key errors
 * 
 * Run with:
 * node replit-session-fix.js
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const SESSIONS_DIR = './sessions';
const BACKUP_DIR = './sessions/backup';

// Create backup directory if it doesn't exist
if (!fs.existsSync(BACKUP_DIR)) {
    fs.mkdirSync(BACKUP_DIR, { recursive: true });
}

/**
 * Get the current time formatted for logs
 */
function getTimestamp() {
    return new Date().toISOString();
}

/**
 * Log a message with timestamp
 */
function log(message, type = 'INFO') {
    console.log(`[${getTimestamp()}] [${type}] ${message}`);
}

/**
 * Back up the sessions directory
 */
function backupSessions() {
    const timestamp = new Date().toISOString().replace(/:/g, '-');
    const backupPath = path.join(BACKUP_DIR, `backup-${timestamp}`);
    
    if (!fs.existsSync(SESSIONS_DIR)) {
        log('No sessions directory found, nothing to backup', 'WARN');
        return false;
    }
    
    try {
        fs.mkdirSync(backupPath, { recursive: true });
        
        // Copy all session files to backup
        const files = fs.readdirSync(SESSIONS_DIR);
        let count = 0;
        
        for (const file of files) {
            if (file === 'backup' || !file.endsWith('.json')) continue;
            
            const sourcePath = path.join(SESSIONS_DIR, file);
            const destPath = path.join(backupPath, file);
            
            fs.copyFileSync(sourcePath, destPath);
            count++;
        }
        
        log(`Backed up ${count} session files to ${backupPath}`, 'SUCCESS');
        return true;
    } catch (err) {
        log(`Failed to backup sessions: ${err.message}`, 'ERROR');
        return false;
    }
}

/**
 * Check if a specific session file is valid JSON
 */
function isValidSessionFile(filePath) {
    try {
        const content = fs.readFileSync(filePath, 'utf8');
        JSON.parse(content);
        return true;
    } catch (err) {
        return false;
    }
}

/**
 * Clean up the sessions directory
 */
function cleanupSessions() {
    if (!fs.existsSync(SESSIONS_DIR)) {
        log('No sessions directory found, creating one', 'WARN');
        fs.mkdirSync(SESSIONS_DIR, { recursive: true });
        return;
    }
    
    // First backup current sessions
    backupSessions();
    
    try {
        const files = fs.readdirSync(SESSIONS_DIR);
        let removedCount = 0;
        let fixedCount = 0;
        
        for (const file of files) {
            if (file === 'backup' || !file.endsWith('.json')) continue;
            
            const filePath = path.join(SESSIONS_DIR, file);
            
            // Check if the file is corrupted
            if (!isValidSessionFile(filePath)) {
                log(`Found corrupted session file: ${file}`, 'WARN');
                
                try {
                    // Try to fix the file by removing the last line (common corruption pattern)
                    const content = fs.readFileSync(filePath, 'utf8');
                    const lines = content.split('\n');
                    
                    if (lines.length > 1) {
                        // Remove the last line which might be corrupted
                        const fixed = lines.slice(0, -1).join('\n');
                        
                        try {
                            // Check if removing the last line makes it valid JSON
                            JSON.parse(fixed);
                            
                            // If we get here, the JSON is valid, so save it
                            fs.writeFileSync(filePath, fixed);
                            log(`Fixed corrupted session file: ${file}`, 'SUCCESS');
                            fixedCount++;
                            continue;
                        } catch (fixErr) {
                            // Still not valid, we'll delete it below
                        }
                    }
                    
                    // If we couldn't fix it, delete it
                    fs.unlinkSync(filePath);
                    log(`Removed corrupted session file: ${file}`, 'WARN');
                    removedCount++;
                } catch (err) {
                    log(`Error handling corrupted file ${file}: ${err.message}`, 'ERROR');
                }
            }
        }
        
        log(`Session cleanup complete. Fixed: ${fixedCount}, Removed: ${removedCount}`, 'SUCCESS');
    } catch (err) {
        log(`Failed to cleanup sessions: ${err.message}`, 'ERROR');
    }
}

/**
 * Fix the credential file specifically
 */
function fixCredentialsFile() {
    const credsPath = path.join(SESSIONS_DIR, 'creds.json');
    
    if (!fs.existsSync(credsPath)) {
        log('No creds.json file found, nothing to fix', 'WARN');
        return false;
    }
    
    try {
        let creds = JSON.parse(fs.readFileSync(credsPath, 'utf8'));
        let modified = false;
        
        // Check for common issues with creds.json
        
        // 1. Fix for empty noiseKey
        if (!creds.noiseKey || !creds.noiseKey.private || !creds.noiseKey.public) {
            log('Found issue with noiseKey, fixing...', 'WARN');
            // We'll reset the credentials file entirely as partial fixes are risky
            modified = true;
        }
        
        // 2. Check for empty or null signedIdentityKey
        if (!creds.signedIdentityKey || !creds.signedIdentityKey.private || !creds.signedIdentityKey.public) {
            log('Found issue with signedIdentityKey, fixing...', 'WARN');
            modified = true;
        }
        
        // 3. Check for empty or null signedPreKey
        if (!creds.signedPreKey || !creds.signedPreKey.keyPair || !creds.signedPreKey.signature) {
            log('Found issue with signedPreKey, fixing...', 'WARN');
            modified = true;
        }
        
        // If issues found, we'll remove the file to let it regenerate
        if (modified) {
            // First make a special backup of just this file
            const backupPath = path.join(BACKUP_DIR, `creds-backup-${Date.now()}.json`);
            fs.copyFileSync(credsPath, backupPath);
            log(`Backed up problematic creds.json to ${backupPath}`, 'INFO');
            
            // Now remove the file
            fs.unlinkSync(credsPath);
            log('Removed problematic creds.json file, it will be regenerated on next start', 'SUCCESS');
            return true;
        } else {
            log('Credentials file appears to be valid', 'SUCCESS');
            return false;
        }
    } catch (err) {
        log(`Error fixing credentials file: ${err.message}`, 'ERROR');
        
        // If we can't even parse it, just remove it
        try {
            fs.unlinkSync(credsPath);
            log('Removed corrupted creds.json file, it will be regenerated on next start', 'WARN');
            return true;
        } catch (unlinkErr) {
            log(`Failed to remove corrupted creds.json: ${unlinkErr.message}`, 'ERROR');
            return false;
        }
    }
}

/**
 * Fix session files with counters (pre-keys)
 */
function fixSessionCounters() {
    if (!fs.existsSync(SESSIONS_DIR)) {
        log('No sessions directory found, nothing to fix', 'WARN');
        return;
    }
    
    try {
        const files = fs.readdirSync(SESSIONS_DIR);
        let fixedCount = 0;
        
        for (const file of files) {
            // Look for files like pre-key-1.json
            if (file === 'backup' || !file.startsWith('pre-key-') || !file.endsWith('.json')) continue;
            
            const filePath = path.join(SESSIONS_DIR, file);
            
            try {
                const content = fs.readFileSync(filePath, 'utf8');
                const data = JSON.parse(content);
                
                // Check if this is a pre-key with chain counters
                if (data.chains && Object.keys(data.chains).length > 0) {
                    let modified = false;
                    
                    // Check each chain for counter issues
                    for (const chainKey of Object.keys(data.chains)) {
                        const chain = data.chains[chainKey];
                        
                        // Look for chain counter issues (MessageCounterError)
                        if (chain.chainType === 1 && chain.counter < 1) {
                            log(`Found chain with invalid counter in ${file} (chain: ${chainKey})`, 'WARN');
                            // Fix by setting counter to 1
                            chain.counter = 1;
                            modified = true;
                        }
                    }
                    
                    if (modified) {
                        // Save the fixed file
                        fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
                        log(`Fixed chain counters in ${file}`, 'SUCCESS');
                        fixedCount++;
                    }
                }
            } catch (err) {
                log(`Error processing ${file}: ${err.message}`, 'ERROR');
            }
        }
        
        log(`Session counter fixes complete. Fixed: ${fixedCount} files`, 'SUCCESS');
    } catch (err) {
        log(`Failed to fix session counters: ${err.message}`, 'ERROR');
    }
}

/**
 * Main function
 */
async function main() {
    log('Starting session fix process...', 'INFO');
    
    // 1. Backup current sessions
    backupSessions();
    
    // 2. Clean up corrupted sessions
    cleanupSessions();
    
    // 3. Fix credentials file
    const credsFixed = fixCredentialsFile();
    
    // 4. Fix session counters (MessageCounterError)
    fixSessionCounters();
    
    log('Session fix process complete', 'SUCCESS');
    
    if (credsFixed) {
        log('IMPORTANT: Credentials file was reset. You will need to scan a new QR code on next start.', 'WARN');
    }
    
    return 0;
}

// Run the main function
main().then(exitCode => {
    process.exit(exitCode);
}).catch(err => {
    log(`Unhandled error: ${err.message}`, 'ERROR');
    process.exit(1);
});