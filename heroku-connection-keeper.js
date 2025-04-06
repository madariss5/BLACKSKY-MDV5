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
const { delay, DisconnectReason } = require('@adiwajshing/baileys');
const { Boom } = require('@hapi/boom');
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
  isReconnecting: false, // Added to track reconnection attempts
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
 * Initialize PostgreSQL pool with retry mechanism
 */
function initPostgresPool() {
  const maxRetries = 3;
  let retries = 0;
  const retryInterval = 5000; // 5 seconds

  function attemptConnection() {
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
            if (retries < maxRetries) {
              retries++;
              log(`Retrying PostgreSQL connection in ${retryInterval / 1000} seconds...`, 'WARN');
              setTimeout(attemptConnection, retryInterval);
            } else {
              log(`Failed to connect to PostgreSQL after ${maxRetries} retries.`, 'ERROR');
            }
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
      if (retries < maxRetries) {
        retries++;
        log(`Retrying PostgreSQL connection in ${retryInterval / 1000} seconds...`, 'WARN');
        setTimeout(attemptConnection, retryInterval);
      } else {
        log(`Failed to connect to PostgreSQL after ${maxRetries} retries.`, 'ERROR');
      }
    }
  }

  attemptConnection();
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

    // Start transaction with retry mechanism
    let client;
    let retryCount = 0;
    const maxRetries = 3;
    const batchSize = 50;
    let currentBatch = [];

    while (retryCount < maxRetries) {
      try {
        client = await STATE.postgresPool.connect();
        await client.query('BEGIN');

        // Clear any existing transaction
        await client.query('ROLLBACK');
        await client.query('BEGIN');

        // Create table if doesn't exist
        await client.query(`
          CREATE TABLE IF NOT EXISTS whatsapp_sessions (
            id SERIAL PRIMARY KEY,
            session_id VARCHAR(255) NOT NULL,
            file_name VARCHAR(255) NOT NULL, 
            session_data TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            UNIQUE(session_id, file_name)
          );
        `);

        let count = 0;
        let batchSize = 0;

        for (const file of files) {
          const filePath = path.join(sessionDir, file);
          if (fs.statSync(filePath).isDirectory()) continue;

        try {
          const fileContent = fs.readFileSync(filePath, 'utf8');
          let sessionData;

          // Commit transaction every 50 files to prevent timeouts
          batchSize++;
          if (batchSize >= 50) {
            await client.query('COMMIT');
            await client.query('BEGIN');
            batchSize = 0;
          }

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

      if (batchSize > 0) {
          await client.query('COMMIT');
        }
        log(`Backed up ${count} session files to PostgreSQL database`, 'SUCCESS');
        STATE.lastBackupTime = Date.now();

        if (client) client.release();
        return true;

      } catch (err) {
        log(`Attempt ${retryCount + 1} failed: ${err.message}`, 'WARN');

        if (client) {
          try {
            await client.query('ROLLBACK');
          } catch (rollbackErr) {
            log(`Error during rollback: ${rollbackErr.message}`, 'ERROR');
          } finally {
            client.release();
          }
        }

        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, 1000 * (retryCount + 1)));
        retryCount++;

        if (retryCount === maxRetries) {
          log(`Failed to backup after ${maxRetries} attempts`, 'ERROR');
          return false;
        }
      }
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

    // Check socket status for direct websocket health
    if (conn.ws) {
      // If websocket exists but is in CLOSING or CLOSED state, connection is inactive
      if (conn.ws.readyState === 2 || conn.ws.readyState === 3) {
        log('WebSocket in CLOSING or CLOSED state, connection is inactive', 'WARN');
        return false;
      }

      // If socket is connecting for too long, consider problematic
      if (conn.ws.readyState === 0) {
        const connectingTime = Date.now() - (conn.wsStartTime || Date.now());
        if (connectingTime > 10000) { // 10 seconds
          log(`WebSocket has been in CONNECTING state for ${Math.round(connectingTime/1000)}s, connection may be stale`, 'WARN');
          return false;
        }
      }
    }

    // Check if there are any pending message sends that have timed out
    if (conn.pendingRequestTimeoutMs && conn.pendingRequests) {
      const stalePendingRequests = Object.values(conn.pendingRequests).filter(req => {
        const elapsed = Date.now() - req.startTime;
        return elapsed > 30000; // 30 seconds is too long for a request
      });

      if (stalePendingRequests.length > 3) {
        log(`Found ${stalePendingRequests.length} stale pending requests, connection may be stale`, 'WARN');
        return false;
      }
    }

    // Check for messages received timestamp as a general health indicator
    const lastReceiveTimestamp = conn.lastReceivedMsg?.messageTimestamp;
    if (lastReceiveTimestamp) {
      const now = Date.now() / 1000; // Convert to seconds
      const elapsed = now - lastReceiveTimestamp;

      // If no message received in 5 minutes, consider connection potentially problematic
      // (reduced from 10 minutes to catch issues earlier)
      if (elapsed > 300) {
        log(`No messages received in ${Math.round(elapsed)}s, connection may be stale`, 'WARN');
        return false;
      }
    }

    // If we get here, all checks passed
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
    if (STATE.isReconnecting) return false;
    STATE.isReconnecting = true;

    if (STATE.reconnectAttempts >= CONFIG.maxReconnectAttempts) {
      log('Maximum reconnection attempts reached, attempting recovery...', 'WARN');

      // Backup current session
      await backupSessionToPostgres();
      await backupSessionFiles();

      // Try restoring from backup
      const restored = await restoreSessionFromPostgres() || await restoreSessionFiles();

      if (restored) {
        // Reset connection state
        STATE.reconnectAttempts = 0;
        STATE.backoffDelay = CONFIG.initialBackoffDelay;
        STATE.isReconnecting = false;

        // Force reconnection
        if (global.conn?.ws) {
          try { global.conn.ws.close(); } catch {}
        }

        setTimeout(() => {
          if (global.reloadHandler) {
            global.reloadHandler(true);
          }
        }, 2000);

        return true;
      }
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

    // Try multiple reconnection strategies in sequence

    // 1. First try a simple heartbeat to trigger reconnection
    await sendHeartbeat(conn);

    // Wait a moment to see if that worked
    await new Promise(resolve => setTimeout(resolve, 1000));

    // 2. If connection still appears closed, try a more direct approach
    if (!isConnectionActive(conn)) {
      log('Heartbeat did not trigger reconnection, trying more direct approach', 'WARN');

      // Try to force a connection reset through connection update event
      if (typeof conn.ev?.emit === 'function') {
        conn.ev.emit('connection.update', { 
          connection: 'close', 
          lastDisconnect: {
            error: new Error('Manual reconnection triggered')
          }
        });
      }

      // Wait for reset to process
      await new Promise(resolve => setTimeout(resolve, 2000));
    }

    // Every 3 attempts, try restoring sessions
    if (STATE.reconnectAttempts % 3 === 0) {
      log('Multiple reconnection attempts failed, trying to restore sessions', 'WARN');
      await restoreSessionFromDatabase();

      // After restoration, backup current state for safety
      await backupSessionToDatabase();
    }
  } catch (err) {
    log(`Error in attemptReconnect: ${err.message}`, 'ERROR');
    STATE.isReconnecting = false; // Ensure isReconnecting is reset on error
  } finally {
    STATE.isReconnecting = false; // Ensure isReconnecting is reset
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
  // Even if HEROKU_APP_URL is not set, we'll use internal anti-idle measures
  if (!process.env.HEROKU_APP_URL) {
    log('No HEROKU_APP_URL set, using internal anti-idle mechanisms', 'INFO');

    // Set up internal anti-idle mechanism (will keep the process active)
    STATE.intervalIds.internalAntiIdle = setInterval(() => {
      try {
        // Force minor activity to prevent dyno from sleeping
        if (global.conn && global.conn.user) {
          // Log minimal activity to keep the process active
          log(`Bot active with JID: ${global.conn.user?.id || 'Unknown'}`, 'DEBUG');

          // Perform minimal activity every few hours
          const currentHour = new Date().getHours();
          if (currentHour % 3 === 0) { // Every 3 hours
            log('Running periodic bot activity to prevent idle', 'INFO');

            // Update presence status or perform another lightweight action
            try {
              if (typeof global.conn.updateProfileStatus === 'function') {
                const timestamp = new Date().toISOString();
                global.conn.updateProfileStatus(`Online [Last check: ${timestamp}]`)
                  .catch(err => log(`Failed to update profile status: ${err.message}`, 'WARN'));
              } else {
                // If updateProfileStatus isn't available, try another lightweight action
                if (typeof global.conn.sendPresenceUpdate === 'function') {
                  global.conn.sendPresenceUpdate('available', global.conn.user.id)
                    .catch(err => log(`Failed to update presence: ${err.message}`, 'WARN'));
                }
              }
            } catch (err) {
              log(`Error in lightweight anti-idle action: ${err.message}`, 'ERROR');
            }
          }
        } else {
          log('Bot not fully initialized yet, skipping internal anti-idle', 'DEBUG');
        }
      } catch (err) {
        log(`Error in internal anti-idle: ${err.message}`, 'ERROR');
      }
    }, 30 * 60 * 1000); // Check every 30 minutes

    log('Internal anti-idle mechanism active, checking every 30 minutes', 'SUCCESS');
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

        // If external ping fails, fall back to internal mechanism
        log('External ping failed, falling back to internal anti-idle mechanism', 'INFO');
        if (global.conn && global.conn.user && typeof global.conn.sendPresenceUpdate === 'function') {
          global.conn.sendPresenceUpdate('available', global.conn.user.id)
            .catch(err => log(`Failed to update presence: ${err.message}`, 'WARN'));
        }
      });
    } catch (err) {
      log(`Error in anti-idle: ${err.message}`, 'ERROR');
    }
  }, CONFIG.antiIdleInterval);

  log(`Anti-idle setup for ${appUrl} every ${CONFIG.antiIdleInterval / 60000} minutes`, 'SUCCESS');
}

/**
 * Set up health check endpoint for Heroku, handling port conflicts
 */
let healthCheckServerInitialized = false;
let healthCheckServer = null;

function setupHealthCheck() {
  // Skip if already initialized to prevent port conflicts
  if (healthCheckServerInitialized) {
    log('Health check server already initialized, skipping duplicate initialization', 'INFO');
    return;
  }

  healthCheckServerInitialized = true; // Set to true immediately to prevent multiple attempts

  const app = express();
  let port = CONFIG.healthCheckPort;
  let maxPortAttempts = 5; // Try 5 different ports if the initial one is busy.

  function startHealthCheckServer(currentPort){
    try {
      // Start the server with error handling
      STATE.healthCheckServer = app.listen(currentPort, () => {
        log(`Health check server started on port ${currentPort}`, 'SUCCESS');
      });
      // Handle server errors
      STATE.healthCheckServer.on('error', (err) => {
        log(`Failed to start health check server on port ${currentPort}: ${err.message}`, 'ERROR');
        if(err.code === 'EADDRINUSE' && maxPortAttempts > 0){
          maxPortAttempts--;
          currentPort = Math.floor(Math.random() * 10000) + 30000;
          log(`Port ${currentPort} already in use, trying port ${currentPort} instead`, 'WARN');
          startHealthCheckServer(currentPort); //Recursive call to retry
        }
      });
    } catch (err) {
      log(`Fatal error starting health check server: ${err.message}`, 'ERROR');
    }
  }

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
  app.get('/restart-connection', (req, res) => {
    try {
      log('Manual connection restart requested via health endpoint', 'INFO');

      res.json({
        status: 'restarting',
        timestamp: new Date().toISOString(),
        message: 'Connection restart initiated'
      });

      // Use a small timeout to ensure response is sent before restarting the connection
      setTimeout(() => {
        if (global.enhancedConnectionKeeper?.forceReconnect) {
          log('Using enhanced connection keeper to restart connection', 'INFO');
          global.enhancedConnectionKeeper.forceReconnect(global.conn);
        } else if (typeof global.forceRestartConnection === 'function') {
          log('Using global forceRestartConnection function', 'INFO');
          global.forceRestartConnection();
        } else if (typeof attemptReconnect === 'function') {
          log('Using standard attemptReconnect function', 'INFO');
          attemptReconnect();
        } else {
          log('No reconnection method found, using basic technique', 'WARN');
          // Basic reconnection - mark as disconnected and wait for auto-reconnect
          if (global.conn?.ws) {
            try {
              global.conn.ws.close();
              log('Closed WebSocket connection to trigger reconnect', 'INFO');
            } catch (err) {
              log(`Error closing WebSocket: ${err.message}`, 'ERROR');
            }
          }
        }
      }, 500);
    } catch (err) {
      log(`Error handling restart-connection request: ${err.message}`, 'ERROR');
      res.status(500).json({
        status: 'error',
        message: `Failed to restart connection: ${err.message}`
      });
    }
  });

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

  startHealthCheckServer(port);
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
        const disconReason = lastDisconnect?.error?.message || 'Unknown reason';
        log(`Connection closed (status code: ${statusCode}, reason: ${disconReason})`, 'WARN');

        // Mark connection as lost
        if (!STATE.connectionLostTime) {
          STATE.connectionLostTime = Date.now();
        }

        // Handle specific disconnection reasons with custom strategies
        if (statusCode === DisconnectReason.loggedOut) {
          log('Device logged out, will try to restore session from backup', 'WARN');
          // This is a critical issue that requires session restoration
          restoreSessionFromDatabase().then(success => {
            if (!success) {
              log('Failed to restore from database, trying local backup', 'WARN');
              return restoreSessionFiles();
            }
            return success;
          }).catch(err => {
            log(`Error in session restoration: ${err.message}`, 'ERROR');
          });
        } else if (statusCode === DisconnectReason.connectionLost) {
          log('Connection lost, attempting immediate reconnection', 'WARN');
          // Trigger immediate reconnection attempt without waiting for the regular interval
          setTimeout(() => attemptReconnect(conn), 1000);
        } else if (statusCode === DisconnectReason.connectionReplaced) {
          log('Connection replaced on another device, will try to reclaim', 'WARN');
          // Wait a moment then try to reclaim the session
          setTimeout(() => {
            restoreSessionFromDatabase().then(() => {
              // Force reconnection after a brief delay
              setTimeout(() => attemptReconnect(conn), 2000);
            });
          }, 3000);
        } else if (statusCode === DisconnectReason.timedOut) {
          log('Connection timed out, scheduling faster reconnection', 'WARN');
          // Use a shorter delay for timeouts
          setTimeout(() => attemptReconnect(conn), 1500);
        } else {
          // For other disconnect reasons, use the regular check interval
          log(`Standard reconnection will be attempted at next connection check`, 'INFO');
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
 * Set up enhanced connection keeper with safe initialization
 */
function setupEnhancedKeeper() {
  try {
    log('Attempting to initialize enhanced connection keeper...', 'INFO');
    const enhancedKeeper = require('./enhanced-connection-keeper.js');

    if (typeof enhancedKeeper.safeInitialize === 'function') {
      log('Enhanced connection keeper with safe initialization found', 'SUCCESS');
      enhancedKeeper.safeInitialize();
      log('Enhanced connection keeper polling initialized successfully', 'SUCCESS');
    } else if (typeof enhancedKeeper.applyConnectionPatch === 'function') {
      log('Enhanced connection keeper found but without safe initialization', 'WARN');

      // Set up our own polling for the connection
      log('Setting up fallback connection polling system...', 'INFO');
      const connectionCheckInterval = setInterval(() => {
        if (global.conn) {
          log('Connection object available, applying enhanced connection patch...', 'SUCCESS');
          try {
            // Apply enhanced connection patch when connection is available
            enhancedKeeper.applyConnectionPatch(global.conn);
            log('Enhanced connection patch applied successfully', 'SUCCESS');

            // Clear the interval since we've found the connection
            clearInterval(connectionCheckInterval);
          } catch (err) {
            log(`Error applying enhanced connection patch: ${err.message}`, 'ERROR');
          }
        }
      }, 5000);
    } else {
      log('Enhanced connection keeper available but missing required functions', 'WARN');
      setupFallbackConnectionPolling();
    }
  } catch (err) {
    log(`Enhanced connection keeper not available: ${err.message}`, 'WARN');
    setupFallbackConnectionPolling();
  }
}

/**
 * Set up a fallback polling system to apply our own connection patch
 */
function setupFallbackConnectionPolling() {
  log('Setting up basic connection polling system...', 'INFO');
  const connectionCheckInterval = setInterval(() => {
    if (global.conn) {
      log('Connection object available, applying basic connection patch...', 'INFO');
      try {
        // Apply our own connection patch when connection is available
        applyConnectionPatch(global.conn);
        log('Basic connection patch applied successfully', 'SUCCESS');

        // Clear the interval since we've found the connection
        clearInterval(connectionCheckInterval);
      } catch (err) {
        log(`Error applying basic connection patch: ${err.message}`, 'ERROR');
      }
    }
  }, 5000);
}

async function backupSessionToPostgres() {
  // Placeholder for PostgreSQL backup function
  log('Backing up session to PostgreSQL...', 'INFO');
  try {
    //Implement actual backup logic here.
    return true;
  } catch (error) {
    log(`Error backing up session to PostgreSQL: ${error.message}`, 'ERROR');
    return false;
  }
}

async function restoreSessionFromPostgres() {
  // Placeholder for PostgreSQL restore function
  log('Restoring session from PostgreSQL...', 'INFO');
  try {
    //Implement actual restore logic here.
    return true;
  } catch (error) {
    log(`Error restoring session from PostgreSQL: ${error.message}`, 'ERROR');
    return false;
  }
}


/**
 * Initialize the Heroku connection keeper with improved error handling and retry logic.
 */
function initialize() {
  log('Initializing Heroku connection keeper...', 'INFO');

  // Initialize PostgreSQL pool with retry mechanism
  initPostgresPool();

  // Set up health check endpoint with port conflict handling
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

  // Set up enhanced connection keeper with polling mechanism
  setupEnhancedKeeper();

  // Set up intervals with error handling
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