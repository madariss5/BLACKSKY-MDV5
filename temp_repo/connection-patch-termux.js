/**
 * Termux-friendly Connection Handler Patch
 * This version removes sharp dependencies for better Termux compatibility
 */

// Import required modules
const express = require('express');
const app = express();
const os = require('os');
const fs = require('fs');
const path = require('path');
const { promisify } = require('util');
const { exec } = require('child_process');
const execAsync = promisify(exec);

// Initialize health check server and Termux compatibility layer
function setupHealthCheckServer() {
    const PORT = process.env.PORT || 5000;
    
    // Basic info route
    app.get('/', (req, res) => {
        res.send(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>BLACKSKY-MD Bot</title>
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
                .stats {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 10px;
                }
                .stat-card {
                    background: #2a2a2a;
                    padding: 15px;
                    border-radius: 5px;
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
                    Status: <span class="online">ONLINE</span><br>
                    WhatsApp Connection: ${global.conn?.user ? "Connected" : "Waiting for connection"}
                </div>
                
                <div class="stats">
                    <div class="stat-card">
                        <h3>System Info</h3>
                        <p>Platform: ${os.platform()} ${os.arch()}</p>
                        <p>Node.js: ${process.version}</p>
                        <p>Memory: ${Math.round(process.memoryUsage().rss / 1024 / 1024)} MB</p>
                    </div>
                    <div class="stat-card">
                        <h3>Bot Info</h3>
                        <p>Bot Name: ${process.env.BOT_NAME || global.wm || "BLACKSKY-MD"}</p>
                        <p>Uptime: ${formatUptime(process.uptime())}</p>
                        <p>Environment: ${process.env.NODE_ENV || "termux"}</p>
                    </div>
                </div>
                
                <footer>
                    BLACKSKY-MD Bot &copy; 2025
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
            uptime: process.uptime(),
            memory: process.memoryUsage(),
            connection: {
                connected: !!global.conn?.user,
                user: global.conn?.user?.name || null
            }
        });
    });
    
    // Logo endpoint for fetching the BLACKSKY-MD logo - no image processing
    app.get('/logo', async (req, res) => {
        try {
            // Prioritize logo files in order
            const logoFiles = [
                'blacksky-premium-logo.svg',
                'blacksky-logo.svg',
                'blacksky-logo-simple.svg',
                'icon.png',
                'logo.png'
            ];
            
            let logoFile = null;
            for (const file of logoFiles) {
                const filePath = path.join(process.cwd(), file);
                if (fs.existsSync(filePath)) {
                    logoFile = filePath;
                    break;
                }
            }
            
            if (!logoFile) {
                res.status(404).send('Logo not found');
                return;
            }
            
            // Determine the content type based on file extension
            const ext = path.extname(logoFile).toLowerCase();
            let contentType;
            
            if (ext === '.svg') {
                contentType = 'image/svg+xml';
            } else if (ext === '.png') {
                contentType = 'image/png';
            } else if (ext === '.jpg' || ext === '.jpeg') {
                contentType = 'image/jpeg';
            } else {
                contentType = 'application/octet-stream';
            }
            
            // Simply read and serve the file
            const fileData = fs.readFileSync(logoFile);
            res.setHeader('Content-Type', contentType);
            res.send(fileData);
            console.log('[CONNECTION] Served logo file:', path.basename(logoFile));
        } catch (error) {
            console.error('Error serving logo:', error);
            res.status(500).send('Error loading logo');
        }
    });
    
    // Session status endpoint
    app.get('/status', (req, res) => {
        const sessionStatus = {
            connected: !!global.conn?.user,
            user: global.conn?.user ? {
                name: global.conn.user.name,
                phone: global.conn.user.id.split('@')[0]
            } : null,
            uptime: formatUptime(process.uptime()),
            memory: Math.round(process.memoryUsage().rss / 1024 / 1024) + ' MB',
            timestamp: new Date().toISOString(),
            environment: process.env.NODE_ENV || 'termux',
            version: '2.5.0 Premium'
        };
        
        res.json(sessionStatus);
    });
    
    // Metric monitoring endpoint for external monitoring tools
    app.get('/metrics', (req, res) => {
        const metrics = {
            'bot_uptime_seconds': process.uptime(),
            'bot_memory_usage_bytes': process.memoryUsage().rss,
            'bot_heap_total_bytes': process.memoryUsage().heapTotal,
            'bot_heap_used_bytes': process.memoryUsage().heapUsed,
            'bot_external_bytes': process.memoryUsage().external,
            'bot_connection_status': global.conn?.user ? 1 : 0,
            'system_total_memory_bytes': os.totalmem(),
            'system_free_memory_bytes': os.freemem(),
            'system_load_average': os.loadavg()[0]
        };
        
        // Format as Prometheus metrics
        let output = '';
        for (const [key, value] of Object.entries(metrics)) {
            output += `# HELP ${key} Metric for BLACKSKY-MD bot\n`;
            output += `# TYPE ${key} gauge\n`;
            output += `${key} ${value}\n`;
        }
        
        res.setHeader('Content-Type', 'text/plain');
        res.send(output);
    });
    
    // Session info endpoint
    app.get('/session', (req, res) => {
        const sessionDir = path.join(process.cwd(), 'sessions');
        
        try {
            if (!fs.existsSync(sessionDir)) {
                return res.json({
                    status: 'error',
                    message: 'No sessions directory found'
                });
            }
            
            const sessionId = process.env.SESSION_ID || 'BLACKSKY-MD';
            const sessionFiles = fs.readdirSync(sessionDir)
                .filter(file => file.startsWith(sessionId))
                .map(file => ({
                    name: file,
                    path: path.join(sessionDir, file),
                    size: fs.statSync(path.join(sessionDir, file)).size,
                    modified: fs.statSync(path.join(sessionDir, file)).mtime,
                }));
            
            res.json({
                status: 'success',
                sessionId,
                connected: !!global.conn?.user,
                files: sessionFiles
            });
        } catch (error) {
            res.json({
                status: 'error',
                message: error.message
            });
        }
    });
    
    // Start server
    app.listen(PORT, () => {
        console.log(`⚡ Health check server running on port ${PORT}`);
    });
}

// Helper function to format uptime
function formatUptime(seconds) {
    const days = Math.floor(seconds / (3600 * 24));
    const hours = Math.floor((seconds % (3600 * 24)) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    
    return `${days}d ${hours}h ${minutes}m ${secs}s`;
}

// Initialize health check server if running in Termux or production environment
if (process.env.NODE_ENV === 'production' || process.env.TERMUX) {
    setupHealthCheckServer();
    console.log('🔍 Health check server initialized for Termux environment');
}

// Load our connection message function
let connectionMessageSender = null;

// For safety, try to find and load the connection message function
try {
    // When running as a module, try to require the connection message module
    const { sendConnectionMessage } = require('./plugins/info-connection');
    connectionMessageSender = sendConnectionMessage;
    console.log('✅ Connection patch loaded successfully');
} catch (e) {
    // If we can't load it directly, we'll look for it in globals
    console.log('Loading connection message from globals as fallback');
    connectionMessageSender = global.sendConnectionMessage;
}

// For backwards compatibility
if (!connectionMessageSender && typeof global.sendConnectionSuccess === 'function') {
    console.log('Using legacy connection message function');
    connectionMessageSender = global.sendConnectionSuccess;
}

// For safety, wrap in a check
if (typeof connectionMessageSender === 'function') {
    // Wait for bot to finish loading plugins
    setTimeout(() => {
        try {
            // Send connection success message
            connectionMessageSender(global.conn);
            
            // Also send to owner if owner is configured
            if (global.owner && global.owner.length > 0) {
                let ownerJid = global.owner[0][0] + '@s.whatsapp.net';
                
                // Send to owner's chat directly
                if (ownerJid && ownerJid !== 'undefined@s.whatsapp.net') {
                    connectionMessageSender(global.conn, ownerJid);
                    console.log('📱 Connection success message sent to owner');
                }
            }
        } catch (error) {
            console.error('❌ Error sending connection message:', error);
        }
    }, 5000); // Wait 5 seconds for everything to load
} else {
    console.log('⚠️ Connection message function not found');
}

/**
 * Perform graceful shutdown, saving data and closing connections
 */
async function performGracefulShutdown() {
    console.log('🔄 Received shutdown signal, performing graceful shutdown...');
    
    try {
        // Save session if it exists
        if (global.conn?.user) {
            console.log('💾 Saving WhatsApp session before shutdown...');
            
            // Try to log out properly
            try {
                await global.conn.logout();
                console.log('👋 Successfully logged out from WhatsApp');
            } catch (logoutError) {
                console.error('Error during logout:', logoutError.message);
            }
        }
        
        // Save database if it exists
        if (global.db) {
            console.log('💾 Saving database before shutdown...');
            try {
                await global.db.write();
                console.log('✅ Database saved successfully');
            } catch (dbError) {
                console.error('Error saving database:', dbError.message);
            }
        }
        
        console.log('👍 Graceful shutdown completed');
    } catch (e) {
        console.error('❌ Error during graceful shutdown:', e);
    } finally {
        // Force exit after some time if hanging
        setTimeout(() => {
            console.log('⚠️ Forcing exit after grace period');
            process.exit(0);
        }, 3000);
    }
}

// Register the shutdown handler for different signals
process.on('SIGTERM', performGracefulShutdown);
process.on('SIGINT', performGracefulShutdown);

// Also handle uncaught exceptions to prevent crashes
process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception:', err);
    console.error('Stack trace:', err.stack);
    
    // If this is a connection error, try to recover
    if (err.message && (
        err.message.includes('Connection Closed') || 
        err.message.includes('connection closed') ||
        err.message.includes('Connection terminated') ||
        err.message.includes('timed out')
    )) {
        console.log('🔄 Connection error detected. Attempting to recover...');
        // Try to reconnect if this is a connection error
        if (global.conn && typeof global.reloadHandler === 'function') {
            setTimeout(() => {
                console.log('🔄 Forcing connection refresh...');
                global.reloadHandler(true);
            }, 5000);
        }
    }
    // Don't exit, let the process continue
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
    
    // If this is a connection error, try to recover
    if (reason && reason.message && (
        reason.message.includes('Connection Closed') || 
        reason.message.includes('connection closed') ||
        reason.message.includes('Connection terminated') ||
        reason.message.includes('timed out')
    )) {
        console.log('🔄 Connection rejection detected. Attempting to recover...');
        // Try to reconnect if this is a connection error
        if (global.conn && typeof global.reloadHandler === 'function') {
            setTimeout(() => {
                console.log('🔄 Forcing connection refresh after rejection...');
                global.reloadHandler(true);
            }, 5000);
        }
    }
    // Don't exit, let the process continue
});

// Add connection retrying
const reconnectAttempts = new Map();

async function handleConnectionLoss(conn) {
  const jid = conn.user?.jid || 'unknown';
  
  // Initialize or increment reconnection attempts
  reconnectAttempts.set(jid, (reconnectAttempts.get(jid) || 0) + 1);
  const attempts = reconnectAttempts.get(jid);
  
  // Exponential backoff with max 5 minutes
  const delay = Math.min(Math.pow(2, attempts) * 1000, 300000);
  
  console.log(`⚠️ Connection lost for ${jid}. Reconnection attempt ${attempts} in ${delay/1000}s`);
  
  setTimeout(async () => {
    try {
      console.log(`🔄 Attempting to reconnect ${jid}...`);
      // Force refresh connection
      await conn.ev.flush();
      // Reset reconnection counter on successful reconnection
      reconnectAttempts.set(jid, 0);
      console.log(`✅ Successfully reconnected ${jid}`);
    } catch (err) {
      console.error(`❌ Failed to reconnect ${jid}:`, err);
      // Try again
      handleConnectionLoss(conn);
    }
  }, delay);
}

// Add notification queue
const pendingNotifications = new Map();

async function sendNotificationWithRetry(conn, jid, content, options = {}) {
  const msgId = `${jid}_${Date.now()}`;
  let attempts = 0;
  const maxAttempts = 5;
  
  const attemptSend = async () => {
    try {
      if (!conn.user) {
        // Connection not ready, queue for later
        if (!pendingNotifications.has(msgId) && attempts < maxAttempts) {
          pendingNotifications.set(msgId, { jid, content, options, attempts });
          console.log(`📤 Queued notification for later: ${msgId}`);
          
          // Try again later
          setTimeout(() => {
            const notification = pendingNotifications.get(msgId);
            if (notification) {
              notification.attempts++;
              attempts = notification.attempts;
              attemptSend();
            }
          }, 30000); // 30 seconds
        }
        return;
      }
      
      // Connection ready, send message
      await conn.sendMessage(jid, content, { ...options });
      console.log(`📩 Notification sent successfully: ${msgId}`);
      pendingNotifications.delete(msgId);
    } catch (err) {
      console.error(`❌ Error sending notification: ${err.message}`);
      
      // Retry with backoff
      if (attempts < maxAttempts) {
        attempts++;
        const delay = Math.min(Math.pow(2, attempts) * 1000, 60000);
        console.log(`⏱️ Will retry in ${delay/1000}s (attempt ${attempts}/${maxAttempts})`);
        setTimeout(attemptSend, delay);
      } else {
        console.error(`❌ Failed to send notification after ${maxAttempts} attempts`);
        pendingNotifications.delete(msgId);
      }
    }
  };
  
  attemptSend();
}

// Process queued notifications when connection is established
function processNotificationQueue(conn) {
  if (!conn.user || pendingNotifications.size === 0) return;
  
  console.log(`Processing ${pendingNotifications.size} queued notifications`);
  
  for (const [id, notification] of pendingNotifications.entries()) {
    sendNotificationWithRetry(conn, notification.jid, notification.content, notification.options);
  }
}

// Listen for connection state changes
function listenToConnectionEvents(conn) {
  conn.ev.on('connection.update', (update) => {
    const { connection, lastDisconnect } = update;
    
    if (connection === 'close') {
      // Determine if we should reconnect
      const statusCode = lastDisconnect?.error?.output?.statusCode;
      const shouldReconnect = statusCode !== 401; // 401 = logged out
      
      if (shouldReconnect) {
        handleConnectionLoss(conn);
      }
    }
    
    if (connection === 'open') {
      // Reset reconnection counter on successful connection
      reconnectAttempts.set(conn.user?.jid || 'unknown', 0);
      
      // Process any pending notifications
      processNotificationQueue(conn);
    }
  });
}

// Export the functions
module.exports = {
  handleConnectionLoss,
  sendNotificationWithRetry,
  listenToConnectionEvents,
  performGracefulShutdown
};

// Log the patch loading
console.log('🔧 Termux-friendly connection patch loaded');