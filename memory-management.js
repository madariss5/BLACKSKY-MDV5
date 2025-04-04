/**
 * Memory Management Module
 * Integrates advanced memory management for WhatsApp bot
 */

const { initMemoryManager } = require('./lib/advanced-memory-manager');

/**
 * Initialize memory management for the WhatsApp bot
 * Handles garbage collection and memory optimization
 */
function initializeMemoryManagement() {
  console.log('🧠 Initializing memory management systems...');
  
  // Check if NODE_OPTIONS includes --expose-gc
  const exposedGC = process.execArgv.includes('--expose-gc') || 
                    process.env.NODE_OPTIONS?.includes('--expose-gc');
  
  if (!exposedGC) {
    console.warn('⚠️ Running without exposed garbage collection. For optimal memory management, start with NODE_OPTIONS="--expose-gc"');
  }
  
  // Initialize safe garbage collection function
  global.safeGC = function() {
    try {
      if (typeof global.gc === 'function') {
        global.gc();
        return true;
      }
      return false;
    } catch (error) {
      console.error('❌ Error during garbage collection:', error);
      return false;
    }
  };
  
  // Initialize memory manager with optimal settings
  // These settings are optimized for WhatsApp bots which typically have
  // high media processing and caching requirements
  const memoryManager = initMemoryManager({
    memoryThresholdWarning: 75, // Warn at 75% memory usage
    memoryThresholdCritical: 85, // Critical at 85% memory usage
    cleanupInterval: 3 * 60 * 1000, // Clean every 3 minutes (more frequent)
    snapshotInterval: 15 * 60 * 1000, // Snapshot every 15 minutes
    cacheDefaultTTL: 10 * 60 * 1000, // Default cache TTL: 10 minutes
    maxCacheItems: 500, // Reduced max cache items for memory efficiency
    logMemoryUsage: true, // Enable memory usage logging
    logInterval: 10 * 60 * 1000, // Log every 10 minutes
  });
  
  // Store in global for access throughout the application
  global.memoryManager = memoryManager;
  
  // Create specialized caches for bot operations
  const mediaCache = memoryManager.createCache('media', {
    ttl: 30 * 60 * 1000, // 30 minutes TTL for media
    maxItems: 100, // Only keep 100 media items cached
  });
  
  const userDataCache = memoryManager.createCache('userData', {
    ttl: 60 * 60 * 1000, // 1 hour TTL for user data
    maxItems: 1000, // User data is small, so we can cache more
  });
  
  const pluginResultCache = memoryManager.createCache('pluginResults', {
    ttl: 5 * 60 * 1000, // 5 minutes TTL for plugin results
    maxItems: 200, // Limit plugin result caching
  });
  
  // Setup memory cleanup event handler for Node.js
  process.on('memoryUsageChange', (memoryInfo) => {
    // If memory usage exceeds 80%, run cleanup
    if (memoryInfo.percentageMemoryUsed > 80) {
      console.log('⚠️ High memory usage detected, running cleanup...');
      memoryManager.runCleanup();
      global.safeGC();
    }
  });
  
  // Register memory manager shutdown on process exit
  process.on('exit', () => {
    console.log('🧹 Cleaning up memory manager on exit...');
    memoryManager.shutdown();
  });
  
  // Register for SIGTERM (for Heroku)
  process.on('SIGTERM', () => {
    console.log('🧹 Performing final garbage collection...');
    global.safeGC();
  });
  
  // Execute initial garbage collection
  global.safeGC();
  
  console.log('✅ Memory management initialized');
  return memoryManager;
}

module.exports = {
  initializeMemoryManagement
};