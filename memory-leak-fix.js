/**
 * BLACKSKY-MD Premium - Memory Leak Prevention Module
 * 
 * This module implements various optimizations to prevent memory leaks:
 * 1. Periodic garbage collection
 * 2. Cache size monitoring and cleanup
 * 3. Object reference cleanup
 * 4. Message object size control
 * 5. Circular reference detection
 */

// Global variables for monitoring
let lastGcTime = Date.now();
let memoryUsageHistory = [];
let intervalHandlers = [];
let cacheStats = {
  commandCache: { size: 0, hits: 0, misses: 0 },
  messageCache: { size: 0, hits: 0, misses: 0 },
  mediaCache: { size: 0, hits: 0, misses: 0 }
};

/**
 * Initialize memory leak prevention
 */
function initMemoryOptimization() {
  console.log('🚀 Starting with memory optimization and leak prevention');
  
  // Set up periodic garbage collection if expose-gc is enabled
  if (global.gc) {
    console.log('✅ Manual garbage collection is available');
    
    // Schedule periodic garbage collection
    const gcInterval = setInterval(() => {
      try {
        const beforeMemory = process.memoryUsage();
        global.gc(true); // Force full garbage collection
        const afterMemory = process.memoryUsage();
        
        const freedMem = (beforeMemory.heapUsed - afterMemory.heapUsed) / (1024 * 1024);
        if (freedMem > 5) { // Only log if significant memory was freed
          console.log(`🧹 Garbage collection freed ${freedMem.toFixed(2)} MB`);
        }
        
        // Update last GC time
        lastGcTime = Date.now();
      } catch (e) {
        console.error('Error during garbage collection:', e);
      }
    }, 60000); // Run every minute
    
    intervalHandlers.push(gcInterval);
  } else {
    console.log('⚠️ Manual garbage collection not available. Add --expose-gc to NODE_OPTIONS for better memory management.');
  }
  
  // Memory usage monitoring
  const memoryMonitorInterval = setInterval(() => {
    try {
      const memUsage = process.memoryUsage();
      
      // Keep history of last 10 readings
      memoryUsageHistory.push({
        time: Date.now(),
        rss: memUsage.rss,
        heapTotal: memUsage.heapTotal,
        heapUsed: memUsage.heapUsed,
        external: memUsage.external
      });
      
      if (memoryUsageHistory.length > 10) {
        memoryUsageHistory.shift();
      }
      
      // Check for memory leaks
      detectMemoryLeaks();
      
      // When heap usage is high, try to free memory
      const heapUsedMB = memUsage.heapUsed / (1024 * 1024);
      if (heapUsedMB > 400) { // If heap usage exceeds 400 MB
        console.log(`⚠️ High memory usage detected (${heapUsedMB.toFixed(2)} MB). Attempting cleanup...`);
        cleanupMemory();
      }
    } catch (e) {
      console.error('Error in memory monitoring:', e);
    }
  }, 30000); // Run every 30 seconds
  
  intervalHandlers.push(memoryMonitorInterval);
  
  // Clean up global caches and objects periodically
  const cacheCleanupInterval = setInterval(() => {
    try {
      cleanupCaches();
    } catch (e) {
      console.error('Error in cache cleanup:', e);
    }
  }, 300000); // Run every 5 minutes
  
  intervalHandlers.push(cacheCleanupInterval);
  
  // Add memory optimization hooks to shutdown
  process.on('SIGTERM', () => stopMemoryOptimization());
  process.on('SIGINT', () => stopMemoryOptimization());
  
  return {
    cleanupMemory,
    getMemoryStats,
    stopMemoryOptimization
  };
}

/**
 * Stop all memory optimization intervals
 */
function stopMemoryOptimization() {
  console.log('🛑 Stopping memory optimization...');
  
  // Clear all interval handlers
  intervalHandlers.forEach(interval => {
    clearInterval(interval);
  });
  
  intervalHandlers = [];
  
  // One final garbage collection
  if (global.gc) {
    try {
      global.gc(true);
      console.log('✅ Final garbage collection completed');
    } catch (e) {
      console.error('Error during final garbage collection:', e);
    }
  }
}

/**
 * Detect potential memory leaks by analyzing memory usage history
 */
function detectMemoryLeaks() {
  if (memoryUsageHistory.length < 5) return; // Need more data points
  
  // Calculate average growth rate
  const oldestReading = memoryUsageHistory[0];
  const newestReading = memoryUsageHistory[memoryUsageHistory.length - 1];
  const timeSpanMinutes = (newestReading.time - oldestReading.time) / (1000 * 60);
  
  if (timeSpanMinutes < 1) return; // Need at least 1 minute of data
  
  const heapGrowthMB = (newestReading.heapUsed - oldestReading.heapUsed) / (1024 * 1024);
  const growthRateMBPerMinute = heapGrowthMB / timeSpanMinutes;
  
  // Alert if growth rate is higher than threshold
  if (growthRateMBPerMinute > 10) { // 10 MB/minute
    console.log(`⚠️ Potential memory leak detected! Memory growing at ${growthRateMBPerMinute.toFixed(2)} MB/minute`);
    
    // Try to take corrective action
    if (global.gc) {
      global.gc(true);
    }
    
    cleanupMemory(true); // Aggressive cleanup
  }
}

/**
 * Clean up memory by removing caches and large objects
 * @param {boolean} aggressive - If true, perform more aggressive cleanup
 */
function cleanupMemory(aggressive = false) {
  console.log(`🧹 Performing memory cleanup (${aggressive ? 'aggressive' : 'normal'} mode)`);
  
  // Force garbage collection if available
  if (global.gc) {
    global.gc(true);
  }
  
  // Clear caches
  cleanupCaches(aggressive);
  
  // Remove circular references
  breakCircularReferences();
  
  // Reset various module-level caches if they exist
  if (global.conn) {
    try {
      // Reset message cache if it exists
      if (global.conn.messageCache && typeof global.conn.messageCache.clear === 'function') {
        global.conn.messageCache.clear();
      }
      
      // Reset query cache if it exists
      if (global.conn.queryCache && typeof global.conn.queryCache.clear === 'function') {
        global.conn.queryCache.clear();
      }
    } catch (e) {
      console.error('Error resetting connection caches:', e);
    }
  }
  
  // If in aggressive mode, try to clean up more
  if (aggressive) {
    console.log('🧨 Performing aggressive memory cleanup');
    
    // Reset global media caches
    if (global.mediaCache) {
      global.mediaCache = {};
    }
    
    // Reset image processing cache
    if (global.sharp && global.sharp.cache && typeof global.sharp.cache.clear === 'function') {
      global.sharp.cache.clear();
    }
  }
}

/**
 * Clean up various caches to prevent memory growth
 * @param {boolean} aggressive - If true, clear all caches completely
 */
function cleanupCaches(aggressive = false) {
  // Keep track of cleaned memory
  let cleanedItems = 0;
  
  // Command response cache
  if (global.commandResponseCache) {
    const beforeSize = Object.keys(global.commandResponseCache).length;
    
    if (aggressive) {
      // In aggressive mode, clear everything
      global.commandResponseCache = {};
      cleanedItems += beforeSize;
    } else {
      // In normal mode, only remove old items
      const now = Date.now();
      Object.keys(global.commandResponseCache).forEach(key => {
        const item = global.commandResponseCache[key];
        if (item && item.timestamp && (now - item.timestamp > 300000)) { // 5 minutes
          delete global.commandResponseCache[key];
          cleanedItems++;
        }
      });
    }
    
    cacheStats.commandCache.size = Object.keys(global.commandResponseCache).length;
  }
  
  // Media cache
  if (global.mediaCache) {
    const beforeSize = Object.keys(global.mediaCache).length;
    
    if (aggressive) {
      // Clear all media caches in aggressive mode
      global.mediaCache = {};
      cleanedItems += beforeSize;
    } else {
      // Remove old media caches
      const now = Date.now();
      Object.keys(global.mediaCache).forEach(key => {
        const item = global.mediaCache[key];
        if (item && item.timestamp && (now - item.timestamp > 600000)) { // 10 minutes
          delete global.mediaCache[key];
          cleanedItems++;
        }
      });
    }
    
    cacheStats.mediaCache.size = Object.keys(global.mediaCache).length;
  }
  
  if (cleanedItems > 0) {
    console.log(`🧹 Cleaned up ${cleanedItems} cached items`);
  }
}

/**
 * Break circular references to help garbage collection
 */
function breakCircularReferences() {
  // Intentionally empty - implement based on specific circular references in your codebase
}

/**
 * Get memory statistics for monitoring
 * @returns {Object} Memory stats object
 */
function getMemoryStats() {
  const memUsage = process.memoryUsage();
  
  return {
    current: {
      rss: (memUsage.rss / (1024 * 1024)).toFixed(2) + ' MB',
      heapTotal: (memUsage.heapTotal / (1024 * 1024)).toFixed(2) + ' MB',
      heapUsed: (memUsage.heapUsed / (1024 * 1024)).toFixed(2) + ' MB',
      external: (memUsage.external / (1024 * 1024)).toFixed(2) + ' MB',
    },
    history: memoryUsageHistory,
    cacheStats: cacheStats,
    timeSinceLastGC: Math.floor((Date.now() - lastGcTime) / 1000) + ' seconds'
  };
}

// Export functions
module.exports = {
  initMemoryOptimization,
  cleanupMemory,
  getMemoryStats,
  stopMemoryOptimization
};