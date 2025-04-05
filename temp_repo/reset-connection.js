/**
 * BLACKSKY-MD PREMIUM
 * Connection Reset Utility
 * 
 * This script completely resets the WhatsApp connection by:
 * 1. Backing up current sessions
 * 2. Completely removing all session files
 * 3. Initiating a fresh pairing with WhatsApp
 * 
 * Use this tool when experiencing persistent connection issues
 */

const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

// Configuration
const SESSIONS_DIR = path.join(__dirname, 'sessions');
const BACKUP_DIR = path.join(__dirname, 'sessions-backup');

// Create backup directory if it doesn't exist
if (!fs.existsSync(BACKUP_DIR)) {
    fs.mkdirSync(BACKUP_DIR, { recursive: true });
}

/**
 * Get formatted timestamp for backup directories
 */
function getTimestamp() {
    return new Date().toISOString().replace(/:/g, '-');
}

/**
 * Backup all session files
 */
function backupSessions() {
    console.log('⚙️ Creating backup of current sessions...');
    
    if (!fs.existsSync(SESSIONS_DIR)) {
        console.log('❌ No sessions directory found to backup');
        return false;
    }
    
    try {
        // Create timestamped backup directory
        const backupPath = path.join(BACKUP_DIR, `backup-${getTimestamp()}`);
        fs.mkdirSync(backupPath, { recursive: true });
        
        // Get all session files
        const files = fs.readdirSync(SESSIONS_DIR);
        let count = 0;
        
        for (const file of files) {
            if (file === 'backup' || path.extname(file) !== '.json') continue;
            
            const sourcePath = path.join(SESSIONS_DIR, file);
            const destPath = path.join(backupPath, file);
            
            fs.copyFileSync(sourcePath, destPath);
            count++;
        }
        
        console.log(`✅ Backed up ${count} session files to ${backupPath}`);
        return true;
    } catch (err) {
        console.error(`❌ Backup failed: ${err.message}`);
        return false;
    }
}

/**
 * Clean all session files
 */
function cleanSessions() {
    console.log('🧹 Cleaning all session files...');
    
    if (!fs.existsSync(SESSIONS_DIR)) {
        fs.mkdirSync(SESSIONS_DIR, { recursive: true });
        console.log('✅ Created new sessions directory');
        return true;
    }
    
    try {
        const files = fs.readdirSync(SESSIONS_DIR);
        let count = 0;
        
        for (const file of files) {
            if (file === 'backup' || path.extname(file) !== '.json') continue;
            
            const filePath = path.join(SESSIONS_DIR, file);
            fs.unlinkSync(filePath);
            count++;
        }
        
        console.log(`✅ Removed ${count} session files`);
        return true;
    } catch (err) {
        console.error(`❌ Cleaning sessions failed: ${err.message}`);
        return false;
    }
}

/**
 * Restart the bot
 */
function restartBot() {
    console.log('🔄 Restarting bot with pairing mode...');
    
    try {
        // Close current process
        console.log('👋 Closing current process...');
        
        // Start the new bot process with pairing flag
        setTimeout(() => {
            const args = ['index.js', '--pairing'];
            console.log(`🚀 Starting new process: node ${args.join(' ')}`);
            
            const child = spawn('node', args, {
                detached: true,
                stdio: 'inherit'
            });
            
            child.unref();
            
            console.log('✅ Bot restarted in pairing mode. You can close this window.');
            setTimeout(() => process.exit(0), 1000);
        }, 2000);
    } catch (err) {
        console.error(`❌ Failed to restart bot: ${err.message}`);
    }
}

/**
 * Main function
 */
async function main() {
    console.log('🌟 BLACKSKY-MD Premium Connection Reset 🌟');
    console.log('=========================================');
    
    // 1. Backup sessions
    backupSessions();
    
    // 2. Clean sessions
    cleanSessions();
    
    // 3. Restart bot
    restartBot();
}

// Run the main function
main().catch(err => {
    console.error(`❌ Unhandled error: ${err.message}`);
    process.exit(1);
});