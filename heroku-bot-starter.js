/**
 * BLACKSKY-MD Bot Starter for Heroku
 * 
 * This script is customized for running BLACKSKY-MD WhatsApp bot on Heroku
 * with enhanced session persistence, connection stability, and automatic
 * reconnection after dyno cycling.
 */

const fs = require('fs');
const path = require('path');
const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

// Create necessary directories
const sessionDir = path.join(__dirname, 'sessions');
if (!fs.existsSync(sessionDir)) {
  fs.mkdirSync(sessionDir, { recursive: true });
  console.log(`📁 Created sessions directory at ${sessionDir}`);
}

const tmpDir = path.join(__dirname, 'tmp');
if (!fs.existsSync(tmpDir)) {
  fs.mkdirSync(tmpDir, { recursive: true });
  console.log(`📁 Created tmp directory at ${tmpDir}`);
}

// Start express server to keep Heroku dyno alive
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
        <title>BLACKSKY-MD Bot | Running on Heroku</title>
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
            .offline {
                color: #f55;
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
            <h1>BLACKSKY-MD Bot Server</h1>
            <div class="status">
                <p>Server Status: <span class="online">ONLINE</span></p>
                <p>WhatsApp Bot: <span class="offline">INITIALIZING</span></p>
                <p>Last Updated: ${new Date().toLocaleString()}</p>
            </div>
            
            <div>
                <p>The BLACKSKY-MD WhatsApp bot is running in a separate process.</p>
                <p>This web interface is used to keep the Heroku dyno active and display status information.</p>
            </div>
            
            <footer>
                BLACKSKY-MD Premium Bot &copy; 2025
            </footer>
        </div>
    </body>
    </html>
  `);
});

// Health check endpoint
app.get('/ping', (req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    botRunning: true
  });
});

// Status endpoint
app.get('/status', (req, res) => {
  // Get the uptime in a readable format
  const uptime = formatUptime(process.uptime());
  
  // Return basic status info
  res.status(200).json({
    status: 'online',
    uptime: uptime,
    timestamp: new Date().toISOString(),
    dyno: process.env.DYNO || 'unknown',
    memory: process.memoryUsage()
  });
});

// First start the server
const server = app.listen(port, '0.0.0.0', () => {
  console.log(`⚡ Server running on port ${port}`);
  
  // Fix session directories and files first
  try {
    // Get PostgreSQL connection info from environment
    if (process.env.DATABASE_URL) {
      console.log('✅ PostgreSQL database URL detected, will use for session persistence');
    } else {
      console.warn('⚠️ No DATABASE_URL found, session persistence may be limited');
    }
    
    // Set app URL for anti-idle pings
    if (process.env.HEROKU_APP_URL) {
      console.log(`✅ Heroku app URL set to: ${process.env.HEROKU_APP_URL}`);
    } else {
      console.warn('⚠️ No HEROKU_APP_URL set, anti-idle system disabled');
    }
    
    // Start the bot after server is confirmed running
    setTimeout(startBot, 1000);
  } catch (err) {
    console.error('❌ Error in startup sequence:', err);
    // Try to start bot anyway after delay
    setTimeout(startBot, 3000);
  }
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
      setTimeout(startBot, 1000);
    });
  }
});

// Helper function to format uptime
function formatUptime(seconds) {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  
  let result = '';
  if (days > 0) result += `${days}d `;
  if (hours > 0) result += `${hours}h `;
  if (minutes > 0) result += `${minutes}m `;
  result += `${secs}s`;
  
  return result;
}

// Function to start the bot
function startBot() {
  console.log('🤖 Starting BLACKSKY-MD WhatsApp Bot on Heroku...');
  
  // Set environment variables needed for the bot
  process.env.NODE_ENV = 'production';
  process.env.SESSION_ID = 'BLACKSKY-MD';
  
  // Make sure sessions directory exists and has proper permissions
  const sessionsDir = path.join(__dirname, 'sessions');
  if (!fs.existsSync(sessionsDir)) {
    fs.mkdirSync(sessionsDir, { recursive: true });
    console.log(`📁 Created sessions directory at ${sessionsDir}`);
  }
  
  // Initialize an empty creds.json file if it doesn't exist
  // This prevents the "no such file or directory" errors
  const credsPath = path.join(sessionsDir, 'creds.json');
  if (!fs.existsSync(credsPath)) {
    fs.writeFileSync(credsPath, JSON.stringify({
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
    }, null, 2));
    console.log(`📝 Created initial creds.json file at ${credsPath}`);
  }
  
  // Load our connection keeper to maintain WhatsApp connection
  try {
    require('./connection-keeper.js');
    console.log('✅ Connection keeper loaded successfully');
  } catch (err) {
    console.error('❌ Failed to load connection keeper:', err);
  }
  
  // Use Heroku-specific connection patch
  try {
    require('./heroku-connection-patch.js');
    console.log('✅ Heroku connection patch loaded successfully');
  } catch (err) {
    console.error('❌ Failed to load Heroku connection patch:', err);
    
    // Fall back to standard connection patch if Heroku-specific one fails
    try {
      require('./connection-patch.js');
      console.log('✅ Fallback to standard connection patch successful');
    } catch (fallbackErr) {
      console.error('❌ Failed to load fallback connection patch:', fallbackErr);
    }
  }
  
  // Start the bot in the same process to avoid complexity
  try {
    console.log('🔄 Loading main bot module...');
    require('./index.js');
    console.log('✅ Bot module loaded successfully');
  } catch (err) {
    console.error('❌ Error starting bot:', err);
    
    // Attempt to restart after delay
    console.log('🔄 Will attempt to restart in 10 seconds...');
    setTimeout(startBot, 10000);
  }
}

// Handle shutdown gracefully
process.on('SIGTERM', () => {
  console.log('🛑 Received SIGTERM signal. Heroku is cycling dynos.');
  console.log('💾 Attempting to save sessions before shutdown...');
  
  // Here we don't exit immediately to allow backup processes to complete
  // The Heroku process will be killed automatically after 30 seconds anyway
  // This gives our backup code time to execute
});

process.on('SIGINT', () => {
  console.log('🛑 Received SIGINT signal. Shutting down gracefully...');
  process.exit(0);
});

// Start the bot
startBot();