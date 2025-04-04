/**
 * BLACKSKY-MD Bot Starter for Heroku with enhanced stability
 * Optimized for Replit environment
 */
const { initialize: initKeeper } = require('./heroku-connection-keeper.js');
const express = require('express');
const app = express();
const port = process.env.PORT || 4444; // Use a different port to avoid conflicts
const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

// Initialize PostgreSQL connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

// Create session table if it doesn't exist
async function createSessionTable() {
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
  } catch (err) {
    console.error('❌ Error creating session table:', err);
  }
}

// Initialize session database
createSessionTable();

// Enable session backup and restore
global.DATABASE_ENABLED = true;
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

// Start server first
const server = app.listen(port, '0.0.0.0', () => {
  console.log(`⚡ Server running on port ${port}`);

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


// Make sure the server is properly handling errors
server.on('error', (err) => {
  console.error('Server error:', err);
  if (err.code === 'EADDRINUSE') {
    console.log(`Port ${port} is already in use. Trying another port...`);
    // Try another port
    server.close();
    app.listen(0, '0.0.0.0', () => {
      console.log(`⚡ Server running on a random port`);
      setTimeout(() => {
        try {
          require('./index.js');
          console.log('✅ Bot started successfully on random port');
        } catch (err) {
          console.error('❌ Error starting bot on random port:', err);
          process.exit(1);
        }
      }, 1000);
    });
  }
});

// Session backup and restore functions
async function restoreSessionFromDatabase() {
  try {
    const sessionDir = path.join(process.cwd(), 'sessions');
    
    // Create sessions directory if it doesn't exist
    if (!fs.existsSync(sessionDir)) {
      console.log('📁 Creating sessions directory...');
      fs.mkdirSync(sessionDir, { recursive: true });
    }
    
    // Query latest sessions from database
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
  } catch (err) {
    console.error('❌ Error in restoreSessionFromDatabase:', err);
    return false;
  }
}

// Restore sessions on startup
console.log('🔄 Attempting to restore sessions from database...');
restoreSessionFromDatabase().then(success => {
  if (success) {
    console.log('✅ Sessions restored successfully');
  } else {
    console.log('⚠️ No sessions restored from database');
  }
});

// Set up periodic session backup
const BACKUP_INTERVAL_MS = 5 * 60 * 1000; // 5 minutes
setInterval(async () => {
  console.log('⏰ Running scheduled session backup...');
  await backupSessionToDatabase();
}, BACKUP_INTERVAL_MS);

// Also back up on memory pressure
let lastBackupTime = Date.now();
const MIN_BACKUP_INTERVAL_MS = 60 * 1000; // 1 minute minimum between backups
process.on('memoryUsageHigh', async () => {
  const now = Date.now();
  if (now - lastBackupTime > MIN_BACKUP_INTERVAL_MS) {
    console.log('⚠️ Memory pressure detected, backing up sessions...');
    await backupSessionToDatabase();
    lastBackupTime = now;
  }
});

async function backupSessionToDatabase() {
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
        await pool.query(
          `INSERT INTO whatsapp_sessions (session_id, session_data, updated_at) 
           VALUES ($1, $2, NOW()) 
           ON CONFLICT (session_id) 
           DO UPDATE SET session_data = $2, updated_at = NOW()`,
          [sessionId, sessionData]
        );
        
        successCount++;
      } catch (err) {
        console.error(`❌ Error backing up session file ${file}:`, err);
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
    // Save sessions to database
    console.log('💾 Backing up sessions to PostgreSQL...');
    await backupSessionToDatabase();
    
    // Close database pool
    if (pool) {
      console.log('🔌 Closing database connection...');
      await pool.end();
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