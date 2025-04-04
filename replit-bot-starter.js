/**
 * BLACKSKY-MD Bot Starter for Replit
 * 
 * This script is customized for running BLACKSKY-MD WhatsApp bot on Replit
 * with enhanced session persistence and connection stability.
 */

const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');
const express = require('express');
const app = express();
const port = process.env.PORT || 5000;

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

// Start express server for keeping Replit alive
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
        <title>BLACKSKY-MD Bot | Running on Replit</title>
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
                <p>Please check the Replit console for the QR code to scan (if needed).</p>
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
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    botRunning: true
  });
});

// Backup sessions route
app.get('/backup', async (req, res) => {
  try {
    // Run the backup script
    const child = spawn('node', ['backup-sessions.js']);
    
    let output = '';
    
    child.stdout.on('data', (data) => {
      output += data.toString();
    });
    
    child.stderr.on('data', (data) => {
      output += data.toString();
    });
    
    child.on('close', (code) => {
      res.status(200).json({
        status: code === 0 ? 'success' : 'error',
        output: output,
        code: code
      });
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      error: error.message
    });
  }
});

// First start the server
const server = app.listen(port, '0.0.0.0', () => {
  console.log(`⚡ Server running on port ${port}`);
  // Start the bot after server is confirmed running
  setTimeout(startBot, 1000);
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

// Function to start the bot
function startBot() {
  console.log('🤖 Starting BLACKSKY-MD WhatsApp Bot...');
  
  // Set environment variables needed for the bot
  process.env.NODE_ENV = 'production';
  process.env.SESSION_ID = 'BLACKSKY-MD';
  
  // Force use connection patch
  try {
    require('./connection-patch.js');
    console.log('✅ Connection patch loaded successfully');
  } catch (err) {
    console.error('❌ Failed to load connection patch:', err);
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
  console.log('🛑 Received SIGTERM signal. Shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('🛑 Received SIGINT signal. Shutting down gracefully...');
  process.exit(0);
});