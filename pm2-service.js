/**
 * BLACKSKY-MD Premium - PM2 Service Monitor
 * 
 * This service ensures the bot stays running with PM2
 * Compatible with both Termux and Heroku environments
 */

const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');
const http = require('http');

// Detect environment
const isTermux = os.platform() === 'android' || process.env.TERMUX === 'true';
const isHeroku = process.env.HEROKU === 'true' || !!process.env.DYNO;
const PM2_MONITOR_PORT = process.env.PM2_MONITOR_PORT || 9615;

// Logging
const LOG_FILE = path.join(process.cwd(), 'pm2-logs', `pm2-monitor-${new Date().toISOString().split('T')[0]}.log`);
if (!fs.existsSync(path.dirname(LOG_FILE))) {
  fs.mkdirSync(path.dirname(LOG_FILE), { recursive: true });
}

// Service state
const state = {
  startTime: new Date(),
  lastCheck: null,
  checkCount: 0,
  restartCount: 0,
  repairCount: 0,
  botRunning: false,
  pm2Running: false,
  lastLogs: [],
}

/**
 * Add a log entry
 * @param {string} message - Message to log
 * @param {string} type - Log type (INFO, WARNING, ERROR)
 */
function addLog(message, type = 'INFO') {
  const now = new Date();
  const timestamp = now.toISOString();
  const logEntry = `[${timestamp}] [${type}] ${message}`;
  
  console.log(logEntry);
  
  // Keep last 100 logs in memory
  state.lastLogs.push(logEntry);
  if (state.lastLogs.length > 100) {
    state.lastLogs.shift();
  }
  
  // Write to log file
  try {
    fs.appendFileSync(LOG_FILE, logEntry + '\n');
  } catch (err) {
    console.error(`Failed to write to log file: ${err.message}`);
  }
}

/**
 * Execute a command
 * @param {string} command - Command to execute
 * @returns {Promise<{stdout: string, stderr: string, error: any}>}
 */
function executeCommand(command) {
  return new Promise((resolve) => {
    exec(command, (error, stdout, stderr) => {
      resolve({ stdout, stderr, error });
    });
  });
}

/**
 * Check if PM2 is installed
 * @returns {Promise<boolean>}
 */
async function isPM2Installed() {
  const { error } = await executeCommand('pm2 --version');
  return !error;
}

/**
 * Check if PM2 is running
 * @returns {Promise<boolean>}
 */
async function isPM2Running() {
  const { error, stdout } = await executeCommand('pm2 ping');
  return !error && stdout.includes('pong');
}

/**
 * Get PM2 process list
 * @returns {Promise<Array>}
 */
async function getPM2Processes() {
  try {
    const { stdout, error } = await executeCommand('pm2 jlist');
    if (error) return [];
    
    try {
      return JSON.parse(stdout);
    } catch (e) {
      addLog(`Error parsing PM2 process list: ${e.message}`, 'ERROR');
      return [];
    }
  } catch (err) {
    addLog(`Error getting PM2 processes: ${err.message}`, 'ERROR');
    return [];
  }
}

/**
 * Check if bot is running in PM2
 * @returns {Promise<boolean>}
 */
async function isBotRunning() {
  const processes = await getPM2Processes();
  const botProcess = processes.find(p => p.name === 'BLACKSKY-MD');
  return !!botProcess && botProcess.pm2_env.status === 'online';
}

/**
 * Start the bot with PM2
 * @returns {Promise<boolean>}
 */
async function startBot() {
  addLog('Attempting to start bot with PM2...', 'INFO');
  
  // Check if ecosystem.config.js exists
  const hasEcosystem = fs.existsSync(path.join(process.cwd(), 'ecosystem.config.js'));
  
  let command;
  if (hasEcosystem) {
    command = 'pm2 start ecosystem.config.js';
  } else {
    command = 'pm2 start index.js --name BLACKSKY-MD -- --autocleartmp';
  }
  
  const { error, stdout } = await executeCommand(command);
  if (error) {
    addLog(`Failed to start bot: ${error.message}`, 'ERROR');
    return false;
  }
  
  addLog('Bot started successfully', 'INFO');
  return true;
}

/**
 * Restart the bot with PM2
 * @returns {Promise<boolean>}
 */
async function restartBot() {
  addLog('Attempting to restart bot...', 'INFO');
  const { error } = await executeCommand('pm2 restart BLACKSKY-MD');
  
  if (error) {
    addLog(`Failed to restart bot: ${error.message}`, 'ERROR');
    return false;
  }
  
  state.restartCount++;
  addLog('Bot restarted successfully', 'INFO');
  return true;
}

/**
 * Save PM2 process list
 * @returns {Promise<boolean>}
 */
async function savePM2Processes() {
  const { error } = await executeCommand('pm2 save');
  return !error;
}

/**
 * Check and repair PM2 status
 * @returns {Promise<boolean>}
 */
async function checkAndRepair() {
  addLog('Running PM2 status check...', 'INFO');
  state.lastCheck = new Date();
  state.checkCount++;
  
  // Step 1: Check if PM2 is installed
  const isPM2Available = await isPM2Installed();
  if (!isPM2Available) {
    addLog('PM2 is not installed or not available', 'ERROR');
    return false;
  }
  
  // Step 2: Check if PM2 is running
  const pm2Running = await isPM2Running();
  state.pm2Running = pm2Running;
  
  if (!pm2Running) {
    addLog('PM2 daemon is not running, attempting to resurrect...', 'WARNING');
    await executeCommand('pm2 resurrect');
    
    // Check again if resurrection worked
    const pm2ResurrectWorked = await isPM2Running();
    if (!pm2ResurrectWorked) {
      addLog('Failed to resurrect PM2 daemon', 'ERROR');
      return false;
    }
    
    addLog('PM2 daemon resurrected successfully', 'INFO');
    state.repairCount++;
  }
  
  // Step 3: Check if bot is running
  const botRunning = await isBotRunning();
  state.botRunning = botRunning;
  
  if (!botRunning) {
    addLog('Bot is not running, attempting to start...', 'WARNING');
    
    // First try to restart
    let success = await restartBot();
    
    // If restart failed, try to start
    if (!success) {
      addLog('Restart failed, attempting fresh start...', 'WARNING');
      success = await startBot();
    }
    
    if (success) {
      // Save PM2 process list
      await savePM2Processes();
      addLog('Bot is now running', 'INFO');
      state.repairCount++;
      return true;
    } else {
      addLog('Failed to start bot', 'ERROR');
      return false;
    }
  }
  
  // Everything is running smoothly
  addLog('All systems operational - PM2 and bot are running', 'INFO');
  return true;
}

/**
 * Set up a simple monitoring server
 */
function setupMonitoringServer() {
  const server = http.createServer((req, res) => {
    if (req.url === '/health') {
      // Health check endpoint
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        status: state.botRunning ? 'healthy' : 'unhealthy',
        uptime: Math.floor((new Date() - state.startTime) / 1000),
        formattedUptime: formatUptime(Math.floor((new Date() - state.startTime) / 1000)),
        lastCheck: state.lastCheck,
        checkCount: state.checkCount,
        restartCount: state.restartCount,
        repairCount: state.repairCount,
        pm2Running: state.pm2Running,
        botRunning: state.botRunning,
        environment: isTermux ? 'termux' : (isHeroku ? 'heroku' : 'other')
      }));
    } else if (req.url === '/logs') {
      // Logs endpoint
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        logs: state.lastLogs
      }));
    } else {
      // Dashboard page
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>PM2 Monitor - BLACKSKY-MD</title>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body {
              font-family: Arial, sans-serif;
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
              text-shadow: 0 0 5px rgba(0,221,255,0.5);
            }
            .status {
              background: #333;
              padding: 15px;
              border-radius: 5px;
              margin: 20px 0;
            }
            .status-item {
              display: flex;
              justify-content: space-between;
              margin: 10px 0;
              border-bottom: 1px solid #444;
              padding-bottom: 5px;
            }
            .logs {
              background: #222;
              padding: 10px;
              border-radius: 5px;
              height: 300px;
              overflow-y: auto;
              font-family: monospace;
              font-size: 12px;
            }
            .log-entry {
              margin: 5px 0;
              word-break: break-all;
            }
            .healthy { color: #0f6; }
            .unhealthy { color: #f06; }
            .actions {
              display: flex;
              gap: 10px;
              margin: 20px 0;
            }
            button {
              background: #0df;
              color: #111;
              border: none;
              padding: 10px 15px;
              border-radius: 5px;
              cursor: pointer;
              flex: 1;
              font-weight: bold;
            }
            button:hover {
              background: #0cf;
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
            <h1>PM2 Monitor - BLACKSKY-MD</h1>
            
            <div class="status">
              <div class="status-item">
                <span>Status:</span>
                <span class="${state.botRunning ? 'healthy' : 'unhealthy'}">${state.botRunning ? 'HEALTHY' : 'UNHEALTHY'}</span>
              </div>
              <div class="status-item">
                <span>Uptime:</span>
                <span>${formatUptime(Math.floor((new Date() - state.startTime) / 1000))}</span>
              </div>
              <div class="status-item">
                <span>Last Check:</span>
                <span>${state.lastCheck ? state.lastCheck.toLocaleString() : 'Never'}</span>
              </div>
              <div class="status-item">
                <span>PM2 Running:</span>
                <span class="${state.pm2Running ? 'healthy' : 'unhealthy'}">${state.pm2Running ? 'YES' : 'NO'}</span>
              </div>
              <div class="status-item">
                <span>Bot Running:</span>
                <span class="${state.botRunning ? 'healthy' : 'unhealthy'}">${state.botRunning ? 'YES' : 'NO'}</span>
              </div>
              <div class="status-item">
                <span>Environment:</span>
                <span>${isTermux ? 'Termux' : (isHeroku ? 'Heroku' : 'Other')}</span>
              </div>
              <div class="status-item">
                <span>Checks:</span>
                <span>${state.checkCount}</span>
              </div>
              <div class="status-item">
                <span>Restarts:</span>
                <span>${state.restartCount}</span>
              </div>
              <div class="status-item">
                <span>Repairs:</span>
                <span>${state.repairCount}</span>
              </div>
            </div>
            
            <div class="actions">
              <button onclick="runCheck()">Run Check</button>
              <button onclick="restartBot()">Restart Bot</button>
              <button onclick="refreshLogs()">Refresh Logs</button>
            </div>
            
            <h2>Logs</h2>
            <div class="logs" id="logs">
              ${state.lastLogs.map(log => `<div class="log-entry">${log}</div>`).join('')}
            </div>
            
            <footer>
              PM2 Monitor for BLACKSKY-MD Premium © 2025
            </footer>
          </div>
          
          <script>
            function runCheck() {
              fetch('/api/check', { method: 'POST' })
                .then(response => response.json())
                .then(data => {
                  alert(data.message);
                  location.reload();
                })
                .catch(err => {
                  alert('Error: ' + err);
                });
            }
            
            function restartBot() {
              fetch('/api/restart', { method: 'POST' })
                .then(response => response.json())
                .then(data => {
                  alert(data.message);
                  location.reload();
                })
                .catch(err => {
                  alert('Error: ' + err);
                });
            }
            
            function refreshLogs() {
              fetch('/logs')
                .then(response => response.json())
                .then(data => {
                  const logsElement = document.getElementById('logs');
                  logsElement.innerHTML = data.logs.map(log => 
                    '<div class="log-entry">' + log + '</div>'
                  ).join('');
                })
                .catch(err => {
                  alert('Error: ' + err);
                });
            }
            
            // Auto-refresh every 30 seconds
            setInterval(() => {
              location.reload();
            }, 30000);
          </script>
        </body>
        </html>
      `);
    }
  });
  
  // API endpoints for the dashboard
  server.on('request', (req, res) => {
    if (req.method === 'POST') {
      if (req.url === '/api/check') {
        checkAndRepair()
          .then(success => {
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({
              success,
              message: success ? 'Check completed successfully' : 'Check failed'
            }));
          })
          .catch(err => {
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({
              success: false,
              message: `Error: ${err.message}`
            }));
          });
      } else if (req.url === '/api/restart') {
        restartBot()
          .then(success => {
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({
              success,
              message: success ? 'Bot restarted successfully' : 'Failed to restart bot'
            }));
          })
          .catch(err => {
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({
              success: false,
              message: `Error: ${err.message}`
            }));
          });
      }
    }
  });
  
  // Start server
  server.listen(PM2_MONITOR_PORT, '0.0.0.0', () => {
    addLog(`PM2 Monitor server listening on port ${PM2_MONITOR_PORT}`, 'INFO');
  });
}

/**
 * Format uptime in a human-readable format
 * @param {number} seconds 
 * @returns {string}
 */
function formatUptime(seconds) {
  const days = Math.floor(seconds / (24 * 3600));
  seconds %= (24 * 3600);
  const hours = Math.floor(seconds / 3600);
  seconds %= 3600;
  const minutes = Math.floor(seconds / 60);
  seconds %= 60;
  
  let result = '';
  if (days > 0) result += `${days}d `;
  if (hours > 0) result += `${hours}h `;
  if (minutes > 0) result += `${minutes}m `;
  result += `${seconds}s`;
  
  return result;
}

/**
 * Main function
 */
async function main() {
  addLog('Starting PM2 Monitor service...', 'INFO');
  
  // Set up web server
  setupMonitoringServer();
  
  // Run initial check
  await checkAndRepair();
  
  // Set up check interval (every 2 minutes)
  setInterval(async () => {
    await checkAndRepair();
  }, 2 * 60 * 1000);
  
  // Special debug check for first few minutes
  let quickCheckCount = 0;
  const quickCheckInterval = setInterval(async () => {
    quickCheckCount++;
    if (quickCheckCount >= 5) {
      clearInterval(quickCheckInterval);
      return;
    }
    
    addLog('Running quick check...', 'INFO');
    await checkAndRepair();
  }, 30 * 1000);
  
  // We're ready
  addLog('PM2 Monitor service is running', 'INFO');
}

// Start the service
main().catch(err => {
  addLog(`Error in main: ${err.message}`, 'ERROR');
  process.exit(1);
});