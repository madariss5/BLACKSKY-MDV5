/**
 * BLACKSKY-MD Premium - Enhanced Connection Fixer
 * 
 * This module strengthens WhatsApp connection in challenging environments like Termux
 * by implementing advanced connection recovery mechanisms.
 * 
 * Features:
 * - Automatic reconnection with exponential backoff
 * - Socket keep-alive mechanics
 * - Ping/Pong heartbeat system
 * - Connection state monitoring
 * - Graceful reconnection on network changes
 * - Memory cleanup during reconnection
 */

// Required modules
const { exec } = require('child_process');
const os = require('os');
const fs = require('fs');
const path = require('path');

// Check if running in Termux
const isTermux = os.platform() === 'android' || process.env.TERMUX === 'true';

// Configurable settings
const CONFIG = {
  // Heartbeat interval in milliseconds
  heartbeatInterval: 25000,
  
  // Connection check interval in milliseconds
  checkInterval: 30000,
  
  // Maximum reconnection attempts
  maxReconnectAttempts: 10,
  
  // Initial reconnect delay in milliseconds
  initialReconnectDelay: 5000,
  
  // Maximum reconnect delay in milliseconds (with exponential backoff)
  maxReconnectDelay: 60000,
  
  // Heartbeat contacts - will receive a "ping" message
  // These should be your own numbers or test contacts
  heartbeatContacts: [],
  
  // Enable logging to file
  logToFile: true,
  
  // Log file path
  logFile: './connection-fix-logs.txt',
  
  // Enable debug logging
  debug: true,
  
  // Session backup interval (minutes)
  sessionBackupInterval: 30,
};

// Global state tracking
const STATE = {
  connectionCount: 0,
  reconnectAttempts: 0,
  lastReconnectTime: 0,
  lastHeartbeatTime: 0,
  lastCheckTime: 0,
  currentDelay: CONFIG.initialReconnectDelay,
  isReconnecting: false,
  heartbeatTimer: null,
  checkTimer: null,
  watcher: null,
  // This will hold a reference to the Baileys connection
  conn: null,
};

/**
 * Log a message with timestamp and optional saving to file
 * @param {string} message - The message to log
 * @param {string} level - The log level (INFO, WARN, ERROR, DEBUG)
 */
function log(message, level = 'INFO') {
  const timestamp = new Date().toISOString();
  const logMsg = `[CONNECTION-FIX][${level}][${timestamp}] ${message}`;
  
  // Log to console
  switch (level) {
    case 'ERROR':
      console.error('\x1b[31m%s\x1b[0m', logMsg); // Red
      break;
    case 'WARN':
      console.warn('\x1b[33m%s\x1b[0m', logMsg); // Yellow
      break;
    case 'SUCCESS':
      console.log('\x1b[32m%s\x1b[0m', logMsg); // Green
      break;
    case 'DEBUG':
      if (CONFIG.debug) {
        console.log('\x1b[36m%s\x1b[0m', logMsg); // Cyan
      }
      break;
    default:
      console.log('\x1b[37m%s\x1b[0m', logMsg); // White
  }
  
  // Log to file if enabled
  if (CONFIG.logToFile) {
    try {
      fs.appendFileSync(CONFIG.logFile, `${logMsg}\n`);
    } catch (err) {
      // If directory doesn't exist, create it
      if (err.code === 'ENOENT') {
        try {
          const dir = path.dirname(CONFIG.logFile);
          if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
          }
          fs.appendFileSync(CONFIG.logFile, `${logMsg}\n`);
        } catch (e) {
          console.error('\x1b[31m%s\x1b[0m', `[CONNECTION-FIX][ERROR] Failed to write to log file: ${e.message}`);
        }
      } else {
        console.error('\x1b[31m%s\x1b[0m', `[CONNECTION-FIX][ERROR] Failed to write to log file: ${err.message}`);
      }
    }
  }
}

/**
 * Check if the connection is active
 * @returns {boolean} - Whether the connection is active
 */
function isConnectionActive() {
  try {
    const conn = STATE.conn;
    if (!conn) return false;
    
    // Check if user object exists and connection is open
    if (!conn.user || !conn.user.id) {
      log('Connection user object not found', 'DEBUG');
      return false;
    }
    
    // Check if the socket is available
    if (!conn.ws || conn.ws.readyState !== 1) {
      log(`WebSocket readyState: ${conn.ws ? conn.ws.readyState : 'undefined'}`, 'DEBUG');
      return false;
    }
    
    return true;
  } catch (error) {
    log(`Error checking connection: ${error.message}`, 'ERROR');
    return false;
  }
}

/**
 * Back up session files to prevent data loss
 */
async function backupSession() {
  try {
    const sessionsDir = path.join(process.cwd(), 'sessions');
    const backupDir = path.join(process.cwd(), 'sessions-backup');
    
    // Create backup directory if it doesn't exist
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }
    
    // Check if sessions directory exists
    if (!fs.existsSync(sessionsDir)) {
      log('No sessions directory found, skipping backup', 'WARN');
      return;
    }
    
    // Create a timestamped backup folder
    const timestamp = new Date().toISOString().replace(/:/g, '-');
    const backupFolder = path.join(backupDir, `backup-${timestamp}`);
    fs.mkdirSync(backupFolder, { recursive: true });
    
    // Copy all files from sessions to backup
    const files = fs.readdirSync(sessionsDir);
    for (const file of files) {
      const sourcePath = path.join(sessionsDir, file);
      const destPath = path.join(backupFolder, file);
      
      // Only backup files, not directories
      if (fs.statSync(sourcePath).isFile()) {
        fs.copyFileSync(sourcePath, destPath);
      }
    }
    
    // Also copy to the latest backup
    const latestBackupFolder = path.join(backupDir, 'latest');
    if (fs.existsSync(latestBackupFolder)) {
      fs.rmSync(latestBackupFolder, { recursive: true, force: true });
    }
    fs.mkdirSync(latestBackupFolder, { recursive: true });
    
    for (const file of files) {
      const sourcePath = path.join(sessionsDir, file);
      const destPath = path.join(latestBackupFolder, file);
      
      // Only backup files, not directories
      if (fs.statSync(sourcePath).isFile()) {
        fs.copyFileSync(sourcePath, destPath);
      }
    }
    
    log(`Session backup created in ${backupFolder}`, 'SUCCESS');
    
    // Keep only the 5 most recent backups to save space
    const backupFolders = fs.readdirSync(backupDir)
      .filter(f => f !== 'latest' && fs.statSync(path.join(backupDir, f)).isDirectory())
      .sort((a, b) => {
        return fs.statSync(path.join(backupDir, b)).mtime.getTime() - 
               fs.statSync(path.join(backupDir, a)).mtime.getTime();
      });
    
    if (backupFolders.length > 5) {
      for (let i = 5; i < backupFolders.length; i++) {
        const oldFolder = path.join(backupDir, backupFolders[i]);
        fs.rmSync(oldFolder, { recursive: true, force: true });
        log(`Removed old backup: ${oldFolder}`, 'DEBUG');
      }
    }
    
    return true;
  } catch (error) {
    log(`Error backing up session: ${error.message}`, 'ERROR');
    return false;
  }
}

/**
 * Restore session from backup if the current session is invalid
 */
async function restoreSession() {
  try {
    const sessionsDir = path.join(process.cwd(), 'sessions');
    const backupDir = path.join(process.cwd(), 'sessions-backup', 'latest');
    
    // Check if backup directory exists
    if (!fs.existsSync(backupDir)) {
      log('No backup directory found, skipping restore', 'WARN');
      return false;
    }
    
    // Create sessions directory if it doesn't exist
    if (!fs.existsSync(sessionsDir)) {
      fs.mkdirSync(sessionsDir, { recursive: true });
    }
    
    // Copy all files from backup to sessions
    const files = fs.readdirSync(backupDir);
    for (const file of files) {
      const sourcePath = path.join(backupDir, file);
      const destPath = path.join(sessionsDir, file);
      
      // Only restore files, not directories
      if (fs.statSync(sourcePath).isFile()) {
        fs.copyFileSync(sourcePath, destPath);
      }
    }
    
    log('Session restored from backup', 'SUCCESS');
    return true;
  } catch (error) {
    log(`Error restoring session: ${error.message}`, 'ERROR');
    return false;
  }
}

/**
 * Send a heartbeat message to keep the connection alive
 */
async function sendHeartbeat() {
  try {
    if (!isConnectionActive()) {
      log('Cannot send heartbeat: Connection not active', 'WARN');
      return false;
    }
    
    const conn = STATE.conn;
    
    // Method 1: Update presence status
    try {
      await conn.sendPresenceUpdate('available');
      log('Sent presence update as heartbeat', 'DEBUG');
    } catch (e) {
      log(`Failed to send presence update: ${e.message}`, 'DEBUG');
    }
    
    // Method 2: Send a ping to the server directly
    try {
      if (conn.ws && conn.ws.readyState === 1) {
        conn.ws.send(JSON.stringify(['admin', 'test']));
        log('Sent WebSocket ping as heartbeat', 'DEBUG');
      }
    } catch (e) {
      log(`Failed to send WebSocket ping: ${e.message}`, 'DEBUG');
    }
    
    // Method 3: Send a ping to specific contacts if configured
    if (CONFIG.heartbeatContacts.length > 0) {
      try {
        const contact = CONFIG.heartbeatContacts[
          Math.floor(Math.random() * CONFIG.heartbeatContacts.length)
        ];
        
        if (contact) {
          const chatId = contact.endsWith('@s.whatsapp.net') ? 
            contact : `${contact}@s.whatsapp.net`;
          
          // Send a very small message that deletes itself immediately
          await conn.sendMessage(chatId, {
            text: '.',
            edit: true
          }, { ephemeralExpiration: 1 });
          
          log(`Sent message heartbeat to ${chatId}`, 'DEBUG');
        }
      } catch (e) {
        log(`Failed to send message heartbeat: ${e.message}`, 'DEBUG');
      }
    }
    
    STATE.lastHeartbeatTime = Date.now();
    return true;
  } catch (error) {
    log(`Error sending heartbeat: ${error.message}`, 'ERROR');
    return false;
  }
}

/**
 * Attempt to reconnect to WhatsApp with exponential backoff
 */
async function attemptReconnect() {
  if (STATE.isReconnecting) {
    log('Already attempting to reconnect, skipping', 'DEBUG');
    return false;
  }
  
  try {
    STATE.isReconnecting = true;
    STATE.reconnectAttempts++;
    
    // Calculate delay with exponential backoff
    STATE.currentDelay = Math.min(
      CONFIG.initialReconnectDelay * Math.pow(1.5, STATE.reconnectAttempts - 1),
      CONFIG.maxReconnectDelay
    );
    
    log(`Attempt #${STATE.reconnectAttempts} to reconnect (delay: ${STATE.currentDelay}ms)...`, 'WARN');
    
    // Backup session before attempting reconnect
    await backupSession();
    
    // Force garbage collection if available
    if (global.gc) {
      log('Running garbage collection before reconnect', 'DEBUG');
      global.gc();
    }
    
    // Wait for the delay
    await new Promise(resolve => setTimeout(resolve, STATE.currentDelay));
    
    // Check if reload handler is available
    if (typeof global.reloadHandler === 'function') {
      log('Executing reloadHandler() to reconnect', 'INFO');
      global.reloadHandler(true);
      
      // Wait for connection to reestablish
      await new Promise(resolve => setTimeout(resolve, 5000));
      
      // Check if connection is now active
      if (isConnectionActive()) {
        log('Connection successfully reestablished', 'SUCCESS');
        STATE.reconnectAttempts = 0;
        STATE.currentDelay = CONFIG.initialReconnectDelay;
        STATE.isReconnecting = false;
        return true;
      }
    } else {
      log('reloadHandler not available, trying fallback methods', 'WARN');
      
      // Fallback: Try restarting the process using PM2 if available
      if (isTermux) {
        try {
          // Execute the reload command differently on Termux
          exec('pm2 restart blacksky-md || pm2 restart all || pm2 restart 0', (error) => {
            if (error) {
              log(`Failed to restart with PM2: ${error.message}`, 'ERROR');
            } else {
              log('Restarted process with PM2', 'SUCCESS');
            }
          });
        } catch (e) {
          log(`Error executing PM2 restart: ${e.message}`, 'ERROR');
        }
      }
    }
    
    // If maximum attempts reached, try to restore from backup
    if (STATE.reconnectAttempts >= CONFIG.maxReconnectAttempts) {
      log('Maximum reconnection attempts reached, trying to restore from backup', 'WARN');
      await restoreSession();
      STATE.reconnectAttempts = 0; // Reset attempts counter after restore
    }
    
    STATE.isReconnecting = false;
    STATE.lastReconnectTime = Date.now();
    return false;
  } catch (error) {
    log(`Error during reconnection attempt: ${error.message}`, 'ERROR');
    STATE.isReconnecting = false;
    return false;
  }
}

/**
 * Check connection status and take appropriate action
 */
async function checkConnection() {
  try {
    // Skip if too soon after last check
    const now = Date.now();
    if (now - STATE.lastCheckTime < 10000) {
      return;
    }
    
    STATE.lastCheckTime = now;
    
    // Check if connection is active
    if (!isConnectionActive()) {
      log('Connection appears to be closed. Attempting to reconnect...', 'WARN');
      await attemptReconnect();
      return;
    }
    
    // If active but no heartbeat sent in a while, send one
    if (now - STATE.lastHeartbeatTime > CONFIG.heartbeatInterval) {
      log('Sending keep-alive heartbeat', 'DEBUG');
      await sendHeartbeat();
    }
    
    // Backup sessions periodically
    if (now - STATE.lastBackupTime > CONFIG.sessionBackupInterval * 60 * 1000) {
      log('Running periodic session backup', 'DEBUG');
      await backupSession();
      STATE.lastBackupTime = now;
    }
  } catch (error) {
    log(`Error checking connection: ${error.message}`, 'ERROR');
  }
}

/**
 * Apply connection patch to WhatsApp bot
 * @param {Object} conn - The WhatsApp connection object
 */
function applyConnectionPatch(conn) {
  if (!conn) {
    log('No connection object provided, cannot apply patch', 'ERROR');
    return;
  }
  
  // Store the connection reference
  STATE.conn = conn;
  
  // Initialize state
  STATE.lastHeartbeatTime = Date.now();
  STATE.lastCheckTime = Date.now();
  STATE.lastBackupTime = Date.now();
  STATE.connectionCount++;
  
  log(`Applying connection patch (connection #${STATE.connectionCount})`, 'INFO');
  
  // Set up heartbeat timer
  if (STATE.heartbeatTimer) {
    clearInterval(STATE.heartbeatTimer);
  }
  
  STATE.heartbeatTimer = setInterval(() => {
    sendHeartbeat().catch(err => {
      log(`Heartbeat error: ${err.message}`, 'ERROR');
    });
  }, CONFIG.heartbeatInterval);
  
  // Set up connection check timer
  if (STATE.checkTimer) {
    clearInterval(STATE.checkTimer);
  }
  
  STATE.checkTimer = setInterval(() => {
    checkConnection().catch(err => {
      log(`Connection check error: ${err.message}`, 'ERROR');
    });
  }, CONFIG.checkInterval);
  
  // Enhance the connection's close handler
  const originalClose = conn.close;
  conn.close = async () => {
    log('Connection.close() called, cleaning up connection fix timers', 'INFO');
    
    // Clear timers
    if (STATE.heartbeatTimer) {
      clearInterval(STATE.heartbeatTimer);
      STATE.heartbeatTimer = null;
    }
    
    if (STATE.checkTimer) {
      clearInterval(STATE.checkTimer);
      STATE.checkTimer = null;
    }
    
    if (STATE.watcher) {
      STATE.watcher.close();
      STATE.watcher = null;
    }
    
    // Backup session before closing
    await backupSession();
    
    // Call original close method
    if (typeof originalClose === 'function') {
      return originalClose.call(conn);
    }
  };
  
  // Add event listeners for connection state
  conn.ev.on('connection.update', async (update) => {
    const { connection, lastDisconnect } = update;
    
    if (connection === 'close') {
      const statusCode = lastDisconnect?.error?.output?.statusCode;
      const reason = lastDisconnect?.error?.message || 'Unknown reason';
      
      log(`Connection closed with status ${statusCode}: ${reason}`, 'WARN');
      
      // Logoff was intentional, don't auto-reconnect
      if (statusCode === 428) {
        log('Intentional logout detected, not attempting to reconnect', 'INFO');
        return;
      }
      
      // Wait a moment before attempting reconnect
      setTimeout(() => {
        attemptReconnect().catch(err => {
          log(`Reconnect error: ${err.message}`, 'ERROR');
        });
      }, 5000);
    }
    
    if (connection === 'open') {
      log('Connection opened successfully', 'SUCCESS');
      STATE.reconnectAttempts = 0;
      STATE.currentDelay = CONFIG.initialReconnectDelay;
      
      // Send a heartbeat right away
      setTimeout(() => {
        sendHeartbeat().catch(err => {
          log(`Initial heartbeat error: ${err.message}`, 'ERROR');
        });
      }, 5000);
    }
  });
  
  // Additional connection handling for Termux
  if (isTermux) {
    log('Applying Termux-specific connection enhancements', 'INFO');
    
    // Watch network changes in Termux
    try {
      const networkCheckInterval = setInterval(() => {
        exec('ping -c 1 8.8.8.8', (error) => {
          const hadNetwork = global.networkAvailable;
          const hasNetwork = !error;
          
          // Update global network state
          global.networkAvailable = hasNetwork;
          
          // If network transitioned from unavailable to available, trigger reconnect
          if (!hadNetwork && hasNetwork) {
            log('Network connection recovered, triggering reconnect', 'INFO');
            setTimeout(() => {
              attemptReconnect().catch(err => {
                log(`Network change reconnect error: ${err.message}`, 'ERROR');
              });
            }, 5000);
          }
          
          // If network is gone, log this but don't try reconnecting yet
          if (hadNetwork && !hasNetwork) {
            log('Network connection lost, waiting for recovery', 'WARN');
          }
        });
      }, 60000); // Check every minute
      
      // Clean up on unload
      process.on('exit', () => {
        clearInterval(networkCheckInterval);
      });
    } catch (e) {
      log(`Failed to set up network monitoring: ${e.message}`, 'WARN');
    }
  }
  
  // Watch session directory for changes
  try {
    const sessionsDir = path.join(process.cwd(), 'sessions');
    if (fs.existsSync(sessionsDir)) {
      STATE.watcher = fs.watch(sessionsDir, (eventType, filename) => {
        if (filename === 'creds.json' && eventType === 'change') {
          log('creds.json changed, backing up session', 'DEBUG');
          backupSession().catch(err => {
            log(`Session backup error: ${err.message}`, 'ERROR');
          });
        }
      });
    }
  } catch (e) {
    log(`Failed to set up session watcher: ${e.message}`, 'WARN');
  }
  
  log('Connection patch applied successfully', 'SUCCESS');
  return true;
}

// Export the connection patch function
module.exports = {
  applyConnectionPatch,
  sendHeartbeat,
  checkConnection,
  backupSession,
  restoreSession,
  isConnectionActive,
  isTermux
};