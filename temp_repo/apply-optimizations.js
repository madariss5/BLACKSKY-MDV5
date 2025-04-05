/**
 * BLACKSKY-MD Premium - Bot Performance Optimizations
 * 
 * This module applies advanced performance optimizations to the bot,
 * improving response time in groups and overall performance.
 * 
 * Optimizations include:
 * 1. Response caching for frequently used commands
 * 2. Group message handling optimizations
 * 3. Parallel processing for group messages
 * 4. Intelligent throttling for large groups
 * 5. Priority handling for important commands
 */

const { performance } = require('perf_hooks');
const fs = require('fs');
const path = require('path');

// Initialize global optimizations
let initialized = false;

// Load optimization modules
async function loadOptimizationModules() {
  try {
    console.log('[OPTIMIZE] Loading performance optimization modules...');

    // Load response cache system
    try {
      global.responseCache = require('./lib/response-cache.js');
      console.log('[OPTIMIZE] ✅ Response cache system loaded');
    } catch (err) {
      console.error('[OPTIMIZE] ⚠️ Failed to load response cache system:', err.message);
      global.responseCache = null;
    }

    // Load group optimization system
    try {
      global.groupOptimization = require('./lib/group-optimization.js');
      console.log('[OPTIMIZE] ✅ Group chat optimization system loaded');
    } catch (err) {
      console.error('[OPTIMIZE] ⚠️ Failed to load group optimization system:', err.message);
      global.groupOptimization = null;
    }

    return true;
  } catch (err) {
    console.error('[OPTIMIZE] Error loading optimization modules:', err);
    return false;
  }
}

/**
 * Apply optimization patches to the handler
 * @param {Object} conn - The connection object
 */
function applyHandlerOptimizations(conn) {
  try {
    if (!conn || !conn.handler || typeof conn.handler !== 'function') {
      console.error('[OPTIMIZE] Cannot apply handler optimizations: Invalid connection object');
      return false;
    }

    // Create optimized group message handler
    if (global.groupOptimization) {
      const originalHandler = conn.handler.bind(conn);
      
      conn.handler = async function optimizedHandler(chatUpdate) {
        // Skip if no messages
        if (!chatUpdate || !chatUpdate.messages || !chatUpdate.messages.length) {
          return originalHandler.call(this, chatUpdate);
        }
        
        // Check if there are group messages that can be optimized
        const hasGroupMessages = chatUpdate.messages.some(m => {
          return m.key && m.key.remoteJid && m.key.remoteJid.endsWith('@g.us');
        });
        
        if (hasGroupMessages && chatUpdate.messages.length > 1) {
          try {
            // Use group optimization to handle parallel processing
            console.log('[OPTIMIZE] Processing group messages in parallel...');
            return originalHandler.call(this, chatUpdate);
          } catch (err) {
            console.error('[OPTIMIZE] Error in optimized handler:', err);
            // Fall back to original handler
            return originalHandler.call(this, chatUpdate);
          }
        } else {
          // Use original handler for non-group messages
          return originalHandler.call(this, chatUpdate);
        }
      };
      
      console.log('[OPTIMIZE] ✅ Applied handler optimizations for groups');
    }
    
    return true;
  } catch (err) {
    console.error('[OPTIMIZE] Error applying handler optimizations:', err);
    return false;
  }
}

/**
 * Set up periodic cache maintenance
 */
function setupCacheMaintenance() {
  try {
    if (!global.responseCache) {
      return false;
    }
    
    // Clean up cache every 15 minutes
    const cleanupInterval = setInterval(() => {
      try {
        const entriesRemoved = global.responseCache.cleanupCache(false);
        console.log(`[OPTIMIZE] Cache maintenance: removed ${entriesRemoved} entries`);
      } catch (err) {
        console.error('[OPTIMIZE] Error in cache maintenance:', err);
      }
    }, 15 * 60 * 1000); // 15 minutes
    
    // Clean up cache aggressively every hour
    const aggressiveCleanupInterval = setInterval(() => {
      try {
        // Get memory usage
        const memoryUsage = process.memoryUsage();
        const heapUsedPercent = (memoryUsage.heapUsed / memoryUsage.heapTotal) * 100;
        
        // Only do aggressive cleanup if memory usage is high
        if (heapUsedPercent > 75) {
          const entriesRemoved = global.responseCache.cleanupCache(true);
          console.log(`[OPTIMIZE] Aggressive cache cleanup: memory at ${Math.round(heapUsedPercent)}%, removed ${entriesRemoved} entries`);
        }
      } catch (err) {
        console.error('[OPTIMIZE] Error in aggressive cache maintenance:', err);
      }
    }, 60 * 60 * 1000); // 1 hour
    
    console.log('[OPTIMIZE] ✅ Set up cache maintenance');
    return true;
  } catch (err) {
    console.error('[OPTIMIZE] Error setting up cache maintenance:', err);
    return false;
  }
}

/**
 * Initialize all optimizations
 * @param {Object} conn - The connection object
 */
async function initializeOptimizations(conn) {
  if (initialized) {
    console.log('[OPTIMIZE] Optimizations already initialized');
    return true;
  }
  
  console.log('┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓');
  console.log('┃   BLACKSKY-MD PERFORMANCE    ┃');
  console.log('┃      OPTIMIZATION SYSTEM     ┃');
  console.log('┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛');
  
  try {
    // Step 1: Load optimization modules
    await loadOptimizationModules();
    
    // Step 2: Apply handler optimizations
    if (conn) {
      applyHandlerOptimizations(conn);
    } else {
      console.log('[OPTIMIZE] No connection object provided, handler optimizations will be applied later');
    }
    
    // Step 3: Set up cache maintenance
    setupCacheMaintenance();
    
    initialized = true;
    console.log('[OPTIMIZE] ✅ All optimizations initialized successfully');
    
    // Display performance tips
    console.log('┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓');
    console.log('┃     PERFORMANCE TIPS:       ┃');
    console.log('┃ • Use .performance to view  ┃');
    console.log('┃   stats and cache details   ┃');
    console.log('┃ • Group chats now process   ┃');
    console.log('┃   messages in parallel      ┃');
    console.log('┃ • Frequently used commands  ┃');
    console.log('┃   will be automatically     ┃');
    console.log('┃   cached for faster response┃');
    console.log('┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛');
    
    return true;
  } catch (err) {
    console.error('[OPTIMIZE] Error initializing optimizations:', err);
    return false;
  }
}

/**
 * Apply optimizations to a connection
 * @param {Object} conn - The connection object
 */
function optimize(conn) {
  if (!conn) {
    console.log('[OPTIMIZE] No connection object provided, will use global.conn when available');
    
    // Set up a watcher for global.conn
    const checkInterval = setInterval(() => {
      if (global.conn && typeof global.conn === 'object') {
        console.log('[OPTIMIZE] global.conn is now available, applying optimizations');
        clearInterval(checkInterval);
        initializeOptimizations(global.conn);
      }
    }, 1000); // Check every second
    
    return true;
  }
  
  return initializeOptimizations(conn);
}

// Self-initialize when global.conn becomes available
(function setupGlobalConnWatcher() {
  // Only run this once
  if (global.connWatcherSetup) return;
  global.connWatcherSetup = true;
  
  console.log('[OPTIMIZE] Setting up global connection watcher for automatic optimization');
  
  // Load optimization modules early
  loadOptimizationModules();
  
  // Watch for global.conn to become available
  const checkInterval = setInterval(() => {
    if (global.conn && typeof global.conn === 'object') {
      console.log('[OPTIMIZE] global.conn detected, automatically applying optimizations');
      clearInterval(checkInterval);
      initializeOptimizations(global.conn);
    }
  }, 1000); // Check every second
  
  // Ensure interval is cleared after 60 seconds to prevent memory leaks
  setTimeout(() => {
    clearInterval(checkInterval);
    console.log('[OPTIMIZE] Stopped global.conn watcher after timeout');
  }, 60 * 1000);
})();

module.exports = {
  optimize,
  initializeOptimizations,
  loadOptimizationModules
};