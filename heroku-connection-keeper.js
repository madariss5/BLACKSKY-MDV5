/**
 * BLACKSKY-MD Premium - Heroku Connection Keeper
 * 
 * This module ensures 24/7 operation on Heroku by:
 * 1. Implementing advanced connection stability mechanisms
 * 2. Utilizing PostgreSQL for session persistence across dyno cycles
 * 3. Managing automatic reconnection with exponential backoff
 * 4. Preventing dyno sleeping with anti-idle system
 * 5. Handling graceful recovery from connection issues
 * 6. Implementing proactive connection monitoring
 */

const fs = require('fs');
const path = require('path');
const http = require('http');
const https = require('https');
const express = require('express');
const { Pool } = require('pg');
const { delay } = require('@adiwajshing/baileys');
const crypto = require('crypto');

// Configuration
const CONFIG = {
  // Connection check intervals
  heartbeatInterval: 45 * 1000, // 45 seconds
  connectionCheckInterval: 30 * 1000, // 30 seconds
  
  // Exponential backoff settings
  initialBackoffDelay: 3000, // 3 seconds
  maxBackoffDelay: 60 * 1000, // 60 seconds
  backoffFactor: 1.5,
  maxReconnectAttempts: 15,
  
  // Session backup settings
  backupInterval: 15 * 60 * 1000, // 15 minutes
  
  // Anti-idle settings
  healthCheckPort: process.env.HEALTH_CHECK_PORT || 28111,
  antiIdleInterval: 20 * 60 * 1000, // 20 minutes
};

// Global state
const STATE = {
  postgresPool: null,
  lastHeartbeatTime: null,
  lastBackupTime: null,
  connectionLostTime: null,
  reconnectAttempts: 0,
  backoffDelay: CONFIG.initialBackoffDelay,
  healthCheckServer: null,
  intervalIds: {
    heartbeat: null,
    connectionCheck: null,
    backup: null,
    antiIdle: null
  }
};

/**
 * Log keeper message with timestamp
 * @param {string} message 
 * @param {string} type 
 */
function log(message, type = 'INFO') {
  const timestamp = new Date().toISOString();
  console.log(`[HEROKU-KEEPER][${type}][${timestamp}] ${message}`);
}

/**
 * Initialize PostgreSQL pool
 */
function initPostgresPool() {
  try {
    if (process.env.DATABASE_URL) {
      STATE.postgresPool = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: {
          rejectUnauthorized: false // Required for Heroku
        },
        max: 5, // Maximum number of connections
        idleTimeoutMillis: 30000, // Close idle connections after 30 seconds
        connectionTimeoutMillis: 10000, // 10 seconds to establish connection
      });
      
      // Test the connection
      STATE.postgresPool.query('SELECT NOW()', (err, res) => {
        if (err) {
          log(`PostgreSQL connection error: ${err.message}`, 'ERROR');
        } else {
          log(`PostgreSQL connection successful: ${res.rows[0].now}`, 'SUCCESS');
        }
      });
      
      log('PostgreSQL pool initialized', 'INFO');
    } else {
      log('No DATABASE_URL environment variable found, PostgreSQL backup disabled', 'WARN');
    }
  } catch (err) {
    log(`Error initializing PostgreSQL pool: ${err.message}`, 'ERROR');
  }
}

/**
 * Create session table if it doesn't exist
 */
async function createSessionTable() {
  if (!STATE.postgresPool) return false;
  
  try {
    await STATE.postgresPool.query(`
      CREATE TABLE IF NOT EXISTS whatsapp_sessions (
        id SERIAL PRIMARY KEY,
        session_id VARCHAR(255) NOT NULL,
        session_data JSONB NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      
      CREATE INDEX IF NOT EXISTS idx_whatsapp_sessions_session_id ON whatsapp_sessions(session_id);
    `);
    
    log('Session table created or verified', 'SUCCESS');
    return true;
  } catch (err) {
    log(`Error creating session table: ${err.message}`, 'ERROR');
    return false;
  }
}

/**
 * Back up session files to PostgreSQL database
 * This is critical for Heroku as filesystem is ephemeral
 */
async function backupSessionToDatabase() {
  if (!STATE.postgresPool) return false;
  
  try {
    // Create table if it doesn't exist
    await createSessionTable();
    
    // Get all session files
    const sessionDir = path.join(process.cwd(), 'sessions');
    if (!fs.existsSync(sessionDir)) {
      log('Sessions directory does not exist, nothing to backup', 'WARN');
      return false;
    }
    
    const files = fs.readdirSync(sessionDir).filter(file => 
      file !== 'creds.json' && 
      !file.endsWith('.bak') && 
      !file.endsWith('.old')
    );
    
    // Start a transaction
    const client = await STATE.postgresPool.connect();
    try {
      await client.query('BEGIN');
      
      let count = 0;
      for (const file of files) {
        const filePath = path.join(sessionDir, file);
        if (fs.statSync(filePath).isDirectory()) continue;
        
        try {
          const fileContent = fs.readFileSync(filePath, 'utf8');
          let sessionData;
          
          // Try to parse as JSON
          try {
            sessionData = JSON.parse(fileContent);
          } catch (parseErr) {
            // If it's not valid JSON, store as binary data in a JSON wrapper
            sessionData = { 
              type: 'binary', 
              data: fileContent.toString('base64') 
            };
          }
          
          const sessionId = file.replace('.json', '');
          
          // Upsert the session data
          await client.query(`
            INSERT INTO whatsapp_sessions (session_id, session_data, updated_at)
            VALUES ($1, $2, NOW())
            ON CONFLICT (session_id) 
            DO UPDATE SET session_data = $2, updated_at = NOW()
          `, [sessionId, sessionData]);
          
          count++;
        } catch (fileErr) {
          log(`Error processing file ${file}: ${fileErr.message}`, 'ERROR');
        }
      }
      
      await client.query('COMMIT');
      log(`Backed up ${count} session files to PostgreSQL database`, 'SUCCESS');
      STATE.lastBackupTime = Date.now();
      return true;
    } catch (err) {
      await client.query('ROLLBACK');
      log(`Error backing up sessions to database: ${err.message}`, 'ERROR');
      return false;
    } finally {
      client.release();
    }
  } catch (err) {
    log(`Error in backupSessionToDatabase: ${err.message}`, 'ERROR');
    return false;
  }
}

/**
 * Restore session files from PostgreSQL database
 * Critical after Heroku dyno restarts
 */
async function restoreSessionFromDatabase() {
  if (!STATE.postgresPool) return false;
  
  try {
    // Create sessions directory if it doesn't exist
    const sessionDir = path.join(process.cwd(), 'sessions');
    if (!fs.existsSync(sessionDir)) {
      fs.mkdirSync(sessionDir, { recursive: true });
    }
    
    // Get all session data from database
    const result = await STATE.postgresPool.query(`
      SELECT session_id, session_data FROM whatsapp_sessions 
      ORDER BY updated_at DESC
    `);
    
    if (result.rows.length === 0) {
      log('No sessions found in database', 'WARN');
      return false;
    }
    
    let count = 0;
    for (const row of result.rows) {
      try {
        const { session_id, session_data } = row;
        const filePath = path.join(sessionDir, `${session_id}.json`);
        
        // Ensure parent directory exists
        const dir = path.dirname(filePath);
        if (!fs.existsSync(dir)) {
          fs.mkdirSync(dir, { recursive: true });
        }
        
        // Handle binary data if stored in that format
        if (session_data && session_data.type === 'binary' && session_data.data) {
          // Convert base64 back to binary
          const binaryData = Buffer.from(session_data.data, 'base64');
          fs.writeFileSync(filePath, binaryData);
        } else {
          // Write JSON data
          fs.writeFileSync(filePath, JSON.stringify(session_data, null, 2));
        }
        
        count++;
      } catch (err) {
        log(`Error restoring session ${row.session_id}: ${err.message}`, 'ERROR');
      }
    }
    
    log(`Successfully restored ${count} session files from database`, 'SUCCESS');
    return count > 0;
  } catch (err) {
    log(`Error restoring sessions from database: ${err.message}`, 'ERROR');
    return false;
  }
}

/**
 * Local file-based session backup
 * Used as secondary backup method
 */
async function backupSessionFiles() {
  try {
    // Create backup directory if it doesn't exist
    const backupDir = path.join(process.cwd(), 'sessions-backup', `backup-${Date.now()}`);
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }
    
    // Get all session files
    const sessionDir = path.join(process.cwd(), 'sessions');
    if (!fs.existsSync(sessionDir)) {
      log('Sessions directory does not exist, nothing to backup', 'WARN');
      return false;
    }
    
    const files = fs.readdirSync(sessionDir).filter(file => 
      !file.endsWith('.bak') && 
      !file.endsWith('.old')
    );
    
    if (files.length === 0) {
      log('No session files found, nothing to backup', 'WARN');
      return false;
    }
    
    // Copy files to backup directory
    let count = 0;
    for (const file of files) {
      const srcPath = path.join(sessionDir, file);
      if (fs.statSync(srcPath).isDirectory()) continue;
      
      const destPath = path.join(backupDir, file);
      fs.copyFileSync(srcPath, destPath);
      count++;
    }
    
    log(`Backed up ${count} session files to ${backupDir}`, 'SUCCESS');
    STATE.lastBackupTime = Date.now();
    
    // Clean old backups (keep last 5)
    const backupsRoot = path.join(process.cwd(), 'sessions-backup');
    const backups = fs.readdirSync(backupsRoot)
      .filter(dir => dir.startsWith('backup-'))
      .map(dir => path.join(backupsRoot, dir))
      .sort((a, b) => fs.statSync(b).mtime.getTime() - fs.statSync(a).mtime.getTime());
    
    // Remove old backups (keep most recent 5)
    for (let i = 5; i < backups.length; i++) {
      try {
        fs.rmdirSync(backups[i], { recursive: true });
        log(`Removed old backup: ${backups[i]}`, 'INFO');
      } catch (err) {
        log(`Failed to remove old backup ${backups[i]}: ${err.message}`, 'WARN');
      }
    }
    
    return true;
  } catch (err) {
    log(`Error backing up session files: ${err.message}`, 'ERROR');
    return false;
  }
}

/**
 * Restore session files from local backup
 * Fallback if PostgreSQL restore fails
 */
async function restoreSessionFiles() {
  try {
    // Find most recent backup
    const backupsRoot = path.join(process.cwd(), 'sessions-backup');
    if (!fs.existsSync(backupsRoot)) {
      log('No backups directory found', 'WARN');
      return false;
    }
    
    const backups = fs.readdirSync(backupsRoot)
      .filter(dir => dir.startsWith('backup-'))
      .map(dir => path.join(backupsRoot, dir))
      .sort((a, b) => fs.statSync(b).mtime.getTime() - fs.statSync(a).mtime.getTime());
    
    if (backups.length === 0) {
      log('No backup directories found', 'WARN');
      return false;
    }
    
    const latestBackup = backups[0];
    const files = fs.readdirSync(latestBackup);
    
    if (files.length === 0) {
      log(`Latest backup ${latestBackup} is empty`, 'WARN');
      return false;
    }
    
    // Create sessions directory if it doesn't exist
    const sessionDir = path.join(process.cwd(), 'sessions');
    if (!fs.existsSync(sessionDir)) {
      fs.mkdirSync(sessionDir, { recursive: true });
    }
    
    // Copy files from backup to sessions directory
    let count = 0;
    for (const file of files) {
      const srcPath = path.join(latestBackup, file);
      if (fs.statSync(srcPath).isDirectory()) continue;
      
      const destPath = path.join(sessionDir, file);
      fs.copyFileSync(srcPath, destPath);
      count++;
    }
    
    log(`Successfully restored ${count} session files from ${latestBackup}`, 'SUCCESS');
    return true;
  } catch (err) {
    log(`Error restoring session files: ${err.message}`, 'ERROR');
    return false;
  }
}

/**
 * Check if the connection is currently active
 * @param {Object} conn - Baileys connection object
 * @returns {boolean} - Whether the connection is active
 */
function isConnectionActive(conn) {
  try {
    if (!conn) return false;
    
    // Check if user is available (means connected)
    if (!conn.user) return false;
    
    // Check if last received message was too long ago
    const lastReceiveTimestamp = conn.lastReceivedMsg?.messageTimestamp;
    if (lastReceiveTimestamp) {
      const now = Date.now() / 1000; // Convert to seconds
      const elapsed = now - lastReceiveTimestamp;
      
      // If no message received in 10 minutes, consider connection dead
      if (elapsed > 600) {
        log(`No messages received in ${Math.round(elapsed)}s, connection may be stale`, 'WARN');
        return false;
      }
    }
    
    return true;
  } catch (err) {
    log(`Error checking connection status: ${err.message}`, 'ERROR');
    return false;
  }
}

/**
 * Check connection status and reconnect if needed
 * @param {Object} conn - Baileys connection object
 */
async function checkConnection(conn) {
  try {
    if (!conn) {
      log('No connection object available', 'WARN');
      return;
    }
    
    // Check if connection is active
    const isActive = isConnectionActive(conn);
    if (!isActive) {
      if (!STATE.connectionLostTime) {
        STATE.connectionLostTime = Date.now();
        log('Connection lost, will attempt to reconnect', 'WARN');
      }
      
      // Time since connection was lost
      const downtime = Date.now() - STATE.connectionLostTime;
      log(`Connection has been down for ${Math.round(downtime / 1000)} seconds`, 'WARN');
      
      // Attempt to reconnect
      await attemptReconnect(conn);
    } else {
      // Reset connection state if previously lost
      if (STATE.connectionLostTime) {
        const downtime = Date.now() - STATE.connectionLostTime;
        log(`Connection restored after ${Math.round(downtime / 1000)} seconds downtime`, 'SUCCESS');
        
        STATE.connectionLostTime = null;
        STATE.reconnectAttempts = 0;
        STATE.backoffDelay = CONFIG.initialBackoffDelay;
        
        // Schedule a backup after reconnection
        backupSessionToDatabase().catch(err => 
          log(`Error backing up after reconnection: ${err.message}`, 'ERROR')
        );
      }
    }
  } catch (err) {
    log(`Error in checkConnection: ${err.message}`, 'ERROR');
  }
}

/**
 * Attempt to reconnect with exponential backoff
 * @param {Object} conn - Baileys connection object
 */
async function attemptReconnect(conn) {
  try {
    if (STATE.reconnectAttempts >= CONFIG.maxReconnectAttempts) {
      log('Maximum reconnection attempts reached', 'FATAL');
      
      // Try aggressive recovery measures
      log('Attempting aggressive recovery...', 'INFO');
      
      // First, backup current (possibly corrupted) sessions
      await backupSessionFiles();
      
      // Then try restoring from database
      const databaseRestoreSuccess = await restoreSessionFromDatabase();
      
      // If database restore failed, try file backup
      if (!databaseRestoreSuccess) {
        log('Database restore failed, trying file backup', 'WARN');
        await restoreSessionFiles();
      }
      
      // Reset connection state
      STATE.connectionLostTime = null;
      STATE.reconnectAttempts = 0;
      STATE.backoffDelay = CONFIG.initialBackoffDelay;
      
      // Force restart the connection
      if (typeof conn.ev?.emit === 'function') {
        conn.ev.emit('connection.update', { 
          connection: 'close', 
          lastDisconnect: {
            error: new Error('Manual restart after max reconnection attempts')
          }
        });
      }
      
      return;
    }
    
    STATE.reconnectAttempts++;
    const delay = STATE.backoffDelay;
    
    log(`Reconnection attempt ${STATE.reconnectAttempts}/${CONFIG.maxReconnectAttempts} after ${delay}ms`, 'WARN');
    
    // Wait for backoff delay
    await new Promise(resolve => setTimeout(resolve, delay));
    
    // Increase backoff delay for next attempt, with maximum
    STATE.backoffDelay = Math.min(
      STATE.backoffDelay * CONFIG.backoffFactor,
      CONFIG.maxBackoffDelay
    );
    
    // Try to send a message to trigger reconnection
    await sendHeartbeat(conn);
    
    // Every 5 attempts, try restoring sessions
    if (STATE.reconnectAttempts % 5 === 0) {
      log('Multiple reconnection attempts failed, trying to restore sessions', 'WARN');
      await restoreSessionFromDatabase();
    }
  } catch (err) {
    log(`Error in attemptReconnect: ${err.message}`, 'ERROR');
  }
}

/**
 * Send a heartbeat to keep the connection alive
 * @param {Object} conn - Baileys connection object
 */
async function sendHeartbeat(conn) {
  try {
    if (!conn || !conn.user) {
      log('No active connection for heartbeat', 'WARN');
      return;
    }
    
    // Try to read "self" (your own contacts) as a simple heartbeat
    if (typeof conn.contacts === 'function') {
      await conn.contacts();
      log('Heartbeat sent: contacts', 'DEBUG');
    } else {
      // Fallback method
      await delay(100);
      if (typeof conn.user === 'object') {
        const selfJid = conn.user.id;
        if (typeof conn.profilePictureUrl === 'function') {
          try {
            await conn.profilePictureUrl(selfJid);
            log('Heartbeat sent: profilePicture', 'DEBUG');
          } catch (e) {
            log(`Heartbeat error: ${e.message}`, 'WARN');
          }
        }
      }
    }
    
    STATE.lastHeartbeatTime = Date.now();
  } catch (err) {
    log(`Error sending heartbeat: ${err.message}`, 'ERROR');
  }
}

/**
 * Anti-idle function to prevent Heroku dyno from sleeping
 * Only used when HEROKU_APP_URL is set
 */
function setupAntiIdle() {
  if (!process.env.HEROKU_APP_URL) {
    log('No HEROKU_APP_URL set, anti-idle disabled', 'INFO');
    return;
  }
  
  const appUrl = process.env.HEROKU_APP_URL;
  
  // Set up interval to ping the app URL
  STATE.intervalIds.antiIdle = setInterval(() => {
    try {
      log(`Pinging ${appUrl} to prevent idle...`, 'DEBUG');
      
      https.get(appUrl, (res) => {
        const statusCode = res.statusCode;
        if (statusCode !== 200) {
          log(`Anti-idle ping received non-200 response: ${statusCode}`, 'WARN');
        } else {
          log('Anti-idle ping successful', 'DEBUG');
        }
      }).on('error', (err) => {
        log(`Anti-idle ping error: ${err.message}`, 'ERROR');
      });
    } catch (err) {
      log(`Error in anti-idle: ${err.message}`, 'ERROR');
    }
  }, CONFIG.antiIdleInterval);
  
  log(`Anti-idle setup for ${appUrl} every ${CONFIG.antiIdleInterval / 60000} minutes`, 'INFO');
}

/**
 * Set up health check endpoint for Heroku
 */
// Track if health check server has been initialized
let healthCheckServerInitialized = false;
let healthCheckServer = null;

function setupHealthCheck() {
  // Skip if already initialized to prevent port conflicts
  if (healthCheckServerInitialized) {
    log('Health check server already initialized, skipping duplicate initialization', 'INFO');
    return;
  }
  
  try {
    const app = express();
    const PORT = Math.floor(Math.random() * 10000) + 20000; // Use a random high port to avoid conflicts
    
    // Basic health check endpoint
    app.get('/health', (req, res) => {
      const uptimeSeconds = process.uptime();
      const formatted = formatUptime(uptimeSeconds);
      
      const memoryUsage = process.memoryUsage();
      const heapUsedMB = Math.round(memoryUsage.heapUsed / (1024 * 1024));
      const rssUsedMB = Math.round(memoryUsage.rss / (1024 * 1024));
      
      // Get session files
      const sessionDir = path.join(process.cwd(), 'sessions');
      let sessionFiles = 0;
      if (fs.existsSync(sessionDir)) {
        sessionFiles = fs.readdirSync(sessionDir).length;
      }
      
      // Check if any global connection exists
      const connectionStatus = global.conn?.user ? 'Connected' : 'Disconnected';
      
      const response = {
        status: 'ok',
        timestamp: new Date().toISOString(),
        uptime: formatted,
        uptimeSeconds: uptimeSeconds,
        memoryUsage: {
          heapUsed: `${heapUsedMB} MB`,
          rss: `${rssUsedMB} MB`,
          heapUsedRaw: heapUsedMB,
          rssRaw: rssUsedMB
        },
        connection: {
          status: connectionStatus,
          reconnectAttempts: STATE.reconnectAttempts,
          lastHeartbeat: STATE.lastHeartbeatTime ? new Date(STATE.lastHeartbeatTime).toISOString() : null,
          lastBackup: STATE.lastBackupTime ? new Date(STATE.lastBackupTime).toISOString() : null
        },
        sessions: {
          count: sessionFiles
        }
      };
      
      res.json(response);
    });
    
    // Pretty homepage
    app.get('/', (req, res) => {
      const uptimeSeconds = process.uptime();
      const formatted = formatUptime(uptimeSeconds);
      
      const memoryUsage = process.memoryUsage();
      const heapUsedMB = Math.round(memoryUsage.heapUsed / (1024 * 1024));
      const rssUsedMB = Math.round(memoryUsage.rss / (1024 * 1024));
      
      const connectionStatus = global.conn?.user ? 'Connected' : 'Disconnected';
      
      const html = `
        <!DOCTYPE html>
        <html>
        <head>
            <title>BLACKSKY-MD Status</title>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
                body {
                    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
                    background-color: #1a1a1a;
                    color: #f0f0f0;
                    margin: 0;
                    padding: 20px;
                }
                .container {
                    max-width: 800px;
                    margin: 0 auto;
                    background-color: #272727;
                    border-radius: 10px;
                    padding: 20px;
                    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                }
                h1 {
                    text-align: center;
                    color: #0df;
                    margin-bottom: 30px;
                }
                .status-section {
                    margin: 15px 0;
                    padding: 15px;
                    background-color: #333;
                    border-radius: 5px;
                    border-left: 5px solid #0df;
                }
                .status-title {
                    font-weight: bold;
                    margin-bottom: 10px;
                    color: #0df;
                }
                .status-item {
                    margin: 5px 0;
                    display: flex;
                    justify-content: space-between;
                }
                .status-label {
                    color: #aaa;
                }
                .status-value {
                    font-weight: bold;
                }
                .connected {
                    color: #4CAF50;
                }
                .disconnected {
                    color: #F44336;
                }
                .footer {
                    text-align: center;
                    margin-top: 30px;
                    color: #888;
                    font-size: 0.9rem;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <h1>BLACKSKY-MD HEROKU STATUS</h1>
                
                <div class="status-section">
                    <div class="status-title">System Status</div>
                    <div class="status-item">
                        <span class="status-label">Uptime:</span>
                        <span class="status-value">${formatted}</span>
                    </div>
                    <div class="status-item">
                        <span class="status-label">Memory (Heap):</span>
                        <span class="status-value">${heapUsedMB} MB</span>
                    </div>
                    <div class="status-item">
                        <span class="status-label">Memory (RSS):</span>
                        <span class="status-value">${rssUsedMB} MB</span>
                    </div>
                    <div class="status-item">
                        <span class="status-label">Environment:</span>
                        <span class="status-value">Heroku</span>
                    </div>
                </div>
                
                <div class="status-section">
                    <div class="status-title">Connection Status</div>
                    <div class="status-item">
                        <span class="status-label">Status:</span>
                        <span class="status-value ${connectionStatus === 'Connected' ? 'connected' : 'disconnected'}">${connectionStatus}</span>
                    </div>
                    <div class="status-item">
                        <span class="status-label">Reconnect Attempts:</span>
                        <span class="status-value">${STATE.reconnectAttempts} / ${CONFIG.maxReconnectAttempts}</span>
                    </div>
                    <div class="status-item">
                        <span class="status-label">Last Heartbeat:</span>
                        <span class="status-value">${STATE.lastHeartbeatTime ? new Date(STATE.lastHeartbeatTime).toLocaleTimeString() : 'Never'}</span>
                    </div>
                </div>
                
                <div class="status-section">
                    <div class="status-title">Backup Status</div>
                    <div class="status-item">
                        <span class="status-label">Database:</span>
                        <span class="status-value">${STATE.postgresPool ? 'Connected' : 'Not Connected'}</span>
                    </div>
                    <div class="status-item">
                        <span class="status-label">Last Backup:</span>
                        <span class="status-value">${STATE.lastBackupTime ? new Date(STATE.lastBackupTime).toLocaleTimeString() : 'Never'}</span>
                    </div>
                </div>
                
                <div class="footer">
                    <p>BLACKSKY-MD PREMIUM • Heroku Optimized Edition</p>
                    <p>Last Updated: ${new Date().toLocaleTimeString()}</p>
                </div>
            </div>
        </body>
        </html>
      `;
      
      res.send(html);
    });
    
    // Start the server with error handling
    try {
      // Close existing server if it exists
      if (STATE.healthCheckServer) {
        try {
          STATE.healthCheckServer.close();
        } catch (err) {
          log(`Error closing existing health check server: ${err.message}`, 'WARN');
        }
      }
      
      // Start new server
      STATE.healthCheckServer = app.listen(PORT, () => {
        log(`Health check server started on port ${PORT}`, 'SUCCESS');
        healthCheckServerInitialized = true;
      });
      
      // Handle server errors
      STATE.healthCheckServer.on('error', (err) => {
        log(`Failed to start health check server on port ${PORT}: ${err.message}`, 'ERROR');
        
        // Try another port if this one is in use
        if (err.code === 'EADDRINUSE') {
          const newPort = Math.floor(Math.random() * 10000) + 30000;
          log(`Port ${PORT} already in use, trying port ${newPort} instead`, 'WARN');
          
          STATE.healthCheckServer = app.listen(newPort, () => {
            log(`Health check server running on alternate port ${newPort}`, 'SUCCESS');
            healthCheckServerInitialized = true;
          });
        }
      });
    } catch (err) {
      log(`Fatal error starting health check server: ${err.message}`, 'ERROR');
    }
  } catch (err) {
    log(`Error setting up health check: ${err.message}`, 'ERROR');
  }
}

/**
 * Format uptime in human-readable format
 * @param {number} seconds - Uptime in seconds
 * @returns {string} - Formatted uptime string
 */
function formatUptime(seconds) {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  
  return `${days}d ${hours}h ${minutes}m ${secs}s`;
}

/**
 * Register global handlers for graceful shutdown
 */
function registerGlobalHandlers() {
  // Handle process signals
  process.on('SIGTERM', async () => {
    log('SIGTERM received, performing graceful shutdown', 'INFO');
    await performGracefulShutdown();
    process.exit(0);
  });
  
  process.on('SIGINT', async () => {
    log('SIGINT received, performing graceful shutdown', 'INFO');
    await performGracefulShutdown();
    process.exit(0);
  });
  
  // Handle uncaught exceptions
  process.on('uncaughtException', async (err) => {
    log(`Uncaught exception: ${err.message}`, 'ERROR');
    log(err.stack, 'ERROR');
    
    // Backup sessions before crashing
    await backupSessionToDatabase();
    await backupSessionFiles();
  });
  
  // Handle unhandled promise rejections
  process.on('unhandledRejection', async (reason, promise) => {
    log(`Unhandled rejection: ${reason}`, 'ERROR');
    
    // Backup sessions
    await backupSessionToDatabase();
    await backupSessionFiles();
  });
}

/**
 * Apply connection patch fix to Baileys connection
 * @param {Object} conn - Baileys connection object
 */
function applyConnectionPatch(conn) {
  if (!conn) {
    log('No connection object available to patch', 'WARN');
    return;
  }
  
  try {
    // Store reference to the connection
    global.conn = conn;
    
    // Monitor connection events
    conn.ev.on('connection.update', async (update) => {
      const { connection, lastDisconnect } = update;
      
      if (connection === 'open') {
        log('Connection opened', 'SUCCESS');
        
        // Apply performance optimizations when connection is established
        try {
          log('Initializing performance optimization system...', 'INFO');
          const { optimize } = require('./apply-optimizations.js');
          if (typeof optimize === 'function') {
            optimize(conn);
            log('Performance optimizations applied successfully', 'SUCCESS');
          }
        } catch (optErr) {
          log(`Failed to apply performance optimizations: ${optErr.message}`, 'ERROR');
        }
        
        // Reset connection state
        STATE.connectionLostTime = null;
        STATE.reconnectAttempts = 0;
        STATE.backoffDelay = CONFIG.initialBackoffDelay;
        
        // Backup sessions after successful connection
        backupSessionToDatabase().catch(err => 
          log(`Error backing up after connection: ${err.message}`, 'ERROR')
        );
      }
      
      if (connection === 'close') {
        const statusCode = lastDisconnect?.error?.output?.statusCode;
        log(`Connection closed (status code: ${statusCode})`, 'WARN');
        
        // Mark connection as lost
        if (!STATE.connectionLostTime) {
          STATE.connectionLostTime = Date.now();
        }
      }
    });
    
    log('Connection patch applied', 'SUCCESS');
  } catch (err) {
    log(`Error applying connection patch: ${err.message}`, 'ERROR');
  }
}

/**
 * Perform graceful shutdown, saving data and closing connections
 */
async function performGracefulShutdown() {
  log('Performing graceful shutdown...', 'INFO');
  
  // Backup sessions
  try {
    await backupSessionToDatabase();
    await backupSessionFiles();
  } catch (err) {
    log(`Error backing up during shutdown: ${err.message}`, 'ERROR');
  }
  
  // Close health check server
  if (STATE.healthCheckServer) {
    try {
      STATE.healthCheckServer.close();
      log('Health check server closed', 'INFO');
    } catch (err) {
      log(`Error closing health check server: ${err.message}`, 'ERROR');
    }
  }
  
  // Close database connection
  if (STATE.postgresPool) {
    try {
      await STATE.postgresPool.end();
      log('Database connection closed', 'INFO');
    } catch (err) {
      log(`Error closing database connection: ${err.message}`, 'ERROR');
    }
  }
  
  // Clear all intervals
  for (const key in STATE.intervalIds) {
    if (STATE.intervalIds[key]) {
      clearInterval(STATE.intervalIds[key]);
      log(`Cleared ${key} interval`, 'INFO');
    }
  }
  
  log('Graceful shutdown completed', 'SUCCESS');
}

/**
 * Initialize the Heroku connection keeper
 */
function initialize() {
  log('Initializing Heroku connection keeper...', 'INFO');
  
  // Initialize PostgreSQL pool if DATABASE_URL is available
  initPostgresPool();
  
  // Set up health check endpoint
  setupHealthCheck();
  
  // Set up anti-idle mechanism
  setupAntiIdle();
  
  // Register global handlers for graceful shutdown
  registerGlobalHandlers();
  
  // Try to restore session from database if it exists
  restoreSessionFromDatabase().catch(err => {
    log(`Error restoring session during init: ${err.message}`, 'ERROR');
    // Try file-based restore
    restoreSessionFiles().catch(console.error);
  });
  
  // Set up intervals
  STATE.intervalIds.heartbeat = setInterval(() => {
    if (global.conn) {
      sendHeartbeat(global.conn).catch(err => 
        log(`Error in heartbeat interval: ${err.message}`, 'ERROR')
      );
    }
  }, CONFIG.heartbeatInterval);
  
  STATE.intervalIds.connectionCheck = setInterval(() => {
    if (global.conn) {
      checkConnection(global.conn).catch(err => 
        log(`Error in connection check interval: ${err.message}`, 'ERROR')
      );
    }
  }, CONFIG.connectionCheckInterval);
  
  STATE.intervalIds.backup = setInterval(() => {
    backupSessionToDatabase().catch(err => 
      log(`Error in backup interval: ${err.message}`, 'ERROR')
    );
    
    // Also do file backup as fallback
    backupSessionFiles().catch(err => 
      log(`Error in file backup interval: ${err.message}`, 'ERROR')
    );
  }, CONFIG.backupInterval);
  
  log('Heroku connection keeper initialized', 'SUCCESS');
  
  return {
    applyConnectionPatch,
    backupSessionToDatabase,
    restoreSessionFromDatabase,
    isConnectionActive,
    sendHeartbeat,
    checkConnection
  };
}

// Export public API
module.exports = {
  initialize,
  applyConnectionPatch,
  backupSessionToDatabase,
  restoreSessionFromDatabase,
  backupSessionFiles,
  restoreSessionFiles,
  sendHeartbeat,
  checkConnection,
  formatUptime,
  performGracefulShutdown
};

// Auto-initialize if not being required by another module
if (require.main === module) {
  initialize();
}