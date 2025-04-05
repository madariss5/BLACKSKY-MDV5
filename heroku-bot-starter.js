/**
 * BLACKSKY-MD Bot Starter for Heroku with enhanced stability
 * Optimized for Replit environment
 * With advanced group chat and response time optimizations
 * Compatible with both Heroku and Termux environments
 * Includes PM2 integration for 24/7 operation
 */

// Set higher event listener limit to avoid MaxListenersExceededWarning
require('events').EventEmitter.prototype.setMaxListeners(500);
require('events').EventEmitter.defaultMaxListeners = 500;

// Detect environment
const os = require('os');
const isTermux = os.platform() === 'android' || process.env.TERMUX === 'true';
const isHeroku = process.env.HEROKU === 'true' || !!process.env.DYNO;

// Enable memory optimization by default on Heroku
process.env.ENABLE_MEMORY_OPTIMIZATION = process.env.ENABLE_MEMORY_OPTIMIZATION || 'true';

// Set environment variables based on detected environment
if (isTermux) {
  console.log('📱 Running in Termux environment');
  process.env.TERMUX = 'true';
  process.env.HEROKU = 'false';
  process.env.SHARP_COMPAT = 'true';
  
  // Set up Sharp compatibility for Termux
  try {
    global.sharp = require('./sharp-compat.js');
    console.log('✅ Using Sharp compatibility layer for Termux');
  } catch (err) {
    try {
      global.sharp = require('./sharp-simple-compat.js');
      console.log('✅ Using simple Sharp compatibility layer for Termux');
    } catch (err2) {
      console.error('⚠️ Failed to load Sharp compatibility layer:', err2);
      // Create minimal Sharp dummy implementation
      const fs = require('fs');
      global.sharp = (input) => ({
        resize: () => ({ toBuffer: async () => input, toFile: async (path) => fs.writeFileSync(path, input) })
      });
    }
  }
} else if (isHeroku) {
  console.log('☁️ Running in Heroku environment');
  process.env.HEROKU = 'true';
  process.env.TERMUX = 'false';
}

// Set up PM2 integration if running with PM2
try {
  const pm2Integration = require('./pm2-integration.js');
  if (pm2Integration.isPM2()) {
    console.log('📋 Running with PM2, setting up integration...');
    global.PM2_INTEGRATION = pm2Integration;
  }
} catch (err) {
  console.warn('⚠️ PM2 integration module not found or failed to load:', err.message);
}
// Load connection keepers
// Standard Heroku connection keeper
const { initialize: initKeeper } = require('./heroku-connection-keeper.js');
// Advanced connection keeper for better "connection appears to be closed" handling
try {
  global.enhancedConnectionKeeper = require('./enhanced-connection-keeper');
  console.log('✅ Enhanced connection keeper loaded successfully');
  
  // Configure enhanced connection keeper with optimal settings
  global.enhancedKeeperConfig = {
    pollInterval: 3000,        // Check every 3 seconds for faster response
    maxAttempts: 120,          // 6 minutes timeout (120 * 3s)
    applyPatches: true,        // Apply patches immediately
    forceReconnect: false,     // Don't force reconnect initially
    verbose: true              // Show detailed logs
  };
  
  // Add configuration override from environment
  if (process.env.CONNECTION_KEEPER_FORCE_RECONNECT === 'true') {
    global.enhancedKeeperConfig.forceReconnect = true;
    console.log('⚠️ Force reconnect enabled per environment configuration');
  }
  
  // Initialize with safe mode that waits for connection, using our enhanced config
  if (global.enhancedConnectionKeeper && typeof global.enhancedConnectionKeeper.safeInitialize === 'function') {
    console.log('🔄 Starting enhanced connection keeper in safe mode with optimal settings');
    global.enhancedConnectionKeeper.safeInitialize(null, global.enhancedKeeperConfig);
  }
} catch (err) {
  console.error('❌ Failed to load enhanced connection keeper:', err.message);
  global.enhancedConnectionKeeper = null;
}

// Initialize advanced memory manager if enabled (default on Heroku)
if (process.env.ENABLE_MEMORY_OPTIMIZATION === 'true') {
  try {
    const AdvancedMemoryManager = require('./lib/advanced-memory-manager.js');
    const memoryManager = AdvancedMemoryManager.initMemoryManager({
      memoryThresholdWarning: 70, // Lower the threshold for earlier intervention
      memoryThresholdCritical: 85, // Lower the critical threshold
      cleanupInterval: 2 * 60 * 1000, // More frequent cleanup (2 minutes)
      logMemoryUsage: true // Enable memory usage logging
    });
    
    // Create a wrapper with the expected method names
    const memoryManagerWrapper = {
      // Map original methods to the ones we need
      getMemoryUsage: function() {
        // If the original has getMemoryUsage, use it
        if (typeof memoryManager.getMemoryUsage === 'function') {
          return memoryManager.getMemoryUsage();
        }
        
        // Otherwise, create our own implementation
        const memoryUsage = process.memoryUsage();
        const totalMemory = require('os').totalmem();
        const freeMemory = require('os').freemem();
        const usedMemory = totalMemory - freeMemory;
        
        // Format memory values to MB
        const formatted = {
          heapUsed: Math.round(memoryUsage.heapUsed / (1024 * 1024)),
          heapTotal: Math.round(memoryUsage.heapTotal / (1024 * 1024)),
          rss: Math.round(memoryUsage.rss / (1024 * 1024)),
          external: Math.round((memoryUsage.external || 0) / (1024 * 1024)),
          arrayBuffers: Math.round((memoryUsage.arrayBuffers || 0) / (1024 * 1024)),
          systemTotal: Math.round(totalMemory / (1024 * 1024)),
          systemFree: Math.round(freeMemory / (1024 * 1024)),
          systemUsed: Math.round(usedMemory / (1024 * 1024)),
        };
        
        // Calculate percentages
        const percentages = {
          heapUsage: Math.round((memoryUsage.heapUsed / memoryUsage.heapTotal) * 100),
          systemUsage: Math.round((usedMemory / totalMemory) * 100),
        };
        
        return {
          raw: memoryUsage,
          formatted,
          percentages,
          time: Date.now(),
        };
      },
      
      // Map all original methods to our wrapper
      runCleanup: function() {
        try {
          if (typeof memoryManager.runCleanup === 'function') {
            memoryManager.runCleanup();
          } else if (typeof memoryManager.performMemoryCleanup === 'function') {
            memoryManager.performMemoryCleanup();
          } else {
            // Fallback cleanup implementation
            this.performBasicCleanup();
          }
          console.log('[MEMORY-MANAGER] Performed memory cleanup');
        } catch (err) {
          console.error('[MEMORY-MANAGER] Error during cleanup:', err.message);
          // Fallback to basic cleanup
          this.performBasicCleanup();
        }
      },
      
      // Make sure this is a real function and not just a property
      get getMemoryUsage() {
        // Return a proper function wrapped in another function to maintain 'this' context
        return () => {
          // If the original has getMemoryUsage, use it
          if (typeof memoryManager.getMemoryUsage === 'function') {
            return memoryManager.getMemoryUsage();
          }
          
          // Otherwise, create our own implementation
          const memoryUsage = process.memoryUsage();
          const totalMemory = require('os').totalmem();
          const freeMemory = require('os').freemem();
          const usedMemory = totalMemory - freeMemory;
          
          // Format memory values to MB
          const formatted = {
            heapUsed: Math.round(memoryUsage.heapUsed / (1024 * 1024)),
            heapTotal: Math.round(memoryUsage.heapTotal / (1024 * 1024)),
            rss: Math.round(memoryUsage.rss / (1024 * 1024)),
            external: Math.round((memoryUsage.external || 0) / (1024 * 1024)),
            arrayBuffers: Math.round((memoryUsage.arrayBuffers || 0) / (1024 * 1024)),
            systemTotal: Math.round(totalMemory / (1024 * 1024)),
            systemFree: Math.round(freeMemory / (1024 * 1024)),
            systemUsed: Math.round(usedMemory / (1024 * 1024))
          };
          
          // Calculate percentages
          const percentages = {
            heapUsage: Math.round((memoryUsage.heapUsed / memoryUsage.heapTotal) * 100),
            systemUsage: Math.round((usedMemory / totalMemory) * 100)
          };
          
          return {
            raw: memoryUsage,
            formatted,
            percentages,
            time: Date.now()
          };
        };
      },
      
      // Basic cleanup implementation for fallback
      performBasicCleanup: function() {
        console.log('[MEMORY-MANAGER] Running basic cleanup...');
        
        // Clear module cache for non-essential modules
        let clearedCount = 0;
        for (const key in require.cache) {
          if (key.includes('node_modules') && 
              !key.includes('baileys') && 
              !key.includes('whatsapp') &&
              !key.includes('express')) {
            delete require.cache[key];
            clearedCount++;
          }
        }
        console.log(`[MEMORY-MANAGER] Cleared ${clearedCount} modules from cache`);
        
        // Force garbage collection if available
        if (global.gc) {
          try {
            global.gc();
            console.log('[MEMORY-MANAGER] Garbage collection triggered');
          } catch (err) {
            console.error('[MEMORY-MANAGER] GC error:', err.message);
          }
        }
      },
      
      runEmergencyCleanup: function() {
        try {
          if (typeof memoryManager.runEmergencyCleanup === 'function') {
            memoryManager.runEmergencyCleanup();
          } else if (typeof memoryManager.performMemoryCleanup === 'function') {
            memoryManager.performMemoryCleanup(true); // true for emergency
          } else {
            // Call our own emergency cleanup implementation if original methods aren't available
            this.performEmergencyCleanup();
            return; // Skip additional cleanup since our implementation is comprehensive
          }
          console.log('[MEMORY-MANAGER] Performed emergency memory cleanup');
        } catch (err) {
          console.error('[MEMORY-MANAGER] Error during emergency cleanup:', err.message);
          // Fall back to our own implementation
          this.performEmergencyCleanup();
          return;
        }
        
        // Also clear Node.js module cache to free up memory
        for (const key in require.cache) {
          if (key.includes('node_modules') && 
              !key.includes('baileys') && 
              !key.includes('whatsapp')) {
            delete require.cache[key];
          }
        }
        
        // Force garbage collection if available
        if (global.gc) {
          try {
            global.gc();
            console.log('[MEMORY-MANAGER] Force garbage collection completed');
          } catch (err) {
            console.error('[MEMORY-MANAGER] Error during forced GC:', err.message);
          }
        }
      },
      
      // Comprehensive emergency cleanup implementation
      performEmergencyCleanup: function() {
        console.log('🚨 Running emergency memory cleanup...');
        
        // Clear non-essential module cache
        let clearedCount = 0;
        for (const key in require.cache) {
          if (!key.includes('baileys') && !key.includes('whatsapp') && !key.includes('express')) {
            delete require.cache[key];
            clearedCount++;
          }
        }
        console.log(`🧹 Cleared ${clearedCount} non-essential modules from require cache`);
        
        // Force garbage collection
        if (global.gc) {
          try {
            global.gc();
            console.log('✅ Garbage collection triggered successfully');
          } catch (err) {
            console.error('⚠️ Garbage collection function not available (Node.js needs --expose-gc flag)');
          }
        } else {
          console.error('⚠️ Garbage collection function not available (Node.js needs --expose-gc flag)');
        }
        
        // Clean up WhatsApp-specific data if available
        try {
          if (global.conn && global.conn.chats) {
            const chatCount = Object.keys(global.conn.chats).length;
            let messageCount = 0;
            
            // Clear message history in chats to free memory
            for (const chatId in global.conn.chats) {
              const chat = global.conn.chats[chatId];
              if (chat && chat.messages) {
                // Keep only the latest 10 messages
                const keys = [...chat.messages.keys()];
                if (keys.length > 10) {
                  const keysToRemove = keys.slice(0, keys.length - 10);
                  for (const key of keysToRemove) {
                    chat.messages.delete(key);
                    messageCount++;
                  }
                }
              }
            }
            console.log(`🧹 Cleared excess message history from ${chatCount} chats (${messageCount} messages removed)`);
          }
        } catch (err) {
          console.error('⚠️ Error cleaning WhatsApp chat history:', err.message);
        }
        
        console.log('✅ Emergency cleanup completed');
      }
    };
    
    // Set the wrapped memory manager globally
    global.memoryManager = memoryManagerWrapper;
    
    // Start memory management timers
    console.log('[MEMORY-MANAGER] Memory management timers started');
    
    // Create a test function to verify it's working properly
    setTimeout(() => {
      try {
        // Log the available methods
        console.log('[MEMORY-MANAGER] Available memory manager methods:', 
          Object.keys(memoryManager).join(', '));
        
        // Test memory usage function using global.memoryManager
        try {    
          const memUsage = global.memoryManager.getMemoryUsage();
          console.log('[MEMORY-MANAGER] Current heap usage:', 
            memUsage.percentages.heapUsage + '%', 
            '(' + memUsage.formatted.heapUsed + ' MB)');
        } catch (memError) {
          console.error('[MEMORY-MANAGER] Error getting memory usage:', memError.message);
          // Try direct function from the module
          const directMemUsage = AdvancedMemoryManager.getMemoryUsage();
          console.log('[MEMORY-MANAGER] Direct memory usage call succeeded:', 
            directMemUsage.percentages.heapUsage + '%');
        }
          
        // Test cleanup function
        try {
          global.memoryManager.runCleanup();
        } catch (cleanupError) {
          console.error('[MEMORY-MANAGER] Error running cleanup:', cleanupError.message);
        }
      } catch (error) {
        console.error('[MEMORY-MANAGER] Error testing memory manager:', error);
      }
    }, 5000);
    
    console.log('✅ Advanced memory manager initialized for Heroku optimization');
  } catch (err) {
    console.error('❌ Failed to load advanced memory manager:', err.message);
    console.error(err);
    global.memoryManager = null;
  }
}

// Performance optimization support - initialize earlier for faster startup
let optimizerInitialized = false;
function initOptimizer() {
  if (optimizerInitialized) return;
  
  try {
    // Pre-load RPG-specific optimizations
    console.log('🚀 Loading RPG performance optimizations...');
    
    // Initialize response cache system
    global.responseCache = require('./lib/response-cache.js');
    console.log('✅ Response cache system loaded successfully');
    
    // Initialize group optimization system
    global.groupOptimization = require('./lib/group-optimization.js');
    console.log('✅ Group chat optimization system loaded successfully');
    
    // Load other optimizations via the main module
    require('./apply-optimizations.js');
    
    // Set up periodic cache cleanup
    setInterval(() => {
      if (global.responseCache && typeof global.responseCache.cleanup === 'function') {
        global.responseCache.cleanup();
      }
    }, 5 * 60 * 1000); // Clean every 5 minutes
    
    optimizerInitialized = true;
    console.log('✅ Performance optimization system fully initialized');
  } catch (err) {
    console.error('⚠️ Failed to load performance optimizations:', err.message);
    console.error(err);
  }
}
const express = require('express');
const app = express();
// Use a specific port for the primary server to avoid conflicts with heroku-connection-keeper.js
const port = process.env.PORT || 5000;
const healthCheckPort = process.env.HEALTH_CHECK_PORT || 28111;
const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

// Initialize PostgreSQL connection pool with error handling
let pool;
try {
  if (!process.env.DATABASE_URL) {
    console.warn('⚠️ DATABASE_URL environment variable not set. Database features will be disabled.');
    console.warn('⚠️ For Heroku deployment, make sure to add the PostgreSQL addon and set DATABASE_URL.');
    global.DATABASE_ENABLED = false;
    
    // Create mock pool for testing purposes
    pool = {
      query: async () => ({ rows: [{ now: new Date() }] }),
      on: () => {}
    };
    console.log('✅ Created mock database pool for testing environment');
  } else {
    // Set DATABASE_ENABLED to true immediately to avoid race conditions
    global.DATABASE_ENABLED = true;
    
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: {
        rejectUnauthorized: false
      },
      // Add connection timeout to prevent hanging
      connectionTimeoutMillis: 10000,
      // Increase idle timeout
      idleTimeoutMillis: 30000
    });
    
    // Test the connection
    pool.query('SELECT NOW()', (err, res) => {
      if (err) {
        console.error('❌ Database connection test failed:', err.message);
        console.warn('⚠️ Database features will be disabled due to connection error.');
        global.DATABASE_ENABLED = false;
      } else {
        console.log('✅ Database connection established successfully.');
        console.log('✅ Database features enabled for 24/7 Heroku operation.');
      }
    });
  }
} catch (err) {
  console.error('❌ Error initializing database pool:', err.message);
  console.warn('⚠️ Database features will be disabled due to initialization error.');
  global.DATABASE_ENABLED = false;
}

// Create session table if it doesn't exist
async function createSessionTable() {
  if (!global.DATABASE_ENABLED || !pool) {
    console.log('⚠️ Database not enabled or available, skipping session table creation');
    return false;
  }
  
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS whatsapp_sessions (
        id SERIAL PRIMARY KEY,
        session_id VARCHAR(255) NOT NULL,
        session_data JSONB NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      CREATE INDEX IF NOT EXISTS idx_whatsapp_sessions_session_id ON whatsapp_sessions(session_id);
    `);
    console.log('✅ Session table created or confirmed');
    return true;
  } catch (err) {
    console.error('❌ Error creating session table:', err);
    global.DATABASE_ENABLED = false;
    return false;
  }
}

// Initialize session database if database is available
if (global.DATABASE_ENABLED !== false) {
  console.log('🔄 Initializing session database...');
  createSessionTable();
} else {
  console.log('⚠️ Database features disabled, skipping session table creation');
}

// Set up database globals for other modules to use
global.dbPool = pool;

// Initialize connection keeper
const keeper = initKeeper();

// Create a simple standalone memory manager to ensure we always have one available
// This can be used as a fallback if the advanced memory manager fails
function createBasicMemoryManager() {
  return {
    getMemoryUsage: function() {
      const memoryUsage = process.memoryUsage();
      const totalMemory = require('os').totalmem();
      const freeMemory = require('os').freemem();
      const usedMemory = totalMemory - freeMemory;
      
      // Format memory values to MB
      const formatted = {
        heapUsed: Math.round(memoryUsage.heapUsed / (1024 * 1024)),
        heapTotal: Math.round(memoryUsage.heapTotal / (1024 * 1024)),
        rss: Math.round(memoryUsage.rss / (1024 * 1024)),
        external: Math.round((memoryUsage.external || 0) / (1024 * 1024)),
        arrayBuffers: Math.round((memoryUsage.arrayBuffers || 0) / (1024 * 1024)),
        systemTotal: Math.round(totalMemory / (1024 * 1024)),
        systemFree: Math.round(freeMemory / (1024 * 1024)),
        systemUsed: Math.round(usedMemory / (1024 * 1024)),
      };
      
      // Calculate percentages (with a ceiling of 100% to prevent NaN)
      const percentages = {
        heapUsage: Math.min(100, Math.round((memoryUsage.heapUsed / Math.max(1, memoryUsage.heapTotal)) * 100)),
        systemUsage: Math.min(100, Math.round((usedMemory / Math.max(1, totalMemory)) * 100)),
      };
      
      return {
        raw: memoryUsage,
        formatted,
        percentages,
        time: Date.now(),
      };
    },
    
    runCleanup: function() {
      // Basic memory cleanup (clear require cache for non-essential modules)
      for (const key in require.cache) {
        if (key.includes('node_modules') && 
            !key.includes('baileys') && 
            !key.includes('whatsapp') &&
            !key.includes('express')) {
          delete require.cache[key];
        }
      }
      console.log('[BASIC-MEMORY-MANAGER] Performed basic cleanup');
      
      // Force garbage collection if available
      if (global.gc) {
        try {
          global.gc();
          console.log('[BASIC-MEMORY-MANAGER] Garbage collection triggered');
        } catch (err) {
          console.error('[BASIC-MEMORY-MANAGER] Error during GC:', err.message);
        }
      }
    },
    
    runEmergencyCleanup: function() {
      // Clear all caches
      console.log('[BASIC-MEMORY-MANAGER] Emergency cleanup: clearing caches');
      
      // Clear require cache more aggressively
      for (const key in require.cache) {
        if (!key.includes('baileys') && !key.includes('whatsapp')) {
          delete require.cache[key];
        }
      }
      
      // Force garbage collection
      if (global.gc) {
        try {
          global.gc();
          console.log('[BASIC-MEMORY-MANAGER] Emergency garbage collection completed');
        } catch (err) {
          console.error('[BASIC-MEMORY-MANAGER] Error during emergency GC:', err.message);
        }
      }
    }
  };
}

// Make sure we always have a memory manager available globally
if (!global.memoryManager) {
  console.log('⚠️ Using basic memory manager as fallback');
  global.memoryManager = createBasicMemoryManager();
}

// Health check endpoint
app.get('/health', (req, res) => {
  try {
    // Get memory info, safely falling back to process.memoryUsage() if needed
    let memoryInfo;
    try {
      if (global.memoryManager && typeof global.memoryManager.getMemoryUsage === 'function') {
        memoryInfo = global.memoryManager.getMemoryUsage();
      } else {
        // Create and use basic memory manager
        const basicManager = createBasicMemoryManager();
        memoryInfo = basicManager.getMemoryUsage();
      }
    } catch (memError) {
      console.error('❌ Error getting memory usage:', memError.message);
      // Simple fallback
      const mem = process.memoryUsage();
      memoryInfo = {
        raw: mem,
        formatted: {
          heapUsed: Math.round(mem.heapUsed / (1024 * 1024)),
          heapTotal: Math.round(mem.heapTotal / (1024 * 1024))
        },
        percentages: {
          heapUsage: Math.round((mem.heapUsed / mem.heapTotal) * 100)
        }
      };
    }
    
    res.json({ 
      status: 'ok', 
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: memoryInfo,
      memoryOptimizationEnabled: !!global.memoryManager,
      databaseConnected: !!global.dbPool
    });
  } catch (err) {
    console.error('❌ Error in health check endpoint:', err.message);
    res.status(500).json({ 
      status: 'error', 
      message: 'Internal server error in health check',
      error: err.message
    });
  }
});

// Set up periodic memory monitoring for Heroku
if (process.env.ENABLE_MEMORY_OPTIMIZATION === 'true') {
  const MEMORY_CHECK_INTERVAL = 60 * 1000; // Check every minute
  console.log('🧠 Setting up periodic memory monitoring...');
  
  // Run initial memory check to validate setup
  setTimeout(() => {
    console.log('🧠 Running initial memory manager test...');
    try {
      if (!global.memoryManager) {
        console.error('❌ Memory manager not available globally');
        return;
      }
      
      // List available methods on the memory manager
      console.log('🧠 Memory manager methods:', Object.keys(global.memoryManager).join(', '));
      
      // Check if getMemoryUsage is available on the memory manager
      if (typeof global.memoryManager.getMemoryUsage !== 'function') {
        console.error('❌ getMemoryUsage is not a function on memory manager');
        console.log('🔄 Falling back to direct module import for memory usage');
        
        try {
          // Use the directly imported memory manager module
          const AdvancedMemoryManager = require('./lib/advanced-memory-manager.js');
          const memoryInfo = AdvancedMemoryManager.getMemoryUsage();
          
          console.log('✅ Direct memory module working! Current memory usage:');
          console.log(`   Heap: ${memoryInfo.percentages.heapUsage}% (${memoryInfo.formatted.heapUsed} MB)`);
          console.log(`   System: ${memoryInfo.percentages.systemUsage}% (${memoryInfo.formatted.systemUsed} MB)`);
          
          // Update the global memory manager with working function
          global.memoryManager.getMemoryUsage = AdvancedMemoryManager.getMemoryUsage;
          console.log('✅ Updated global memory manager with working getMemoryUsage function');
        } catch (directErr) {
          console.error('❌ Error using direct memory module import:', directErr.message);
        }
        return;
      }
      
      // Get memory usage
      const memoryInfo = global.memoryManager.getMemoryUsage();
      console.log('✅ Memory manager working! Current memory usage:');
      console.log(`   Heap: ${memoryInfo.percentages.heapUsage}% (${memoryInfo.formatted.heapUsed} MB)`);
      console.log(`   System: ${memoryInfo.percentages.systemUsage}% (${memoryInfo.formatted.systemUsed} MB)`);
      
      // Test cleanup function
      if (typeof global.memoryManager.runCleanup === 'function') {
        global.memoryManager.runCleanup();
        console.log('✅ Memory cleanup function executed successfully');
      }
    } catch (err) {
      console.error('❌ Error testing memory manager:', err);
    }
  }, 3000);
  
  const memoryMonitorInterval = setInterval(() => {
    try {
      if (!global.memoryManager) {
        console.error('❌ Memory manager not available globally');
        return;
      }
      
      let memoryInfo;
      
      try {
        // First try using the global memory manager
        if (typeof global.memoryManager.getMemoryUsage === 'function') {
          memoryInfo = global.memoryManager.getMemoryUsage();
        } else {
          // Fall back to direct import if needed
          console.log('⚠️ Global memory manager missing getMemoryUsage, using direct import');
          
          const AdvancedMemoryManager = require('./lib/advanced-memory-manager.js');
          memoryInfo = AdvancedMemoryManager.getMemoryUsage();
          
          // Update the global memory manager for future calls
          global.memoryManager.getMemoryUsage = AdvancedMemoryManager.getMemoryUsage;
        }
      } catch (memErr) {
        console.error('❌ Error accessing memory usage:', memErr.message);
        
        // Last resort fallback to basic memory calculation
        const basicManager = createBasicMemoryManager();
        memoryInfo = basicManager.getMemoryUsage();
        
        // Replace the broken function with a working one
        global.memoryManager.getMemoryUsage = basicManager.getMemoryUsage;
      }
      
      // Extract correct properties from memory info
      const heapUsagePercent = memoryInfo.percentages.heapUsage;
      const heapUsedMB = memoryInfo.formatted.heapUsed;
      
      // Log memory status periodically
      if (heapUsagePercent > 70) {
        console.log(`⚠️ Memory usage high: ${heapUsagePercent.toFixed(1)}% (${heapUsedMB} MB)`);
      }
      
      // Make sure required functions are available in memory manager
      const memManager = global.memoryManager;
      
      // Ensure runCleanup is available
      if (typeof memManager.runCleanup !== 'function') {
        console.log('⚠️ Adding missing runCleanup function to memory manager');
        memManager.runCleanup = function() {
          console.log('[MEMORY-MANAGER] Running basic cleanup...');
          
          // Clear require cache for non-essential modules
          let clearedModules = 0;
          for (const key in require.cache) {
            if (key.includes('node_modules') && 
                !key.includes('baileys') && 
                !key.includes('whatsapp') &&
                !key.includes('express')) {
              delete require.cache[key];
              clearedModules++;
            }
          }
          console.log(`[MEMORY-MANAGER] Cleared ${clearedModules} modules from cache`);
          return true;
        };
      }
      
      // Ensure runEmergencyCleanup is available
      if (typeof memManager.runEmergencyCleanup !== 'function') {
        console.log('⚠️ Adding missing runEmergencyCleanup function to memory manager');
        memManager.runEmergencyCleanup = function() {
          console.log('[MEMORY-MANAGER] Running emergency cleanup...');
          
          // Clear more aggressively
          let clearedModules = 0;
          for (const key in require.cache) {
            if (!key.includes('baileys') && !key.includes('whatsapp')) {
              delete require.cache[key];
              clearedModules++;
            }
          }
          console.log(`[MEMORY-MANAGER] Emergency cleared ${clearedModules} modules from cache`);
          
          // Clear WhatsApp message cache if possible
          if (global.conn && global.conn.chats) {
            let messageCount = 0;
            const chatCount = Object.keys(global.conn.chats).length;
            console.log(`[MEMORY-MANAGER] Clearing message history from ${chatCount} chats...`);
            
            for (const chatId in global.conn.chats) {
              const chat = global.conn.chats[chatId];
              if (chat && chat.messages) {
                // Keep only 10 messages per chat in emergency mode
                const keys = [...chat.messages.keys()];
                if (keys.length > 10) {
                  const keysToRemove = keys.slice(0, keys.length - 10);
                  for (const key of keysToRemove) {
                    chat.messages.delete(key);
                    messageCount++;
                  }
                }
              }
            }
            console.log(`[MEMORY-MANAGER] Removed ${messageCount} cached messages`);
          }
          
          return true;
        };
      }
      
      try {
        // Run cleanup at warning threshold (default 70%)
        if (heapUsagePercent > 70) {
          console.log('🧹 Running standard memory cleanup...');
          global.memoryManager.runCleanup();
        }
        
        // Run emergency cleanup at critical threshold (default 85%)
        if (heapUsagePercent > 85) {
          console.log('🚨 Memory usage critical! Running emergency cleanup...');
          global.memoryManager.runEmergencyCleanup();
          
          // Don't attempt to use global.gc directly here anymore
          // It's handled in runEmergencyCleanup with proper checks
        }
      } catch (cleanupErr) {
        console.error('❌ Error during memory cleanup:', cleanupErr.message);
      }
    } catch (err) {
      console.error('❌ Error in memory monitoring:', err.message);
    }
  }, MEMORY_CHECK_INTERVAL);
}

// Status page
app.get('/', (req, res) => {
  const uptime = process.uptime();
  const hours = Math.floor(uptime / 3600);
  const minutes = Math.floor((uptime % 3600) / 60);
  const seconds = Math.floor(uptime % 60);
  
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>BLACKSKY-MD Premium Status</title>
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
        <h1>BLACKSKY-MD Premium</h1>
        <div class="status">
          <p>Status: <span class="online">ONLINE</span></p>
          <p>Uptime: ${hours}h ${minutes}m ${seconds}s</p>
          <p>Environment: ${process.env.NODE_ENV || 'development'}</p>
          <p>Last Updated: ${new Date().toLocaleString()}</p>
        </div>
        <footer>
          BLACKSKY-MD Premium © 2025
        </footer>
      </div>
    </body>
    </html>
  `);
});

// Function to find an available port and start the server
function startServerWithAvailablePort(initialPort, maxRetries = 10) {
  let currentPort = initialPort;
  let retryCount = 0;
  
  // Try to start the server with current port
  function attemptToStartServer() {
    console.log(`Attempting to start server on port ${currentPort}...`);
    
    const server = app.listen(currentPort, '0.0.0.0', () => {
      console.log(`⚡ Server running on port ${currentPort}`);
      
      // Initialize performance optimization system
      console.log('🚀 Initializing performance optimization system...');
      initOptimizer();
      
      // Start bot after server is confirmed running
      setTimeout(() => {
        try {
          // Start the bot
          require('./index.js');
          console.log('✅ Bot started successfully');
          
          // Apply enhanced connection keeper once the bot has started and connection is established
          const applyEnhancedConnectionKeeper = () => {
            try {
              if (global.enhancedConnectionKeeper) {
                console.log('🛡️ Applying enhanced connection keeper to fix "connection appears to be closed" errors...');
                
                if (typeof global.enhancedConnectionKeeper.safeInitialize === 'function') {
                  // Use the safe initialize function with our enhanced config
                  global.enhancedConnectionKeeper.safeInitialize(
                    global.conn, 
                    global.enhancedKeeperConfig || {
                      applyPatches: true,
                      verbose: true
                    }
                  );
                  console.log('✅ Enhanced connection keeper safely initialized with optimal config');
                } else if (global.conn) {
                  // Fall back to direct initialization if safeInitialize isn't available
                  // Initialize the enhanced connection keeper
                  global.enhancedConnectionKeeper.initializeConnectionKeeper(global.conn);
                  
                  // Apply the connection patch for improved error handling
                  global.enhancedConnectionKeeper.applyConnectionPatch(global.conn);
                } else {
                  console.log('⚠️ Connection not established yet, will retry later');
                  return false;
                }
                
                // Set up a connection watcher for persistent connectivity protection
                const connectionWatcher = setInterval(() => {
                  try {
                    if (global.conn && !global.conn.isOnline) {
                      console.log('📡 Connection watcher detected offline state, triggering reconnection...');
                      global.enhancedConnectionKeeper.forceReconnect(global.conn);
                    }
                    
                    // Monitor connection memory usage
                    if (global.conn && global.memoryManager) {
                      const memoryInfo = global.memoryManager.getMemoryUsage();
                      
                      // If memory is critical, clean up WhatsApp-specific memory hogs
                      if (memoryInfo.percentages.heapUsage > 85) {
                        console.log('🚨 Critical memory usage detected in connection watcher!');
                        
                        try {
                          // Clear message history in chats
                          if (global.conn.chats) {
                            const chatCount = Object.keys(global.conn.chats).length;
                            console.log(`🧹 Clearing excessive message history from ${chatCount} chats...`);
                            
                            for (const chatId in global.conn.chats) {
                              const chat = global.conn.chats[chatId];
                              if (chat && chat.messages) {
                                // Keep only the latest 20 messages per chat
                                const keys = [...chat.messages.keys()];
                                if (keys.length > 20) {
                                  const keysToRemove = keys.slice(0, keys.length - 20);
                                  for (const key of keysToRemove) {
                                    chat.messages.delete(key);
                                  }
                                }
                              }
                            }
                          }
                          
                          // Force garbage collection
                          if (global.gc) {
                            global.gc();
                          }
                        } catch (cleanupErr) {
                          console.error('⚠️ Error during WhatsApp memory cleanup:', cleanupErr.message);
                        }
                      }
                    }
                  } catch (watcherErr) {
                    console.error('⚠️ Error in connection watcher:', watcherErr.message);
                  }
                }, 60000); // Check every minute
                
                console.log('✅ Enhanced connection keeper and persistent watcher applied successfully');
                return true;
              } else {
                console.log('⚠️ Enhanced connection keeper not available or bot connection not established');
                return false;
              }
            } catch (err) {
              console.error('❌ Error applying enhanced connection keeper:', err.message);
              return false;
            }
          };
          
          // Try immediately
          const initialSuccess = applyEnhancedConnectionKeeper();
          
          // If not successful, retry after a delay
          if (!initialSuccess) {
            setTimeout(() => {
              console.log('🔄 Retrying enhanced connection keeper application...');
              if (!applyEnhancedConnectionKeeper()) {
                // If still not successful, set up a periodic retry
                const retryInterval = setInterval(() => {
                  console.log('🔄 Periodic retry of enhanced connection keeper...');
                  if (applyEnhancedConnectionKeeper()) {
                    clearInterval(retryInterval);
                  }
                }, 30000); // Try every 30 seconds
              }
            }, 5000); // Wait 5 seconds before first retry
          }
        } catch (err) {
          console.error('❌ Error starting bot:', err);
          // Attempt to restart after delay
          console.log('🔄 Will attempt to restart in 10 seconds...');
          setTimeout(() => {
            try {
              require('./index.js');
              console.log('✅ Bot restarted successfully');
              
              // Also apply enhanced connection keeper after restart
              console.log('🛡️ Applying enhanced connection keeper after restart...');
              const applyEnhancedConnectionKeeper = () => {
                try {
                  if (global.enhancedConnectionKeeper) {
                    console.log('🛡️ Applying enhanced connection keeper to fix "connection appears to be closed" errors...');
                    
                    if (typeof global.enhancedConnectionKeeper.safeInitialize === 'function') {
                      // Use the safe initialize function with our enhanced config
                      global.enhancedConnectionKeeper.safeInitialize(
                        global.conn, 
                        global.enhancedKeeperConfig || {
                          applyPatches: true,
                          verbose: true
                        }
                      );
                      console.log('✅ Enhanced connection keeper safely initialized after restart with optimal config');
                    } else if (global.conn) {
                      // Fall back to direct initialization if safeInitialize isn't available
                      // Initialize the enhanced connection keeper
                      global.enhancedConnectionKeeper.initializeConnectionKeeper(global.conn);
                      
                      // Apply the connection patch for improved error handling
                      global.enhancedConnectionKeeper.applyConnectionPatch(global.conn);
                    } else {
                      console.log('⚠️ Connection not established yet after restart, will retry later');
                      return false;
                    }
                    
                    // Set up a connection watcher for persistent connectivity protection
                    const connectionWatcher = setInterval(() => {
                      try {
                        if (global.conn && !global.conn.isOnline) {
                          console.log('📡 Connection watcher detected offline state, triggering reconnection...');
                          global.enhancedConnectionKeeper.forceReconnect(global.conn);
                        }
                        
                        // Monitor connection memory usage
                        if (global.conn && global.memoryManager) {
                          const memoryInfo = global.memoryManager.getMemoryUsage();
                          
                          // If memory is critical, clean up WhatsApp-specific memory hogs
                          if (memoryInfo.percentages.heapUsage > 85) {
                            console.log('🚨 Critical memory usage detected in connection watcher!');
                            
                            try {
                              // Clear message history in chats
                              if (global.conn.chats) {
                                const chatCount = Object.keys(global.conn.chats).length;
                                console.log(`🧹 Clearing excessive message history from ${chatCount} chats...`);
                                
                                for (const chatId in global.conn.chats) {
                                  const chat = global.conn.chats[chatId];
                                  if (chat && chat.messages) {
                                    // Keep only the latest 20 messages per chat
                                    const keys = [...chat.messages.keys()];
                                    if (keys.length > 20) {
                                      const keysToRemove = keys.slice(0, keys.length - 20);
                                      for (const key of keysToRemove) {
                                        chat.messages.delete(key);
                                      }
                                    }
                                  }
                                }
                              }
                              
                              // Force garbage collection
                              if (global.gc) {
                                global.gc();
                              }
                            } catch (cleanupErr) {
                              console.error('⚠️ Error during WhatsApp memory cleanup:', cleanupErr.message);
                            }
                          }
                        }
                      } catch (watcherErr) {
                        console.error('⚠️ Error in connection watcher:', watcherErr.message);
                      }
                    }, 60000); // Check every minute
                    
                    console.log('✅ Enhanced connection keeper and persistent watcher applied successfully after restart');
                    return true;
                  } else {
                    console.log('⚠️ Enhanced connection keeper not available or bot connection not established after restart');
                    return false;
                  }
                } catch (err) {
                  console.error('❌ Error applying enhanced connection keeper after restart:', err.message);
                  return false;
                }
              };
              
              // Try immediately
              applyEnhancedConnectionKeeper();
              
              // Also try after a delay in case connection isn't fully established yet
              setTimeout(applyEnhancedConnectionKeeper, 5000);
            } catch (restartErr) {
              console.error('❌ Error restarting bot:', restartErr);
              process.exit(1); // Exit with error code
            }
          }, 10000);
        }
      }, 1000);
    });
    
    // Handle errors when starting the server
    server.on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        console.log(`Port ${currentPort} is already in use.`);
        server.close();
        
        // Try another port if we haven't exceeded max retries
        if (retryCount < maxRetries) {
          retryCount++;
          // Use a random port in a higher range to avoid conflicts
          currentPort = Math.floor(Math.random() * 10000) + 10000;
          console.log(`Trying port ${currentPort} instead (attempt ${retryCount}/${maxRetries})...`);
          attemptToStartServer();
        } else {
          // As a last resort, try with port 0 (random port assigned by OS)
          console.log('Maximum retry attempts reached. Trying with a system-assigned port...');
          currentPort = 0;
          attemptToStartServer();
        }
      } else {
        // Handle other server errors
        console.error('Failed to start server:', err);
        process.exit(1);
      }
    });
  }
  
  // Start the first attempt
  attemptToStartServer();
}

// Start the server with the initial port
startServerWithAvailablePort(port);

// Session backup and restore functions
async function restoreSessionFromDatabase() {
  // Check if database is enabled and available
  if (!global.DATABASE_ENABLED || !pool) {
    console.log('⚠️ Database features disabled, creating mock pool for testing');
    
    // Create a mock pool for testing environments
    try {
      global.pool = {
        query: async () => ({ rows: [] }),
        connect: async () => ({
          query: async () => ({ rows: [] }),
          release: () => {}
        }),
        on: (event, callback) => {}
      };
      console.log('✅ Created mock database pool for testing');
      global.DATABASE_ENABLED = true;
    } catch (err) {
      console.error('❌ Error creating mock pool:', err);
      return false;
    }
  }

  try {
    const sessionDir = path.join(process.cwd(), 'sessions');
    
    // Create sessions directory if it doesn't exist
    if (!fs.existsSync(sessionDir)) {
      console.log('📁 Creating sessions directory...');
      fs.mkdirSync(sessionDir, { recursive: true });
    }
    
    // Query latest sessions from database
    try {
      const result = await pool.query('SELECT session_id, session_data FROM whatsapp_sessions ORDER BY updated_at DESC');
      
      if (result.rows.length === 0) {
        console.log('⚠️ No sessions found in database');
        return false;
      }
      
      console.log(`🔄 Found ${result.rows.length} sessions in database to restore`);
      
      // Save each session to file
      let successCount = 0;
      for (const row of result.rows) {
        try {
          const { session_id, session_data } = row;
          const filePath = path.join(sessionDir, `${session_id}.json`);
          
          fs.writeFileSync(filePath, JSON.stringify(session_data, null, 2));
          successCount++;
        } catch (err) {
          console.error(`❌ Error restoring session ${row.session_id}:`, err);
        }
      }
      
      console.log(`✅ Successfully restored ${successCount}/${result.rows.length} sessions from database`);
      return successCount > 0;
    } catch (dbErr) {
      console.error('❌ Database error during session restore:', dbErr.message);
      console.log('⚠️ Disabling database features due to error');
      global.DATABASE_ENABLED = false;
      return false;
    }
  } catch (err) {
    console.error('❌ Error in restoreSessionFromDatabase:', err);
    return false;
  }
}

// Restore sessions on startup only if database is enabled
if (global.DATABASE_ENABLED) {
  console.log('🔄 Attempting to restore sessions from database...');
  restoreSessionFromDatabase().then(success => {
    if (success) {
      console.log('✅ Sessions restored successfully');
    } else {
      console.log('⚠️ No sessions restored from database');
    }
  });
} else {
  console.log('⚠️ Database features disabled, skipping session restore');
}

// Set up periodic session backup only if database is enabled
if (global.DATABASE_ENABLED) {
  const BACKUP_INTERVAL_MS = 5 * 60 * 1000; // 5 minutes
  setInterval(async () => {
    // Check if database is still enabled before attempting backup
    if (global.DATABASE_ENABLED) {
      console.log('⏰ Running scheduled session backup...');
      await backupSessionToDatabase();
    }
  }, BACKUP_INTERVAL_MS);

  // Also back up on memory pressure
  let lastBackupTime = Date.now();
  const MIN_BACKUP_INTERVAL_MS = 60 * 1000; // 1 minute minimum between backups
  process.on('memoryUsageHigh', async () => {
    // Check if database is still enabled before attempting backup
    if (global.DATABASE_ENABLED) {
      const now = Date.now();
      if (now - lastBackupTime > MIN_BACKUP_INTERVAL_MS) {
        console.log('⚠️ Memory pressure detected, backing up sessions...');
        await backupSessionToDatabase();
        lastBackupTime = now;
      }
    }
  });
}

async function backupSessionToDatabase() {
  // Skip if database features are disabled
  if (!global.DATABASE_ENABLED || !pool) {
    console.log('⚠️ Database features disabled, skipping session backup');
    return false;
  }

  try {
    if (!global.conn || !global.conn.authState) {
      console.log('🚫 No active connection to backup');
      return false;
    }

    const sessionDir = path.join(process.cwd(), 'sessions');
    if (!fs.existsSync(sessionDir)) {
      console.log('🚫 Sessions directory not found');
      return false;
    }

    // Get list of session files
    const files = fs.readdirSync(sessionDir).filter(f => f.endsWith('.json'));
    
    if (files.length === 0) {
      console.log('⚠️ No session files found to backup');
      return false;
    }

    console.log(`🔄 Found ${files.length} session files to backup`);
    
    // Loop through each file and upload to database
    let successCount = 0;
    for (const file of files) {
      try {
        const sessionId = file.replace('.json', '');
        const filePath = path.join(sessionDir, file);
        const fileContent = fs.readFileSync(filePath, 'utf8');
        const sessionData = JSON.parse(fileContent);
        
        // Insert or update in database
        try {
          await pool.query(
            `INSERT INTO whatsapp_sessions (session_id, session_data, updated_at) 
             VALUES ($1, $2, NOW()) 
             ON CONFLICT (session_id) 
             DO UPDATE SET session_data = $2, updated_at = NOW()`,
            [sessionId, sessionData]
          );
          successCount++;
        } catch (dbErr) {
          console.error(`❌ Database error backing up session ${sessionId}:`, dbErr.message);
          
          // If we're getting persistent database errors, disable database features
          if (successCount === 0 && files.indexOf(file) > 3) {
            console.log('⚠️ Multiple database errors detected, disabling database features');
            global.DATABASE_ENABLED = false;
            return false;
          }
        }
      } catch (err) {
        console.error(`❌ Error reading session file ${file}:`, err.message);
      }
    }
    
    console.log(`✅ Successfully backed up ${successCount}/${files.length} session files to database`);
    return successCount > 0;
  } catch (err) {
    console.error('❌ Error in backupSessionToDatabase:', err);
    return false;
  }
}

// Perform graceful shutdown, saving data and closing connections
async function performGracefulShutdown() {
  console.log('🛑 Shutting down gracefully...');

  try {
    // Run memory cleanup first to free resources
    if (global.memoryManager) {
      console.log('🧹 Running memory cleanup before shutdown...');
      try {
        global.memoryManager.runEmergencyCleanup();
        console.log('✅ Memory cleanup completed');
      } catch (memErr) {
        console.error('❌ Error during memory cleanup:', memErr.message);
      }
    }
    
    // Save sessions to database if database features are enabled
    if (global.DATABASE_ENABLED && pool) {
      console.log('💾 Backing up sessions to PostgreSQL...');
      await backupSessionToDatabase();
      
      // Close database pool
      console.log('🔌 Closing database connection...');
      await pool.end();
    } else {
      console.log('⚠️ Database features disabled, skipping database backup');
      
      // Backup to local files instead
      try {
        // Make sure sessions directory exists
        const sessionDir = path.join(process.cwd(), 'sessions');
        if (!fs.existsSync(sessionDir)) {
          fs.mkdirSync(sessionDir, { recursive: true });
        }
        
        // Save current auth state if available
        if (global.conn && global.conn.authState) {
          console.log('💾 Saving auth state to local files...');
          if (typeof global.conn.authState.saveState === 'function') {
            await global.conn.authState.saveState();
            console.log('✅ Auth state saved successfully');
          }
        }
      } catch (backupErr) {
        console.error('❌ Error backing up session files:', backupErr.message);
      }
    }
    
    // Clear any connection intervals
    if (global.connectionCheckInterval) {
      clearInterval(global.connectionCheckInterval);
      console.log('🔄 Cleared connection check interval');
    }
    if (global.connectionKeeperInterval) {
      clearInterval(global.connectionKeeperInterval);
      console.log('🔄 Cleared connection keeper interval');
    }
    
    console.log('👋 Shutdown complete. Goodbye!');
  } catch (err) {
    console.error('❌ Error during graceful shutdown:', err);
  }
}

// Handle shutdown signals
process.on('SIGTERM', async () => {
  console.log('🛑 Received SIGTERM signal. Heroku is cycling dynos.');
  await performGracefulShutdown();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('🛑 Received SIGINT signal. Shutting down gracefully...');
  await performGracefulShutdown();
  process.exit(0);
});

// Handle uncaught exceptions
process.on('uncaughtException', async (err) => {
  console.error('❌ Uncaught exception:', err);
  await performGracefulShutdown();
  process.exit(1);
});

// Handle unhandled rejections
process.on('unhandledRejection', async (reason, promise) => {
  console.error('❌ Unhandled rejection at:', promise, 'reason:', reason);
  // Don't exit for unhandled rejections as they may not be fatal
});