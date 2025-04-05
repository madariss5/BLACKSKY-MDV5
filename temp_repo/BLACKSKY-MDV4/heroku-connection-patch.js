/**
 * Heroku-specific connection patch for WhatsApp bot
 * 
 * This module addresses several issues specific to running WhatsApp bots
 * on Heroku:
 * 
 * 1. Handling Heroku's ephemeral filesystem (sessions get wiped on dyno restart)
 * 2. Managing connections through Heroku's 24-hour dyno cycling
 * 3. Implementing PostgreSQL-backed session persistence
 * 4. Preventing disconnections due to Heroku's network characteristics
 * 5. Special keepalive mechanics for the Heroku environment
 */

const fs = require('fs');
const path = require('path');
const os = require('os');
const http = require('http');
const { promisify } = require('util');
const { exec } = require('child_process');
const { Pool } = require('pg');
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
  
  // PostgreSQL check interval (ms)
  pgBackupInterval: 300000, // 5 minutes
  
  // Debug mode
  debug: true,
  
  // Heroku app URL for keeping dyno alive
  herokuUrl: process.env.HEROKU_APP_URL || null,
  
  // DB connection (from Heroku DATABASE_URL)
  databaseUrl: process.env.DATABASE_URL || null
};

// State tracking
const STATE = {
  connectedSince: null,
  isConnected: false,
  connectionAttempts: 0,
  lastHeartbeat: 0,
  uptime: 0,
  lastPgBackup: 0
};

// PostgreSQL pool
let pgPool = null;

// Initialize PostgreSQL connection
function initPostgresPool() {
  if (!CONFIG.databaseUrl) {
    log('No DATABASE_URL provided, PostgreSQL session backup disabled', 'WARN');
    return null;
  }
  
  try {
    // Create a new Pool with SSL settings required by Heroku
    pgPool = new Pool({
      connectionString: CONFIG.databaseUrl,
      ssl: {
        rejectUnauthorized: false // Required for Heroku PostgreSQL
      }
    });
    
    log('PostgreSQL connection pool initialized', 'SUCCESS');
    
    // Test the connection
    pgPool.query('SELECT NOW()', (err, res) => {
      if (err) {
        log(`PostgreSQL connection error: ${err.message}`, 'ERROR');
      } else {
        log(`PostgreSQL connected successfully, time: ${res.rows[0].now}`, 'SUCCESS');
        
        // Create table if not exists
        createSessionTable().catch(err => 
          log(`Error creating session table: ${err.message}`, 'ERROR')
        );
      }
    });
    
    return pgPool;
  } catch (error) {
    log(`Error initializing PostgreSQL pool: ${error.message}`, 'ERROR');
    return null;
  }
}

// Create session table if it doesn't exist
async function createSessionTable() {
  if (!pgPool) return false;
  
  try {
    await pgPool.query(`
      CREATE TABLE IF NOT EXISTS whatsapp_sessions (
        id SERIAL PRIMARY KEY,
        session_id VARCHAR(255) NOT NULL,
        file_name VARCHAR(255) NOT NULL,
        file_data TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(session_id, file_name)
      )
    `);
    
    log('Session table created or confirmed existing', 'SUCCESS');
    return true;
  } catch (error) {
    log(`Error creating session table: ${error.message}`, 'ERROR');
    return false;
  }
}

// Log with timestamp for debugging
function log(message, type = 'INFO') {
  if (type !== 'DEBUG' || CONFIG.debug) {
    const timestamp = new Date().toISOString();
    console.log(`[HEROKU-PATCH][${type}][${timestamp}] ${message}`);
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
          backupSessionToPostgres().catch(err => 
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
 * Backup session files to PostgreSQL database
 * This is critical for Heroku as filesystem is ephemeral
 */
async function backupSessionToPostgres() {
  if (!pgPool) {
    log('PostgreSQL backup skipped - no connection pool', 'WARN');
    return false;
  }
  
  try {
    if (!fs.existsSync(CONFIG.sessionDir)) {
      log(`Creating session directory: ${CONFIG.sessionDir}`, 'INFO');
      fs.mkdirSync(CONFIG.sessionDir, { recursive: true });
      return false;
    }
    
    // Get all files in session directory
    const files = fs.readdirSync(CONFIG.sessionDir);
    const sessionFiles = files.filter(file => file.endsWith('.json') && !file.includes('backup'));
    
    if (sessionFiles.length === 0) {
      log('No session files found to backup', 'WARN');
      return false;
    }
    
    log(`Starting PostgreSQL backup of ${sessionFiles.length} session files...`, 'INFO');
    
    // Count of successfully backed up files
    let successCount = 0;
    
    // Use a transaction for all operations
    const client = await pgPool.connect();
    try {
      await client.query('BEGIN');
      
      for (const file of sessionFiles) {
        const filePath = path.join(CONFIG.sessionDir, file);
        try {
          const fileContent = fs.readFileSync(filePath, 'utf8');
          
          // Make sure file content is valid JSON
          JSON.parse(fileContent);
          
          // Insert or update file in database
          await client.query(`
            INSERT INTO whatsapp_sessions (session_id, file_name, file_data, updated_at)
            VALUES ($1, $2, $3, NOW())
            ON CONFLICT (session_id, file_name) 
            DO UPDATE SET 
              file_data = $3,
              updated_at = NOW()
          `, [CONFIG.sessionId, file, fileContent]);
          
          successCount++;
        } catch (error) {
          log(`Error backing up file ${file}: ${error.message}`, 'ERROR');
          // Continue with other files even if one fails
        }
      }
      
      await client.query('COMMIT');
      STATE.lastPgBackup = Date.now();
      
      log(`Successfully backed up ${successCount}/${sessionFiles.length} session files to PostgreSQL`, 'SUCCESS');
      return true;
    } catch (error) {
      await client.query('ROLLBACK');
      log(`Transaction error during PostgreSQL backup: ${error.message}`, 'ERROR');
      return false;
    } finally {
      client.release();
    }
  } catch (error) {
    log(`Error backing up sessions to PostgreSQL: ${error.message}`, 'ERROR');
    return false;
  }
}

/**
 * Restore session files from PostgreSQL database
 * Critical after Heroku dyno restarts
 */
async function restoreSessionFromPostgres() {
  if (!pgPool) {
    log('PostgreSQL restore skipped - no connection pool', 'WARN');
    return false;
  }
  
  try {
    log('Starting session restore from PostgreSQL...', 'INFO');
    
    // Create session directory if it doesn't exist
    if (!fs.existsSync(CONFIG.sessionDir)) {
      fs.mkdirSync(CONFIG.sessionDir, { recursive: true });
    }
    
    // Get all session files for this session ID
    const result = await pgPool.query(`
      SELECT file_name, file_data, updated_at
      FROM whatsapp_sessions
      WHERE session_id = $1
      ORDER BY updated_at DESC
    `, [CONFIG.sessionId]);
    
    if (result.rowCount === 0) {
      log('No session files found in PostgreSQL database', 'WARN');
      return false;
    }
    
    log(`Found ${result.rowCount} session files in database`, 'INFO');
    
    // Restore counter
    let restoredCount = 0;
    
    // Restore each file
    for (const row of result.rows) {
      const filePath = path.join(CONFIG.sessionDir, row.file_name);
      
      try {
        // Make sure the data is valid JSON
        const fileData = row.file_data;
        JSON.parse(fileData);
        
        // Write file to disk
        fs.writeFileSync(filePath, fileData);
        restoredCount++;
      } catch (error) {
        log(`Error restoring file ${row.file_name}: ${error.message}`, 'ERROR');
        // Continue with other files
      }
    }
    
    log(`Successfully restored ${restoredCount}/${result.rowCount} session files from PostgreSQL`, 'SUCCESS');
    return restoredCount > 0;
  } catch (error) {
    log(`Error restoring sessions from PostgreSQL: ${error.message}`, 'ERROR');
    return false;
  }
}

/**
 * Local file-based session backup
 * Used as secondary backup method
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
    log(`Successfully backed up ${Object.keys(backupData).length} session files locally`, 'SUCCESS');
  } catch (error) {
    log(`Error backing up session files locally: ${error.message}`, 'ERROR');
  }
}

/**
 * Restore session files from local backup
 * Fallback if PostgreSQL restore fails
 */
async function restoreSessionFiles() {
  try {
    if (!fs.existsSync(CONFIG.sessionBackupFile)) {
      log('No local backup file found', 'WARN');
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
    let successCount = 0;
    for (const file of files) {
      try {
        const filePath = path.join(CONFIG.sessionDir, file);
        fs.writeFileSync(filePath, backupData[file]);
        successCount++;
      } catch (error) {
        log(`Error restoring file ${file} from local backup: ${error.message}`, 'ERROR');
      }
    }
    
    log(`Successfully restored ${successCount}/${files.length} session files from local backup`, 'SUCCESS');
    return successCount > 0;
  } catch (error) {
    log(`Error restoring session files from local backup: ${error.message}`, 'ERROR');
    return false;
  }
}

/**
 * Anti-idle function to prevent Heroku dyno from sleeping
 * Only used when HEROKU_APP_URL is set
 */
function setupAntiIdle() {
  if (!CONFIG.herokuUrl) {
    log('Anti-idle system disabled - HEROKU_APP_URL not set', 'WARN');
    return;
  }
  
  // Clean up URL
  const url = CONFIG.herokuUrl.trim().replace(/\/$/, '');
  if (!url.startsWith('http')) {
    log(`Invalid HEROKU_APP_URL: ${url}`, 'ERROR');
    return;
  }
  
  // Set up ping every 20 minutes
  const pingInterval = 20 * 60 * 1000; // 20 minutes
  
  setInterval(() => {
    try {
      // Use built-in http module for simple GET request
      const pingUrl = `${url}/ping`;
      log(`Sending anti-idle ping to ${pingUrl}`, 'DEBUG');
      
      http.get(pingUrl, (res) => {
        const { statusCode } = res;
        log(`Anti-idle ping response: ${statusCode}`, 'DEBUG');
      }).on('error', (err) => {
        log(`Anti-idle ping error: ${err.message}`, 'ERROR');
      });
    } catch (error) {
      log(`Anti-idle ping error: ${error.message}`, 'ERROR');
    }
  }, pingInterval);
  
  log(`Anti-idle system started, pinging ${url}/ping every 20 minutes`, 'SUCCESS');
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
      
      // PostgreSQL backup check
      const now = Date.now();
      if (STATE.isConnected && pgPool && now - STATE.lastPgBackup > CONFIG.pgBackupInterval) {
        backupSessionToPostgres().catch(err => 
          log(`Error in periodic PostgreSQL backup: ${err.message}`, 'ERROR')
        );
      }
      
      // Local backup as fallback
      if (STATE.isConnected) {
        backupSessionFiles().catch(err => 
          log(`Error in periodic local backup: ${err.message}`, 'ERROR')
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
        newConn.herokuPatched = true;
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
      backupSessionToPostgres().catch(e => 
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
      backupSessionToPostgres().catch(e => 
        log(`Error backing up sessions after rejection: ${e.message}`, 'ERROR')
      );
    }
  });
  
  // Setup termination handlers for Heroku dyno cycling
  process.on('SIGTERM', async () => {
    log('SIGTERM received, Heroku is cycling dynos. Backing up sessions...', 'WARN');
    
    try {
      // First attempt to backup to PostgreSQL (preferred)
      await backupSessionToPostgres();
      
      // Then also do a local backup as fallback
      await backupSessionFiles();
      
      log('Session backup completed before shutdown', 'SUCCESS');
      
      // Safe exit
      process.exit(0);
    } catch (error) {
      log(`Error during shutdown backup: ${error.message}`, 'ERROR');
      process.exit(1);
    }
  });
  
  log('Global handlers registered', 'INFO');
}

// Create a simple HTTP endpoint for keeping dynos alive
function setupHealthEndpoint() {
  try {
    const express = require('express');
    const app = express();
    const port = process.env.PORT || 3000;
    
    // Basic health check endpoint
    app.get('/ping', (req, res) => {
      res.status(200).send({
        status: 'ok',
        timestamp: new Date().toISOString(),
        uptime: formatUptime(process.uptime()),
        connection: STATE.isConnected ? 'connected' : 'disconnected',
        connectionUptime: STATE.isConnected ? formatUptime(STATE.uptime) : '0s',
        memory: process.memoryUsage()
      });
    });
    
    // Start server
    app.listen(port, () => {
      log(`Health endpoint server running on port ${port}`, 'SUCCESS');
    });
  } catch (error) {
    log(`Error setting up health endpoint: ${error.message}`, 'ERROR');
  }
}

// Main initialization function
function initialize() {
  log('Initializing Heroku connection patch...', 'INFO');
  
  // Initialize PostgreSQL
  if (CONFIG.databaseUrl) {
    initPostgresPool();
  }
  
  // Restore sessions - first try PostgreSQL, then local backup as fallback
  restoreSessionFromPostgres()
    .then(restored => {
      if (restored) {
        log('Session files restored from PostgreSQL', 'SUCCESS');
      } else {
        return restoreSessionFiles();
      }
    })
    .then(restoredLocal => {
      if (restoredLocal) {
        log('Session files restored from local backup', 'SUCCESS');
      }
    })
    .catch(err => log(`Error restoring sessions: ${err.message}`, 'ERROR'));
  
  // Register global handlers for connection
  registerGlobalHandlers();
  
  // Setup health check system
  setupHealthCheck();
  
  // Setup anti-idle system if Heroku URL is provided
  setupAntiIdle();
  
  // Setup health endpoint server (also keeps dyno alive)
  setupHealthEndpoint();
  
  log('Heroku connection patch initialized successfully', 'SUCCESS');
}

// Run initialization
initialize();

// Export key functions for external use
module.exports = {
  backupSessionToPostgres,
  restoreSessionFromPostgres,
  backupSessionFiles,
  restoreSessionFiles
};