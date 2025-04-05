/**
 * BLACKSKY-MD Premium - Connection Keeper Module
 * 
 * This module prevents WhatsApp disconnections by:
 * 1. Implementing a heartbeat mechanism
 * 2. Detecting connection state changes
 * 3. Automatically reconnecting when needed
 * 4. Backing up and restoring sessions
 * 5. Implementing exponential backoff for reconnection attempts
 */

const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const { promisify } = require('util');
const execAsync = promisify(exec);

// Configuration options for connection keeper
const KEEPER_CONFIG = {
  // How often to check connection status (ms)
  checkInterval: 30000,
  
  // Maximum reconnection attempts before requiring intervention
  maxReconnectAttempts: 15,
  
  // Base delay for reconnection attempts (ms)
  reconnectBaseDelay: 3000,
  
  // Session backup interval (ms)
  backupInterval: 300000, // 5 minutes
  
  // Heartbeat message interval (ms) - prevents WhatsApp timeouts
  heartbeatInterval: 180000, // 3 minutes
  
  // Keep alive ping interval (ms) - keeps socket active
  keepAlivePingInterval: 50000, // 50 seconds
  
  // Session directory
  sessionDir: path.join(process.cwd(), 'sessions'),
  
  // Backup directory
  backupDir: path.join(process.cwd(), 'sessions', 'backup'),
  
  // Debug mode (verbose logging)
  debug: true
};

// Make sure backup directory exists
if (!fs.existsSync(KEEPER_CONFIG.backupDir)) {
  fs.mkdirSync(KEEPER_CONFIG.backupDir, { recursive: true });
}

// State tracking
let connectionState = {
  isConnected: false,
  lastConnected: 0,
  reconnectAttempts: 0,
  lastBackup: 0,
  isReconnecting: false,
  keeperActive: false,
  sessionExists: false
};

/**
 * Log a keeper message with timestamp
 * @param {string} message 
 * @param {string} type 
 */
function keeperLog(message, type = 'INFO') {
  const timestamp = new Date().toISOString();
  console.log(`[KEEPER][${type}][${timestamp}] ${message}`);
}

/**
 * Check if connection is active by checking user object
 * @returns {boolean}
 */
function isConnectionActive() {
  return !!(global.conn && global.conn.user);
}

/**
 * Backup session files
 * @returns {Promise<boolean>}
 */
async function backupSession() {
  try {
    if (!fs.existsSync(KEEPER_CONFIG.sessionDir)) {
      keeperLog('Sessions directory does not exist, creating...', 'WARN');
      fs.mkdirSync(KEEPER_CONFIG.sessionDir, { recursive: true });
      return false;
    }
    
    const sessionFiles = fs.readdirSync(KEEPER_CONFIG.sessionDir)
      .filter(file => file.endsWith('.json') && !file.includes('backup'));
    
    if (sessionFiles.length === 0) {
      keeperLog('No session files found to backup', 'WARN');
      return false;
    }
    
    const timestamp = Date.now();
    const backupPath = path.join(KEEPER_CONFIG.backupDir, `backup-${timestamp}`);
    
    if (!fs.existsSync(backupPath)) {
      fs.mkdirSync(backupPath, { recursive: true });
    }
    
    let copiedFiles = 0;
    
    // Copy each session file to backup directory
    for (const file of sessionFiles) {
      const sourcePath = path.join(KEEPER_CONFIG.sessionDir, file);
      const destPath = path.join(backupPath, file);
      
      fs.copyFileSync(sourcePath, destPath);
      copiedFiles++;
    }
    
    keeperLog(`Successfully backed up ${copiedFiles} session files to ${backupPath}`, 'SUCCESS');
    connectionState.lastBackup = Date.now();
    return true;
  } catch (error) {
    keeperLog(`Error backing up session: ${error.message}`, 'ERROR');
    return false;
  }
}

/**
 * Restore session from most recent backup
 * @returns {Promise<boolean>}
 */
async function restoreSession() {
  try {
    if (!fs.existsSync(KEEPER_CONFIG.backupDir)) {
      keeperLog('No backup directory found', 'ERROR');
      return false;
    }
    
    // Get all backup directories sorted by timestamp (newest first)
    const backupDirs = fs.readdirSync(KEEPER_CONFIG.backupDir)
      .filter(dir => dir.startsWith('backup-'))
      .sort((a, b) => {
        const timeA = parseInt(a.split('-')[1]);
        const timeB = parseInt(b.split('-')[1]);
        return timeB - timeA; // Descending order (newest first)
      });
    
    if (backupDirs.length === 0) {
      keeperLog('No backups found to restore', 'WARN');
      return false;
    }
    
    const latestBackup = backupDirs[0];
    const backupPath = path.join(KEEPER_CONFIG.backupDir, latestBackup);
    
    if (!fs.existsSync(backupPath)) {
      keeperLog(`Backup path ${backupPath} does not exist`, 'ERROR');
      return false;
    }
    
    const backupFiles = fs.readdirSync(backupPath)
      .filter(file => file.endsWith('.json'));
    
    if (backupFiles.length === 0) {
      keeperLog('No session files found in backup', 'WARN');
      return false;
    }
    
    // Ensure session directory exists
    if (!fs.existsSync(KEEPER_CONFIG.sessionDir)) {
      fs.mkdirSync(KEEPER_CONFIG.sessionDir, { recursive: true });
    }
    
    let restoredFiles = 0;
    
    // Copy each backup file to session directory
    for (const file of backupFiles) {
      const sourcePath = path.join(backupPath, file);
      const destPath = path.join(KEEPER_CONFIG.sessionDir, file);
      
      fs.copyFileSync(sourcePath, destPath);
      restoredFiles++;
    }
    
    keeperLog(`Successfully restored ${restoredFiles} session files from ${backupPath}`, 'SUCCESS');
    return true;
  } catch (error) {
    keeperLog(`Error restoring session: ${error.message}`, 'ERROR');
    return false;
  }
}

/**
 * Send a heartbeat message to prevent disconnections
 * This function sends a "ping" to WhatsApp servers to keep the connection alive
 */
async function sendHeartbeat() {
  if (!isConnectionActive()) {
    return;
  }
  
  try {
    // Use a method that doesn't need to send an actual message, just keep socket alive
    if (global.conn.sendPresenceUpdate) {
      await global.conn.sendPresenceUpdate('available', global.conn.user.id);
      
      if (KEEPER_CONFIG.debug) {
        keeperLog('Heartbeat sent successfully', 'DEBUG');
      }
    }
  } catch (error) {
    keeperLog(`Error sending heartbeat: ${error.message}`, 'ERROR');
  }
}

/**
 * Attempt to reconnect to WhatsApp
 * @returns {Promise<boolean>}
 */
async function attemptReconnect() {
  if (connectionState.isReconnecting) {
    return false;
  }
  
  connectionState.isReconnecting = true;
  
  try {
    connectionState.reconnectAttempts++;
    
    // Calculate backoff delay with jitter to prevent thundering herd problem
    const backoffFactor = Math.min(10, Math.pow(1.5, connectionState.reconnectAttempts));
    const jitter = 0.2 * Math.random() - 0.1; // ±10% jitter
    const delay = KEEPER_CONFIG.reconnectBaseDelay * backoffFactor * (1 + jitter);
    
    keeperLog(`Reconnection attempt ${connectionState.reconnectAttempts}/${KEEPER_CONFIG.maxReconnectAttempts} after ${Math.round(delay)}ms`, 'WARN');
    
    // Wait for backoff period
    await new Promise(resolve => setTimeout(resolve, delay));
    
    // First try to restore session if needed
    if (connectionState.reconnectAttempts % 3 === 1) { // Every 3rd attempt, try restore
      await restoreSession();
    }
    
    // Force reload handler (should trigger reconnection)
    if (typeof global.reloadHandler === 'function') {
      keeperLog('Calling reloadHandler() to reconnect...', 'INFO');
      const success = await global.reloadHandler(true);
      
      // Check if we're connected after reload attempt
      if (success && isConnectionActive()) {
        keeperLog('Successfully reconnected to WhatsApp!', 'SUCCESS');
        connectionState.isConnected = true;
        connectionState.lastConnected = Date.now();
        connectionState.reconnectAttempts = 0;
        connectionState.isReconnecting = false;
        return true;
      }
    }
    
    // If still not connected and max attempts reached, give up
    if (connectionState.reconnectAttempts >= KEEPER_CONFIG.maxReconnectAttempts) {
      keeperLog('Maximum reconnection attempts reached.', 'FATAL');
      connectionState.isReconnecting = false;
      return false;
    }
    
    // Still not connected but attempts remaining, schedule another attempt
    connectionState.isReconnecting = false;
    return false;
  } catch (error) {
    keeperLog(`Error during reconnection: ${error.message}`, 'ERROR');
    connectionState.isReconnecting = false;
    return false;
  }
}

/**
 * Check connection status and take appropriate action
 */
async function checkConnection() {
  const now = Date.now();
  const connected = isConnectionActive();
  
  // Update connection state
  if (connected && !connectionState.isConnected) {
    // Just connected
    keeperLog('WhatsApp connection established!', 'SUCCESS');
    connectionState.isConnected = true;
    connectionState.lastConnected = now;
    connectionState.reconnectAttempts = 0;
    
    // Backup session on successful connection
    await backupSession();
  } else if (!connected && connectionState.isConnected) {
    // Just disconnected
    keeperLog('WhatsApp connection lost!', 'ERROR');
    connectionState.isConnected = false;
    
    // Try to reconnect immediately
    attemptReconnect();
  } else if (connected) {
    // Still connected, check if it's time for maintenance tasks
    
    // Backup session periodically
    if (now - connectionState.lastBackup > KEEPER_CONFIG.backupInterval) {
      await backupSession();
    }
    
    // Send heartbeat to keep connection alive
    if (now - connectionState.lastConnected > KEEPER_CONFIG.heartbeatInterval) {
      await sendHeartbeat();
      connectionState.lastConnected = now;
    }
  } else if (!connected && !connectionState.isReconnecting) {
    // Still disconnected, try to reconnect if not already attempting
    attemptReconnect();
  }
}

/**
 * Start the connection keeper
 */
function startConnectionKeeper() {
  if (connectionState.keeperActive) {
    keeperLog('Connection keeper already running', 'WARN');
    return;
  }
  
  keeperLog('Starting WhatsApp connection keeper...', 'INFO');
  
  // Set up connection check interval
  const connectionCheckInterval = setInterval(checkConnection, KEEPER_CONFIG.checkInterval);
  
  // Set up heartbeat interval (separate, more frequent than connection check)
  const heartbeatInterval = setInterval(sendHeartbeat, KEEPER_CONFIG.heartbeatInterval);
  
  // Set up keep-alive ping (prevents socket timeout)
  const keepAlivePingInterval = setInterval(() => {
    if (global.conn && global.conn.ws) {
      if (typeof global.conn.ws.ping === 'function') {
        global.conn.ws.ping();
        if (KEEPER_CONFIG.debug) {
          keeperLog('Keep-alive ping sent', 'DEBUG');
        }
      }
    }
  }, KEEPER_CONFIG.keepAlivePingInterval);
  
  // Handle process exit
  process.on('exit', () => {
    keeperLog('Process exiting, cleaning up connection keeper...', 'INFO');
    clearInterval(connectionCheckInterval);
    clearInterval(heartbeatInterval);
    clearInterval(keepAlivePingInterval);
    backupSession().catch(err => keeperLog(`Error on exit backup: ${err.message}`, 'ERROR'));
  });
  
  // Set active flag
  connectionState.keeperActive = true;
  
  // Do initial connection check
  checkConnection();
  
  keeperLog('Connection keeper started successfully', 'SUCCESS');
}

// Run immediately if loaded directly
startConnectionKeeper();

// Export functions for use in other modules
module.exports = {
  startConnectionKeeper,
  backupSession,
  restoreSession,
  sendHeartbeat,
  checkConnection,
  isConnectionActive
};