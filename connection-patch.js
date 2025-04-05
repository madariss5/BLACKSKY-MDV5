/**
 * BLACKSKY-MD Premium - Connection Patch
 * 
 * This module patches the standard WhatsApp connection with:
 * 1. Enhanced error handling
 * 2. Automatic reconnection with exponential backoff
 * 3. Connection status monitoring and recovery
 * 4. Graceful shutdown handling
 * 5. Health check endpoint
 */

// Initialize Express for the health endpoint
const express = require('express');
const app = express();
let healthCheckServer = null; // Reference to the server

// Initialize standard modules
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
const { default: makeWASocket, useMultiFileAuthState, jidDecode } = require('@adiwajshing/baileys'); //Added jidDecode

// Initialize global variables
let reconnectTimer = null;

// Track if health check server has been initialized
let healthCheckServerInitialized = false;

function setupHealthCheckServer() {
    // Skip if already initialized to prevent port conflicts
    if (healthCheckServerInitialized) {
        console.log('Health check server already initialized, skipping duplicate initialization');
        return;
    }

    // Use a dedicated health check port that's different from the main server port
    const PORT = process.env.HEALTH_CHECK_PORT || 28111;

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
                <h1>BLACKSKY-MD Bot</h1>
                <div class="status">
                    <p>Status: <span class="online">ONLINE</span></p>
                    <p>Uptime: ${formatUptime(process.uptime())}</p>
                    <p>Environment: ${process.env.NODE_ENV || 'development'}</p>
                    <p>Last Updated: ${new Date().toLocaleString()}</p>
                </div>
                <footer>
                    BLACKSKY-MD Premium Bot
                </footer>
            </div>
        </body>
        </html>
        `);
    });

    // More detailed status endpoint in JSON format
    app.get('/status', (req, res) => {
        const uptime = process.uptime();

        const herokuInfo = {
            status: 'online',
            uptime: formatUptime(uptime),
            timestamp: new Date().toISOString(),
            environment: process.env.NODE_ENV || 'development',
            memory: {
                rss: Math.round(process.memoryUsage().rss / 1024 / 1024) + ' MB',
                heapTotal: Math.round(process.memoryUsage().heapTotal / 1024 / 1024) + ' MB',
                heapUsed: Math.round(process.memoryUsage().heapUsed / 1024 / 1024) + ' MB'
            },
            bot: {
                connected: global.conn && global.conn.user ? true : false,
                user: global.conn && global.conn.user ? global.conn.user.name || 'Unknown' : 'Not connected'
            }
        };

        res.json(herokuInfo);
    });

    // Start server with error handling
    try {
        // Close any existing server
        if (healthCheckServer) {
            try {
                healthCheckServer.close();
            } catch (err) {
                console.log('Error closing existing health check server:', err.message);
            }
        }

        healthCheckServer = app.listen(PORT, () => {
            console.log(`⚡ Health check server running on port ${PORT}`);
            healthCheckServerInitialized = true;
        });

        healthCheckServer.on('error', (err) => {
            console.error(`Failed to start health check server on port ${PORT}:`, err.message);
            // Try another port if this one is in use
            if (err.code === 'EADDRINUSE') {
                const newPort = Math.floor(Math.random() * 10000) + 50000;
                console.log(`Port ${PORT} already in use, trying port ${newPort} instead`);
                healthCheckServer = app.listen(newPort, () => {
                    console.log(`⚡ Health check server running on alternate port ${newPort}`);
                    healthCheckServerInitialized = true;
                });
            }
        });
    } catch (err) {
        console.error('Failed to initialize health check server:', err);
    }
}

// Helper function to format uptime
function formatUptime(seconds) {
    const days = Math.floor(seconds / (3600 * 24));
    const hours = Math.floor((seconds % (3600 * 24)) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);

    return `${days}d ${hours}h ${minutes}m ${secs}s`;
}

// Initialize health check server if running on Heroku or production environment
if (process.env.NODE_ENV === 'production' || process.env.HEROKU) {
    setupHealthCheckServer();
    console.log('🔍 Health check server initialized for production environment');
}

// Setup reconnection system
let reconnectInterval = null;
let reconnectAttempts = 0;

function setupReconnectionSystem() {
    if (reconnectInterval) {
        clearInterval(reconnectInterval);
    }

    reconnectInterval = setInterval(() => {
        // Check if connection is closed or disconnected
        if (global.conn && (!global.conn.user || global.conn.ws.readyState !== 1)) {
            reconnectAttempts++;
            console.log(`⚠️ Connection appears to be closed. Attempt #${reconnectAttempts} to reconnect...`);

            try {
                // Try to trigger built-in reconnection
                if (global.conn.ev) {
                    global.conn.ev.emit('connection.update', { connection: 'close' });
                }

                // If more than 5 reconnection attempts, do a full reload
                if (reconnectAttempts > 5 && typeof global.reloadHandler === 'function') {
                    console.log('🔄 Multiple reconnection attempts failed. Forcing full reload...');
                    reconnectAttempts = 0;
                    global.reloadHandler(true);
                }
            } catch (e) {
                console.error('Error during reconnection attempt:', e);
            }
        } else {
            // Reset counter when connected
            if (reconnectAttempts > 0) {
                console.log('✅ Connection is stable again. Resetting reconnection counter.');
                reconnectAttempts = 0;
            }
        }
    }, 30000); // Check every 30 seconds
}

// Start the reconnection system
setupReconnectionSystem();

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
        } catch (e) {
            console.log('Error sending connection message:', e);
        }
    }, 15000);
}

/**
 * Perform graceful shutdown, saving data and closing connections
 */
async function performGracefulShutdown() {
    console.log('🛑 Performing graceful shutdown...');

    // Clear reconnection timer if it exists
    if (reconnectInterval) {
        clearInterval(reconnectInterval);
        console.log('✅ Cleared reconnection interval');
    }

    // Close health check server if it exists
    if (healthCheckServer) {
        try {
            healthCheckServer.close();
            console.log('✅ Closed health check server');
        } catch (err) {
            console.log('❌ Error closing health check server:', err.message);
        }
    }

    // Save session state if possible
    if (global.conn && global.conn.authState && typeof global.conn.authState.saveState === 'function') {
        try {
            await global.conn.authState.saveState();
            console.log('✅ Saved auth state');
        } catch (err) {
            console.log('❌ Error saving auth state:', err.message);
        }
    }

    // Close WhatsApp connection if it exists
    if (global.conn && global.conn.ws) {
        try {
            global.conn.ws.close();
            console.log('✅ Closed WhatsApp connection');
        } catch (err) {
            console.log('❌ Error closing WhatsApp connection:', err.message);
        }
    }

    // Save database if it exists
    if (global.db && typeof global.db.write === 'function') {
        try {
            await global.db.write();
            console.log('✅ Saved database');
        } catch (err) {
            console.log('❌ Error saving database:', err.message);
        }
    }

    console.log('✅ Graceful shutdown complete');
}

// Register global handlers for clean shutdown
process.on('SIGTERM', async () => {
    console.log('🛑 Received SIGTERM signal');
    await performGracefulShutdown();
    process.exit(0);
});

process.on('SIGINT', async () => {
    console.log('🛑 Received SIGINT signal');
    await performGracefulShutdown();
    process.exit(0);
});

// Export the graceful shutdown function
module.exports = {
    performGracefulShutdown,
    setupHealthCheckServer
};