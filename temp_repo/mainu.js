/**
 * BLACKSKY-MD Premium - Enhanced Main Script with Connection Stability
 * 
 * This enhanced version of main.js integrates advanced connection fixes
 * to prevent the "connection appears to be closed" errors, especially in Termux.
 * 
 * Features:
 * 1. Advanced connection state monitoring and recovery
 * 2. Automatic reconnection with exponential backoff
 * 3. Session backup and restoration
 * 4. Intelligent connection error handling
 * 5. Memory management optimizations
 */

// Import required modules
const { default: makeWASocket, useMultiFileAuthState, DisconnectReason, fetchLatestBaileysVersion, makeCacheableSignalKeyStore } = require('@adiwajshing/baileys')
const { Boom } = require('@hapi/boom')
const fs = require('fs')
const chalk = require('chalk')
const path = require('path')
const pino = require('pino')
const yargs = require('yargs/yargs')
const { promisify } = require('util')
const { exec: execCallback, spawn } = require('child_process')
const exec = promisify(execCallback)
const os = require('os')
const rimraf = require('rimraf')
const chokidar = require('fs').promises

// Import local modules
let connectionFixer = {
  applyConnectionFixes: () => console.log('Connection fixer not loaded')
}

try {
  connectionFixer = require('./enhanced-connection-keeper.js')
  console.log('✅ Enhanced connection keeper loaded successfully')
} catch (e) {
  console.log('⚠️ Enhanced connection keeper not found, using basic stability')
  try {
    connectionFixer = require('./connection-fix-integrator.js')
    console.log('✅ Basic connection integrator loaded successfully')
  } catch (e) {
    console.log('⚠️ Connection fix modules not found, using fallback stability')
  }
}

// Configuration and global variables
const { isTermux, isHeroku, isPm2, isRailway, isNodeWebkit } = require('./config.js')
const config = require('./config.js')
let { sessionDir } = require('./config.js')
sessionDir = sessionDir || 'sessions'

// Connection state counters
let connectionRetryCount = 0
const MAX_RETRY_COUNT = 10
let lastDisconnect = null
let qrRetry = 0
const MAX_QR_RETRY = 3
let lastConnectionTimestamp = Date.now()

// Setup session directory
if (!fs.existsSync(sessionDir)) {
  fs.mkdirSync(sessionDir, { recursive: true })
  console.log(chalk.green('✅ Session directory created'))
}

/**
 * Log a message with timestamp and color
 * @param {string} message - Message to log
 * @param {string} type - Log type (INFO, ERROR, WARN, SUCCESS)
 */
function log(message, type = 'INFO') {
  const timestamp = new Date().toLocaleTimeString()
  const colorFn = {
    INFO: chalk.blue,
    ERROR: chalk.red,
    WARN: chalk.yellow,
    SUCCESS: chalk.green
  }[type] || chalk.white
  
  console.log(`[${timestamp}] ${colorFn(`[${type}]`)} ${message}`)
}

/**
 * Check available memory and perform cleanup if necessary
 */
function checkMemory() {
  const memoryInfo = process.memoryUsage()
  const memoryUsageMb = Math.round(memoryInfo.heapUsed / 1024 / 1024 * 100) / 100
  
  if (memoryUsageMb > 500) {
    log(`High memory usage detected: ${memoryUsageMb} MB. Running garbage collection...`, 'WARN')
    
    // Force garbage collection if supported
    if (global.gc) {
      global.gc()
      log('Manual garbage collection executed', 'INFO')
    }
  }
}

/**
 * Clear temporary files to prevent accumulation
 */
async function clearTempFiles() {
  try {
    const tempFolder = './tmp'
    if (fs.existsSync(tempFolder)) {
      const files = await fs.promises.readdir(tempFolder)
      const oneHourAgo = Date.now() - (60 * 60 * 1000)
      
      for (const file of files) {
        try {
          const filePath = path.join(tempFolder, file)
          const stats = await fs.promises.stat(filePath)
          
          if (stats.mtimeMs < oneHourAgo) {
            await fs.promises.unlink(filePath)
            log(`Deleted old temp file: ${file}`, 'INFO')
          }
        } catch (e) {
          // Skip if file already deleted
        }
      }
    }
  } catch (error) {
    log(`Error clearing temp files: ${error}`, 'ERROR')
  }
}

/**
 * Handle connection close events with proper analysis
 * @param {Object} conn - Connection object
 * @param {Error} error - Error that caused the disconnection
 */
async function handleConnectionClose(conn, error) {
  const { connection, lastDisconnect } = error
  const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut
  
  log(`Connection closed: ${error.message}`, 'WARN')
  
  if (connection === 'close') {
    // For common connection issues with Baileys
    if (error.name === 'ConnectionError' || error.name === 'TimeoutError') {
      log('Connection error detected, attempting recovery...', 'INFO')
      return startBot() // Reconnect directly for connection errors
    }
    
    // For more serious structural errors
    if (error.name === 'BaileysError' || error.message.includes('Stream Errored')) {
      log('Baileys structural error, detailed recovery...', 'WARN')
      await new Promise(resolve => setTimeout(resolve, 5000))
      return startBot()
    }
    
    // Handle logged out case
    if (lastDisconnect?.error?.output?.statusCode === DisconnectReason.loggedOut) {
      log('Logged out from WhatsApp, clearing session and restarting...', 'ERROR')
      // Clear session folder
      try {
        if (fs.existsSync(sessionDir)) {
          fs.readdirSync(sessionDir).forEach(file => {
            try {
              fs.unlinkSync(path.join(sessionDir, file))
            } catch {}
          })
        }
        log('Session data cleared, please scan QR code', 'INFO')
      } catch (e) {
        log(`Error clearing session: ${e}`, 'ERROR')
      }
      return startBot()
    }
    
    if (shouldReconnect) {
      // Apply exponential backoff
      const retryDelay = Math.min(1000 * Math.pow(2, connectionRetryCount), 30000)
      connectionRetryCount++
      
      log(`Reconnecting with backoff (${connectionRetryCount}/${MAX_RETRY_COUNT}) in ${retryDelay / 1000}s...`, 'INFO')
      
      // If we've tried too many times, clear the session
      if (connectionRetryCount >= MAX_RETRY_COUNT) {
        log('Too many reconnection attempts, clearing session data...', 'WARN')
        try {
          rimraf.sync(sessionDir)
          fs.mkdirSync(sessionDir, { recursive: true })
          connectionRetryCount = 0
        } catch (e) {
          log(`Error clearing session: ${e}`, 'ERROR')
        }
      }
      
      setTimeout(startBot, retryDelay)
    } else {
      log('Connection closed permanently, not reconnecting', 'ERROR')
    }
  }
}

/**
 * Perform maintenance tasks periodically
 */
function setupMaintenance() {
  // Check memory usage every 5 minutes
  setInterval(checkMemory, 5 * 60 * 1000)
  
  // Clear temp files every hour
  setInterval(clearTempFiles, 60 * 60 * 1000)
}

/**
 * The main bot startup function
 */
async function startBot() {
  try {
    log('Starting WhatsApp bot with enhanced stability...', 'INFO')
    
    // Check for necessary folders
    const pluginsFolder = './plugins'
    if (!fs.existsSync(pluginsFolder)) {
      fs.mkdirSync(pluginsFolder, { recursive: true })
      log('Created plugins folder', 'INFO')
    }
    
    // Get latest Baileys version
    const { version, isLatest } = await fetchLatestBaileysVersion()
    log(`Using Baileys version ${version} (Latest: ${isLatest})`, 'INFO')
    
    // Prepare auth state
    const { state, saveCreds } = await useMultiFileAuthState(sessionDir)
    
    // Create connection with improved logging
    const conn = makeWASocket({
      version,
      auth: {
        creds: state.creds,
        keys: makeCacheableSignalKeyStore(state.keys, pino({ enabled: false }).child({ level: 'silent' })),
      },
      printQRInTerminal: true,
      logger: pino({ level: 'silent' }),
      browser: ['BLACKSKY-MD Premium', 'Firefox', '3.0.0'],
      syncFullHistory: false,
      markOnlineOnConnect: true,
      connectTimeoutMs: 60000,
      defaultQueryTimeoutMs: 30000,
      keepAliveIntervalMs: 10000,
      emitOwnEvents: true,
      fireInitQueries: true,
      generateHighQualityLinkPreview: true,
      getMessage: async key => {
        return { conversation: 'Error retrieving message' }
      }
    })
    
    // Apply connection fixes from the external module
    if (connectionFixer.applyConnectionFixes) {
      log('Applying enhanced connection fixes...', 'INFO')
      connectionFixer.applyConnectionFixes(conn)
    }
    
    // Reset connection retry counter on successful connection
    conn.ev.on('connection.update', async (update) => {
      const { connection, lastDisconnect, qr } = update
      lastConnectionTimestamp = Date.now()
      
      if (connection === 'open') {
        connectionRetryCount = 0
        log('Connection established successfully!', 'SUCCESS')
      }
      
      // Handle QR code updates
      if (qr) {
        qrRetry++
        if (qrRetry > MAX_QR_RETRY) {
          log('Too many QR refreshes, restarting session...', 'WARN')
          try {
            rimraf.sync(sessionDir)
            fs.mkdirSync(sessionDir, { recursive: true })
            qrRetry = 0
            log('Session cleared, restarting...', 'INFO')
            return process.exit(0) // Force restart for clean QR
          } catch (e) {
            log(`Error clearing session: ${e.message}`, 'ERROR')
          }
        }
      }
      
      // Handle disconnections with proper analysis
      if (connection === 'close') {
        const error = new Boom(lastDisconnect?.error)
        await handleConnectionClose(conn, { connection, lastDisconnect, error })
      }
    })
    
    // Save credentials whenever they're updated
    conn.ev.on('creds.update', saveCreds)
    
    // Handle incoming messages with error catching
    conn.ev.on('messages.upsert', async (chatUpdate) => {
      try {
        if (global.db.data == null) await loadDatabase()
        
        // Pass to main handler
        if (chatUpdate.messages) {
          if (chatUpdate.messages[0].key.remoteJid === 'status@broadcast') return
          
          const loadHandler = await import('./handler.js')
          if (loadHandler.handler) await loadHandler.handler(conn, chatUpdate)
        }
      } catch (e) {
        log(`Error in messages.upsert: ${e.stack}`, 'ERROR')
      }
    })
    
    // Handle group participant updates
    conn.ev.on('group-participants.update', async (anu) => {
      try {
        const loadHandler = await import('./handler.js')
        if (loadHandler.participantsUpdate) await loadHandler.participantsUpdate(conn, anu)
      } catch (e) {
        log(`Error in group-participants.update: ${e.stack}`, 'ERROR')
      }
    })
    
    // Handle message deletion
    conn.ev.on('messages.delete', async (message) => {
      try {
        const loadHandler = await import('./handler.js')
        if (loadHandler.delete) await loadHandler.delete(conn, message)
      } catch (e) {
        log(`Error in messages.delete: ${e.stack}`, 'ERROR')
      }
    })
    
    // Setup periodic maintenance routines
    setupMaintenance()
    
    // Display startup info
    if (conn.user) {
      log(`Connected as ${conn.user.name || conn.user.verifiedName || conn.user.id.split(':')[0]}`, 'SUCCESS')
    }
    
    log('Bot is now running with enhanced stability!', 'SUCCESS')
    
    // Create a heartbeat interval
    setInterval(() => {
      // Check if we're still connected (defined as having received an event in the last 2 minutes)
      const timeSinceLastEvent = Date.now() - lastConnectionTimestamp
      if (timeSinceLastEvent > 2 * 60 * 1000) {
        log('No events for 2 minutes, connection may be stale', 'WARN')
        conn.sendMessage('me', { text: 'Heartbeat check' })
          .then(() => {
            log('Heartbeat sent successfully', 'INFO')
            lastConnectionTimestamp = Date.now()
          })
          .catch(err => {
            log(`Heartbeat failed: ${err.message}`, 'ERROR')
            // Don't force reconnect here - let the connection.update handler deal with it
          })
      }
    }, 60 * 1000) // Check every minute
    
    return conn
  } catch (e) {
    log(`Fatal error in startBot: ${e.stack}`, 'ERROR')
    setTimeout(startBot, 10000) // Try again after 10 seconds
  }
}

// Execute the startBot function
startBot()
  .catch(e => console.error(e))

// Handle unexpected errors
process.on('uncaughtException', (err) => {
  log(`Uncaught Exception: ${err.stack}`, 'ERROR')
  // Don't exit, let the bot try to recover
})

process.on('unhandledRejection', (reason, promise) => {
  log(`Unhandled Rejection: ${reason}`, 'ERROR')
  // Don't exit, let the bot try to recover
})

// Handle termination signals for clean shutdown
process.on('SIGINT', async () => {
  log('Received SIGINT, shutting down gracefully...', 'INFO')
  setTimeout(() => process.exit(0), 3000) // Force exit after 3 seconds if graceful shutdown fails
})

process.on('SIGTERM', async () => {
  log('Received SIGTERM, shutting down gracefully...', 'INFO')
  setTimeout(() => process.exit(0), 3000) // Force exit after 3 seconds if graceful shutdown fails
})

// Export for PM2 clustering and monitoring
module.exports = {
  apps: [{
    name: "blacksky-md-bot",
    script: "./index.js",
    watch: false,
    ignore_watch: ["node_modules", "sessions", "tmp"],
    exp_backoff_restart_delay: 100,
    max_memory_restart: "500M"
  }]
}