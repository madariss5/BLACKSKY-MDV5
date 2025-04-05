/**
 * WhatsApp Bot Server Launcher
 * 
 * This script ensures proper process management and port allocation
 * for the WhatsApp bot in the Replit environment.
 */

const express = require('express');
const os = require('os');
const { execSync } = require('child_process');

// Constants
const PORT = 5000;
const app = express();

// Setup routes
app.get('/', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  const data = {
    status: 'true',
    message: 'WhatsApp Bot Successfully Activated!',
    author: 'BLACKSKY-MD'
  };
  res.send(JSON.stringify({ response: data }, null, 2));
});

// Health check endpoint
app.get('/health', (req, res) => {
  const uptime = process.uptime();
  const uptimeFormatted = `${Math.floor(uptime / 3600)}h ${Math.floor((uptime % 3600) / 60)}m ${Math.floor(uptime % 60)}s`;
  
  res.setHeader('Content-Type', 'application/json');
  res.send(JSON.stringify({
    status: 'healthy',
    uptime: uptimeFormatted,
    memory: {
      total: `${(os.totalmem() / (1024 * 1024 * 1024)).toFixed(2)} GB`,
      free: `${(os.freemem() / (1024 * 1024 * 1024)).toFixed(2)} GB`
    }
  }, null, 2));
});

// Dashboard route
app.get('/dashboard', (req, res) => {
  res.setHeader('Content-Type', 'text/html');
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>WhatsApp Bot Dashboard</title>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
        .status { padding: 10px; border-radius: 5px; margin: 10px 0; }
        .online { background-color: #d4edda; color: #155724; }
        .info { background-color: #f8f9fa; border: 1px solid #ddd; padding: 15px; border-radius: 5px; }
        h1 { color: #343a40; }
      </style>
    </head>
    <body>
      <h1>BLACKSKY-MD WhatsApp Bot</h1>
      <div class="status online">Status: Online</div>
      <div class="info">
        <p><strong>Bot Uptime:</strong> ${Math.floor(process.uptime() / 3600)}h ${Math.floor((process.uptime() % 3600) / 60)}m</p>
        <p><strong>Memory Usage:</strong> ${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)} MB</p>
        <p><strong>Platform:</strong> ${os.platform()} (${os.arch()})</p>
        <p><strong>Node.js Version:</strong> ${process.version}</p>
      </div>
      <p>This is a multilingual WhatsApp bot with support for English and German languages.</p>
    </body>
    </html>
  `;
  res.send(html);
});

// Attempt to free port 5000 if it's in use
function freePort() {
  try {
    console.log(`[SERVER] Attempting to free port ${PORT}...`);
    execSync(`fuser -k ${PORT}/tcp 2>/dev/null || true`, { stdio: 'inherit' });
    console.log(`[SERVER] Port ${PORT} should now be available`);
  } catch (err) {
    // Ignore errors - fuser might not be available
  }
}

// Launch the bot in the background
function launchBot() {
  try {
    console.log('[SERVER] Starting WhatsApp bot in the background...');
    
    // Using spawn would be better, but for simplicity in this demo
    // we're using execSync with background process
    execSync('node index.js > whatsapp-bot.log 2>&1 &', { stdio: 'inherit' });
    
    console.log('[SERVER] WhatsApp bot started in background');
  } catch (err) {
    console.error(`[SERVER] Error starting bot: ${err.message}`);
  }
}

// Main function
async function main() {
  try {
    // First, try to free the port
    freePort();
    
    // Start the web server
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`[SERVER] Web server started on port ${PORT}`);
      
      // Start the WhatsApp bot in the background
      setTimeout(() => {
        launchBot();
      }, 1000);
    });
  } catch (err) {
    console.error(`[SERVER] Critical error: ${err.message}`);
    process.exit(1);
  }
}

// Start the server
main();

// Handle clean shutdown
process.on('SIGINT', () => {
  console.log('[SERVER] Shutting down...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('[SERVER] Received SIGTERM, shutting down...');
  process.exit(0);
});