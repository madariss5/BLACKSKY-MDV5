const express = require('express');
const os = require('os');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 5000;

// Basic JSON response
app.get('/', (req, res) => {
  res.json({
    status: "online",
    message: "WhatsApp Bot Successfully Activated!",
    author: "BLACKSKY-MD"
  });
});

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: "healthy",
    uptime: formatUptime(process.uptime()),
    memory: {
      total: formatBytes(os.totalmem()),
      free: formatBytes(os.freemem()),
      usage: Math.round((os.totalmem() - os.freemem()) / os.totalmem() * 100) + "%"
    }
  });
});

// Dashboard
app.get('/dashboard', (req, res) => {
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
        <p><strong>Bot Uptime:</strong> ${formatUptime(process.uptime())}</p>
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

// Helper: Format bytes
function formatBytes(bytes, decimals = 2) {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(decimals)) + ' ' + sizes[i];
}

// Helper: Format uptime
function formatUptime(seconds) {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  
  const parts = [];
  if (days > 0) parts.push(`${days}d`);
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0) parts.push(`${minutes}m`);
  if (secs > 0 || parts.length === 0) parts.push(`${secs}s`);
  
  return parts.join(' ');
}

// Start the server
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`[SERVER] HTTP server running on port ${PORT}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('[SERVER] SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('[SERVER] HTTP server closed');
    process.exit(0);
  });
});

// Manual start of WhatsApp bot is required - this is just the web interface
console.log('[SERVER] WhatsApp Bot web interface active. The bot must be started separately.');