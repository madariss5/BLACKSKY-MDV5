/**
 * Enhanced Connection Handler Patch
 * This code adds robust connection handling with retries and better error recovery
 */

// Initialize global connection object if not exists
if (!global.conn) {
    global.conn = {};
}

const express = require('express');
const app = express();
const os = require('os');
const fs = require('fs');
const path = require('path');
const { promisify } = require('util');
const { exec } = require('child_process');
const execAsync = promisify(exec);
const sharp = require('sharp');

// Initialize health check server and Heroku compatibility layer
function setupHealthCheckServer() {
    // Try ports sequentially until one works
    const ports = [process.env.PORT || 3000, 8080, 5000, 3001];
    let server;

    const tryPort = (index) => {
        if (index >= ports.length) {
            console.error('No available ports found');
            return;
        }

        server = app.listen(ports[index], '0.0.0.0', () => {
            console.log('\x1b[32m%s\x1b[0m', `⚡ Health check server running on port ${ports[index]}`);
        }).on('error', (err) => {
            if (err.code === 'EADDRINUSE') {
                console.log(`Port ${ports[index]} in use, trying next port...`);
                tryPort(index + 1);
            } else {
                console.error('Server error:', err);
            }
        });
    };

    tryPort(0);
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
                        <p>Environment: ${process.env.NODE_ENV || "development"}</p>
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

    // Logo endpoint for fetching the BLACKSKY-MD logo
    app.get('/logo', async (req, res) => {
        try {
            // Prioritize logo files in order
            const logoFiles = [
                'blacksky-premium-gradient.svg',
                'blacksky-premium-logo.svg', 
                'blacksky-logo-cosmic.svg',
                'blacksky-logo.svg',
                'blacksky-logo-simple.svg'
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

            // Convert SVG to PNG for better compatibility
            try {
                console.log('[CONNECTION] Using logo:', path.basename(logoFile));
                console.log('Converting SVG file:', logoFile);

                const pngBuffer = await sharp(logoFile)
                    .resize(300)
                    .png()
                    .toBuffer();

                res.setHeader('Content-Type', 'image/png');
                res.send(pngBuffer);
                console.log('[CONNECTION] Successfully converted logo SVG to PNG');
            } catch (err) {
                console.error('Error converting SVG to PNG:', err);

                // Fallback to sending the raw SVG
                res.setHeader('Content-Type', 'image/svg+xml');
                res.send(fs.readFileSync(logoFile));
            }
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
            environment: process.env.NODE_ENV || 'development',
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

    // Heroku-specific information endpoint
    app.get('/heroku', (req, res) => {
        const herokuInfo = {
            dyno: process.env.DYNO || 'Not running on Heroku',
            appName: process.env.HEROKU_APP_NAME || 'Unknown',
            region: process.env.HEROKU_REGION || 'Unknown',
            releaseVersion: process.env.HEROKU_RELEASE_VERSION || 'Unknown',
            slugId: process.env.HEROKU_SLUG_ID || 'Unknown',
            dynoSize: process.env.HEROKU_DYNO_SIZE || 'eco'
        };

        res.json(herokuInfo);
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


// Enhanced connection management
const reconnectAttempts = new Map();
const MAX_RETRIES = 10;
const BASE_DELAY = 1000; // 1 second
const MAX_DELAY = 300000; // 5 minutes

async function handleConnectionLoss(connection) {
    if (!connection) {
        console.log('[CONNECTION] No connection object provided');
        return;
    }

    try {
        const jid = connection.user?.jid || 'unknown';
        reconnectAttempts.set(jid, (reconnectAttempts.get(jid) || 0) + 1);
        const attempts = reconnectAttempts.get(jid);

        if (attempts > MAX_RETRIES) {
            console.log(`[CONNECTION] Max retries (${MAX_RETRIES}) reached for ${jid}. Resetting connection...`);
            reconnectAttempts.delete(jid);
            if (connection.ws) {
                connection.ws.close();
            }
            await new Promise(resolve => setTimeout(resolve, 5000));
            return;
        }

        const delay = Math.min(BASE_DELAY * Math.pow(2, attempts - 1) + Math.random() * 1000, MAX_DELAY);
        console.log(`[CONNECTION] Connection lost for ${jid}. Attempt ${attempts}/${MAX_RETRIES} in ${Math.floor(delay/1000)}s`);

        setTimeout(async () => {
            try {
                if (connection.ev) {
                    connection.ev.removeAllListeners('connection.update');
                    connection.ev.removeAllListeners('creds.update');
                }
                await connection.connect();
                console.log(`[CONNECTION] Successfully reconnected ${jid}`);
                reconnectAttempts.delete(jid);
            } catch (err) {
                console.error(`[CONNECTION] Failed to reconnect ${jid}:`, err);
                handleConnectionLoss(connection);
            }
        }, delay);
    } catch (err) {
        console.error('[CONNECTION] Error in handleConnectionLoss:', err);
    }
}

// Make functions available globally
global.connectionManager = {
    handleConnectionLoss,
    resetAttempts: () => reconnectAttempts.clear(),
    getAttempts: (jid) => reconnectAttempts.get(jid) || 0
};

// Export the connection handler
module.exports = {
    handleConnectionLoss,
    setupHealthCheckServer
};

// Load connection message handler
try {
    const { sendConnectionMessage } = require('./plugins/info-connection');
    connectionMessageSender = sendConnectionMessage;
    console.log('✅ Connection patch loaded successfully');
} catch (e) {
    console.log('Loading connection message from globals as fallback');
    connectionMessageSender = global.sendConnectionMessage;
}

// Initialize health check server if in production
if (process.env.NODE_ENV === 'production' || process.env.HEROKU) {
    setupHealthCheckServer();
    console.log('🔍 Health check server initialized for production environment');
}

// Log the patch loading
console.log('🔧 Connection success patch and health check loaded');

// For backwards compatibility
if (!connectionMessageSender && typeof global.sendConnectionSuccess === 'function') {
    console.log('Using legacy connection message function');
    connectionMessageSender = global.sendConnectionSuccess;
}

// For safety, wrap in a check
if (typeof connectionMessageSender === 'function') {
    //Improved connection notification handling.

    // Send the connection message with retry logic
    async function sendStartupMessage(conn, maxRetries = 5) {
        let retryCount = 0;
        const retryInterval = 5000; // 5 seconds between retries

        const sendWithRetry = async () => {
            try {
                if (!conn?.user?.jid) {
                    throw new Error('Connection not ready');
                }

                const botJid = conn.user.jid;
                console.log(`[CONNECTION] Attempting to send startup message to ${botJid}`);

                // Send message with premium logo  (assuming messageText, logoBuffer, and groupLink are defined elsewhere)
                await conn.sendMessage(botJid, {
                    text: messageText,
                    contextInfo: {
                        externalAdReply: {
                            title: '🌌 BLACKSKY-MD PREMIUM',
                            body: 'Successfully Connected',
                            mediaType: 1,
                            previewType: 0,
                            thumbnailUrl: 'https://i.ibb.co/r7GLRnP/generated-icon.png',
                            thumbnail: logoBuffer,
                            sourceUrl: groupLink,
                            showAdAttribution: true,
                            renderLargerThumbnail: true
                        }
                    }
                });

                console.log('[CONNECTION] Startup notification sent successfully');
                return true;
            } catch (error) {
                console.error(`[CONNECTION] Attempt ${retryCount + 1}/${maxRetries} failed:`, error.message);
                retryCount++;

                if (retryCount < maxRetries) {
                    console.log(`[CONNECTION] Retrying in ${retryInterval/1000} seconds...`);
                    await new Promise(resolve => setTimeout(resolve, retryInterval));
                    return sendWithRetry();
                } else {
                    console.error('[CONNECTION] Max retries reached, could not send startup notification');
                    return false;
                }
            }
        };

        return sendWithRetry();
    }

    // Wait for connection to be fully ready before sending
    if (conn) {
        conn.ev.on('connection.update', async (update) => {
            const { connection, lastDisconnect } = update;

            if (connection === 'open') {
                console.log('[CONNECTION] Connection opened, attempting to send startup message');
                await sendStartupMessage(conn);
            }
        });
    }
} else {
    console.log('⚠️ Connection message function not found');
}

/**
 * Perform graceful shutdown, saving data and closing connections
 */
async function performGracefulShutdown() {
    console.log('🔄 Received shutdown signal, performing gracefulshutdown...');

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

        // Perform any other cleanup tasks here
        // ...

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
    // Don't exit, let the process continue
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
    // Don't exit, let the process continue
});

// Add event listener for connection close using ev
if (global.conn?.ev) {
    global.conn.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect } = update;
        if (connection === 'close') {
            handleConnectionLoss(global.conn);
        }
    });
    console.log('[CONNECTION] Event listeners initialized successfully');
} else {
    console.log('[CONNECTION] Waiting for WhatsApp connection to be established...');
}