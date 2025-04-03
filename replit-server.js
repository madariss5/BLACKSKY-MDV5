/**
 * Replit-Specific WhatsApp Bot Server
 * 
 * This script is specifically designed for Replit to:
 * 1. Ensure the server runs on port 5000 (required for Replit workflows)
 * 2. Kill any processes that might be using port 5000
 * 3. Provide a stable web interface for the WhatsApp bot
 * 4. Start the actual WhatsApp bot in the background
 */

const express = require('express');
const { exec, execSync, spawn } = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');

// Configuration
const PORT = 5000;
const app = express();

// Console with colors
const log = {
  info: (msg) => console.log(`\x1b[34m[INFO]\x1b[0m ${msg}`),
  success: (msg) => console.log(`\x1b[32m[SUCCESS]\x1b[0m ${msg}`),
  warn: (msg) => console.log(`\x1b[33m[WARNING]\x1b[0m ${msg}`),
  error: (msg) => console.error(`\x1b[31m[ERROR]\x1b[0m ${msg}`)
};

/**
 * Kill processes using the specified port
 */
function killProcessesOnPort(port) {
  try {
    log.info(`Checking for processes using port ${port}...`);
    
    // Using lsof (works in Replit environment)
    try {
      exec(`lsof -i :${port} -t`, (error, stdout) => {
        if (error) {
          // No processes found - that's actually good
          log.info(`No processes found using port ${port}`);
          return;
        }
        
        const pids = stdout.trim().split('\n');
        if (pids.length > 0 && pids[0]) {
          log.warn(`Found ${pids.length} processes using port ${port}. Terminating...`);
          
          pids.forEach(pid => {
            if (pid && parseInt(pid) !== process.pid) {
              try {
                process.kill(parseInt(pid), 'SIGKILL');
                log.info(`Terminated process ${pid}`);
              } catch (e) {
                log.warn(`Could not terminate process ${pid}: ${e.message}`);
              }
            }
          });
        }
      });
    } catch (e) {
      log.warn(`Could not check for processes using lsof: ${e.message}`);
    }
    
    // Alternative: using netstat (might be available in some environments)
    try {
      exec(`netstat -nlp | grep :${port}`, (error, stdout) => {
        if (!error && stdout) {
          log.warn(`Found additional processes on port ${port} via netstat`);
          
          // Try pkill as a fallback (works in Replit)
          try {
            execSync(`pkill -f "node.*:${port}"`, { stdio: 'inherit' });
          } catch (pkillErr) {
            // Ignore errors from pkill
          }
        }
      });
    } catch (e) {
      // Ignore errors from netstat - might not be installed
    }
    
    // Extra forceful approach for Replit
    try {
      execSync(`pkill -f "node.*listen.*${port}"`, { stdio: ['ignore', 'ignore', 'ignore'] });
    } catch (e) {
      // Ignore errors
    }
    
    // Wait a moment to ensure the port is freed
    return new Promise(resolve => setTimeout(resolve, 1000));
    
  } catch (err) {
    log.error(`Error in killProcessesOnPort: ${err.message}`);
    return Promise.resolve(); // Continue anyway
  }
}

/**
 * Setup Express routes
 */
function setupRoutes() {
  // Root endpoint - JSON status
  app.get('/', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    const data = {
      status: 'online',
      message: 'WhatsApp Bot successfully activated',
      server_time: new Date().toISOString(),
      uptime: formatUptime(process.uptime())
    };
    res.send(JSON.stringify(data, null, 2));
  });

  // Health check
  app.get('/health', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    const healthData = {
      status: 'healthy',
      uptime: formatUptime(process.uptime()),
      memory: {
        total: formatBytes(os.totalmem()),
        free: formatBytes(os.freemem()),
        usage: `${Math.round((os.totalmem() - os.freemem()) / os.totalmem() * 100)}%`
      },
      system: {
        platform: os.platform(),
        arch: os.arch(),
        version: os.release(),
        cpus: os.cpus().length
      }
    };
    res.send(JSON.stringify(healthData, null, 2));
  });

  // Dashboard with HTML
  app.get('/dashboard', (req, res) => {
    res.setHeader('Content-Type', 'text/html');
    const html = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>WhatsApp Bot - Dashboard</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; max-width: 800px; margin: 0 auto; padding: 20px; color: #333; }
          header { background: #4CAF50; color: white; padding: 1em; border-radius: 5px; margin-bottom: 20px; }
          .card { background: white; border-radius: 5px; padding: 20px; margin-bottom: 20px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
          .status { display: flex; align-items: center; }
          .status::before { content: ""; display: inline-block; width: 12px; height: 12px; background: #4CAF50; border-radius: 50%; margin-right: 8px; }
          .stats { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
          .stat-item { background: #f8f9fa; padding: 10px; border-radius: 5px; }
          .stat-item h3 { margin-top: 0; font-size: 1em; color: #666; }
          .stat-item p { margin-bottom: 0; font-size: 1.2em; font-weight: bold; }
          @media (max-width: 600px) { .stats { grid-template-columns: 1fr; } }
        </style>
      </head>
      <body>
        <header>
          <h1>WhatsApp Bot Dashboard</h1>
        </header>
        
        <section class="card">
          <h2 class="status">System Status: Online</h2>
          <p>Server running on port ${PORT}</p>
          <p>Last started: ${new Date().toLocaleString()}</p>
        </section>
        
        <section class="card">
          <h2>System Statistics</h2>
          <div class="stats">
            <div class="stat-item">
              <h3>Uptime</h3>
              <p>${formatUptime(process.uptime())}</p>
            </div>
            <div class="stat-item">
              <h3>Memory Usage</h3>
              <p>${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)} MB</p>
            </div>
            <div class="stat-item">
              <h3>Platform</h3>
              <p>${os.platform()} (${os.arch()})</p>
            </div>
            <div class="stat-item">
              <h3>Node.js Version</h3>
              <p>${process.version}</p>
            </div>
          </div>
        </section>
        
        <section class="card">
          <h2>Bot Information</h2>
          <p>This is a multilingual WhatsApp bot with support for English and German languages.</p>
          <p>The bot uses Baileys to connect to WhatsApp and provides numerous features including language learning capabilities.</p>
        </section>
      </body>
      </html>
    `;
    res.send(html);
  });

  log.info('Express routes configured successfully');
}

/**
 * Start the WhatsApp bot in the background
 */
function startWhatsAppBot() {
  try {
    log.info('Starting WhatsApp bot process in the background...');
    
    // Create a detached child process
    const botProcess = spawn('node', ['index.js'], {
      detached: true,
      stdio: 'ignore',
      env: { ...process.env, PORT: 0 } // Use a random high port for the bot's own express server
    });
    
    // Unref the child so parent can exit independently
    botProcess.unref();
    
    log.success('WhatsApp bot started in background');
    return true;
  } catch (error) {
    log.error(`Failed to start WhatsApp bot: ${error.message}`);
    return false;
  }
}

/**
 * Format bytes to human readable format
 */
function formatBytes(bytes, decimals = 2) {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(decimals)) + ' ' + sizes[i];
}

/**
 * Format uptime to human readable format
 */
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

/**
 * Main function
 */
async function main() {
  log.info('Starting WhatsApp Bot server for Replit...');
  
  // Kill any existing processes on port 5000
  await killProcessesOnPort(PORT);
  
  // Setup Express routes
  setupRoutes();
  
  // Start the server
  app.listen(PORT, '0.0.0.0', () => {
    log.success(`Server started on port ${PORT}`);
    
    // Start the WhatsApp bot in the background after a short delay
    setTimeout(() => {
      startWhatsAppBot();
    }, 2000);
  }).on('error', (err) => {
    log.error(`Failed to start server: ${err.message}`);
    
    if (err.code === 'EADDRINUSE') {
      log.warn(`Port ${PORT} is still in use despite our cleanup efforts`);
      log.info('Attempting more aggressive process termination...');
      
      // Try more aggressive approach
      try {
        execSync(`pkill -9 -f "node"`, { stdio: 'inherit' });
        log.warn('Killed all Node.js processes. Waiting before retry...');
        
        // Wait 5 seconds and try again
        setTimeout(() => {
          log.info('Attempting to restart server...');
          main();
        }, 5000);
      } catch (e) {
        log.error(`Failed to kill processes: ${e.message}`);
        process.exit(1);
      }
    } else {
      process.exit(1);
    }
  });
}

// Handle process signals
process.on('SIGINT', () => {
  log.info('Received SIGINT signal. Shutting down gracefully...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  log.info('Received SIGTERM signal. Shutting down gracefully...');
  process.exit(0);
});

// Start the server
main();