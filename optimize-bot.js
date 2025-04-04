/**
 * BLACKSKY-MD Premium - Bot Optimizer
 * 
 * This module provides advanced performance optimizations for the WhatsApp bot:
 * 1. Response caching for frequently used commands
 * 2. Parallel message processing where appropriate
 * 3. Pattern matching optimization for faster command detection
 * 4. Memory usage optimizations
 * 5. Performance statistics tracking
 */

// Required modules
const fs = require('fs');
const path = require('path');
const { promisify } = require('util');

// Try to load response cache module
let responseCache;
try {
  responseCache = require('./lib/response-cache.js');
  console.log('✅ Response cache system loaded');
} catch (err) {
  console.error('⚠️ Failed to load response cache system:', err);
  responseCache = null;
}

// Try to load memory manager
let memoryManager;
try {
  memoryManager = require('./lib/advanced-memory-manager.js');
  console.log('✅ Advanced memory manager loaded');
} catch (err) {
  console.error('⚠️ Failed to load advanced memory manager:', err);
  memoryManager = null;
}

// Configuration
const CONFIG = {
  // Maximum number of parallel messages to process at once
  maxParallelMessages: 5,
  
  // Types of messages that can be processed in parallel
  parallelizableMessageTypes: [
    'imageMessage',
    'videoMessage',
    'audioMessage',
    'stickerMessage',
    'documentMessage',
    'extendedTextMessage',
  ],
  
  // Minimum processing time (ms) to consider caching a response
  minProcessingTimeForCache: 100,
  
  // Maximum size (in bytes) for cacheable responses
  maxCacheableResponseSize: 10 * 1024 * 1024, // 10 MB
  
  // Memory threshold (percentage) for automatic cleanup
  memoryThresholdForCleanup: 85,
  
  // Performance stats reporting interval (ms)
  statsReportInterval: 15 * 60 * 1000, // 15 minutes
  
  // Garbage collection interval (ms)
  gcInterval: 5 * 60 * 1000, // 5 minutes
};

// Performance tracking
const performanceStats = {
  // Command execution stats
  commandsProcessed: 0,
  averageCommandTime: 0,
  
  // Parallel processing stats
  parallelBatches: 0,
  parallelMessages: 0,
  
  // Cache stats
  cacheHits: 0,
  cacheMisses: 0,
  
  // Memory stats
  memoryChecks: 0,
  memoryCleanups: 0,
  
  // Pattern optimization stats
  fastPatternMatches: 0,
  conventionalMatches: 0,
  
  // Timing
  startTime: Date.now(),
  lastStatsReset: Date.now(),
};

// Optimized pattern lookup for faster command matching
const optimizedPatterns = {
  exactMatchCommands: new Map(), // Map of exact command names to plugin indices
  prefixedCommands: new Map(), // Map of command prefixes to plugin indices
  patternBuckets: new Map(), // Map of first characters to plugin indices
};

/**
 * Log message with timestamp
 * @param {string} message - Message to log
 */
function log(message) {
  const timestamp = new Date().toISOString();
  console.log(`[OPTIMIZER][${timestamp}] ${message}`);
}

/**
 * Process messages in parallel when appropriate
 * This should be called at the start of the handler function
 * @param {Object} chatUpdate - The chat update object
 * @returns {Boolean} - Whether parallel processing was applied
 */
async function processMessageParallel(chatUpdate) {
  try {
    // Only process messages with valid structure
    if (!chatUpdate || !chatUpdate.messages || !Array.isArray(chatUpdate.messages)) {
      return false;
    }
    
    // If there's only one message, handle it normally
    if (chatUpdate.messages.length <= 1) {
      return false;
    }
    
    // Get messages that can be processed in parallel
    const parallelizableMessages = chatUpdate.messages.filter(msg => {
      // Check if message type is parallelizable
      if (!msg.message) return false;
      
      const messageType = Object.keys(msg.message)[0];
      return CONFIG.parallelizableMessageTypes.includes(messageType);
    });
    
    // If not enough parallelizable messages, handle normally
    if (parallelizableMessages.length <= 1) {
      return false;
    }
    
    // Limit to max parallel messages
    const messagesToProcess = parallelizableMessages.slice(0, CONFIG.maxParallelMessages);
    
    // Mark messages as being processed in parallel to avoid duplicate processing
    for (const msg of messagesToProcess) {
      msg._PARALLEL_PROCESSED = true;
    }
    
    // Update stats
    performanceStats.parallelBatches++;
    performanceStats.parallelMessages += messagesToProcess.length;
    
    // Create a new chat update object for each message and process in parallel
    const processingPromises = messagesToProcess.map(msg => {
      const singleMsgUpdate = {
        ...chatUpdate,
        messages: [msg],
        _PARALLEL_PROCESSED: true,
      };
      
      // If there's a global connection with handler, call it
      if (global.conn && typeof global.conn.handler === 'function') {
        return global.conn.handler(singleMsgUpdate).catch(err => {
          console.error('Error in parallel message processing:', err);
        });
      }
      
      return Promise.resolve();
    });
    
    // Wait for all messages to be processed
    await Promise.all(processingPromises);
    
    return true;
  } catch (err) {
    console.error('Error in parallel message processing:', err);
    return false;
  }
}

/**
 * Get cached response for a command if available
 * @param {Object} m - Message object
 * @param {string} command - Command being executed
 * @param {Array} args - Command arguments
 * @returns {*} - Cached response or null if not cached
 */
function getCachedResponse(m, command, args) {
  // Check if cache is available
  if (!responseCache) {
    return null;
  }
  
  try {
    // Get from cache
    const cachedResponse = responseCache.getCachedResponse(m, command, args);
    
    // Update stats
    if (cachedResponse) {
      performanceStats.cacheHits++;
    } else {
      performanceStats.cacheMisses++;
    }
    
    return cachedResponse;
  } catch (err) {
    console.error('Error getting cached response:', err);
    return null;
  }
}

/**
 * Cache a command response
 * @param {Object} m - Message object
 * @param {string} command - Command that was executed
 * @param {Array} args - Command arguments
 * @param {*} response - Command response to cache
 * @param {number} processingTime - Time taken to process the command
 * @returns {boolean} - Whether the response was cached
 */
function cacheResponse(m, command, args, response, processingTime) {
  // Check if cache is available
  if (!responseCache) {
    return false;
  }
  
  try {
    // Check if worth caching (took significant time to process)
    if (processingTime < CONFIG.minProcessingTimeForCache) {
      return false;
    }
    
    // Check response size - avoid caching very large responses
    let responseSize = 0;
    
    if (typeof response === 'string') {
      responseSize = response.length;
    } else if (Buffer.isBuffer(response)) {
      responseSize = response.length;
    } else if (typeof response === 'object') {
      try {
        responseSize = JSON.stringify(response).length;
      } catch (e) {
        // If can't stringify, estimate size
        responseSize = 5 * 1024 * 1024; // Assume 5MB
      }
    }
    
    if (responseSize > CONFIG.maxCacheableResponseSize) {
      return false;
    }
    
    // Add to cache
    return responseCache.cacheResponse(m, command, args, response);
  } catch (err) {
    console.error('Error caching response:', err);
    return false;
  }
}

/**
 * Optimize the response cache
 * @param {boolean} aggressive - Whether to use aggressive optimization
 * @returns {number} - Number of entries removed
 */
function optimizeCache(aggressive = false) {
  if (!responseCache) {
    return 0;
  }
  
  try {
    return responseCache.cleanupCache(aggressive);
  } catch (err) {
    console.error('Error optimizing cache:', err);
    return 0;
  }
}

/**
 * Clear module cache for non-essential modules
 * This can free up memory when needed
 * @returns {number} - Number of modules cleared
 */
function clearModuleCache() {
  try {
    if (!require.cache) {
      return 0;
    }
    
    const moduleKeys = Object.keys(require.cache);
    let cleared = 0;
    
    for (const moduleKey of moduleKeys) {
      // Skip essential modules
      if (
        moduleKey.includes('node_modules/@adiwajshing/baileys') ||
        moduleKey.includes('/lib/') ||
        moduleKey.includes('/plugins/') ||
        moduleKey.includes('node:')
      ) {
        continue;
      }
      
      // Remove module from cache
      delete require.cache[moduleKey];
      cleared++;
    }
    
    return cleared;
  } catch (err) {
    console.error('Error clearing module cache:', err);
    return 0;
  }
}

/**
 * Build optimized pattern lookup for plugins
 * @param {Object} plugins - The plugins object
 * @returns {Object} - The optimized patterns
 */
function buildOptimizedPatterns(plugins) {
  try {
    // Reset maps
    optimizedPatterns.exactMatchCommands = new Map();
    optimizedPatterns.prefixedCommands = new Map();
    optimizedPatterns.patternBuckets = new Map();
    
    // Process each plugin
    if (!plugins || typeof plugins !== 'object') {
      return optimizedPatterns;
    }
    
    Object.keys(plugins).forEach((pluginName, pluginIndex) => {
      const plugin = plugins[pluginName];
      
      // Skip plugins without patterns
      if (!plugin.pattern) return;
      
      // Convert pattern to string and normalize
      const patternStr = plugin.pattern.toString();
      
      // Process exact match commands (e.g. /^menu$/)
      const exactMatchRegex = /^\^([a-zA-Z0-9]+)\$$/;
      const exactMatch = patternStr.match(exactMatchRegex);
      
      if (exactMatch) {
        const command = exactMatch[1].toLowerCase();
        if (!optimizedPatterns.exactMatchCommands.has(command)) {
          optimizedPatterns.exactMatchCommands.set(command, []);
        }
        optimizedPatterns.exactMatchCommands.get(command).push(pluginIndex);
        return;
      }
      
      // Process prefixed commands (e.g. /^(help|h)$/i)
      const prefixRegex = /^\^\((.*?)\)\$\/i$/;
      const prefixMatch = patternStr.match(prefixRegex);
      
      if (prefixMatch) {
        const prefixes = prefixMatch[1].split('|');
        for (const prefix of prefixes) {
          const normalizedPrefix = prefix.toLowerCase();
          if (!optimizedPatterns.prefixedCommands.has(normalizedPrefix)) {
            optimizedPatterns.prefixedCommands.set(normalizedPrefix, []);
          }
          optimizedPatterns.prefixedCommands.get(normalizedPrefix).push(pluginIndex);
        }
        return;
      }
      
      // For other patterns, bucket by first character
      // This is a simplification - real optimization would analyze the regex
      if (patternStr.length > 2) {
        const firstChar = patternStr.charAt(1);
        if (!optimizedPatterns.patternBuckets.has(firstChar)) {
          optimizedPatterns.patternBuckets.set(firstChar, []);
        }
        optimizedPatterns.patternBuckets.get(firstChar).push(pluginIndex);
      }
    });
    
    return optimizedPatterns;
  } catch (err) {
    console.error('Error building optimized patterns:', err);
    return {
      exactMatchCommands: new Map(),
      prefixedCommands: new Map(),
      patternBuckets: new Map(),
    };
  }
}

/**
 * Fast command lookup to find matching plugins
 * @param {string} command - Command name
 * @returns {Array} - List of matching plugin names
 */
function fastCommandLookup(command) {
  try {
    const matches = [];
    
    // Normalize command
    const normalizedCommand = command.toLowerCase().trim();
    
    // Check exact matches first (fastest)
    if (optimizedPatterns.exactMatchCommands.has(normalizedCommand)) {
      performanceStats.fastPatternMatches++;
      return optimizedPatterns.exactMatchCommands.get(normalizedCommand);
    }
    
    // Check prefixed commands
    if (optimizedPatterns.prefixedCommands.has(normalizedCommand)) {
      performanceStats.fastPatternMatches++;
      return optimizedPatterns.prefixedCommands.get(normalizedCommand);
    }
    
    // As a fallback, check buckets by first character
    if (normalizedCommand.length > 0) {
      const firstChar = normalizedCommand.charAt(0);
      if (optimizedPatterns.patternBuckets.has(firstChar)) {
        performanceStats.conventionalMatches++;
        return optimizedPatterns.patternBuckets.get(firstChar);
      }
    }
    
    return matches;
  } catch (err) {
    console.error('Error in fast command lookup:', err);
    return [];
  }
}

/**
 * Report memory and performance statistics periodically
 */
function reportStats() {
  try {
    // Check elapsed time since last report
    const now = Date.now();
    const elapsedSeconds = (now - performanceStats.startTime) / 1000;
    
    // Calculate performance metrics
    const commandsPerSecond = performanceStats.commandsProcessed / elapsedSeconds;
    const cacheHitRatio = performanceStats.cacheHits + performanceStats.cacheMisses > 0
      ? performanceStats.cacheHits / (performanceStats.cacheHits + performanceStats.cacheMisses) * 100
      : 0;
    
    // Get memory usage
    const memoryUsage = process.memoryUsage();
    const heapUsedMB = Math.round(memoryUsage.heapUsed / (1024 * 1024));
    const rssMB = Math.round(memoryUsage.rss / (1024 * 1024));
    
    // Log stats report
    log('===== PERFORMANCE STATS REPORT =====');
    log(`Uptime: ${Math.round(elapsedSeconds / 60)} minutes`);
    log(`Commands Processed: ${performanceStats.commandsProcessed} (${commandsPerSecond.toFixed(2)}/sec)`);
    log(`Cache Hit Ratio: ${cacheHitRatio.toFixed(1)}% (${performanceStats.cacheHits} hits, ${performanceStats.cacheMisses} misses)`);
    log(`Parallel Processing: ${performanceStats.parallelBatches} batches, ${performanceStats.parallelMessages} messages`);
    log(`Pattern Matching: ${performanceStats.fastPatternMatches} fast matches, ${performanceStats.conventionalMatches} conventional`);
    log(`Memory Usage: ${heapUsedMB} MB heap, ${rssMB} MB RSS`);
    log('===================================');
    
    // Optionally, reset certain counters for period-specific stats
    performanceStats.lastStatsReset = now;
  } catch (err) {
    console.error('Error reporting stats:', err);
  }
}

/**
 * Schedule periodic garbage collection
 */
function setupGarbageCollection() {
  try {
    // Check if global.gc is available
    if (typeof global.gc !== 'function') {
      log('Warning: global.gc not available, run with --expose-gc flag for optimal performance');
      return;
    }
    
    // Set up interval for GC
    setInterval(() => {
      try {
        global.gc();
        log('Performed scheduled garbage collection');
      } catch (err) {
        console.error('❌ Error during garbage collection:', err);
      }
    }, CONFIG.gcInterval);
    
    log(`Scheduled garbage collection at ${CONFIG.gcInterval / 1000}s intervals`);
  } catch (err) {
    console.error('Error setting up garbage collection:', err);
  }
}

/**
 * Set up periodic cache checking and optimization
 */
function setupCacheChecking() {
  try {
    if (!responseCache) {
      return;
    }
    
    // Set up interval for cache optimization
    setInterval(() => {
      try {
        // Check memory usage
        const memoryUsage = process.memoryUsage();
        const heapUsage = memoryUsage.heapUsed / memoryUsage.heapTotal * 100;
        
        // Update stats
        performanceStats.memoryChecks++;
        
        // If memory usage is high, do aggressive cleanup
        if (heapUsage > CONFIG.memoryThresholdForCleanup) {
          log(`High memory usage (${Math.round(heapUsage)}%), performing aggressive cache cleanup`);
          const entriesRemoved = optimizeCache(true);
          log(`Removed ${entriesRemoved} cache entries`);
          
          // Update stats
          performanceStats.memoryCleanups++;
          
          // Also clean module cache in extreme cases
          if (heapUsage > 90) {
            const modulesCleared = clearModuleCache();
            log(`Cleared ${modulesCleared} modules from cache`);
          }
        }
      } catch (err) {
        console.error('Error in cache checking interval:', err);
      }
    }, 60000); // Check every minute
    
    log('Set up periodic cache optimization');
  } catch (err) {
    console.error('Error setting up cache checking:', err);
  }
}

/**
 * Set up stats reporting interval
 */
function setupStatsReporting() {
  try {
    // Set up interval for stats reporting
    setInterval(() => {
      reportStats();
    }, CONFIG.statsReportInterval);
    
    log(`Set up stats reporting at ${CONFIG.statsReportInterval / (60 * 1000)}m intervals`);
  } catch (err) {
    console.error('Error setting up stats reporting:', err);
  }
}

/**
 * Initialize all optimizations
 */
function initializeOptimizations() {
  try {
    log('⚡ Applying performance optimizations...');
    
    // Initialize response cache if available
    if (responseCache) {
      responseCache.initialize();
    }
    
    // Initialize memory manager if available
    if (memoryManager) {
      memoryManager.initialize();
    }
    
    // Set up periodic tasks
    setupGarbageCollection();
    setupCacheChecking();
    setupStatsReporting();
    
    // Record start time
    performanceStats.startTime = Date.now();
    performanceStats.lastStatsReset = Date.now();
    
    log('✅ Bot performance optimizations applied!');
    return true;
  } catch (err) {
    console.error('❌ Error initializing optimizations:', err);
    return false;
  }
}

/**
 * Initialize patterns for all plugins
 * @param {Object} plugins - Global plugins object
 */
function initializePatterns(plugins) {
  try {
    if (!plugins) {
      log('Warning: no plugins object provided for pattern initialization');
      return;
    }
    
    buildOptimizedPatterns(plugins);
    
    const exactMatchCount = optimizedPatterns.exactMatchCommands.size;
    const prefixedCount = optimizedPatterns.prefixedCommands.size;
    const bucketCount = optimizedPatterns.patternBuckets.size;
    
    log(`Optimized patterns: ${exactMatchCount} exact matches, ${prefixedCount} prefixed commands, ${bucketCount} buckets`);
  } catch (err) {
    console.error('Error initializing patterns:', err);
  }
}

/**
 * Clean up on exit
 */
function cleanup() {
  try {
    // Report final stats
    reportStats();
    
    // Clean up memory manager if available
    if (memoryManager) {
      memoryManager.cleanup();
    }
    
    // Final garbage collection
    if (typeof global.gc === 'function') {
      global.gc();
    }
    
    log('Optimizer cleanup complete');
  } catch (err) {
    console.error('Error during optimizer cleanup:', err);
  }
}

// Export public API
module.exports = {
  // Core functions
  initializeOptimizations,
  initializePatterns,
  processMessageParallel,
  getCachedResponse,
  cacheResponse,
  fastCommandLookup,
  
  // Utilities
  reportStats,
  setupStatsReporting,
  cleanup,
  
  // Memory management
  optimizeCache,
  clearModuleCache,
  
  // Stats object (exported for monitoring)
  performanceStats,
};