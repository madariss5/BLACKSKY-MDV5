/**
 * BLACKSKY-MD Premium - Response Cache System
 * 
 * This module implements a high-performance cache for bot responses,
 * using a Least Recently Used (LRU) eviction policy to optimize memory usage.
 * 
 * Features:
 * - Configurable cache size and TTL (Time To Live)
 * - Command-level granularity with argument matching
 * - Memory usage optimizations
 * - Performance metrics tracking
 * - Auto cleanup for expired entries
 */

// Cache configuration
const CONFIG = {
  // Maximum number of entries in the cache
  maxSize: 500,
  
  // Default TTL in milliseconds (15 minutes)
  defaultTTL: 15 * 60 * 1000,
  
  // Custom TTLs for specific commands
  commandTTL: {
    // Frequently used commands with longer TTL
    'help': 30 * 60 * 1000,      // 30 minutes
    'menu': 30 * 60 * 1000,      // 30 minutes
    'ping': 5 * 60 * 1000,       // 5 minutes
    
    // Media commands with shorter TTL
    'play': 10 * 60 * 1000,      // 10 minutes
    'yta': 10 * 60 * 1000,       // 10 minutes
    'ytv': 10 * 60 * 1000,       // 10 minutes
    
    // Search commands with medium TTL
    'google': 15 * 60 * 1000,    // 15 minutes
    'yts': 15 * 60 * 1000,       // 15 minutes
    'pinterest': 15 * 60 * 1000, // 15 minutes
    
    // RPG/game commands with very short TTL due to state changes
    'inventory': 1 * 60 * 1000,  // 1 minute
    'shop': 5 * 60 * 1000,       // 5 minutes
    'daily': 1 * 60 * 1000,      // 1 minute
  },
  
  // List of commands that should never be cached
  uncacheableCommands: [
    'broadcast', 'bc', 'bcgc',   // Broadcasting commands
    'exec', 'eval',              // Code execution
    'join', 'leave',             // Group management
    'ban', 'unban',              // User management
    'restart',                   // System commands
    'set', 'get',                // Database operations
    'update',                    // Update commands
  ],
  
  // Cleanup interval in milliseconds (5 minutes)
  cleanupInterval: 5 * 60 * 1000,
  
  // Maximum age of entries to keep during aggressive cleanup (30 minutes)
  maxAge: 30 * 60 * 1000,
  
  // Memory threshold for aggressive cleanup (85%)
  memoryThreshold: 85,
};

// Cache structure
const cache = {
  entries: new Map(),          // Map of all cache entries
  keysByTime: [],              // Keys ordered by access time (for LRU)
  stats: {
    hits: 0,                   // Number of cache hits
    misses: 0,                 // Number of cache misses
    evictions: 0,              // Number of entries evicted
    cleanups: 0,               // Number of cleanup operations
    size: 0,                   // Current cache size
  },
  lastCleanup: Date.now(),     // Last cleanup timestamp
};

/**
 * Generate a cache key from message, command and arguments
 * @param {Object} m - Message object
 * @param {string} command - Command name
 * @param {Array} args - Command arguments
 * @returns {string} - Cache key
 */
function generateCacheKey(m, command, args) {
  // Base key includes command name
  let key = command;
  
  // Include chat ID for context
  if (m.chat) {
    key += `:${m.chat}`;
  }
  
  // Add relevant arguments (limited to first 3 to avoid excessive uniqueness)
  if (args && args.length > 0) {
    // Limit args to first 3 to avoid excessive keys
    const relevantArgs = args.slice(0, 3).join(',');
    key += `:${relevantArgs}`;
  }
  
  return key;
}

/**
 * Check if a command is cacheable
 * @param {string} command - Command name
 * @returns {boolean} - Whether the command is cacheable
 */
function isCommandCacheable(command) {
  return !CONFIG.uncacheableCommands.includes(command);
}

/**
 * Get TTL for a specific command
 * @param {string} command - Command name
 * @returns {number} - TTL in milliseconds
 */
function getCommandTTL(command) {
  return CONFIG.commandTTL[command] || CONFIG.defaultTTL;
}

/**
 * Check if an entry is expired
 * @param {Object} entry - Cache entry
 * @returns {boolean} - Whether the entry is expired
 */
function isEntryExpired(entry) {
  const now = Date.now();
  return now - entry.timestamp > entry.ttl;
}

/**
 * Update LRU order
 * @param {string} key - Cache key
 */
function updateLRUOrder(key) {
  // Remove key from current position
  const index = cache.keysByTime.indexOf(key);
  if (index > -1) {
    cache.keysByTime.splice(index, 1);
  }
  
  // Add key to end (most recently used)
  cache.keysByTime.push(key);
}

/**
 * Handle cache eviction when cache is full
 */
function evictLRUEntry() {
  if (cache.keysByTime.length === 0) return;
  
  // Get least recently used key
  const key = cache.keysByTime.shift();
  
  // Remove from entries map
  cache.entries.delete(key);
  
  // Update stats
  cache.stats.evictions++;
  cache.stats.size--;
}

/**
 * Get cached response for a command
 * @param {Object} m - Message object
 * @param {string} command - Command name
 * @param {Array} args - Command arguments
 * @returns {*} - Cached response or null if not cached
 */
function getCachedResponse(m, command, args) {
  // Check if command is cacheable
  if (!isCommandCacheable(command)) {
    return null;
  }
  
  // Generate cache key
  const key = generateCacheKey(m, command, args);
  
  // Check if key exists in cache
  if (cache.entries.has(key)) {
    const entry = cache.entries.get(key);
    
    // Check if entry is expired
    if (isEntryExpired(entry)) {
      // Remove expired entry
      cache.entries.delete(key);
      
      // Remove from keysByTime
      const index = cache.keysByTime.indexOf(key);
      if (index > -1) {
        cache.keysByTime.splice(index, 1);
      }
      
      // Update stats
      cache.stats.size--;
      cache.stats.misses++;
      
      return null;
    }
    
    // Update LRU order
    updateLRUOrder(key);
    
    // Update stats
    cache.stats.hits++;
    
    return entry.value;
  }
  
  // Not found in cache
  cache.stats.misses++;
  return null;
}

/**
 * Cache a command response
 * @param {Object} m - Message object
 * @param {string} command - Command that was executed
 * @param {Array} args - Command arguments
 * @param {*} response - Command response to cache
 * @returns {boolean} - Whether the response was cached
 */
function cacheResponse(m, command, args, response) {
  // Check if command is cacheable
  if (!isCommandCacheable(command)) {
    return false;
  }
  
  // Don't cache null or undefined responses
  if (response === null || response === undefined) {
    return false;
  }
  
  // Generate cache key
  const key = generateCacheKey(m, command, args);
  
  // Check if cache is full
  if (cache.entries.size >= CONFIG.maxSize) {
    evictLRUEntry();
  }
  
  // Get TTL for this command
  const ttl = getCommandTTL(command);
  
  // Create cache entry
  const entry = {
    value: response,
    timestamp: Date.now(),
    ttl: ttl,
  };
  
  // Add to cache
  cache.entries.set(key, entry);
  
  // Update LRU order
  updateLRUOrder(key);
  
  // Update stats
  cache.stats.size++;
  
  return true;
}

/**
 * Clean up expired entries
 * @param {boolean} aggressive - Whether to perform aggressive cleanup
 * @returns {number} - Number of entries removed
 */
function cleanupCache(aggressive = false) {
  const now = Date.now();
  let removed = 0;
  
  // Update last cleanup time
  cache.lastCleanup = now;
  
  // Get all keys
  const keys = [...cache.entries.keys()];
  
  for (const key of keys) {
    const entry = cache.entries.get(key);
    
    // Check if entry is expired
    const expired = isEntryExpired(entry);
    
    // In aggressive mode, also remove old entries regardless of TTL
    const tooOld = aggressive && (now - entry.timestamp > CONFIG.maxAge);
    
    if (expired || tooOld) {
      // Remove from cache
      cache.entries.delete(key);
      
      // Remove from keysByTime
      const index = cache.keysByTime.indexOf(key);
      if (index > -1) {
        cache.keysByTime.splice(index, 1);
      }
      
      removed++;
    }
  }
  
  // Update stats
  cache.stats.size = cache.entries.size;
  cache.stats.cleanups++;
  
  return removed;
}

/**
 * Get memory usage percentage
 * @returns {number} - Memory usage percentage
 */
function getMemoryUsage() {
  const memoryUsage = process.memoryUsage();
  const heapUsed = memoryUsage.heapUsed;
  const heapTotal = memoryUsage.heapTotal;
  
  return Math.round((heapUsed / heapTotal) * 100);
}

/**
 * Schedule periodic cache cleanup
 */
function scheduleCleanup() {
  setInterval(() => {
    // Check if cleanup is needed
    const now = Date.now();
    const timeSinceLastCleanup = now - cache.lastCleanup;
    
    if (timeSinceLastCleanup >= CONFIG.cleanupInterval) {
      // Get memory usage
      const memoryUsage = getMemoryUsage();
      
      // Perform aggressive cleanup if memory usage is high
      const aggressive = memoryUsage > CONFIG.memoryThreshold;
      
      // Clean up cache
      const removed = cleanupCache(aggressive);
      
      if (removed > 0) {
        console.log(`[CACHE] Cleaned up ${removed} entries (aggressive: ${aggressive})`);
      }
    }
  }, 60000); // Check every minute
}

/**
 * Reset cache stats
 */
function resetStats() {
  cache.stats.hits = 0;
  cache.stats.misses = 0;
  cache.stats.evictions = 0;
  cache.stats.cleanups = 0;
}

/**
 * Get cache stats
 * @returns {Object} - Cache stats
 */
function getStats() {
  return {
    ...cache.stats,
    hitRatio: cache.stats.hits + cache.stats.misses > 0 
      ? (cache.stats.hits / (cache.stats.hits + cache.stats.misses)) 
      : 0,
    memoryUsage: getMemoryUsage(),
  };
}

/**
 * Clear the entire cache
 */
function clearCache() {
  cache.entries.clear();
  cache.keysByTime = [];
  cache.stats.size = 0;
  console.log('[CACHE] Cache cleared');
}

/**
 * Initialize the cache system
 */
function initialize() {
  console.log('[CACHE] Initializing response cache system');
  
  // Schedule periodic cleanup
  scheduleCleanup();
  
  console.log('[CACHE] Response cache system initialized');
  console.log(`[CACHE] Max size: ${CONFIG.maxSize} entries`);
  console.log(`[CACHE] Default TTL: ${CONFIG.defaultTTL / 1000}s`);
  
  return true;
}

// Initialize on module load
initialize();

// Export public API
module.exports = {
  getCachedResponse,
  cacheResponse,
  cleanupCache,
  getStats,
  clearCache,
  resetStats,
  initialize,
};