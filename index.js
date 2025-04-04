/**
 * BLACKSKY-MD Premium WhatsApp Bot - Heroku Single File Edition
 * All-in-one optimized bot that runs entirely from index.js
 * 
 * This version combines all essential components into a single file:
 * - Core bot functionality
 * - Performance optimizations
 * - Connection stability mechanisms
 * - Memory management
 * - Response caching
 * - Heroku compatibility
 */

// Detect environment and platform
const os = require('os');
const fs = require('fs');
const path = require('path');
const util = require('util');
const events = require('events');
const crypto = require('crypto');
const { performance } = require('perf_hooks');
const { createHash } = crypto;
const isTermux = os.platform() === 'android' || process.env.TERMUX === 'true';
const isHeroku = !!process.env.DYNO || process.env.HEROKU === 'true';
const isPerformanceMode = process.argv.includes('--performance-mode');
const isAutoClearTmp = process.argv.includes('--autocleartmp');

// Apply platform-specific optimizations immediately
console.log(`💻 Running in ${isTermux ? 'Termux' : isHeroku ? 'Heroku' : 'standard'} environment with ${isPerformanceMode ? 'performance optimizations' : 'standard settings'}`);

// Start Express server immediately to ensure we bind to the required port
// This is critical for environments like Replit that require a port to be opened
const express = require('express');
const app = express();
const PORT = process.env.PORT || 5000;

app.get('/', (req, res) => {
  res.send('BLACKSKY-MD Premium Bot - Server is running');
});

// Start listening on the port immediately
app.listen(PORT, '0.0.0.0', () => {
  console.log(`[SERVER] 🌐 Express server started on port ${PORT}`);
});

// Set environment variable for child processes
process.env.HEROKU = isHeroku ? 'true' : 'false';
process.env.TERMUX = isTermux ? 'true' : 'false';
process.env.PERFORMANCE_MODE = isPerformanceMode ? 'true' : 'false';

// Global instance tracking
const GLOBAL_STATE = {
  startTime: Date.now(),
  restartCount: 0,
  lastRestart: null,
  isConnected: false,
  sessionRestored: false,
  lastMemoryUsage: process.memoryUsage(),
  commandStats: {},
  responseCache: new Map(),
  requestsHandled: 0,
  cacheClearTimer: null,
  databaseConnected: false
};

// Set process title for better identification
process.title = 'BLACKSKY-MD-Premium';

// ======== INTEGRATED OPTIMIZATION MODULE ========
// Response caching system with LRU (Least Recently Used) policy
const CACHE_SETTINGS = {
  maxSize: 100,               // Maximum number of cached responses
  ttl: 60 * 1000,             // Time-to-live: 60 seconds
  allowedCommands: [          // Commands eligible for caching
    'help', 'menu', 'info', 'ping', 'status', 'uptime',
    'creator', 'owner', 'groupinfo', 'profile', 'sticker'
  ]
};

// Cache utility functions
const cacheUtils = {
  // Get cached response if available and valid
  get(command, args) {
    const key = this.getCacheKey(command, args);
    const cached = GLOBAL_STATE.responseCache.get(key);
    
    if (!cached) return null;
    
    // Check if cache entry is expired
    if (Date.now() > cached.expiresAt) {
      GLOBAL_STATE.responseCache.delete(key);
      return null;
    }
    
    // Update access time and return cached response
    cached.lastAccessed = Date.now();
    return cached.data;
  },
  
  // Store response in cache
  set(command, args, data) {
    // Don't cache if command is not in allowed list
    if (!CACHE_SETTINGS.allowedCommands.includes(command)) return;
    
    const key = this.getCacheKey(command, args);
    
    // Enforce cache size limit with LRU eviction
    if (GLOBAL_STATE.responseCache.size >= CACHE_SETTINGS.maxSize) {
      let oldest = null;
      let oldestTime = Infinity;
      
      for (const [existingKey, value] of GLOBAL_STATE.responseCache.entries()) {
        if (value.lastAccessed < oldestTime) {
          oldestTime = value.lastAccessed;
          oldest = existingKey;
        }
      }
      
      if (oldest) GLOBAL_STATE.responseCache.delete(oldest);
    }
    
    // Store new cache entry
    GLOBAL_STATE.responseCache.set(key, {
      data,
      createdAt: Date.now(),
      lastAccessed: Date.now(),
      expiresAt: Date.now() + CACHE_SETTINGS.ttl
    });
  },
  
  // Generate unique cache key based on command and arguments
  getCacheKey(command, args) {
    return `${command}:${JSON.stringify(args)}`;
  },
  
  // Clear expired cache entries
  clearExpired() {
    const now = Date.now();
    for (const [key, value] of GLOBAL_STATE.responseCache.entries()) {
      if (now > value.expiresAt) {
        GLOBAL_STATE.responseCache.delete(key);
      }
    }
  },
  
  // Schedule periodic cache cleanup
  scheduleCacheCleanup() {
    if (GLOBAL_STATE.cacheClearTimer) {
      clearInterval(GLOBAL_STATE.cacheClearTimer);
    }
    
    GLOBAL_STATE.cacheClearTimer = setInterval(() => {
      this.clearExpired();
    }, 30000); // Clean up every 30 seconds
  }
};

// Memory optimization utilities
const memoryOptimizer = {
  // Schedule garbage collection
  scheduleGC() {
    // Always monitor memory usage regardless of gc availability
    setInterval(() => {
      this.checkMemoryUsage();
    }, 10000);
    
    // Only schedule explicit GC if it's available
    if (typeof global.gc === 'function') {
      setInterval(() => {
        this.runGC();
      }, 30000); // Run GC every 30 seconds
      console.log('[Memory] Automatic garbage collection scheduled');
    } else {
      console.log('[Memory] Automatic garbage collection not available (--expose-gc flag not set)');
      console.log('[Memory] Only memory monitoring is active');
    }
  },
  
  // Force garbage collection
  runGC() {
    try {
      if (typeof global.gc === 'function') {
        const before = process.memoryUsage().heapUsed / 1024 / 1024;
        global.gc();
        const after = process.memoryUsage().heapUsed / 1024 / 1024;
        console.log(`[Memory] Ran garbage collection: ${before.toFixed(2)} MB -> ${after.toFixed(2)} MB (freed ${(before - after).toFixed(2)} MB)`);
      } else {
        console.log(`[Memory] Garbage collection not available (--expose-gc flag not set)`);
      }
    } catch (err) {
      console.error(`[Memory] Error running garbage collection:`, err);
    }
  },
  
  // Check memory usage and run GC if needed
  checkMemoryUsage() {
    try {
      const { heapUsed, heapTotal } = process.memoryUsage();
      const usedMB = heapUsed / 1024 / 1024;
      const totalMB = heapTotal / 1024 / 1024;
      const usageRatio = heapUsed / heapTotal;
      
      // If memory usage is above 70%, run garbage collection
      if (usageRatio > 0.7) {
        console.log(`[Memory] High memory usage detected: ${usedMB.toFixed(2)}/${totalMB.toFixed(2)} MB (${(usageRatio * 100).toFixed(1)}%)`);
        // Only try to run GC if it's available
        if (typeof global.gc === 'function') {
          this.runGC();
        } else {
          console.log(`[Memory] Garbage collection not available, manual cleanup recommended`);
        }
      }
      
      GLOBAL_STATE.lastMemoryUsage = process.memoryUsage();
    } catch (err) {
      console.error(`[Memory] Error checking memory usage:`, err);
    }
  },
  
  // Clear temporary directories
  clearTempDirectories() {
    const tempDirs = ['./tmp', './temp'];
    
    for (const dir of tempDirs) {
      if (fs.existsSync(dir)) {
        try {
          const files = fs.readdirSync(dir);
          
          for (const file of files) {
            if (file !== '.gitkeep' && file !== '.nomedia') {
              fs.unlinkSync(path.join(dir, file));
            }
          }
          
          console.log(`[Cleanup] Cleared temporary files in ${dir}`);
        } catch (err) {
          console.error(`[Error] Failed to clear ${dir}:`, err);
        }
      }
    }
  },
  
  // Schedule periodic temp directory cleanup
  scheduleTempCleanup() {
    if (isAutoClearTmp) {
      setInterval(() => {
        this.clearTempDirectories();
      }, 300000); // Clean every 5 minutes
    }
  }
};

// Initialize all optimizations
function initializeOptimizations() {
  // Setup cache system
  cacheUtils.scheduleCacheCleanup();
  
  // Setup memory optimizations - always run monitoring regardless of global.gc availability
  console.log(`[Optimization] Initializing memory management system`);
  memoryOptimizer.scheduleGC();
  
  // Setup temp directory cleaning
  if (isAutoClearTmp) {
    console.log(`[Optimization] Automatic temp directory cleaning is enabled`);
    memoryOptimizer.scheduleTempCleanup();
  }
  
  return {
    cache: cacheUtils,
    memory: memoryOptimizer
  };
}

// ========= INTEGRATED HEROKU CONNECTION KEEPER =========

// PostgreSQL connection setup for Heroku
let pgPool = null;

// Initialize PostgreSQL connection if on Heroku and DATABASE_URL is available
if (isHeroku && process.env.DATABASE_URL) {
  try {
    const { Pool } = require('pg');
    pgPool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: {
        rejectUnauthorized: false
      }
    });
    
    console.log('[Database] PostgreSQL connection pool initialized');
    
    // Test the connection
    pgPool.query('SELECT NOW()', (err, res) => {
      if (err) {
        console.error('[Database] Connection test failed:', err);
      } else {
        console.log(`[Database] Connection successful, server time: ${res.rows[0].now}`);
        GLOBAL_STATE.databaseConnected = true;
        
        // Set up session table
        createSessionTable();
        
        // Check if we're running in backup mode
        if (process.argv.includes('--backup-sessions')) {
          console.log('[Backup] Running in session backup mode');
          backupSessions().then(() => {
            console.log('[Backup] Session backup completed, exiting');
            process.exit(0);
          }).catch(err => {
            console.error('[Backup] Session backup failed:', err);
            process.exit(1);
          });
        }
      }
    });
  } catch (err) {
    console.error('[Database] Failed to initialize PostgreSQL:', err);
  }
}

// Comprehensive session backup function for Heroku
async function backupSessions() {
  console.log('[Backup] Starting session backup process');
  
  // Check if PostgreSQL is available
  if (!pgPool || !GLOBAL_STATE.databaseConnected) {
    console.error('[Backup] Cannot backup sessions: PostgreSQL is not connected');
    return false;
  }
  
  try {
    // Create sessions backup directory if it doesn't exist
    const sessionsDir = './sessions';
    const backupDir = './sessions-backup';
    
    if (!fs.existsSync(sessionsDir)) {
      console.log(`[Backup] Sessions directory not found, creating ${sessionsDir}`);
      fs.mkdirSync(sessionsDir, { recursive: true });
    }
    
    if (!fs.existsSync(backupDir)) {
      console.log(`[Backup] Backup directory not found, creating ${backupDir}`);
      fs.mkdirSync(backupDir, { recursive: true });
    }
    
    // Read all session files
    const files = fs.readdirSync(sessionsDir);
    let backupCount = 0;
    
    for (const file of files) {
      if (file.endsWith('.json')) {
        // Read the session file
        const filePath = path.join(sessionsDir, file);
        const backupFilePath = path.join(backupDir, file);
        
        try {
          // Read the session file
          const sessionData = fs.readFileSync(filePath, 'utf8');
          
          // Create a backup copy
          fs.writeFileSync(backupFilePath, sessionData);
          
          // Store in database
          const sessionId = file.replace('.json', '');
          await backupSessionToDatabase(sessionId, sessionData);
          
          backupCount++;
          console.log(`[Backup] Successfully backed up session: ${file}`);
        } catch (fileErr) {
          console.error(`[Backup] Failed to backup session ${file}:`, fileErr);
        }
      }
    }
    
    console.log(`[Backup] Session backup completed. Backed up ${backupCount} session(s)`);
    return true;
  } catch (err) {
    console.error('[Backup] Session backup failed:', err);
    return false;
  }
}

// Create session table if it doesn't exist
async function createSessionTable() {
  if (!pgPool) return;
  
  try {
    await pgPool.query(`
      CREATE TABLE IF NOT EXISTS whatsapp_sessions (
        id SERIAL PRIMARY KEY,
        session_id VARCHAR(255) NOT NULL,
        session_data TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('[Database] Session table verified/created');
  } catch (err) {
    console.error('[Database] Failed to create session table:', err);
  }
}

// Session backup functions for Heroku
async function backupSessionToDatabase(sessionId, sessionData) {
  if (!pgPool || !GLOBAL_STATE.databaseConnected) return false;
  
  try {
    // Convert session data to string if it's not already
    const dataString = typeof sessionData === 'string' ? sessionData : JSON.stringify(sessionData);
    
    // Check if session exists
    const checkResult = await pgPool.query(
      'SELECT id FROM whatsapp_sessions WHERE session_id = $1',
      [sessionId]
    );
    
    if (checkResult.rows.length > 0) {
      // Update existing session
      await pgPool.query(
        'UPDATE whatsapp_sessions SET session_data = $1, updated_at = CURRENT_TIMESTAMP WHERE session_id = $2',
        [dataString, sessionId]
      );
      console.log(`[Session] Updated session ${sessionId} in database`);
    } else {
      // Insert new session
      await pgPool.query(
        'INSERT INTO whatsapp_sessions (session_id, session_data) VALUES ($1, $2)',
        [sessionId, dataString]
      );
      console.log(`[Session] Created new session ${sessionId} in database`);
    }
    
    return true;
  } catch (err) {
    console.error('[Session] Database backup failed:', err);
    return false;
  }
}

// Restore session from database
async function restoreSessionFromDatabase(sessionId) {
  if (!pgPool || !GLOBAL_STATE.databaseConnected) return null;
  
  try {
    const result = await pgPool.query(
      'SELECT session_data FROM whatsapp_sessions WHERE session_id = $1 ORDER BY updated_at DESC LIMIT 1',
      [sessionId]
    );
    
    if (result.rows.length > 0) {
      console.log(`[Session] Restored session ${sessionId} from database`);
      return result.rows[0].session_data;
    } else {
      console.log(`[Session] No session found in database for ${sessionId}`);
      return null;
    }
  } catch (err) {
    console.error('[Session] Database restore failed:', err);
    return null;
  }
}

// Anti-idle HTTP server for Heroku
function setupAntiIdleServer() {
  if (!isHeroku) return;
  
  const http = require('http');
  const server = http.createServer((req, res) => {
    // Simple health check endpoint
    if (req.url === '/health' || req.url === '/') {
      const uptime = process.uptime();
      const formattedUptime = formatUptime(uptime);
      
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        status: 'ok',
        uptime: formattedUptime,
        memory: process.memoryUsage(),
        connected: GLOBAL_STATE.isConnected,
        restarts: GLOBAL_STATE.restartCount,
        timestamp: new Date().toISOString()
      }));
    } else {
      res.writeHead(404);
      res.end();
    }
  });
  
  // Use Heroku's assigned port or fallback to 3000
  const port = process.env.PORT || 3000;
  server.listen(port, '0.0.0.0', () => {
    console.log(`[Server] Anti-idle HTTP server listening on port ${port}`);
  });
}

// ======== END OF INTEGRATED MODULES ========

// Use Sharp compatibility layer in Termux
if (isTermux) {
  console.log('📱 Running in Termux environment, using Jimp-based Sharp compatibility layer');
  global.sharp = require('./sharp-compat.js');
} else {
  try {
    global.sharp = require('sharp');
  } catch (err) {
    console.error('Failed to load Sharp, falling back to compatibility layer:', err);
    global.sharp = require('./sharp-compat.js');
  }
}

// Initialize Heroku optimization if on Heroku platform
if (isHeroku) {
  try {
    console.log('🚀 Initializing Heroku 24/7 connection optimizations...');
    // Create sessions-backup directory if it doesn't exist
    const sessionsBackupDir = path.join(process.cwd(), 'sessions-backup');
    if (!fs.existsSync(sessionsBackupDir)) {
      fs.mkdirSync(sessionsBackupDir, { recursive: true });
    }
    
    // In direct mode, use the built-in Heroku optimizations
    if (process.argv.includes('--direct-mode')) {
      console.log('📦 Running in direct mode - using built-in Heroku optimizations');
      
      // Initialize the anti-idle server
      setupAntiIdleServer();
      
      // Schedule session backups
      const backupInterval = parseInt(process.env.BACKUP_INTERVAL || '15', 10) * 60 * 1000;
      console.log(`📂 Scheduling automatic session backups every ${backupInterval/60000} minutes`);
      
      setInterval(() => {
        console.log('🔄 Running scheduled session backup...');
        backupSessions().catch(err => {
          console.error('❌ Scheduled backup failed:', err);
        });
      }, backupInterval);
      
      console.log('✅ Direct mode Heroku optimizations initialized');
    } else {
      // Classic mode - load the external file
      console.log('📦 Running in classic mode - loading external heroku-connection-keeper.js');
      try {
        const herokuKeeper = require('./heroku-connection-keeper.js');
        herokuKeeper.initialize();
        
        // Make herokuKeeper available globally
        global.herokuKeeper = herokuKeeper;
      } catch (err) {
        console.error('❌ Failed to load heroku-connection-keeper.js:', err);
        console.log('⚠️ Falling back to built-in optimizations');
        setupAntiIdleServer();
      }
    }
    
    console.log('✅ Heroku 24/7 connection optimizations initialized successfully');
  } catch (err) {
    console.error('❌ Error initializing Heroku optimizations:', err);
  }
}

// Apply performance optimizations
try {
  if (fs.existsSync('./optimize-bot.js')) {
    console.log('⚡ Applying performance optimizations...');
    const optimizer = require('./optimize-bot.js');
    
    // Make optimizer available globally for use in handler.js
    global.botOptimizer = optimizer;
    
    // Initialize key optimization functions as global functions for direct access
    global.fastCommandMatch = optimizer.fastCommandLookup;
    global.optimizeCommand = optimizer.getCachedResponse;
    global.cacheCommandResponse = optimizer.cacheResponse;
    global.tryParallelProcessing = optimizer.processMessageParallel;
    
    // Setup the optimizations
    optimizer.initializeOptimizations();
    optimizer.setupStatsReporting();
    
    // Create stats tracking object
    global.msgProcessingStats = {
      messages: 0,
      totalTime: 0,
      avgTime: 0,
      maxTime: 0,
      trackMessage: function(time) {
        this.messages++;
        this.totalTime += time;
        this.avgTime = this.totalTime / this.messages;
        if (time > this.maxTime) this.maxTime = time;
      }
    };
    
    console.log('✅ Bot performance optimizations applied!');
  }
} catch (optimizeErr) {
  console.error('⚠️ Error applying performance optimizations:', optimizeErr);
}

// Set environment variable for Termux
if (isTermux) {
  console.log('📱 Running in Termux environment, using Termux-compatible connection patch');
  process.env.TERMUX = 'true';
  if (!process.argv.includes('--direct-mode')) {
    try {
      require('./connection-patch-termux.js');
    } catch (err) {
      console.error('❌ Failed to load Termux connection patch:', err);
    }
  } else {
    console.log('📦 Running in direct mode - using built-in connection optimizations');
  }
} else if (isHeroku) {
  console.log('🚀 Running in Heroku environment');
  process.env.HEROKU = 'true';
  
  if (!process.argv.includes('--direct-mode')) {
    try {
      console.log('📦 Loading external connection patch...');
      require('./connection-patch.js');
    } catch (err) {
      console.error('❌ Failed to load connection patch:', err);
      console.log('📦 Using built-in optimizations instead');
    }
  } else {
    console.log('📦 Running in direct mode - using built-in connection optimizations');
  }
} else {
  console.log('💻 Running in standard environment');
  if (!process.argv.includes('--direct-mode')) {
    try {
      require('./connection-patch.js');
    } catch (err) {
      console.error('❌ Failed to load connection patch:', err);
    }
  } else {
    console.log('📦 Running in direct mode - using built-in connection optimizations');
  }
}

const cluster = require('cluster');

// Premium cyberpunk-styled home page - enhance the existing Express app we started earlier
// We already have app declared and listening on PORT at the beginning of the script
const formatUptime = seconds => {
  const days = Math.floor(seconds / (3600 * 24));
  const hours = Math.floor((seconds % (3600 * 24)) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  
  return `${days}d ${hours}h ${minutes}m ${secs}s`;
};

// Premium startup message
const logo = `
╔════════════════════════════════════════╗
║      🌌 BLACKSKY-MD PREMIUM 🌌         ║
║      ⚡ CYBERPUNK EDITION ⚡            ║
╚════════════════════════════════════════╝
`;
console.log('\x1b[35m%s\x1b[0m', logo); // Purple color for premium branding
    
    // We already defined formatUptime above
    
    // Premium cyberpunk-styled home page
    app.get('/', (req, res) => {
      res.send(`
      <!DOCTYPE html>
      <html>
      <head>
          <title>BLACKSKY-MD | Premium Cyberpunk WhatsApp Bot</title>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
              @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700&family=Roboto:wght@300;400;700&display=swap');
              
              :root {
                  --primary: #0df;
                  --primary-glow: rgba(0,221,255,0.5);
                  --secondary: #f0c;
                  --secondary-glow: rgba(255,0,204,0.5);
                  --success: #0f6;
                  --success-glow: rgba(0,255,102,0.5);
                  --bg-dark: #121212;
                  --bg-card: #1e1e1e;
                  --bg-card-alt: #2a2a2a;
                  --text: #eee;
                  --text-muted: #888;
              }
              
              * {
                  box-sizing: border-box;
                  margin: 0;
                  padding: 0;
              }
              
              body {
                  font-family: 'Roboto', sans-serif;
                  background: var(--bg-dark);
                  color: var(--text);
                  line-height: 1.6;
                  background-image: 
                      radial-gradient(circle at 10% 20%, rgba(0,221,255,0.05) 0%, transparent 20%),
                      radial-gradient(circle at 90% 80%, rgba(255,0,204,0.05) 0%, transparent 20%),
                      linear-gradient(to bottom, var(--bg-dark), #0a0a14);
                  background-attachment: fixed;
                  min-height: 100vh;
                  overflow-x: hidden;
              }
              
              .container {
                  max-width: 900px;
                  margin: 40px auto;
                  background: rgba(30, 30, 30, 0.9);
                  border-radius: 15px;
                  padding: 30px;
                  box-shadow: 
                      0 0 20px rgba(0,0,0,0.7),
                      0 0 30px rgba(0,221,255,0.1),
                      0 0 50px rgba(255,0,204,0.1);
                  border: 1px solid rgba(0,221,255,0.1);
                  position: relative;
                  overflow: hidden;
              }
              
              .container::before {
                  content: '';
                  position: absolute;
                  top: -50%;
                  left: -50%;
                  width: 200%;
                  height: 200%;
                  background: linear-gradient(
                      to bottom right,
                      transparent,
                      transparent,
                      transparent,
                      rgba(0,221,255,0.05),
                      transparent
                  );
                  transform: rotate(30deg);
                  animation: shimmer 7s linear infinite;
                  pointer-events: none;
              }
              
              @keyframes shimmer {
                  0% { transform: translateY(-50%) rotate(20deg); }
                  100% { transform: translateY(50%) rotate(20deg); }
              }
              
              @keyframes pulse {
                  0% { box-shadow: 0 0 5px var(--primary-glow); }
                  50% { box-shadow: 0 0 15px var(--primary-glow), 0 0 20px var(--secondary-glow); }
                  100% { box-shadow: 0 0 5px var(--primary-glow); }
              }
              
              @keyframes blink {
                  0%, 100% { opacity: 1; }
                  50% { opacity: 0.7; }
              }
              
              .header {
                  text-align: center;
                  margin-bottom: 30px;
                  position: relative;
              }
              
              .logo {
                  font-family: 'Orbitron', sans-serif;
                  font-size: 2.6rem;
                  font-weight: 700;
                  color: var(--primary);
                  text-shadow: 
                      0 0 5px var(--primary-glow),
                      0 0 10px var(--primary-glow),
                      0 0 15px var(--primary-glow);
                  letter-spacing: 2px;
                  margin-bottom: 5px;
              }
              
              .tagline {
                  font-size: 1.1rem;
                  font-weight: 300;
                  color: var(--secondary);
                  text-shadow: 0 0 5px var(--secondary-glow);
                  letter-spacing: 1px;
                  margin-bottom: 15px;
              }
              
              .status-pill {
                  background: var(--bg-card-alt);
                  border-radius: 30px;
                  padding: 8px 20px;
                  display: inline-flex;
                  align-items: center;
                  gap: 10px;
                  font-family: 'Orbitron', sans-serif;
                  font-size: 0.9rem;
                  border: 1px solid rgba(0,221,255,0.2);
                  animation: pulse 3s infinite;
              }
              
              .status-dot {
                  width: 12px;
                  height: 12px;
                  background: var(--success);
                  border-radius: 50%;
                  display: inline-block;
                  box-shadow: 0 0 5px var(--success-glow);
                  animation: blink 2s infinite;
              }
              
              .grid {
                  display: grid;
                  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
                  gap: 20px;
                  margin: 30px 0;
              }
              
              .card {
                  background: var(--bg-card-alt);
                  border-radius: 10px;
                  padding: 20px;
                  border-left: 3px solid var(--primary);
                  transition: all 0.3s ease;
              }
              
              .card:hover {
                  transform: translateY(-5px);
                  box-shadow: 0 5px 15px rgba(0,0,0,0.3);
              }
              
              .card-title {
                  font-family: 'Orbitron', sans-serif;
                  font-size: 1.2rem;
                  color: var(--primary);
                  margin-bottom: 15px;
                  display: flex;
                  align-items: center;
                  gap: 10px;
              }
              
              .card-content p {
                  margin-bottom: 8px;
                  font-size: 0.95rem;
              }
              
              .card-content .highlight {
                  color: var(--primary);
                  font-weight: bold;
              }
              
              .footer {
                  margin-top: 40px;
                  text-align: center;
                  font-size: 0.9rem;
                  color: var(--text-muted);
                  padding-top: 20px;
                  border-top: 1px solid rgba(0,221,255,0.1);
              }
              
              .wave {
                  display: inline-block;
                  animation: wave 1.5s infinite;
                  transform-origin: 70% 70%;
              }
              
              @keyframes wave {
                  0% { transform: rotate(0deg); }
                  10% { transform: rotate(14deg); }
                  20% { transform: rotate(-8deg); }
                  30% { transform: rotate(14deg); }
                  40% { transform: rotate(-4deg); }
                  50% { transform: rotate(10deg); }
                  60% { transform: rotate(0deg); }
                  100% { transform: rotate(0deg); }
              }
              
              .badge {
                  background: var(--bg-dark);
                  border-radius: 5px;
                  padding: 3px 8px;
                  font-size: 0.8rem;
                  color: var(--primary);
                  border: 1px solid var(--primary);
                  margin-right: 5px;
                  display: inline-block;
                  margin-bottom: 5px;
              }
              
              .whatsapp-btn {
                  display: inline-block;
                  background: linear-gradient(45deg, #0df, #0af);
                  color: #000;
                  font-family: 'Orbitron', sans-serif;
                  text-decoration: none;
                  padding: 10px 25px;
                  border-radius: 30px;
                  font-weight: bold;
                  border: none;
                  cursor: pointer;
                  margin-top: 15px;
                  transition: all 0.3s ease;
                  text-shadow: none;
                  box-shadow: 0 5px 15px rgba(0,221,255,0.3);
              }
              
              .whatsapp-btn:hover {
                  transform: translateY(-3px);
                  box-shadow: 0 7px 20px rgba(0,221,255,0.5);
              }
              
              @media (max-width: 768px) {
                  .container {
                      margin: 20px;
                      padding: 20px;
                  }
                  
                  .logo {
                      font-size: 2rem;
                  }
                  
                  .grid {
                      grid-template-columns: 1fr;
                  }
              }
          </style>
      </head>
      <body>
          <div class="container">
              <div class="header">
                  <div style="text-align: center; margin-bottom: 20px;">
                      <img src="/logo" alt="BLACKSKY-MD Premium Logo" style="max-width: 200px; height: auto;" />
                  </div>
                  <div class="logo">BLACKSKY-MD</div>
                  <div class="tagline">PREMIUM CYBERPUNK WHATSAPP BOT</div>
                  
                  <div class="status-pill">
                      <span class="status-dot"></span>
                      <span>SYSTEM ${global.conn?.user ? "CONNECTED" : "INITIALIZING"}</span>
                  </div>
              </div>
              
              <div class="grid">
                  <div class="card">
                      <div class="card-title">
                          <svg width="24" height="24" fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm0 18c-4.418 0-8-3.582-8-8s3.582-8 8-8 8 3.582 8 8-3.582 8-8 8zm1-13h-2v6h6v-2h-4V7z" fill="#0df"/>
                          </svg>
                          System Status
                      </div>
                      <div class="card-content">
                          <p>Platform: <span class="highlight">${os.platform()} ${os.arch()}</span></p>
                          <p>Node.js: <span class="highlight">${process.version}</span></p>
                          <p>Memory Usage: <span class="highlight">${Math.round(process.memoryUsage().rss / 1024 / 1024)} MB</span></p>
                          <p>Uptime: <span class="highlight">${formatUptime(process.uptime())}</span></p>
                      </div>
                  </div>
                  
                  <div class="card">
                      <div class="card-title">
                          <svg width="24" height="24" fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path d="M12 2c-4.42 0-8 3.58-8 8 0 1.65.55 3.15 1.44 4.37l-.92 2.97 2.9-.94c1.2.85 2.66 1.35 4.25 1.35 1.58 0 3.03-.5 4.23-1.34l2.92.94-.91-2.97c.89-1.21 1.43-2.71 1.43-4.36 0-4.42-3.58-8-8-8zm0 14c-3.31 0-6-2.69-6-6s2.69-6 6-6 6 2.69 6 6-2.69 6-6 6z" fill="#0df"/>
                          </svg>
                          Bot Information
                      </div>
                      <div class="card-content">
                          <p>Bot Name: <span class="highlight">${process.env.BOT_NAME || "BLACKSKY-MD"}</span></p>
                          <p>Environment: <span class="highlight">${process.env.NODE_ENV || "development"}</span></p>
                          <p>WhatsApp: <span class="highlight">${global.conn?.user ? "Connected ✓" : "Waiting for connection..."}</span></p>
                          <p>
                              <span class="badge">YouTube</span>
                              <span class="badge">Games</span>
                              <span class="badge">NSFW</span>
                              <span class="badge">AI</span>
                              <span class="badge">Premium</span>
                          </p>
                      </div>
                  </div>
              </div>
              
              <div style="text-align: center; margin-top: 20px;">
                  <p style="margin-bottom: 15px;">Invite BLACKSKY-MD to your WhatsApp group for premium cyberpunk experience!</p>
                  <a href="https://whatsapp.com/channel/0029Va8ZH8fFXUuc69TGVw1q" class="whatsapp-btn">
                      JOIN OFFICIAL CHANNEL
                  </a>
              </div>
              
              <div class="footer">
                  <p>BLACKSKY-MD CYBERPUNK EDITION <span class="wave">🤖</span></p>
                  <p style="margin-top: 5px;">© 2025 | Serving Premium WhatsApp Experience</p>
              </div>
          </div>
      </body>
      </html>
      `);
    });
    
    // Serve the premium logo - now with PNG conversion for better compatibility
    app.get('/logo', async (req, res) => {
      try {
        // First try to serve the SVG-converted-to-PNG version
        const { svgToPng } = require('./lib/svg-converter');
        const logoPath = path.join(__dirname, 'blacksky-premium-logo.svg');
        
        if (fs.existsSync(logoPath)) {
          try {
            // Convert SVG to PNG for better compatibility
            const pngBuffer = await svgToPng(logoPath, {
              width: 500,
              height: 500,
              background: { r: 18, g: 18, b: 18, alpha: 1 } // Dark background matching the website
            });
            
            res.setHeader('Content-Type', 'image/png');
            res.send(pngBuffer);
            console.log('Successfully served PNG-converted logo');
          } catch (conversionError) {
            console.error('Error converting SVG to PNG, falling back to direct SVG:', conversionError);
            // Fall back to direct SVG if conversion fails
            res.setHeader('Content-Type', 'image/svg+xml');
            res.sendFile(logoPath);
          }
        } else {
          // Try alternate logo files
          const alternateLogos = [
            'blacksky-logo-premium.svg',
            'blacksky-logo.svg',
            'blacksky-md-updated.jpg'
          ];
          
          let found = false;
          for (const logo of alternateLogos) {
            const altPath = path.join(__dirname, logo);
            if (fs.existsSync(altPath)) {
              if (logo.endsWith('.svg')) {
                try {
                  // Convert SVG to PNG
                  const pngBuffer = await svgToPng(altPath, {
                    width: 500,
                    height: 500,
                    background: { r: 18, g: 18, b: 18, alpha: 1 }
                  });
                  
                  res.setHeader('Content-Type', 'image/png');
                  res.send(pngBuffer);
                } catch (err) {
                  // Fallback to direct SVG
                  res.setHeader('Content-Type', 'image/svg+xml');
                  res.sendFile(altPath);
                }
              } else {
                // For JPG/PNG files
                res.sendFile(altPath);
              }
              found = true;
              console.log(`Using alternate logo: ${logo}`);
              break;
            }
          }
          
          if (!found) {
            console.error('No logo files found');
            res.status(404).send('Logo not found');
          }
        }
      } catch (error) {
        console.error('Error serving logo:', error);
        res.status(500).send('Error serving logo');
      }
    });
    
    // Health check endpoint for monitoring
    app.get('/health', (req, res) => {
      res.setHeader('Content-Type', 'application/json');
      res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        memory: {
          rss: `${Math.round(process.memoryUsage().rss / 1024 / 1024)} MB`,
          heapTotal: `${Math.round(process.memoryUsage().heapTotal / 1024 / 1024)} MB`,
          heapUsed: `${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)} MB`
        },
        connection: {
          connected: !!global.conn?.user,
          user: global.conn?.user?.name || null
        }
      });
    });
    
    // Start the server
    const server = app.listen(port, () => {
      console.log('\x1b[32m%s\x1b[0m', `🚀 Server running on port ${port}`);
    });
    
    server.on('error', (err) => {
      console.error('\x1b[31m%s\x1b[0m', `❌ Server error: ${err.message}`);
    });
    
  } else {
    console.log(`Port ${port} is already in use. Trying another port...`);
    availablePortIndex++;

    if (availablePortIndex >= ports.length) {
      console.log('No more available ports. Exiting...');
      process.exit(1);
    } else {
      ports[availablePortIndex] = parseInt(port) + 1;
      startServer();
    }
  }
}

startServer();

let isRunning = false;

// This is a modified section to run everything directly from index.js
// without requiring any additional files like main.js

// Load optimization components
let botOptimizer;
try {
  if (fs.existsSync('./optimize-bot.js')) {
    botOptimizer = require('./optimize-bot.js');
    console.log('\x1b[32m%s\x1b[0m', '✅ Bot optimizer loaded');
    botOptimizer.initializeOptimizations();
  } else {
    console.log('\x1b[33m%s\x1b[0m', '⚠️ optimize-bot.js not found, running without optimizations');
  }
} catch (err) {
  console.error('\x1b[31m%s\x1b[0m', '❌ Failed to load optimizer:', err);
}

// Load handler optimizations
try {
  if (fs.existsSync('./handler-optimization.js')) {
    const handlerOptimizer = require('./handler-optimization.js');
    console.log('\x1b[32m%s\x1b[0m', '✅ Handler optimizations loaded');
    handlerOptimizer.initializeOptimizations();
  } else {
    console.log('\x1b[33m%s\x1b[0m', '⚠️ handler-optimization.js not found, running without handler optimizations');
  }
} catch (err) {
  console.error('\x1b[31m%s\x1b[0m', '❌ Failed to load handler optimizations:', err);
}

// Load Heroku-specific connection keeper
try {
  if (process.env.HEROKU === 'true' && fs.existsSync('./heroku-connection-keeper.js')) {
    const herokuConnectionKeeper = require('./heroku-connection-keeper.js');
    console.log('\x1b[32m%s\x1b[0m', '✅ Heroku connection keeper loaded');
    herokuConnectionKeeper.initialize();
  }
} catch (err) {
  console.error('\x1b[31m%s\x1b[0m', '❌ Failed to load Heroku connection keeper:', err);
}

function start(file) {
  if (isRunning) return;
  isRunning = true;
  
  // Import required modules if not already available
  const { spawn } = require('child_process');
  
  // For Heroku, we should not spawn a child process, and instead run directly
  const isHeroku = process.env.HEROKU === 'true' || process.env.HEROKU === true;
  const isDirectMode = isHeroku || process.argv.includes('--direct-mode');
  
  if (isDirectMode && file === 'main.js') {
    // On Heroku, we run everything from index.js
    console.log('\x1b[32m%s\x1b[0m', `⚡ Running directly from index.js (Heroku optimized mode)`);
    
    try {
      // Set up environment for direct mode
      global.directMode = true;
      global.isHerokuMode = isHeroku;
      
      // Initialize core bot components
      console.log('\x1b[32m%s\x1b[0m', `Setting up WhatsApp connection...`);
      
      // Initialize optimization modules directly
      initializeOptimizations();
      
      // Set up anti-idle server for Heroku
      setupAntiIdleServer();
      
      // Execute the main bot code
      console.log('\x1b[32m%s\x1b[0m', `Starting WhatsApp bot in direct mode...`);
      const mainBot = require('./main.js');
      
      console.log('\x1b[32m%s\x1b[0m', `✅ Bot started successfully in direct mode`);
      return;
    } catch (err) {
      console.error('\x1b[31m%s\x1b[0m', `❌ Failed to start bot in direct mode:`, err);
      console.log('\x1b[33m%s\x1b[0m', `⚠️ Falling back to standard mode...`);
    }
  }
  
  // Log optimization status before starting
  if (file === 'main.js') {
    console.log('\x1b[32m%s\x1b[0m', `⚡ Starting optimized bot process...`);
    // Add NODE_OPTIONS to enable GC if not already set
    if (!process.env.NODE_OPTIONS) {
      process.env.NODE_OPTIONS = '--expose-gc';
      console.log('\x1b[32m%s\x1b[0m', `✅ Enabled garbage collection with --expose-gc`);
    }
  }

  const args = [path.join(__dirname, file), ...process.argv.slice(2)];
  const p = spawn(process.argv[0], args, {
    stdio: ["inherit", "inherit", "inherit", "ipc"],
    env: {
      ...process.env,
      PERFORMANCE_MODE: 'true' // Signal to child process that performance mode is active
    }
  });

  p.on("message", (data) => {
    console.log('\x1b[36m%s\x1b[0m', `🟢 RECEIVED ${data}`);
    switch (data) {
      case "reset":
        p.kill();
        isRunning = false;
        start.apply(this, arguments);
        break;
      case "uptime":
        p.send(process.uptime());
        break;
      case "optimize":
        console.log('\x1b[32m%s\x1b[0m', `⚡ Optimization request received, applying optimizations...`);
        p.send("optimizing");
        break;
    }
  });

  p.on("exit", (code) => {
    isRunning = false;
    console.error('\x1b[31m%s\x1b[0m', `Exited with code: ${code}`);
    start('main.js');

    if (code === 0) return;

    fs.watchFile(args[0], () => {
      fs.unwatchFile(args[0]);
          console.error('\x1b[31m%s\x1b[0m', `File ${args[0]} has been modified. Script will restart...`);
      start("main.js");
    });
  });

  p.on("error", (err) => {
    console.error('\x1b[31m%s\x1b[0m', `Error: ${err}`);
    p.kill();
    isRunning = false;
    console.error('\x1b[31m%s\x1b[0m', `Error occurred. Script will restart...`);
    start("main.js");
  });

  const pluginsFolder = path.join(__dirname, "plugins");

  fs.readdir(pluginsFolder, (err, files) => {
    if (err) {
      console.error('\x1b[31m%s\x1b[0m', `Error reading plugins folder: ${err}`);
      return;
    }
    console.log('\x1b[33m%s\x1b[0m', `🟡 Found ${files.length} plugins in folder ${pluginsFolder}`);
    try {
      require.resolve('@adiwajshing/baileys');
      console.log('\x1b[33m%s\x1b[0m', `🟡 Baileys library version ${require('@adiwajshing/baileys/package.json').version} is installed`);
    } catch (e) {
      console.error('\x1b[31m%s\x1b[0m', `❌ Baileys library is not installed`);
    }
  });

  console.log(`🖥️ \x1b[33m${os.type()}\x1b[0m, \x1b[33m${os.release()}\x1b[0m - \x1b[33m${os.arch()}\x1b[0m`);
  const ramInGB = os.totalmem() / (1024 * 1024 * 1024);
  console.log(`💾 \x1b[33mTotal RAM: ${ramInGB.toFixed(2)} GB\x1b[0m`);
  const freeRamInGB = os.freemem() / (1024 * 1024 * 1024);
  console.log(`💽 \x1b[33mFree RAM: ${freeRamInGB.toFixed(2)} GB\x1b[0m`);
  console.log('\x1b[33m%s\x1b[0m', `📃 Script by BETABOTZ`);

  setInterval(() => {}, 1000);
}

start("main.js");

const tmpDir = './tmp';
  if (!fs.existsSync(tmpDir)) {
    fs.mkdirSync(tmpDir);
    console.log('\x1b[33m%s\x1b[0m', `📁 Created directory ${tmpDir}`);
}

process.on('unhandledRejection', (reason) => {
  console.error('\x1b[31m%s\x1b[0m', `Unhandled promise rejection: ${reason}`);
  console.error('\x1b[31m%s\x1b[0m', 'Unhandled promise rejection. Script will restart...');
  start('main.js');
});

process.on('exit', (code) => {
  console.error(`Exited with code: ${code}`);
  console.error('Script will restart...');
  start('main.js');
});
