/**
 * BLACKSKY-MD Premium - Heroku 24/7 Bot Runner
 * 
 * This script is optimized specifically for Heroku deployment:
 * 1. Uses PostgreSQL for session persistence across dyno restarts
 * 2. Implements connection monitoring and auto-reconnection
 * 3. Implements heartbeat mechanism to keep connections alive
 * 4. Sets up anti-idle server to prevent Heroku dyno sleeping
 * 5. Handles graceful shutdown for dyno cycling
 * 6. Includes automatic error recovery
 * 
 * Usage: Set this as your Heroku Procfile web process
 * web: node heroku-bot-runner.js
 */

// Check if running on Heroku
const isHeroku = !!process.env.DYNO || process.env.HEROKU === 'true';
if (!isHeroku) {
  console.log('⚠️ This script is optimized for Heroku. For other environments, use index.js');
  console.log('🔄 Switching to index.js...');
  require('./index.js');
  return;
}

// Import required modules
const fs = require('fs');
const path = require('path');
const os = require('os');
const { spawn } = require('child_process');
const { createServer } = require('http');
const express = require('express');
const { Pool } = require('pg');

// Global state tracking
const GLOBAL_STATE = {
  startTime: Date.now(),
  restartCount: 0,
  lastRestart: null,
  isConnected: false,
  reconnectAttempts: 0,
  lastBackup: null,
  sessionRestored: false,
  herokuStartupTime: Date.now()
};

// Configuration
const CONFIG = {
  // Postgres configuration
  dbEnabled: !!process.env.DATABASE_URL,
  dbConnectionString: process.env.DATABASE_URL,
  
  // Session configuration
  sessionId: process.env.SESSION_ID || 'BLACKSKY-MD',
  sessionDir: path.join(process.cwd(), 'sessions'),
  sessionBackupDir: path.join(process.cwd(), 'sessions-backup'),
  
  // Web server configuration
  port: process.env.PORT || 3000,
  
  // Heartbeat configuration
  heartbeatInterval: 25 * 60 * 1000, // 25 minutes (Heroku timeout is 30)
  
  // Backup configuration
  backupInterval: 10 * 60 * 1000, // 10 minutes
  
  // Logging
  debug: process.env.DEBUG === 'true'
};

// Create required directories
try {
  if (!fs.existsSync(CONFIG.sessionDir)) {
    fs.mkdirSync(CONFIG.sessionDir, { recursive: true });
  }
  if (!fs.existsSync(CONFIG.sessionBackupDir)) {
    fs.mkdirSync(CONFIG.sessionBackupDir, { recursive: true });
  }
} catch (err) {
  console.error('Error creating directories:', err);
}

// Initialize Postgres connection pool
let pgPool;
if (CONFIG.dbEnabled) {
  try {
    pgPool = new Pool({
      connectionString: CONFIG.dbConnectionString,
      ssl: { rejectUnauthorized: false }
    });
    console.log('🗄️ PostgreSQL connection initialized');
    
    // Create session table if it doesn't exist
    createSessionTable();
  } catch (err) {
    console.error('Error initializing PostgreSQL:', err);
  }
}

// Create session table if it doesn't exist
async function createSessionTable() {
  if (!pgPool) return false;
  
  try {
    await pgPool.query(`
      CREATE TABLE IF NOT EXISTS wa_sessions (
        id SERIAL PRIMARY KEY,
        session_id VARCHAR(255) NOT NULL,
        file_name VARCHAR(255) NOT NULL,
        file_data TEXT NOT NULL,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(session_id, file_name)
      )
    `);
    
    console.log('✅ Session table created/verified successfully');
    return true;
  } catch (err) {
    console.error('Error creating session table:', err);
    return false;
  }
}

// Restore session from database
async function restoreSessionFromDatabase() {
  if (!CONFIG.dbEnabled || !pgPool) return false;
  
  try {
    console.log('🔄 Attempting to restore session from database...');
    
    // Get all session files for this session ID
    const result = await pgPool.query(
      'SELECT file_name, file_data FROM wa_sessions WHERE session_id = $1',
      [CONFIG.sessionId]
    );
    
    if (result.rows.length === 0) {
      console.log('⚠️ No session data found in database');
      return false;
    }
    
    // Create session directory if it doesn't exist
    if (!fs.existsSync(CONFIG.sessionDir)) {
      fs.mkdirSync(CONFIG.sessionDir, { recursive: true });
    }
    
    // Restore each file
    for (const row of result.rows) {
      const filePath = path.join(CONFIG.sessionDir, row.file_name);
      const fileData = Buffer.from(row.file_data, 'base64').toString('utf8');
      
      fs.writeFileSync(filePath, fileData);
    }
    
    console.log(`✅ Successfully restored ${result.rows.length} session files from PostgreSQL`);
    GLOBAL_STATE.sessionRestored = true;
    return true;
  } catch (err) {
    console.error('Error restoring session from database:', err);
    return false;
  }
}

// Back up session to database
async function backupSessionToDatabase() {
  if (!CONFIG.dbEnabled || !pgPool) return false;
  
  try {
    // Skip if there is no session directory
    if (!fs.existsSync(CONFIG.sessionDir)) {
      console.log('⚠️ No session directory found');
      return false;
    }
    
    const sessionFiles = fs.readdirSync(CONFIG.sessionDir);
    
    // Only back up files for the current session
    const relevantFiles = sessionFiles.filter(file => 
      file.startsWith(CONFIG.sessionId) || 
      file === 'creds.json' ||
      file.endsWith('.json')
    );
    
    if (relevantFiles.length === 0) {
      console.log('⚠️ No relevant session files found');
      return false;
    }
    
    console.log(`📤 Backing up ${relevantFiles.length} session files to PostgreSQL...`);
    
    // Back up each file
    for (const fileName of relevantFiles) {
      const filePath = path.join(CONFIG.sessionDir, fileName);
      
      // Skip directories
      if (fs.statSync(filePath).isDirectory()) continue;
      
      // Read file content and convert to base64 for safe storage
      const fileData = fs.readFileSync(filePath, 'utf8');
      const base64Data = Buffer.from(fileData).toString('base64');
      
      // Store in database, updating if exists
      await pgPool.query(`
        INSERT INTO wa_sessions (session_id, file_name, file_data, updated_at)
        VALUES ($1, $2, $3, NOW())
        ON CONFLICT (session_id, file_name) 
        DO UPDATE SET file_data = $3, updated_at = NOW()
      `, [CONFIG.sessionId, fileName, base64Data]);
    }
    
    GLOBAL_STATE.lastBackup = Date.now();
    console.log(`✅ Successfully backed up ${relevantFiles.length} session files to PostgreSQL`);
    return true;
  } catch (err) {
    console.error('Error backing up session to database:', err);
    return false;
  }
}

// Also back up to local filesystem as a fallback
async function backupSessionFiles() {
  try {
    // Create backup directory if it doesn't exist
    if (!fs.existsSync(CONFIG.sessionBackupDir)) {
      fs.mkdirSync(CONFIG.sessionBackupDir, { recursive: true });
    }
    
    // Skip if there is no session directory
    if (!fs.existsSync(CONFIG.sessionDir)) {
      console.log('⚠️ No session directory found');
      return false;
    }
    
    const sessionFiles = fs.readdirSync(CONFIG.sessionDir);
    
    // Only back up files for the current session
    const relevantFiles = sessionFiles.filter(file => 
      file.startsWith(CONFIG.sessionId) || 
      file === 'creds.json' ||
      file.endsWith('.json')
    );
    
    if (relevantFiles.length === 0) {
      console.log('⚠️ No relevant session files found');
      return false;
    }
    
    // Create a timestamped backup directory
    const timestamp = Date.now();
    const backupDir = path.join(CONFIG.sessionBackupDir, `backup-${timestamp}`);
    fs.mkdirSync(backupDir, { recursive: true });
    
    // Copy each file to the backup directory
    for (const fileName of relevantFiles) {
      const sourcePath = path.join(CONFIG.sessionDir, fileName);
      const destPath = path.join(backupDir, fileName);
      
      // Skip directories
      if (fs.statSync(sourcePath).isDirectory()) continue;
      
      // Copy file to backup directory
      fs.copyFileSync(sourcePath, destPath);
    }
    
    console.log(`✅ Successfully backed up ${relevantFiles.length} session files to ${backupDir}`);
    return true;
  } catch (err) {
    console.error('Error backing up session files:', err);
    return false;
  }
}

// Restore session from local filesystem
async function restoreSessionFromFiles() {
  try {
    // Skip if there is no backup directory
    if (!fs.existsSync(CONFIG.sessionBackupDir)) {
      console.log('⚠️ No backup directory found');
      return false;
    }
    
    // Find the most recent backup
    const backupDirs = fs.readdirSync(CONFIG.sessionBackupDir)
      .filter(dir => dir.startsWith('backup-'))
      .sort()
      .reverse();
    
    if (backupDirs.length === 0) {
      console.log('⚠️ No backup directories found');
      return false;
    }
    
    const latestBackupDir = path.join(CONFIG.sessionBackupDir, backupDirs[0]);
    const backupFiles = fs.readdirSync(latestBackupDir);
    
    if (backupFiles.length === 0) {
      console.log('⚠️ No files in latest backup directory');
      return false;
    }
    
    // Create session directory if it doesn't exist
    if (!fs.existsSync(CONFIG.sessionDir)) {
      fs.mkdirSync(CONFIG.sessionDir, { recursive: true });
    }
    
    // Copy each file from backup to session directory
    for (const fileName of backupFiles) {
      const sourcePath = path.join(latestBackupDir, fileName);
      const destPath = path.join(CONFIG.sessionDir, fileName);
      
      // Skip directories
      if (fs.statSync(sourcePath).isDirectory()) continue;
      
      // Copy file from backup to session directory
      fs.copyFileSync(sourcePath, destPath);
    }
    
    console.log(`✅ Successfully restored ${backupFiles.length} session files from ${latestBackupDir}`);
    GLOBAL_STATE.sessionRestored = true;
    return true;
  } catch (err) {
    console.error('Error restoring session files:', err);
    return false;
  }
}

// Set up anti-idle web server for Heroku
function setupAntiIdleServer() {
  const app = express();
  const port = CONFIG.port;
  
  // Simple health check endpoint
  app.get('/', (req, res) => {
    const uptime = Date.now() - GLOBAL_STATE.startTime;
    const herokuUptime = Date.now() - GLOBAL_STATE.herokuStartupTime;
    
    // Format uptime in human-readable format
    const formatUptime = (ms) => {
      const seconds = Math.floor(ms / 1000);
      const days = Math.floor(seconds / 86400);
      const hours = Math.floor((seconds % 86400) / 3600);
      const minutes = Math.floor((seconds % 3600) / 60);
      const secs = Math.floor(seconds % 60);
      
      return `${days}d ${hours}h ${minutes}m ${secs}s`;
    };
    
    // Prepare response with bot status
    const status = {
      bot: 'BLACKSKY-MD Premium',
      version: process.env.npm_package_version || 'unknown',
      status: GLOBAL_STATE.isConnected ? 'Connected' : 'Disconnected',
      uptime: formatUptime(uptime),
      herokuUptime: formatUptime(herokuUptime),
      restarts: GLOBAL_STATE.restartCount,
      lastRestart: GLOBAL_STATE.lastRestart ? new Date(GLOBAL_STATE.lastRestart).toISOString() : 'Never',
      reconnectAttempts: GLOBAL_STATE.reconnectAttempts,
      sessionRestored: GLOBAL_STATE.sessionRestored,
      lastBackup: GLOBAL_STATE.lastBackup ? new Date(GLOBAL_STATE.lastBackup).toISOString() : 'Never',
      memory: {
        rss: `${Math.round(process.memoryUsage().rss / 1024 / 1024)} MB`,
        heapTotal: `${Math.round(process.memoryUsage().heapTotal / 1024 / 1024)} MB`,
        heapUsed: `${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)} MB`
      },
      system: {
        platform: process.platform,
        arch: process.arch,
        node: process.version,
        freemem: `${Math.round(os.freemem() / 1024 / 1024)} MB`,
        totalmem: `${Math.round(os.totalmem() / 1024 / 1024)} MB`
      }
    };
    
    // Send status page with pretty formatting
    res.send(`
      <!DOCTYPE html>
      <html>
      <head>
          <title>BLACKSKY-MD Premium Status</title>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
              body {
                  font-family: Arial, sans-serif;
                  line-height: 1.6;
                  background: #121212;
                  color: #eee;
                  max-width: 800px;
                  margin: 0 auto;
                  padding: 20px;
              }
              h1 {
                  color: #0df;
                  text-align: center;
                  margin-bottom: 20px;
              }
              .status-container {
                  background: #1e1e1e;
                  border-radius: 10px;
                  padding: 20px;
                  margin-bottom: 20px;
                  box-shadow: 0 0 10px rgba(0,0,0,0.5);
              }
              .status-item {
                  margin-bottom: 10px;
                  display: flex;
                  justify-content: space-between;
                  border-bottom: 1px solid #333;
                  padding-bottom: 5px;
              }
              .status-label {
                  font-weight: bold;
                  color: #0df;
              }
              .status-value {
                  color: #fff;
              }
              .status-section {
                  margin-bottom: 20px;
              }
              .status-section h2 {
                  color: #f0c;
                  border-bottom: 1px solid #333;
                  padding-bottom: 5px;
              }
              .status-indicator {
                  display: inline-block;
                  width: 12px;
                  height: 12px;
                  border-radius: 50%;
                  margin-right: 8px;
              }
              .status-online {
                  background-color: #0f6;
                  box-shadow: 0 0 8px #0f6;
              }
              .status-offline {
                  background-color: #f33;
                  box-shadow: 0 0 8px #f33;
              }
              .refresh {
                  text-align: center;
                  margin-top: 20px;
                  color: #888;
              }
          </style>
          <script>
              // Auto refresh every 30 seconds
              setTimeout(() => {
                  window.location.reload();
              }, 30000);
          </script>
      </head>
      <body>
          <h1>BLACKSKY-MD Premium Status</h1>
          
          <div class="status-container">
              <div class="status-section">
                  <div class="status-item">
                      <span class="status-label">Bot Status:</span>
                      <span class="status-value">
                          <span class="status-indicator ${status.status === 'Connected' ? 'status-online' : 'status-offline'}"></span>
                          ${status.status}
                      </span>
                  </div>
                  <div class="status-item">
                      <span class="status-label">Version:</span>
                      <span class="status-value">${status.version}</span>
                  </div>
                  <div class="status-item">
                      <span class="status-label">Uptime:</span>
                      <span class="status-value">${status.uptime}</span>
                  </div>
                  <div class="status-item">
                      <span class="status-label">Heroku Uptime:</span>
                      <span class="status-value">${status.herokuUptime}</span>
                  </div>
              </div>
              
              <div class="status-section">
                  <h2>Connection</h2>
                  <div class="status-item">
                      <span class="status-label">Restarts:</span>
                      <span class="status-value">${status.restarts}</span>
                  </div>
                  <div class="status-item">
                      <span class="status-label">Last Restart:</span>
                      <span class="status-value">${status.lastRestart}</span>
                  </div>
                  <div class="status-item">
                      <span class="status-label">Reconnect Attempts:</span>
                      <span class="status-value">${status.reconnectAttempts}</span>
                  </div>
              </div>
              
              <div class="status-section">
                  <h2>Session</h2>
                  <div class="status-item">
                      <span class="status-label">Session Restored:</span>
                      <span class="status-value">${status.sessionRestored ? 'Yes' : 'No'}</span>
                  </div>
                  <div class="status-item">
                      <span class="status-label">Last Backup:</span>
                      <span class="status-value">${status.lastBackup}</span>
                  </div>
              </div>
              
              <div class="status-section">
                  <h2>Memory</h2>
                  <div class="status-item">
                      <span class="status-label">RSS:</span>
                      <span class="status-value">${status.memory.rss}</span>
                  </div>
                  <div class="status-item">
                      <span class="status-label">Heap Total:</span>
                      <span class="status-value">${status.memory.heapTotal}</span>
                  </div>
                  <div class="status-item">
                      <span class="status-label">Heap Used:</span>
                      <span class="status-value">${status.memory.heapUsed}</span>
                  </div>
              </div>
              
              <div class="status-section">
                  <h2>System</h2>
                  <div class="status-item">
                      <span class="status-label">Platform:</span>
                      <span class="status-value">${status.system.platform} (${status.system.arch})</span>
                  </div>
                  <div class="status-item">
                      <span class="status-label">Node.js:</span>
                      <span class="status-value">${status.system.node}</span>
                  </div>
                  <div class="status-item">
                      <span class="status-label">Memory:</span>
                      <span class="status-value">${status.system.freemem} free of ${status.system.totalmem}</span>
                  </div>
              </div>
          </div>
          
          <div class="refresh">
              Auto-refreshes every 30 seconds
          </div>
      </body>
      </html>
    `);
  });
  
  // Health check endpoint for monitoring
  app.get('/health', (req, res) => {
    const status = {
      status: GLOBAL_STATE.isConnected ? 'UP' : 'DOWN',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      herokuUptime: (Date.now() - GLOBAL_STATE.herokuStartupTime) / 1000,
      memory: process.memoryUsage()
    };
    
    res.json(status);
  });
  
  // Start the server
  app.listen(port, '0.0.0.0', () => {
    console.log(`🌐 Anti-idle server running on port ${port}`);
    
    // Set up heartbeat to prevent dyno from sleeping
    setInterval(() => {
      fetch(`http://localhost:${port}/health`)
        .catch(err => {
          console.error('Heartbeat error:', err);
        });
    }, CONFIG.heartbeatInterval);
  });
}

// Set up automatic backup scheduler
function setupAutomaticBackup() {
  setInterval(async () => {
    try {
      console.log('🕒 Running scheduled session backup...');
      await backupSessionToDatabase();
      await backupSessionFiles();
    } catch (err) {
      console.error('Error during scheduled backup:', err);
    }
  }, CONFIG.backupInterval);
  
  console.log(`⏱️ Automatic backup scheduled every ${CONFIG.backupInterval / 60000} minutes`);
}

// Handle graceful shutdown
function setupShutdownHandlers() {
  // Handle SIGTERM (sent by Heroku when dyno cycling)
  process.on('SIGTERM', async () => {
    console.log('🔴 SIGTERM received, performing graceful shutdown...');
    try {
      await backupSessionToDatabase();
      await backupSessionFiles();
      
      if (pgPool) {
        await pgPool.end();
      }
      
      console.log('✅ Graceful shutdown completed');
      process.exit(0);
    } catch (err) {
      console.error('Error during shutdown:', err);
      process.exit(1);
    }
  });
  
  // Handle Ctrl+C
  process.on('SIGINT', async () => {
    console.log('🔴 SIGINT received, performing graceful shutdown...');
    try {
      await backupSessionToDatabase();
      await backupSessionFiles();
      
      if (pgPool) {
        await pgPool.end();
      }
      
      console.log('✅ Graceful shutdown completed');
      process.exit(0);
    } catch (err) {
      console.error('Error during shutdown:', err);
      process.exit(1);
    }
  });
  
  // Handle uncaught exceptions
  process.on('uncaughtException', async (err) => {
    console.error('🚨 Uncaught exception:', err);
    GLOBAL_STATE.reconnectAttempts++;
    
    try {
      // Try to backup session before potential crash
      await backupSessionToDatabase();
      await backupSessionFiles();
      
      // Allow the process to exit normally
      process.exit(1);
    } catch (backupErr) {
      console.error('Error during emergency backup:', backupErr);
      process.exit(1);
    }
  });
  
  // Handle unhandled promise rejections
  process.on('unhandledRejection', (reason, promise) => {
    console.error('🚨 Unhandled promise rejection:', reason);
    // We don't exit here as many libraries have harmless unhandled rejections
  });
  
  console.log('✅ Graceful shutdown handlers registered');
}

// Main function to start the bot with Heroku optimizations
async function startBot() {
  console.log('🚀 Starting BLACKSKY-MD Premium with Heroku optimizations');
  
  try {
    // Set up web server to prevent Heroku dyno from sleeping
    setupAntiIdleServer();
    
    // Set up automatic session backup
    setupAutomaticBackup();
    
    // Set up shutdown handlers
    setupShutdownHandlers();
    
    // Restore session from database or file
    const dbRestored = await restoreSessionFromDatabase();
    if (!dbRestored) {
      console.log('⚠️ Could not restore from database, trying local backup...');
      await restoreSessionFromFiles();
    }
    
    // Add NODE_OPTIONS environment variable for garbage collection
    if (!process.env.NODE_OPTIONS) {
      process.env.NODE_OPTIONS = '--expose-gc';
      console.log('✅ Enabled garbage collection with --expose-gc');
    }
    
    // Set environment variables for Heroku detection
    process.env.HEROKU = 'true';
    
    console.log('✅ Heroku optimizations applied');
    
    // Start the actual bot
    console.log('🤖 Starting bot process with index.js');
    
    // Start the bot with proper arguments
    const args = [path.join(__dirname, 'index.js'), ...process.argv.slice(2)];
    const bot = spawn(process.argv[0], args, {
      stdio: ['inherit', 'inherit', 'inherit', 'ipc'],
      env: {
        ...process.env,
        HEROKU: 'true',
        HEROKU_RESTART_COUNT: GLOBAL_STATE.restartCount,
        NODE_OPTIONS: '--expose-gc'
      }
    });
    
    // Handle messages from the bot process
    bot.on('message', (data) => {
      console.log('📨 Message from bot process:', data);
      
      if (data === 'connected') {
        console.log('✅ Bot connected to WhatsApp');
        GLOBAL_STATE.isConnected = true;
        GLOBAL_STATE.reconnectAttempts = 0;
      } else if (data === 'disconnected') {
        console.log('❌ Bot disconnected from WhatsApp');
        GLOBAL_STATE.isConnected = false;
      } else if (data === 'backup') {
        // Trigger backup
        backupSessionToDatabase()
          .then(() => backupSessionFiles())
          .catch(err => console.error('Error during requested backup:', err));
      }
    });
    
    // Handle bot process exit
    bot.on('exit', async (code, signal) => {
      console.log(`🔴 Bot process exited with code ${code} and signal ${signal}`);
      GLOBAL_STATE.isConnected = false;
      
      // Backup session before restarting
      try {
        await backupSessionToDatabase();
        await backupSessionFiles();
      } catch (err) {
        console.error('Error backing up session before restart:', err);
      }
      
      // Restart the bot after a short delay
      GLOBAL_STATE.restartCount++;
      GLOBAL_STATE.lastRestart = Date.now();
      
      console.log(`🔄 Restarting bot in 5 seconds (restart #${GLOBAL_STATE.restartCount})...`);
      setTimeout(() => {
        startBot();
      }, 5000);
    });
    
    return true;
  } catch (err) {
    console.error('❌ Error starting bot with Heroku optimizations:', err);
    
    // Fall back to standard index.js
    console.log('⚠️ Falling back to standard index.js');
    require('./index.js');
    
    return false;
  }
}

// Start the bot with Heroku optimizations
startBot().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});