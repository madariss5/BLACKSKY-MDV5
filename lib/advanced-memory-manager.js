/**
 * Advanced Memory Manager
 * 
 * This module provides comprehensive memory management capabilities including:
 * - Automated memory usage tracking and reporting
 * - Smart caching system with time-based and usage-based expiration
 * - Memory leak detection using heap snapshots
 * - Automatic garbage collection triggering
 * - Memory usage optimization strategies
 */

const { performance } = require('perf_hooks');
const os = require('os');
const fs = require('fs');
const path = require('path');
const chalk = require('chalk');

// Configuration
const DEFAULT_CONFIG = {
  memoryThresholdWarning: 80, // Memory usage percentage for warning
  memoryThresholdCritical: 90, // Memory usage percentage for critical warning
  cleanupInterval: 5 * 60 * 1000, // Cleanup every 5 minutes
  snapshotInterval: 30 * 60 * 1000, // Memory snapshot every 30 minutes
  cacheDefaultTTL: 5 * 60 * 1000, // Default cache TTL: 5 minutes
  maxCacheItems: 1000, // Maximum items in each cache
  logMemoryUsage: false, // Whether to log memory usage regularly
  logInterval: 15 * 60 * 1000, // Log memory usage every 15 minutes
};

/**
 * Initialize the advanced memory manager
 * @param {Object} customConfig - Custom configuration options
 * @returns {Object} Memory manager object with utility functions
 */
function initMemoryManager(customConfig = {}) {
  // Merge custom config with defaults
  const config = { ...DEFAULT_CONFIG, ...customConfig };
  
  // Store start time for uptime calculation
  const startTime = performance.now();
  
  // Create cache storage
  const caches = new Map();
  
  // Memory snapshots for leak detection
  const memorySnapshots = [];
  
  // Initialize timers container
  let intervals = {
    cleanup: null,
    snapshot: null,
    memoryLog: null,
  };
  
  // Memory manager state
  const state = {
    totalCleanups: 0,
    lastCleanupTime: 0,
    lastSnapshotTime: 0,
    totalCacheHits: 0,
    totalCacheMisses: 0,
    criticalMemoryEvents: 0,
    isCleaningUp: false,
  };
  
  /**
   * Create a new cache with custom options
   * @param {string} cacheName - Name of the cache
   * @param {Object} cacheOptions - Cache configuration options
   * @returns {Object} Cache operations object
   */
  function createCache(cacheName, cacheOptions = {}) {
    if (caches.has(cacheName)) {
      return caches.get(cacheName);
    }
    
    // Merge with default options
    const options = {
      ttl: config.cacheDefaultTTL,
      maxItems: config.maxCacheItems,
      cleanupOnFull: true,
      ...cacheOptions,
    };
    
    // Cache store
    const store = new Map();
    
    // Cache metadata
    const meta = {
      hits: 0,
      misses: 0,
      evictions: 0,
      created: Date.now(),
      lastCleanup: 0,
    };
    
    // Cache operations
    const cacheOps = {
      /**
       * Get a value from the cache
       * @param {string} key - Cache key
       * @param {Function} fallbackFn - Optional function to call if key not found
       * @returns {*} Cached value or fallback result
       */
      get: async (key, fallbackFn = null) => {
        // Check if key exists and is not expired
        if (store.has(key)) {
          const item = store.get(key);
          
          // Check expiration
          if (item.expires > Date.now()) {
            // Update access time and hit count
            item.lastAccessed = Date.now();
            item.hits++;
            meta.hits++;
            state.totalCacheHits++;
            return item.value;
          }
          
          // If expired, delete it
          store.delete(key);
        }
        
        // Record cache miss
        meta.misses++;
        state.totalCacheMisses++;
        
        // If fallback function provided, execute it and cache result
        if (typeof fallbackFn === 'function') {
          try {
            const result = await fallbackFn();
            cacheOps.set(key, result);
            return result;
          } catch (error) {
            console.error(`[MEMORY-MANAGER] Cache fallback error for ${cacheName}:${key}:`, error);
            throw error;
          }
        }
        
        return undefined;
      },
      
      /**
       * Set a value in the cache
       * @param {string} key - Cache key
       * @param {*} value - Value to cache
       * @param {number} customTTL - Custom TTL in milliseconds
       * @returns {boolean} Success status
       */
      set: (key, value, customTTL = null) => {
        // If cache is full, clean up if enabled
        if (store.size >= options.maxItems && options.cleanupOnFull) {
          cacheOps.cleanup(Math.ceil(options.maxItems * 0.2)); // Clean 20% of items
        }
        
        // If still full after cleanup, evict oldest item
        if (store.size >= options.maxItems) {
          let oldestKey = null;
          let oldestAccess = Infinity;
          
          for (const [itemKey, item] of store.entries()) {
            if (item.lastAccessed < oldestAccess) {
              oldestAccess = item.lastAccessed;
              oldestKey = itemKey;
            }
          }
          
          if (oldestKey) {
            store.delete(oldestKey);
            meta.evictions++;
          }
        }
        
        // Calculate expiration time
        const ttl = customTTL || options.ttl;
        const expires = Date.now() + ttl;
        
        // Store the item
        store.set(key, {
          value,
          expires,
          created: Date.now(),
          lastAccessed: Date.now(),
          hits: 0,
        });
        
        return true;
      },
      
      /**
       * Delete a value from the cache
       * @param {string} key - Cache key
       * @returns {boolean} Whether item was deleted
       */
      delete: (key) => {
        return store.delete(key);
      },
      
      /**
       * Clear all items from the cache
       */
      clear: () => {
        const itemCount = store.size;
        store.clear();
        meta.lastCleanup = Date.now();
        return itemCount;
      },
      
      /**
       * Cleanup expired or least used items
       * @param {number} count - Number of items to remove
       */
      cleanup: (count = 0) => {
        // Find expired items
        const now = Date.now();
        let expiredCount = 0;
        
        for (const [key, item] of store.entries()) {
          if (item.expires <= now) {
            store.delete(key);
            expiredCount++;
          }
        }
        
        // If count specified and more items should be removed
        if (count > 0 && count > expiredCount) {
          // Get items sorted by last accessed (oldest first)
          const sortedItems = [...store.entries()]
            .sort((a, b) => a[1].lastAccessed - b[1].lastAccessed);
          
          // Remove oldest items
          const removeCount = Math.min(count - expiredCount, sortedItems.length);
          for (let i = 0; i < removeCount; i++) {
            store.delete(sortedItems[i][0]);
            meta.evictions++;
          }
        }
        
        meta.lastCleanup = now;
        return expiredCount;
      },
      
      /**
       * Get cache statistics
       */
      getStats: () => {
        return {
          size: store.size,
          maxSize: options.maxItems,
          hits: meta.hits,
          misses: meta.misses,
          hitRatio: meta.hits / (meta.hits + meta.misses || 1),
          evictions: meta.evictions,
          created: meta.created,
          lastCleanup: meta.lastCleanup,
        };
      },
    };
    
    // Save cache in the caches map
    caches.set(cacheName, cacheOps);
    
    return cacheOps;
  }
  
  /**
   * Take a memory snapshot for leak detection
   */
  function takeMemorySnapshot() {
    const snapshot = {
      timestamp: Date.now(),
      memory: process.memoryUsage(),
      cacheStats: getAllCacheStats(),
    };
    
    memorySnapshots.push(snapshot);
    
    // Keep only last 10 snapshots
    if (memorySnapshots.length > 10) {
      memorySnapshots.shift();
    }
    
    state.lastSnapshotTime = Date.now();
    
    return snapshot;
  }
  
  /**
   * Detect potential memory leaks by analyzing snapshots
   */
  function detectMemoryLeaks() {
    if (memorySnapshots.length < 3) {
      return { detected: false, message: 'Not enough snapshots for analysis' };
    }
    
    // Get the three most recent snapshots
    const recent = memorySnapshots.slice(-3);
    
    // Check for consistent growth pattern
    const heapUsed1 = recent[0].memory.heapUsed;
    const heapUsed2 = recent[1].memory.heapUsed;
    const heapUsed3 = recent[2].memory.heapUsed;
    
    // Calculate growth rates
    const growth1 = heapUsed2 - heapUsed1;
    const growth2 = heapUsed3 - heapUsed2;
    
    // If both growth rates are positive and significant
    if (growth1 > 5 * 1024 * 1024 && growth2 > 5 * 1024 * 1024) {
      // And the growth is accelerating
      if (growth2 > growth1 * 0.8) {
        return {
          detected: true,
          severity: 'high',
          growthRate: Math.round(growth2 / (1024 * 1024)) + ' MB per snapshot',
          message: 'Consistent and accelerating memory growth detected',
        };
      }
      
      return {
        detected: true,
        severity: 'medium',
        growthRate: Math.round(growth2 / (1024 * 1024)) + ' MB per snapshot',
        message: 'Consistent memory growth detected',
      };
    }
    
    return { detected: false, message: 'No memory leak pattern detected' };
  }
  
  /**
   * Get current memory usage information
   */
  function getMemoryUsage() {
    const memoryUsage = process.memoryUsage();
    const totalMemory = os.totalmem();
    const freeMemory = os.freemem();
    const usedMemory = totalMemory - freeMemory;
    
    // Convert to MB for readability
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
    
    // Calculate usage percentages
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
  }
  
  /**
   * Check if memory usage is critical and take action if needed
   */
  function checkMemoryUsage() {
    const memoryInfo = getMemoryUsage();
    const { percentages } = memoryInfo;
    
    let status = 'normal';
    
    // Check if memory usage is critical
    if (percentages.heapUsage >= config.memoryThresholdCritical) {
      console.log(chalk.red(`[MEMORY-MANAGER] CRITICAL: Memory usage at ${percentages.heapUsage}%`));
      state.criticalMemoryEvents++;
      status = 'critical';
      
      // Take emergency action to free memory
      runEmergencyCleanup();
    } 
    // Check if memory usage is high
    else if (percentages.heapUsage >= config.memoryThresholdWarning) {
      console.log(chalk.yellow(`[MEMORY-MANAGER] WARNING: Memory usage at ${percentages.heapUsage}%`));
      status = 'warning';
      
      // Run regular cleanup
      runCleanup();
    }
    
    // Try triggering garbage collection if available
    if (global.gc && percentages.heapUsage > 70) {
      try {
        global.gc();
        console.log(chalk.green('[MEMORY-MANAGER] Garbage collection triggered'));
      } catch (error) {
        console.error('[MEMORY-MANAGER] Failed to trigger garbage collection:', error);
      }
    }
    
    return { memoryInfo, status };
  }
  
  /**
   * Run a regular cleanup of caches
   */
  function runCleanup() {
    if (state.isCleaningUp) return; // Prevent concurrent cleanups
    
    state.isCleaningUp = true;
    console.log(chalk.blue('[MEMORY-MANAGER] Running regular cache cleanup'));
    
    try {
      let totalCleaned = 0;
      
      // Clean all caches
      for (const [cacheName, cache] of caches.entries()) {
        const cleanedCount = cache.cleanup();
        totalCleaned += cleanedCount;
      }
      
      state.totalCleanups++;
      state.lastCleanupTime = Date.now();
      
      console.log(chalk.green(`[MEMORY-MANAGER] Cleanup complete: ${totalCleaned} items removed`));
    } catch (error) {
      console.error('[MEMORY-MANAGER] Error during cleanup:', error);
    } finally {
      state.isCleaningUp = false;
    }
  }
  
  /**
   * Run an emergency cleanup when memory usage is critical
   */
  function runEmergencyCleanup() {
    console.log(chalk.red('[MEMORY-MANAGER] Running EMERGENCY cleanup'));
    
    try {
      // 1. Clear all caches completely
      let cacheCount = 0;
      for (const [cacheName, cache] of caches.entries()) {
        cache.clear();
        cacheCount++;
      }
      console.log(`[MEMORY-MANAGER] Cleared ${cacheCount} caches during emergency cleanup`)
      
      // 2. Force garbage collection if available
      if (global.gc) {
        try {
          global.gc();
          global.gc(); // Run twice for better collection
        } catch (e) {
          console.error('[MEMORY-MANAGER] Error forcing garbage collection:', e);
        }
      }
      
      // 3. Additional cleanup for known memory hogs
      if (global.conn && global.conn.chats) {
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
              }
            }
          }
        }
      }
      
      console.log(chalk.green('[MEMORY-MANAGER] Emergency cleanup completed'));
    } catch (error) {
      console.error('[MEMORY-MANAGER] Error during emergency cleanup:', error);
    }
  }
  
  /**
   * Get statistics for all caches
   */
  function getAllCacheStats() {
    const stats = {};
    
    for (const [cacheName, cache] of caches.entries()) {
      stats[cacheName] = cache.getStats();
    }
    
    return stats;
  }
  
  /**
   * Log current memory usage
   */
  function logMemoryUsage() {
    const memoryInfo = getMemoryUsage();
    const { formatted, percentages } = memoryInfo;
    
    console.log(chalk.cyan('┌─────────────────────────────────────┐'));
    console.log(chalk.cyan('│       Memory Usage Statistics       │'));
    console.log(chalk.cyan('├─────────────────────────────────────┤'));
    console.log(chalk.cyan(`│ Heap: ${formatted.heapUsed}MB / ${formatted.heapTotal}MB (${percentages.heapUsage}%)   │`));
    console.log(chalk.cyan(`│ RSS: ${formatted.rss}MB                       │`));
    console.log(chalk.cyan(`│ System: ${formatted.systemUsed}MB / ${formatted.systemTotal}MB (${percentages.systemUsage}%) │`));
    console.log(chalk.cyan('└─────────────────────────────────────┘'));
    
    // Log cache statistics if any exist
    const cacheStats = getAllCacheStats();
    if (Object.keys(cacheStats).length > 0) {
      console.log(chalk.cyan('┌─────────────────────────────────────┐'));
      console.log(chalk.cyan('│       Cache Usage Statistics        │'));
      console.log(chalk.cyan('├─────────────────────────────────────┤'));
      
      for (const [cacheName, stats] of Object.entries(cacheStats)) {
        const hitRatio = Math.round(stats.hitRatio * 100);
        console.log(chalk.cyan(`│ ${cacheName.padEnd(15)}: ${stats.size.toString().padStart(4)}/${stats.maxSize.toString().padStart(4)} (${hitRatio}% hits) │`));
      }
      
      console.log(chalk.cyan('└─────────────────────────────────────┘'));
    }
  }
  
  /**
   * Start the memory manager timers
   */
  function startTimers() {
    // Stop any existing timers
    stopTimers();
    
    // Create cleanup interval
    intervals.cleanup = setInterval(() => {
      runCleanup();
    }, config.cleanupInterval);
    
    // Create snapshot interval
    intervals.snapshot = setInterval(() => {
      takeMemorySnapshot();
      
      // Check for memory leaks
      const leakInfo = detectMemoryLeaks();
      if (leakInfo.detected) {
        console.log(chalk.red(`[MEMORY-MANAGER] Memory leak detected: ${leakInfo.message}`));
        console.log(chalk.red(`[MEMORY-MANAGER] Growth rate: ${leakInfo.growthRate}`));
      }
    }, config.snapshotInterval);
    
    // Create memory logging interval if enabled
    if (config.logMemoryUsage) {
      intervals.memoryLog = setInterval(() => {
        logMemoryUsage();
      }, config.logInterval);
    }
    
    console.log(chalk.green('[MEMORY-MANAGER] Memory management timers started'));
  }
  
  /**
   * Stop all memory manager timers
   */
  function stopTimers() {
    for (const [key, interval] of Object.entries(intervals)) {
      if (interval) {
        clearInterval(interval);
        intervals[key] = null;
      }
    }
  }
  
  // Initialize with an immediate memory snapshot
  takeMemorySnapshot();
  
  // Start the timers
  startTimers();
  
  // Return public API
  return {
    /**
     * Create a new managed cache
     * @param {string} name - Cache name
     * @param {Object} options - Cache options
     */
    createCache,
    
    /**
     * Get an existing cache by name
     * @param {string} name - Cache name
     */
    getCache: (name) => caches.get(name),
    
    /**
     * Get current memory usage information
     */
    getMemoryUsage,
    
    /**
     * Run a manual cleanup of all caches
     */
    runCleanup,
    
    /**
     * Run an emergency cleanup when memory is critically low
     */
    runEmergencyCleanup,
    
    /**
     * Get statistics for all caches
     */
    getAllCacheStats,
    
    /**
     * Take a manual memory snapshot
     */
    takeMemorySnapshot,
    
    /**
     * Detect potential memory leaks
     */
    detectMemoryLeaks,
    
    /**
     * Log current memory usage to console
     */
    logMemoryUsage,
    
    /**
     * Check if memory usage is critical and take action if needed
     */
    checkMemoryUsage,
    
    /**
     * Get the memory manager state
     */
    getState: () => ({
      ...state,
      uptime: Math.floor((performance.now() - startTime) / 1000),
      cacheCount: caches.size,
      snapshotCount: memorySnapshots.length,
    }),
    
    /**
     * Stop all memory manager timers
     */
    shutdown: stopTimers,
  };
}

// Create standalone functions for external use
// These proxy to the internal functions in the memory manager

/**
 * Get memory usage information (standalone function for direct use)
 */
function getMemoryUsageStandalone() {
  const memoryUsage = process.memoryUsage();
  const totalMemory = os.totalmem();
  const freeMemory = os.freemem();
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
}

// Removed duplicate getMemoryUsageStandalone function - already defined above

/**
 * Basic standalone function to run cleanup that can be exposed globally
 */
function runCleanupStandalone() {
  console.log('[MEMORY-MANAGER] Running basic cleanup...');
  let count = 0;
  
  // Clear require cache for non-essential modules
  if (require && require.cache) {
    const essentialModules = [
      'baileys', 'ws', 'express', 'http', 'events', 
      'advanced-memory-manager', 'connection', 'handler'
    ];
    
    for (const key in require.cache) {
      // Skip essential modules
      const isEssential = essentialModules.some(name => key.includes(name));
      if (!isEssential) {
        delete require.cache[key];
        count++;
      }
    }
  }
  
  console.log(`[MEMORY-MANAGER] Cleared ${count} modules from cache`);
  
  // Try to run garbage collection if available
  if (global.gc) {
    try {
      global.gc();
      console.log('[MEMORY-MANAGER] Garbage collection triggered successfully');
    } catch (err) {
      console.error('[MEMORY-MANAGER] Failed to trigger garbage collection:', err);
    }
  } else {
    console.log('[MEMORY-MANAGER] Garbage collection not available (run with --expose-gc flag)');
  }
  
  return count;
}

module.exports = {
  initMemoryManager,
  getMemoryUsage: getMemoryUsageStandalone,
  getMemoryUsageStandalone,
  runCleanup: runCleanupStandalone,
  runEmergencyCleanup: () => {
    console.log('[MEMORY-MANAGER] Running emergency cleanup');
    runCleanupStandalone();
    if (global.gc) {
      try {
        global.gc();
        global.gc(); // Run twice for better collection
      } catch (e) {
        console.error('[MEMORY-MANAGER] Failed to trigger garbage collection:', e);
      }
    } else {
      console.warn('⚠️ Garbage collection function not available (Node.js needs --expose-gc flag)');
    }
    return true;
  }
};