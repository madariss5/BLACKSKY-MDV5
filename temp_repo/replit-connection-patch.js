/**
 * Replit-specific connection patch for WhatsApp bot
 * 
 * This module addresses several issues specific to running WhatsApp bots
 * on Replit:
 * 
 * 1. Connection stability issues due to Replit's unique networking
 * 2. Session persistence handling for Replit's ephemeral filesystem
 * 3. Connection recovery mechanisms to prevent disconnections
 * 4. Special keepalive system to maintain WhatsApp connectivity
 */

const fs = require('fs');
const path = require('path');
const os = require('os');
const http = require('http');
const { promisify } = require('util');
const { exec } = require('child_process');
const execAsync = promisify(exec);

// Configuration
const CONFIG = {
  // Session ID (same as in main config)
  sessionId: process.env.SESSION_ID || 'BLACKSKY-MD',
  
  // Session directory
  sessionDir: path.join(process.cwd(), 'sessions'),
  
  // Session backup file
  sessionBackupFile: path.join(process.cwd(), '.session-backup.json'),
  
  // Heartbeat interval (ms)
  heartbeatInterval: 50000,
  
  // Health check interval (ms)
  healthCheckInterval: 30000,
  
  // Debug mode
  debug: true
};

// State tracking
const STATE = {
  connectedSince: null,
  isConnected: false,
  connectionAttempts: 0,
  lastHeartbeat: 0,
  uptime: 0
};

// Log with timestamp for debugging
function log(message, type = 'INFO') {
  if (type !== 'DEBUG' || CONFIG.debug) {
    const timestamp = new Date().toISOString();
    console.log(`[REPLIT-PATCH][${type}][${timestamp}] ${message}`);
  }
}

// Apply monkey patches to the Baileys library once connection is established
function applyBaileysPatch(conn) {
  if (!conn) return false;
  
  try {
    // Patch the connection's logout function to prevent accidental disconnection
    if (typeof conn.logout === 'function') {
      const originalLogout = conn.logout;
      conn.logout = async function patchedLogout() {
        log('⚠️ Logout intercepted! This is usually not intended in a bot. Continuing operation.', 'WARN');
        return { success: false, reason: 'logout-prevented-by-patch' };
      };
      log('Applied logout protection patch', 'DEBUG');
    }
    
    // Patch the WebSocket ping to keep connection alive
    if (conn.ws && typeof conn.ws.on === 'function') {
      // Add an extra ping event to keep the connection alive
      const pingInterval = setInterval(() => {
        if (conn.ws && typeof conn.ws.ping === 'function') {
          try {
            conn.ws.ping();
            STATE.lastHeartbeat = Date.now();
            log('WebSocket ping sent', 'DEBUG');
          } catch (err) {
            log(`WebSocket ping error: ${err.message}`, 'ERROR');
          }
        }
      }, CONFIG.heartbeatInterval);
      
      // Clear interval on WebSocket close
      conn.ws.on('close', () => {
        clearInterval(pingInterval);
        log('WebSocket closed, cleared ping interval', 'DEBUG');
      });
      
      log('Applied WebSocket ping patch', 'DEBUG');
    }
    
    // Patch the ev (event) system to track connection status
    if (conn.ev) {
      conn.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect } = update;
        
        if (connection === 'open') {
          STATE.isConnected = true;
          STATE.connectedSince = Date.now();
          STATE.connectionAttempts = 0;
          log('🟢 Connection established', 'SUCCESS');
          
          // Backup session immediately on successful connection
          backupSessionFiles().catch(err => 
            log(`Session backup error: ${err.message}`, 'ERROR')
          );
        } else if (connection === 'close') {
          STATE.isConnected = false;
          
          // Get error code if available
          const statusCode = lastDisconnect?.error?.output?.statusCode;
          const logoutStatusCodes = [401, 403, 440];
          
          if (statusCode && logoutStatusCodes.includes(statusCode)) {
            log(`❌ Connection closed with auth error (${statusCode}). User may have logged out from phone.`, 'ERROR');
          } else {
            log(`❌ Connection closed. Automatic reconnection will be attempted.`, 'WARN');
          }
        }
      });
      
      log('Applied connection tracking patch', 'DEBUG');
    }
    
    return true;
  } catch (error) {
    log(`Error applying Baileys patches: ${error.message}`, 'ERROR');
    return false;
  }
}

/**
 * Backup session files
 */
async function backupSessionFiles() {
  try {
    if (!fs.existsSync(CONFIG.sessionDir)) {
      log(`Creating session directory: ${CONFIG.sessionDir}`, 'INFO');
      fs.mkdirSync(CONFIG.sessionDir, { recursive: true });
    }
    
    // Get all files in session directory
    const files = fs.readdirSync(CONFIG.sessionDir);
    const sessionFiles = files.filter(file => file.endsWith('.json') && !file.includes('backup'));
    
    if (sessionFiles.length === 0) {
      log('No session files found to backup', 'WARN');
      return;
    }
    
    // Create backup data object
    const backupData = {};
    
    for (const file of sessionFiles) {
      const filePath = path.join(CONFIG.sessionDir, file);
      try {
        const fileContent = fs.readFileSync(filePath, 'utf8');
        backupData[file] = fileContent;
      } catch (error) {
        log(`Error reading file ${file}: ${error.message}`, 'ERROR');
      }
    }
    
    // Save backup data
    fs.writeFileSync(CONFIG.sessionBackupFile, JSON.stringify(backupData, null, 2));
    log(`Successfully backed up ${Object.keys(backupData).length} session files`, 'SUCCESS');
  } catch (error) {
    log(`Error backing up session files: ${error.message}`, 'ERROR');
  }
}

/**
 * Restore session files from backup
 */
async function restoreSessionFiles() {
  try {
    if (!fs.existsSync(CONFIG.sessionBackupFile)) {
      log('No backup file found', 'WARN');
      return false;
    }
    
    const backupData = JSON.parse(fs.readFileSync(CONFIG.sessionBackupFile, 'utf8'));
    const files = Object.keys(backupData);
    
    if (files.length === 0) {
      log('Backup file contains no data', 'WARN');
      return false;
    }
    
    // Create session directory if it doesn't exist
    if (!fs.existsSync(CONFIG.sessionDir)) {
      fs.mkdirSync(CONFIG.sessionDir, { recursive: true });
    }
    
    // Restore each file
    for (const file of files) {
      const filePath = path.join(CONFIG.sessionDir, file);
      fs.writeFileSync(filePath, backupData[file]);
    }
    
    log(`Successfully restored ${files.length} session files`, 'SUCCESS');
    return true;
  } catch (error) {
    log(`Error restoring session files: ${error.message}`, 'ERROR');
    return false;
  }
}

// Set up a health check system
function setupHealthCheck() {
  setInterval(() => {
    try {
      // Basic system info
      const freeMem = os.freemem() / 1024 / 1024;
      const totalMem = os.totalmem() / 1024 / 1024;
      const memoryUsage = Math.round(((totalMem - freeMem) / totalMem) * 100);
      
      // Get process memory usage
      const processMemory = process.memoryUsage();
      const rssInMB = Math.round(processMemory.rss / 1024 / 1024);
      const heapInMB = Math.round(processMemory.heapUsed / 1024 / 1024);
      
      // Check session directory
      let sessionFiles = [];
      if (fs.existsSync(CONFIG.sessionDir)) {
        sessionFiles = fs.readdirSync(CONFIG.sessionDir)
          .filter(file => file.endsWith('.json'));
      }
      
      // Update uptime
      if (STATE.connectedSince) {
        STATE.uptime = Math.floor((Date.now() - STATE.connectedSince) / 1000);
      }
      
      // Log status
      log(`Health check - Memory: ${memoryUsage}% (Process: ${rssInMB}MB, Heap: ${heapInMB}MB), ` +
        `Connection: ${STATE.isConnected ? 'Connected' : 'Disconnected'}, ` +
        `Uptime: ${formatUptime(STATE.uptime)}, ` +
        `Session files: ${sessionFiles.length}`, 'DEBUG');
          
      // Backup session files periodically
      if (STATE.isConnected) {
        backupSessionFiles().catch(err => 
          log(`Error in periodic backup: ${err.message}`, 'ERROR')
        );
      }
      
    } catch (err) {
      log(`Health check error: ${err.message}`, 'ERROR');
    }
  }, CONFIG.healthCheckInterval);
  
  log('Health check system initialized', 'INFO');
}

// Format uptime for display
function formatUptime(seconds) {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  
  let result = '';
  if (days > 0) result += `${days}d `;
  if (hours > 0) result += `${hours}h `;
  if (minutes > 0) result += `${minutes}m `;
  result += `${secs}s`;
  
  return result;
}

// Register global patches and handlers
function registerGlobalHandlers() {
  // Listen for WhatsApp connection object 
  Object.defineProperty(global, 'conn', {
    set: function(newConn) {
      this._conn = newConn;
      
      // Apply patches when connection is set
      if (newConn) {
        log('WhatsApp connection object detected, applying patches...', 'INFO');
        applyBaileysPatch(newConn);
        
        // Add a property to indicate our patch was applied
        newConn.replitPatched = true;
      }
    },
    get: function() {
      return this._conn;
    },
    configurable: true
  });
  
  // Handle uncaught exceptions
  process.on('uncaughtException', err => {
    log(`Uncaught Exception: ${err.message}`, 'ERROR');
    log(err.stack, 'ERROR');
    
    // If it's a fatal error, try to backup sessions
    if (err.message.includes('FATAL') || 
        err.message.includes('Cannot read property') ||
        err.message.includes('undefined is not a function')) {
      backupSessionFiles().catch(e => 
        log(`Error backing up sessions after crash: ${e.message}`, 'ERROR')
      );
    }
  });
  
  // Handle unhandled promise rejections
  process.on('unhandledRejection', (reason, promise) => {
    log(`Unhandled Promise Rejection: ${reason}`, 'ERROR');
    
    // If it's a connection-related rejection, try to backup sessions
    if (reason && typeof reason === 'object' && 
        (reason.message?.includes('Connection') || 
         reason.message?.includes('WebSocket'))) {
      backupSessionFiles().catch(e => 
        log(`Error backing up sessions after rejection: ${e.message}`, 'ERROR')
      );
    }
  });
  
  log('Global handlers registered', 'INFO');
}

// Main initialization function
function initialize() {
  log('Initializing Replit connection patch...', 'INFO');
  
  // Restore session files first, if available
  restoreSessionFiles()
    .then(restored => {
      if (restored) {
        log('Session files restored from backup', 'SUCCESS');
      }
    })
    .catch(err => log(`Error restoring sessions: ${err.message}`, 'ERROR'));
  
  // Register global handlers for connection
  registerGlobalHandlers();
  
  // Start health check system
  setupHealthCheck();
  
  log('Replit connection patch initialized successfully', 'SUCCESS');
}

// Run initialization
initialize();