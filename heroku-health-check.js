/**
 * BLACKSKY-MD Premium - Heroku Health Check System
 * 
 * This specialized health check system helps maintain 24/7 operation on Heroku by:
 * 1. Providing a web endpoint that prevents dyno sleeping
 * 2. Monitoring WhatsApp connection status
 * 3. Exposing metrics and diagnostics
 * 4. Allowing remote status checks
 * 5. Triggering recovery processes when needed
 */

const fs = require('fs');
const path = require('path');
const os = require('os');
const express = require('express');
const app = express();
const port = process.env.PORT || 5000;

// Global state tracking
const STATE = {
  botStartTime: Date.now(),
  connectionStatus: 'initializing', // 'connected', 'disconnected', 'initializing', 'error'
  lastHealthCheck: Date.now(),
  lastBackup: null,
  qrCodeAvailable: false,
  qrAttempts: 0,
  memoryUsage: {},
  dynoCycle: 0,
  sessionExists: false,
  postgresqlStatus: 'unknown',
  lastReconnectAttempt: null,
  errorCount: 0,
  lastError: null
};

// Middleware to parse JSON
app.use(express.json());

// Basic security middleware
app.use((req, res, next) => {
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  next();
});

// Root endpoint with status page
app.get('/', (req, res) => {
  const uptimeHours = ((Date.now() - STATE.botStartTime) / 1000 / 60 / 60).toFixed(2);

  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
        <title>BLACKSKY-MD Premium | Heroku Status</title>
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
            .initializing {
                color: #fc2;
                font-weight: bold;
            }
            footer {
                text-align: center;
                margin-top: 20px;
                font-size: 0.8em;
                color: #888;
            }
            .metric {
                display: flex;
                justify-content: space-between;
                border-bottom: 1px solid #444;
                padding: 8px 0;
            }
            .metric-value {
                font-family: monospace;
            }
            .memory {
                height: 10px;
                background: #333;
                border-radius: 5px;
                margin-top: 10px;
            }
            .memory-used {
                height: 100%;
                background: linear-gradient(90deg, #0f6, #fc2, #f55);
                border-radius: 5px;
                width: ${Math.min(process.memoryUsage().rss / (process.env.MAX_MEMORY_MB * 1024 * 1024 || 512 * 1024 * 1024) * 100, 100)}%;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <h1>BLACKSKY-MD Premium</h1>
            <div class="status">
                <p>Server Status: <span class="online">ONLINE</span></p>
                <p>WhatsApp Bot: <span class="${STATE.connectionStatus === 'connected' ? 'online' : STATE.connectionStatus === 'initializing' ? 'initializing' : 'offline'}">${STATE.connectionStatus.toUpperCase()}</span></p>
                <p>Uptime: ${uptimeHours} hours</p>
                <p>Last Updated: ${new Date().toLocaleString()}</p>
            </div>

            <div>
                <h3>System Metrics</h3>
                <div class="metric">
                    <span>Memory Usage:</span>
                    <span class="metric-value">${Math.round(process.memoryUsage().rss / 1024 / 1024)} MB</span>
                </div>
                <div class="memory">
                    <div class="memory-used"></div>
                </div>
                <div class="metric">
                    <span>Heap:</span>
                    <span class="metric-value">${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)} MB / ${Math.round(process.memoryUsage().heapTotal / 1024 / 1024)} MB</span>
                </div>
                <div class="metric">
                    <span>Session Files:</span>
                    <span class="metric-value">${STATE.sessionExists ? 'Present' : 'Missing'}</span>
                </div>
                <div class="metric">
                    <span>PostgreSQL:</span>
                    <span class="metric-value">${STATE.postgresqlStatus}</span>
                </div>
                <div class="metric">
                    <span>Last Backup:</span>
                    <span class="metric-value">${STATE.lastBackup ? new Date(STATE.lastBackup).toLocaleString() : 'Never'}</span>
                </div>
                <div class="metric">
                    <span>Platform:</span>
                    <span class="metric-value">${process.env.DYNO || 'unknown'} (${process.platform})</span>
                </div>
                <div class="metric">
                    <span>Node.js:</span>
                    <span class="metric-value">${process.version}</span>
                </div>
            </div>

            <footer>
                BLACKSKY-MD Premium © 2025 | Running on Heroku
            </footer>
        </div>
    </body>
    </html>
  `);
});

// Health check endpoint (integrated from edited code)
app.get('/health', (req, res) => {
  // Update last health check time
  STATE.lastHealthCheck = Date.now();

  // Check session files
  const sessionDir = path.join(process.cwd(), 'sessions');
  STATE.sessionExists = fs.existsSync(sessionDir) && fs.readdirSync(sessionDir).some(f => f.endsWith('.json'));

  // Get current memory usage
  STATE.memoryUsage = process.memoryUsage();

  const uptime = process.uptime();
  const memory = process.memoryUsage();

  res.json({
    status: STATE.connectionStatus === 'connected' ? 'ok' : 'warning',
    timestamp: new Date().toISOString(),
    uptime: Math.floor(uptime),
    memory: {
      heapUsed: Math.round(memory.heapUsed / 1024 / 1024) + 'MB',
      rss: Math.round(memory.rss / 1024 / 1024) + 'MB'
    },
    connection: global.conn?.user ? 'connected' : 'disconnected',
    session: STATE.sessionExists,
    connectionStatus: STATE.connectionStatus,
    postgresqlStatus: STATE.postgresqlStatus,
    platform: {
      node: process.version,
      platform: process.platform,
      arch: process.arch,
      dyno: process.env.DYNO || 'unknown'
    }
  });
});


// Metrics endpoint (JSON format) for monitoring tools
app.get('/metrics', (req, res) => {
  // Basic system info
  const cpuUsage = os.loadavg()[0];
  const freeMem = os.freemem() / 1024 / 1024;
  const totalMem = os.totalmem() / 1024 / 1024;
  const memoryUsage = Math.round(((totalMem - freeMem) / totalMem) * 100);

  res.status(200).json({
    bot: {
      uptime: process.uptime(),
      status: STATE.connectionStatus,
      sessionExists: STATE.sessionExists,
      qrCodeAvailable: STATE.qrCodeAvailable,
      lastBackup: STATE.lastBackup,
      lastError: STATE.lastError,
      errorCount: STATE.errorCount
    },
    system: {
      cpu: {
        usage: cpuUsage,
        cores: os.cpus().length
      },
      memory: {
        total: Math.round(totalMem),
        free: Math.round(freeMem),
        usage: memoryUsage,
        process: {
          rss: Math.round(process.memoryUsage().rss / 1024 / 1024),
          heapUsed: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
          heapTotal: Math.round(process.memoryUsage().heapTotal / 1024 / 1024)
        }
      },
      platform: {
        type: os.type(),
        platform: process.platform,
        version: os.release(),
        arch: process.arch,
        node: process.version,
        dyno: process.env.DYNO || 'unknown'
      }
    },
    heroku: {
      app: process.env.HEROKU_APP_NAME || 'unknown',
      dyno: process.env.DYNO || 'unknown',
      dynoCycle: STATE.dynoCycle,
      releaseVersion: process.env.HEROKU_RELEASE_VERSION || 'unknown'
    },
    timestamp: new Date().toISOString()
  });
});

// Update bot status endpoint (used by the bot to report its status)
app.post('/status/update', (req, res) => {
  const { connectionStatus, qrCodeAvailable, error, backup, postgresqlStatus } = req.body;

  if (connectionStatus) STATE.connectionStatus = connectionStatus;
  if (qrCodeAvailable !== undefined) STATE.qrCodeAvailable = qrCodeAvailable;
  if (postgresqlStatus) STATE.postgresqlStatus = postgresqlStatus;

  if (error) {
    STATE.errorCount++;
    STATE.lastError = {
      message: error.message || 'Unknown error',
      time: Date.now()
    };
  }

  if (backup) {
    STATE.lastBackup = Date.now();
  }

  res.status(200).json({ success: true });
});

// Trigger backup endpoint (requires authorization)
app.post('/trigger/backup', (req, res) => {
  const authHeader = req.headers.authorization;

  // Basic auth check - in production you'd want something more secure
  if (!authHeader || authHeader !== `Bearer ${process.env.HEROKU_API_KEY}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  // Set a global flag that the bot can check
  global.TRIGGER_BACKUP = true;

  res.status(200).json({ 
    success: true,
    message: 'Backup triggered. Bot will perform backup on next cycle.'
  });
});

// Errors not caught elsewhere will be logged
app.use((err, req, res, next) => {
  console.error('Health server error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Start the server
const server = app.listen(port, '0.0.0.0', () => {
  console.log(`Health check server running on port ${port}`);

  // Log startup for diagnostics
  console.log(`System: ${os.type()} ${os.platform()} ${os.release()}`);
  console.log(`Node.js: ${process.version}`);
  console.log(`Memory: ${Math.round(os.totalmem() / 1024 / 1024 / 1024)} GB`);
  console.log(`Process ID: ${process.pid}`);
  console.log(`Heroku Dyno: ${process.env.DYNO || 'unknown'}`);
});

// Export for use in other modules
module.exports = {
  updateStatus: (status) => {
    STATE.connectionStatus = status;
  },
  reportBackup: () => {
    STATE.lastBackup = Date.now();
  },
  reportError: (error) => {
    STATE.errorCount++;
    STATE.lastError = {
      message: error.message || 'Unknown error',
      time: Date.now()
    };
  }
};

// Process error handlers
process.on('uncaughtException', (err) => {
  console.error('Uncaught exception in health check server:', err);
  // Don't exit - we want to keep the health check running
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled rejection in health check server:', reason);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down health check server gracefully');
  server.close(() => {
    console.log('Health check server closed');
  });
});