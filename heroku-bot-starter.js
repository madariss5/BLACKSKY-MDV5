/**
 * BLACKSKY-MD Bot Starter for Heroku with enhanced stability
 * Optimized for Replit environment
 * With advanced group chat and response time optimizations
 */
const { initialize: initKeeper } = require('./heroku-connection-keeper.js');

// Performance optimization support - initialize earlier for faster startup
let optimizerInitialized = false;
function initOptimizer() {
  if (optimizerInitialized) return;
  
  try {
    // Pre-load RPG-specific optimizations
    console.log('🚀 Loading RPG performance optimizations...');
    
    // Initialize response cache system
    global.responseCache = require('./lib/response-cache.js');
    console.log('✅ Response cache system loaded successfully');
    
    // Initialize group optimization system
    global.groupOptimization = require('./lib/group-optimization.js');
    console.log('✅ Group chat optimization system loaded successfully');
    
    // Load other optimizations via the main module
    require('./apply-optimizations.js');
    
    // Set up periodic cache cleanup
    setInterval(() => {
      if (global.responseCache && typeof global.responseCache.cleanup === 'function') {
        global.responseCache.cleanup();
      }
    }, 5 * 60 * 1000); // Clean every 5 minutes
    
    optimizerInitialized = true;
    console.log('✅ Performance optimization system fully initialized');
  } catch (err) {
    console.error('⚠️ Failed to load performance optimizations:', err.message);
    console.error(err);
  }
}
const express = require('express');
const app = express();
// Use a specific port for the primary server to avoid conflicts with heroku-connection-keeper.js
const port = process.env.PORT || 5000;
const healthCheckPort = process.env.HEALTH_CHECK_PORT || 28111;
const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

// Initialize PostgreSQL connection pool with error handling
let pool;
try {
  if (!process.env.DATABASE_URL) {
    console.warn('⚠️ DATABASE_URL environment variable not set. Database features will be disabled.');
    console.warn('⚠️ For Heroku deployment, make sure to add the PostgreSQL addon and set DATABASE_URL.');
    global.DATABASE_ENABLED = false;
  } else {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: {
        rejectUnauthorized: false
      }
    });
    
    // Test the connection
    pool.query('SELECT NOW()', (err, res) => {
      if (err) {
        console.error('❌ Database connection test failed:', err.message);
        console.warn('⚠️ Database features will be disabled due to connection error.');
        global.DATABASE_ENABLED = false;
      } else {
        console.log('✅ Database connection established successfully.');
        global.DATABASE_ENABLED = true;
      }
    });
  }
} catch (err) {
  console.error('❌ Error initializing database pool:', err.message);
  console.warn('⚠️ Database features will be disabled due to initialization error.');
  global.DATABASE_ENABLED = false;
}

// Create session table if it doesn't exist
async function createSessionTable() {
  if (!global.DATABASE_ENABLED || !pool) {
    console.log('⚠️ Database not enabled or available, skipping session table creation');
    return false;
  }
  
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS whatsapp_sessions (
        id SERIAL PRIMARY KEY,
        session_id VARCHAR(255) NOT NULL,
        session_data JSONB NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      CREATE INDEX IF NOT EXISTS idx_whatsapp_sessions_session_id ON whatsapp_sessions(session_id);
    `);
    console.log('✅ Session table created or confirmed');
    return true;
  } catch (err) {
    console.error('❌ Error creating session table:', err);
    global.DATABASE_ENABLED = false;
    return false;
  }
}

// Initialize session database if database is available
if (global.DATABASE_ENABLED !== false) {
  console.log('🔄 Initializing session database...');
  createSessionTable();
} else {
  console.log('⚠️ Database features disabled, skipping session table creation');
}

// Set up database globals for other modules to use
global.dbPool = pool;

// Initialize connection keeper
const keeper = initKeeper();

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    databaseConnected: !!global.dbPool
  });
});

// Status page
app.get('/', (req, res) => {
  const uptime = process.uptime();
  const hours = Math.floor(uptime / 3600);
  const minutes = Math.floor((uptime % 3600) / 60);
  const seconds = Math.floor(uptime % 60);
  
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>BLACKSKY-MD Premium Status</title>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          background: #121212;
          color: #eee;
          margin: 0;
          padding: 20px;
          line-height: 1.6;
        }
        .container {
          max-width: 800px;
          margin: 0 auto;
          background: #1e1e1e;
          border-radius: 10px;
          padding: 20px;
          box-shadow: 0 0 10px rgba(0,0,0,0.5);
        }
        h1 {
          color: #0df;
          text-align: center;
          margin-top: 0;
          padding-top: 20px;
          text-shadow: 0 0 5px rgba(0,221,255,0.5);
        }
        .status {
          background: #333;
          padding: 15px;
          border-radius: 5px;
          margin: 20px 0;
        }
        .online {
          color: #0f6;
          font-weight: bold;
        }
        footer {
          text-align: center;
          margin-top: 20px;
          font-size: 0.8em;
          color: #888;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>BLACKSKY-MD Premium</h1>
        <div class="status">
          <p>Status: <span class="online">ONLINE</span></p>
          <p>Uptime: ${hours}h ${minutes}m ${seconds}s</p>
          <p>Environment: ${process.env.NODE_ENV || 'development'}</p>
          <p>Last Updated: ${new Date().toLocaleString()}</p>
        </div>
        <footer>
          BLACKSKY-MD Premium © 2025
        </footer>
      </div>
    </body>
    </html>
  `);
});

// Function to find an available port and start the server
function startServerWithAvailablePort(initialPort, maxRetries = 10) {
  let currentPort = initialPort;
  let retryCount = 0;
  
  // Try to start the server with current port
  function attemptToStartServer() {
    console.log(`Attempting to start server on port ${currentPort}...`);
    
    const server = app.listen(currentPort, '0.0.0.0', () => {
      console.log(`⚡ Server running on port ${currentPort}`);
      
      // Initialize performance optimization system
      console.log('🚀 Initializing performance optimization system...');
      initOptimizer();
      
      // Start bot after server is confirmed running
      setTimeout(() => {
        try {
          require('./index.js');
          console.log('✅ Bot started successfully');
        } catch (err) {
          console.error('❌ Error starting bot:', err);
          // Attempt to restart after delay
          console.log('🔄 Will attempt to restart in 10 seconds...');
          setTimeout(() => {
            try {
              require('./index.js');
              console.log('✅ Bot restarted successfully');
            } catch (restartErr) {
              console.error('❌ Error restarting bot:', restartErr);
              process.exit(1); // Exit with error code
            }
          }, 10000);
        }
      }, 1000);
    });
    
    // Handle errors when starting the server
    server.on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        console.log(`Port ${currentPort} is already in use.`);
        server.close();
        
        // Try another port if we haven't exceeded max retries
        if (retryCount < maxRetries) {
          retryCount++;
          // Use a random port in a higher range to avoid conflicts
          currentPort = Math.floor(Math.random() * 10000) + 10000;
          console.log(`Trying port ${currentPort} instead (attempt ${retryCount}/${maxRetries})...`);
          attemptToStartServer();
        } else {
          // As a last resort, try with port 0 (random port assigned by OS)
          console.log('Maximum retry attempts reached. Trying with a system-assigned port...');
          currentPort = 0;
          attemptToStartServer();
        }
      } else {
        // Handle other server errors
        console.error('Failed to start server:', err);
        process.exit(1);
      }
    });
  }
  
  // Start the first attempt
  attemptToStartServer();
}

// Start the server with the initial port
startServerWithAvailablePort(port);

// Session backup and restore functions
async function restoreSessionFromDatabase() {
  // Check if database is enabled and available
  if (!global.DATABASE_ENABLED || !pool) {
    console.log('⚠️ Database features disabled, skipping session restore');
    return false;
  }

  try {
    const sessionDir = path.join(process.cwd(), 'sessions');
    
    // Create sessions directory if it doesn't exist
    if (!fs.existsSync(sessionDir)) {
      console.log('📁 Creating sessions directory...');
      fs.mkdirSync(sessionDir, { recursive: true });
    }
    
    // Query latest sessions from database
    try {
      const result = await pool.query('SELECT session_id, session_data FROM whatsapp_sessions ORDER BY updated_at DESC');
      
      if (result.rows.length === 0) {
        console.log('⚠️ No sessions found in database');
        return false;
      }
      
      console.log(`🔄 Found ${result.rows.length} sessions in database to restore`);
      
      // Save each session to file
      let successCount = 0;
      for (const row of result.rows) {
        try {
          const { session_id, session_data } = row;
          const filePath = path.join(sessionDir, `${session_id}.json`);
          
          fs.writeFileSync(filePath, JSON.stringify(session_data, null, 2));
          successCount++;
        } catch (err) {
          console.error(`❌ Error restoring session ${row.session_id}:`, err);
        }
      }
      
      console.log(`✅ Successfully restored ${successCount}/${result.rows.length} sessions from database`);
      return successCount > 0;
    } catch (dbErr) {
      console.error('❌ Database error during session restore:', dbErr.message);
      console.log('⚠️ Disabling database features due to error');
      global.DATABASE_ENABLED = false;
      return false;
    }
  } catch (err) {
    console.error('❌ Error in restoreSessionFromDatabase:', err);
    return false;
  }
}

// Restore sessions on startup only if database is enabled
if (global.DATABASE_ENABLED) {
  console.log('🔄 Attempting to restore sessions from database...');
  restoreSessionFromDatabase().then(success => {
    if (success) {
      console.log('✅ Sessions restored successfully');
    } else {
      console.log('⚠️ No sessions restored from database');
    }
  });
} else {
  console.log('⚠️ Database features disabled, skipping session restore');
}

// Set up periodic session backup only if database is enabled
if (global.DATABASE_ENABLED) {
  const BACKUP_INTERVAL_MS = 5 * 60 * 1000; // 5 minutes
  setInterval(async () => {
    // Check if database is still enabled before attempting backup
    if (global.DATABASE_ENABLED) {
      console.log('⏰ Running scheduled session backup...');
      await backupSessionToDatabase();
    }
  }, BACKUP_INTERVAL_MS);

  // Also back up on memory pressure
  let lastBackupTime = Date.now();
  const MIN_BACKUP_INTERVAL_MS = 60 * 1000; // 1 minute minimum between backups
  process.on('memoryUsageHigh', async () => {
    // Check if database is still enabled before attempting backup
    if (global.DATABASE_ENABLED) {
      const now = Date.now();
      if (now - lastBackupTime > MIN_BACKUP_INTERVAL_MS) {
        console.log('⚠️ Memory pressure detected, backing up sessions...');
        await backupSessionToDatabase();
        lastBackupTime = now;
      }
    }
  });
}

async function backupSessionToDatabase() {
  // Skip if database features are disabled
  if (!global.DATABASE_ENABLED || !pool) {
    console.log('⚠️ Database features disabled, skipping session backup');
    return false;
  }

  try {
    if (!global.conn || !global.conn.authState) {
      console.log('🚫 No active connection to backup');
      return false;
    }

    const sessionDir = path.join(process.cwd(), 'sessions');
    if (!fs.existsSync(sessionDir)) {
      console.log('🚫 Sessions directory not found');
      return false;
    }

    // Get list of session files
    const files = fs.readdirSync(sessionDir).filter(f => f.endsWith('.json'));
    
    if (files.length === 0) {
      console.log('⚠️ No session files found to backup');
      return false;
    }

    console.log(`🔄 Found ${files.length} session files to backup`);
    
    // Loop through each file and upload to database
    let successCount = 0;
    for (const file of files) {
      try {
        const sessionId = file.replace('.json', '');
        const filePath = path.join(sessionDir, file);
        const fileContent = fs.readFileSync(filePath, 'utf8');
        const sessionData = JSON.parse(fileContent);
        
        // Insert or update in database
        try {
          await pool.query(
            `INSERT INTO whatsapp_sessions (session_id, session_data, updated_at) 
             VALUES ($1, $2, NOW()) 
             ON CONFLICT (session_id) 
             DO UPDATE SET session_data = $2, updated_at = NOW()`,
            [sessionId, sessionData]
          );
          successCount++;
        } catch (dbErr) {
          console.error(`❌ Database error backing up session ${sessionId}:`, dbErr.message);
          
          // If we're getting persistent database errors, disable database features
          if (successCount === 0 && files.indexOf(file) > 3) {
            console.log('⚠️ Multiple database errors detected, disabling database features');
            global.DATABASE_ENABLED = false;
            return false;
          }
        }
      } catch (err) {
        console.error(`❌ Error reading session file ${file}:`, err.message);
      }
    }
    
    console.log(`✅ Successfully backed up ${successCount}/${files.length} session files to database`);
    return successCount > 0;
  } catch (err) {
    console.error('❌ Error in backupSessionToDatabase:', err);
    return false;
  }
}

// Perform graceful shutdown, saving data and closing connections
async function performGracefulShutdown() {
  console.log('🛑 Shutting down gracefully...');

  try {
    // Save sessions to database if database features are enabled
    if (global.DATABASE_ENABLED && pool) {
      console.log('💾 Backing up sessions to PostgreSQL...');
      await backupSessionToDatabase();
      
      // Close database pool
      console.log('🔌 Closing database connection...');
      await pool.end();
    } else {
      console.log('⚠️ Database features disabled, skipping database backup');
      
      // Backup to local files instead
      try {
        // Make sure sessions directory exists
        const sessionDir = path.join(process.cwd(), 'sessions');
        if (!fs.existsSync(sessionDir)) {
          fs.mkdirSync(sessionDir, { recursive: true });
        }
        
        // Save current auth state if available
        if (global.conn && global.conn.authState) {
          console.log('💾 Saving auth state to local files...');
          if (typeof global.conn.authState.saveState === 'function') {
            await global.conn.authState.saveState();
            console.log('✅ Auth state saved successfully');
          }
        }
      } catch (backupErr) {
        console.error('❌ Error backing up session files:', backupErr.message);
      }
    }
    
    console.log('👋 Shutdown complete. Goodbye!');
  } catch (err) {
    console.error('❌ Error during graceful shutdown:', err);
  }
}

// Handle shutdown signals
process.on('SIGTERM', async () => {
  console.log('🛑 Received SIGTERM signal. Heroku is cycling dynos.');
  await performGracefulShutdown();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('🛑 Received SIGINT signal. Shutting down gracefully...');
  await performGracefulShutdown();
  process.exit(0);
});

// Handle uncaught exceptions
process.on('uncaughtException', async (err) => {
  console.error('❌ Uncaught exception:', err);
  await performGracefulShutdown();
  process.exit(1);
});

// Handle unhandled rejections
process.on('unhandledRejection', async (reason, promise) => {
  console.error('❌ Unhandled rejection at:', promise, 'reason:', reason);
  // Don't exit for unhandled rejections as they may not be fatal
});