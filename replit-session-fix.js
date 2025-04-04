/**
 * BLACKSKY-MD Replit Session Fix
 * 
 * This script fixes session directory and file issues on Replit.
 * Replit has a unique filesystem behavior that requires session files
 * to be created in a specific way to maintain persistence.
 */

const fs = require('fs');
const path = require('path');

// Configuration
const CONFIG = {
  // Use environment variable SESSION_ID or default to BLACKSKY-MD
  sessionId: process.env.SESSION_ID || 'BLACKSKY-MD',
  
  // Session directories
  mainSessionDir: './sessions',
  backupSessionDir: './sessions/backup',
  
  // Critical session files that must exist
  criticalFiles: [
    'creds.json',
    'app-state.json'
  ]
};

// Function to ensure directory exists
function ensureDirectoryExists(dirPath) {
  if (!fs.existsSync(dirPath)) {
    console.log(`[SESSION FIX] Creating directory: ${dirPath}`);
    fs.mkdirSync(dirPath, { recursive: true });
    return true;
  }
  return false;
}

// Function to create basic session file structure
function createBasicSessionFile(filePath) {
  if (!fs.existsSync(filePath)) {
    console.log(`[SESSION FIX] Creating initial file: ${filePath}`);
    
    // Create different content based on file type
    let content = {};
    
    if (filePath.endsWith('creds.json')) {
      content = {
        noiseKey: null,
        signedIdentityKey: null,
        signedPreKey: null,
        registrationId: 0,
        advSecretKey: null,
        nextPreKeyId: 0,
        firstUnuploadedPreKeyId: 0,
        serverHasPreKeys: false,
        account: null,
        me: null,
        signalIdentities: [],
        lastAccountSyncTimestamp: 0,
        myAppStateKeyId: null
      };
    } else if (filePath.endsWith('app-state.json')) {
      content = {
        "keys": []
      };
    }
    
    // Write the file with proper JSON formatting
    fs.writeFileSync(filePath, JSON.stringify(content, null, 2));
    return true;
  }
  return false;
}

// Function to perform session fix
function fixReplicSessions() {
  console.log('[SESSION FIX] Starting session fix for Replit environment...');
  
  // Create main session directory
  ensureDirectoryExists(CONFIG.mainSessionDir);
  
  // Create backup directory
  ensureDirectoryExists(CONFIG.backupSessionDir);
  
  // Create critical files
  let createdFiles = 0;
  CONFIG.criticalFiles.forEach(fileName => {
    const filePath = path.join(CONFIG.mainSessionDir, fileName);
    if (createBasicSessionFile(filePath)) {
      createdFiles++;
    }
  });
  
  // Check if files were created
  if (createdFiles > 0) {
    console.log(`[SESSION FIX] Created ${createdFiles} critical session files`);
  } else {
    console.log('[SESSION FIX] All critical session files already exist');
  }
  
  // Set file permissions explicitly to ensure no permission issues
  try {
    CONFIG.criticalFiles.forEach(fileName => {
      const filePath = path.join(CONFIG.mainSessionDir, fileName);
      if (fs.existsSync(filePath)) {
        fs.chmodSync(filePath, 0o666); // rw-rw-rw-
      }
    });
    
    fs.chmodSync(CONFIG.mainSessionDir, 0o777); // rwxrwxrwx
    fs.chmodSync(CONFIG.backupSessionDir, 0o777); // rwxrwxrwx
    
    console.log('[SESSION FIX] Set permissions on session files and directories');
  } catch (err) {
    console.error('[SESSION FIX] Error setting permissions:', err.message);
  }
  
  console.log('[SESSION FIX] Session fix completed successfully');
  return true;
}

// Run immediately when loaded
fixReplicSessions();

// Export for importing in other modules
module.exports = {
  fixReplicSessions
};