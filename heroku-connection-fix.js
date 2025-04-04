/**
 * BLACKSKY-MD Premium - Heroku Connection Fix
 * 
 * This module provides special optimizations for Heroku deployments:
 * 1. Handles the Heroku specific connection issues
 * 2. Optimizes reconnection and notification queue for Heroku's dyno cycling
 * 3. Implements more aggressive health checks to prevent dyno cycling
 * 4. Ensures data persistence across restarts
 */

const fs = require('fs');
const path = require('path');
const { promisify } = require('util');
const fsPromises = require('fs').promises;
const { spawn } = require('child_process');

// Heroku-specific configuration
const HEROKU_KEEPALIVE_INTERVAL = 5 * 60 * 1000; // 5 minutes
const HEROKU_CONNECTION_CHECK_INTERVAL = 30 * 1000; // 30 seconds
const HEROKU_RECONNECT_DELAY = 10 * 1000; // 10 seconds
const DB_SAVE_INTERVAL = 5 * 60 * 1000; // 5 minutes

// Flag to track if we're running on Heroku
const isHeroku = process.env.DYNO || process.env.RUNNING_ON_HEROKU || false;

/**
 * Enhanced WhatsApp connection recovery for Heroku deployments
 * @param {Object} conn - The WhatsApp connection object
 */
async function setupHerokuConnectionRecovery(conn) {
    if (!isHeroku) {
        console.log('[HEROKU] Not running on Heroku, skipping special optimizations');
        return;
    }

    console.log('[HEROKU] Setting up Heroku-specific connection recovery');
    
    // Enhanced connection monitoring
    let connectionCheckTimer = null;
    let connectionLost = false;
    let lastConnectionTime = Date.now();
    
    // For tracking restart attempts
    let restartAttempts = 0;
    const MAX_RESTART_ATTEMPTS = 3;
    
    // Enhanced database saving for preventing data loss during dyno cycling
    if (global.db) {
        setInterval(() => {
            try {
                console.log('[HEROKU] Performing periodic database save...');
                global.db.write();
            } catch (err) {
                console.error('[HEROKU] Error saving database:', err);
            }
        }, DB_SAVE_INTERVAL);
    }
    
    // Detect connection loss and trigger reconnection
    conn.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect } = update;
        
        // Update timestamp on successful connection
        if (connection === 'open') {
            console.log('[HEROKU] Connection established, starting monitoring');
            lastConnectionTime = Date.now();
            connectionLost = false;
            restartAttempts = 0;
            
            // Process any queued notifications
            if (global.notificationQueue && typeof global.notificationQueue.processNotificationQueue === 'function') {
                setTimeout(() => {
                    global.notificationQueue.processNotificationQueue(conn);
                }, 1000); // Process queue after 1 second of connection
            }
        }
        
        // Handle disconnections with special Heroku handling
        if (connection === 'close') {
            connectionLost = true;
            lastConnectionTime = Date.now();
            
            const statusCode = lastDisconnect?.error?.output?.statusCode;
            console.log(`[HEROKU] Connection closed with status: ${statusCode}`);
            
            if (statusCode === 428) {
                console.log('[HEROKU] Connection closed due to multiple devices, waiting for reconnection');
            } else {
                // Trigger reconnection after a delay
                setTimeout(() => {
                    console.log('[HEROKU] Attempting to reconnect after disconnection');
                    if (global.conn && typeof global.conn.connect === 'function') {
                        global.conn.connect().catch(err => {
                            console.error('[HEROKU] Reconnection attempt failed:', err);
                        });
                    }
                }, HEROKU_RECONNECT_DELAY);
            }
        }
    });
    
    // Set up periodic connection checks for Heroku
    if (connectionCheckTimer) clearInterval(connectionCheckTimer);
    
    connectionCheckTimer = setInterval(() => {
        const connectionAge = Date.now() - lastConnectionTime;
        
        // If connection is lost for too long, attempt restart
        if (connectionLost && connectionAge > 5 * 60 * 1000) {
            restartAttempts++;
            console.log(`[HEROKU] Connection lost for ${connectionAge/1000}s, restart attempt: ${restartAttempts}/${MAX_RESTART_ATTEMPTS}`);
            
            if (restartAttempts <= MAX_RESTART_ATTEMPTS) {
                // Save database before restart attempt
                if (global.db) {
                    try {
                        console.log('[HEROKU] Saving database before restart attempt');
                        global.db.write();
                    } catch (err) {
                        console.error('[HEROKU] Error saving database:', err);
                    }
                }
                
                // Attempt to reconnect
                try {
                    if (global.conn && typeof global.conn.connect === 'function') {
                        console.log('[HEROKU] Attempting to re-establish connection');
                        global.conn.connect().catch(err => {
                            console.error('[HEROKU] Reconnection attempt failed:', err);
                        });
                    }
                } catch (err) {
                    console.error('[HEROKU] Error during reconnection attempt:', err);
                }
            } else {
                console.log('[HEROKU] Maximum restart attempts reached, waiting for watchdog to restart dyno');
            }
        }
        
        // Log connection status periodically
        if (!connectionLost) {
            console.log(`[HEROKU] Connection healthy, age: ${(Date.now() - lastConnectionTime)/1000}s`);
        }
    }, HEROKU_CONNECTION_CHECK_INTERVAL);
    
    // Keep the Heroku dyno awake
    if (process.env.PORT) {
        const port = process.env.PORT;
        setInterval(() => {
            const http = require('http');
            try {
                http.get(`http://localhost:${port}/health`, (res) => {
                    if (res.statusCode === 200) {
                        console.log('[HEROKU] Keepalive health check succeeded');
                    } else {
                        console.log(`[HEROKU] Keepalive health check returned status ${res.statusCode}`);
                    }
                }).on('error', (err) => {
                    console.error('[HEROKU] Keepalive health check failed:', err.message);
                });
            } catch (err) {
                console.error('[HEROKU] Keepalive error:', err);
            }
        }, HEROKU_KEEPALIVE_INTERVAL);
    }
    
    console.log('[HEROKU] Heroku connection recovery setup complete');
    return true;
}

/**
 * Handle backup and restore of session data for Heroku deployment
 */
async function setupHerokuSessionBackups() {
    if (!isHeroku) {
        console.log('[HEROKU] Not running on Heroku, skipping session backup setup');
        return;
    }
    
    console.log('[HEROKU] Setting up session backup and restore for Heroku');
    
    // Create backup directory if it doesn't exist
    const backupDir = path.join(process.cwd(), 'sessions-backup');
    if (!fs.existsSync(backupDir)) {
        fs.mkdirSync(backupDir, { recursive: true });
    }
    
    // Set up periodic backups
    setInterval(async () => {
        try {
            console.log('[HEROKU] Performing session backup...');
            const sessionsDir = path.join(process.cwd(), 'sessions');
            
            if (!fs.existsSync(sessionsDir)) {
                console.log('[HEROKU] No sessions directory found, skipping backup');
                return;
            }
            
            // Read all session files
            const files = fs.readdirSync(sessionsDir);
            
            for (const file of files) {
                // Only backup .json files
                if (file.endsWith('.json')) {
                    const sourcePath = path.join(sessionsDir, file);
                    const destPath = path.join(backupDir, file);
                    
                    // Read the source file
                    const data = fs.readFileSync(sourcePath);
                    
                    // Write to backup location
                    fs.writeFileSync(destPath, data);
                    console.log(`[HEROKU] Backed up session file: ${file}`);
                }
            }
            
            console.log('[HEROKU] Session backup completed successfully');
        } catch (err) {
            console.error('[HEROKU] Error during session backup:', err);
        }
    }, 10 * 60 * 1000); // Every 10 minutes
    
    // Also save sessions to database if available
    if (global.db && global.db.data) {
        try {
            // Create or ensure sessions storage in database
            if (!global.db.data.sessions) {
                global.db.data.sessions = {};
            }
            
            // Set up periodic database-based backups
            setInterval(async () => {
                try {
                    const sessionsDir = path.join(process.cwd(), 'sessions');
                    
                    if (!fs.existsSync(sessionsDir)) {
                        return;
                    }
                    
                    // Read all session files
                    const files = fs.readdirSync(sessionsDir);
                    
                    for (const file of files) {
                        if (file.endsWith('.json')) {
                            const sourcePath = path.join(sessionsDir, file);
                            
                            // Read the source file
                            const data = fs.readFileSync(sourcePath, 'utf8');
                            
                            // Store in database using filename as key
                            global.db.data.sessions[file] = data;
                        }
                    }
                    
                    // Save the database
                    await global.db.write();
                    console.log('[HEROKU] Session data saved to database');
                } catch (err) {
                    console.error('[HEROKU] Error saving sessions to database:', err);
                }
            }, 15 * 60 * 1000); // Every 15 minutes
        } catch (err) {
            console.error('[HEROKU] Error setting up database session backups:', err);
        }
    }
    
    console.log('[HEROKU] Heroku session backup system initialized');
}

/**
 * Initialize all Heroku-specific optimizations
 * @param {Object} conn - The WhatsApp connection object 
 */
async function initHerokuOptimizations(conn) {
    if (!isHeroku) return false;
    
    console.log('[HEROKU] Initializing Heroku-specific optimizations');
    
    try {
        // Set up enhanced connection recovery
        await setupHerokuConnectionRecovery(conn);
        
        // Set up session backups
        await setupHerokuSessionBackups();
        
        // Adjust notification queue for Heroku
        if (global.notificationQueue) {
            // More frequent queue processing on Heroku
            setInterval(() => {
                if (conn.user && global.notificationQueue.processNotificationQueue) {
                    global.notificationQueue.processNotificationQueue(conn);
                }
            }, 2000); // Check every 2 seconds on Heroku
        }
        
        // Set up handling for Heroku dyno cycling
        process.on('SIGTERM', async () => {
            console.log('[HEROKU] Received SIGTERM, dyno shutting down');
            
            // Save database
            if (global.db) {
                try {
                    console.log('[HEROKU] Saving database before shutdown');
                    await global.db.write();
                } catch (err) {
                    console.error('[HEROKU] Error saving database:', err);
                }
            }
            
            // Backup sessions
            try {
                console.log('[HEROKU] Backing up sessions before shutdown');
                const sessionsDir = path.join(process.cwd(), 'sessions');
                const backupDir = path.join(process.cwd(), 'sessions-backup');
                
                if (fs.existsSync(sessionsDir)) {
                    if (!fs.existsSync(backupDir)) {
                        fs.mkdirSync(backupDir, { recursive: true });
                    }
                    
                    const files = fs.readdirSync(sessionsDir);
                    for (const file of files) {
                        if (file.endsWith('.json')) {
                            const sourcePath = path.join(sessionsDir, file);
                            const destPath = path.join(backupDir, file);
                            fs.copyFileSync(sourcePath, destPath);
                        }
                    }
                }
            } catch (err) {
                console.error('[HEROKU] Error backing up sessions:', err);
            }
            
            // Force exit after grace period
            setTimeout(() => {
                console.log('[HEROKU] Graceful shutdown timeout reached, forcing exit');
                process.exit(0);
            }, 3000);
        });
        
        console.log('[HEROKU] Heroku optimizations initialized successfully');
        return true;
    } catch (err) {
        console.error('[HEROKU] Error initializing Heroku optimizations:', err);
        return false;
    }
}

module.exports = {
    initHerokuOptimizations,
    setupHerokuConnectionRecovery,
    setupHerokuSessionBackups
};

// Auto-initialize if running on Heroku
if (isHeroku && global.conn) {
    console.log('[HEROKU] Auto-initializing Heroku optimizations');
    initHerokuOptimizations(global.conn);
}