/**
 * BLACKSKY-MD Response Cache System
 * 
 * This advanced caching system dramatically improves response times
 * for frequently used commands by caching responses at different levels:
 * 
 * 1. Global caching for stateless commands
 * 2. User-specific caching for personalized responses
 * 3. Group-specific caching for shared contexts
 * 4. Command-argument specific optimizations
 * 
 * The system intelligently manages cache entries with appropriate TTLs
 * and handles memory pressure by auto-cleaning when needed.
 */

// Cache data structures
const globalCache = new Map();
const userCache = new Map();
const groupCache = new Map();

// Cache statistics
const stats = {
  hits: 0,
  misses: 0,
  size: 0,
  groupHits: 0,
  hitRatio: 0,
  lastCleanup: Date.now()
};

// Configuration
const DEFAULT_TTL = 5 * 60 * 1000; // 5 minutes
const GROUP_TTL = 10 * 60 * 1000;  // 10 minutes
const MAX_CACHE_SIZE = 500;        // Maximum number of entries
const MAX_CACHE_AGE = 30 * 60 * 1000; // Maximum age for any cache entry (30 minutes)

// Commands that should never be cached
const UNCACHEABLE_COMMANDS = new Set([
  'eval', 'exec', 'term', 'delete', 'del', 'remove',
  'ban', 'unban', 'kick', 'add', 'promote', 'demote',
  'setppgc', 'setdesc', 'setname', 'setpp'
]);

// Commands that benefit from longer cache (informational/static content)
const LONG_CACHE_COMMANDS = new Set([
  'menu', 'help', 'info', 'rules', 'botinfo', 'donate',
  'performance', 'stats', 'language', 'languages', 'credits',
  'owner', 'creator', 'about', 'speed', 'ping'
]);

// RPG commands with shorter but still beneficial cache times
const RPG_CACHEABLE_COMMANDS = new Set([
  'inventory', 'profile', 'inv', 'shop', 'market', 'leaderboard',
  'top', 'rank', 'petshop', 'gunshop', 'bank', 'daily', 'weekly',
  'monthly', 'guninfo', 'petinfo', 'craft', 'cook', 'repair'
]);

/**
 * Generates a cache key based on command and context
 * @param {string} command - The command name
 * @param {Array} args - Command arguments
 * @param {string} userId - User ID
 * @param {string} groupId - Group ID (if applicable)
 * @returns {string} - The cache key
 */
function generateCacheKey(command, args, userId, groupId) {
  // Base key contains command and normalized args
  let baseKey = `${command}:${args.join(',').toLowerCase()}`;
  
  // For user-specific commands, include the user ID
  if (userId) {
    baseKey += `:${userId}`;
  }
  
  // For group-specific commands, include the group ID
  if (groupId) {
    baseKey += `@${groupId}`;
  }
  
  return baseKey;
}

/**
 * Determines if a command should be cached based on its nature
 * @param {string} command - The command name
 * @param {Array} args - Command arguments
 * @returns {boolean} - Whether the command is cacheable
 */
function isCacheable(command, args) {
  // Skip commands that should never be cached
  if (UNCACHEABLE_COMMANDS.has(command)) {
    return false;
  }
  
  // Don't cache commands with sensitive or rapidly changing data
  if (command.startsWith('set') || command.includes('delete') || command.includes('update')) {
    return false;
  }
  
  // Explicitly enable caching for RPG commands that benefit from it
  if (RPG_CACHEABLE_COMMANDS.has(command)) {
    return true;
  }
  
  // Don't cache resource-gathering commands (they change state with each use)
  if (['mine', 'hunt', 'adventure', 'work', 'daily', 'farm', 'fish', 'chop'].includes(command)) {
    return false;
  }
  
  // Don't cache economy-affecting commands
  if (['pay', 'transfer', 'buy', 'sell', 'use', 'open'].includes(command)) {
    return false;
  }
  
  // Default to cacheable for most commands
  return true;
}

/**
 * Gets the appropriate TTL for a command
 * @param {string} command - The command name
 * @param {boolean} isGroupCommand - Whether this is a group command
 * @returns {number} - The TTL in milliseconds
 */
function getTTL(command, isGroupCommand) {
  // Static informational content gets longest cache
  if (LONG_CACHE_COMMANDS.has(command)) {
    return DEFAULT_TTL * 6; // 30 minutes for static content
  }
  
  // RPG commands get intermediate cache duration
  if (RPG_CACHEABLE_COMMANDS.has(command)) {
    return DEFAULT_TTL * 2; // 10 minutes for RPG content
  }
  
  // Special case: Shop/market commands get longer cache in groups
  if ((command === 'shop' || command === 'market' || command === 'store') && isGroupCommand) {
    return GROUP_TTL * 1.5; // 15 minutes for shop data in groups
  }
  
  // Default cache times based on context
  return isGroupCommand ? GROUP_TTL : DEFAULT_TTL;
}

/**
 * Get a cached response if available
 * @param {string} command - The command name
 * @param {Array} args - Command arguments
 * @param {string} userId - User ID
 * @param {string} groupId - Group ID (if applicable)
 * @returns {Object|null} - The cached response or null if not found
 */
function getCached(command, args, userId, groupId) {
  if (!isCacheable(command, args)) {
    stats.misses++;
    return null;
  }
  
  const isGroupCommand = !!groupId;
  const cacheKey = generateCacheKey(command, args, userId, groupId);
  let cache = isGroupCommand ? groupCache : (userId ? userCache : globalCache);
  
  if (cache.has(cacheKey)) {
    const entry = cache.get(cacheKey);
    
    // Check if entry has expired
    if (entry.expires < Date.now()) {
      cache.delete(cacheKey);
      stats.misses++;
      stats.size = globalCache.size + userCache.size + groupCache.size;
      return null;
    }
    
    // Update stats
    stats.hits++;
    if (isGroupCommand) {
      stats.groupHits++;
    }
    stats.hitRatio = stats.hits / (stats.hits + stats.misses);
    
    return entry.data;
  }
  
  stats.misses++;
  return null;
}

/**
 * Store a response in the cache
 * @param {string} command - The command name
 * @param {Array} args - Command arguments
 * @param {string} userId - User ID
 * @param {string} groupId - Group ID (if applicable)
 * @param {*} response - The response to cache
 */
function setCached(command, args, userId, groupId, response) {
  if (!isCacheable(command, args) || !response) {
    return;
  }
  
  // Skip caching large responses
  if (typeof response === 'string' && response.length > 100000) {
    console.log('[CACHE] Skipping large response for', command);
    return;
  }
  
  const isGroupCommand = !!groupId;
  const cacheKey = generateCacheKey(command, args, userId, groupId);
  let cache = isGroupCommand ? groupCache : (userId ? userCache : globalCache);
  
  // Get TTL
  const ttl = getTTL(command, isGroupCommand);
  const expires = Date.now() + ttl;
  
  // Store in cache
  cache.set(cacheKey, {
    data: response,
    expires,
    command,
    created: Date.now()
  });
  
  // Check if cache needs cleaning
  const totalSize = globalCache.size + userCache.size + groupCache.size;
  stats.size = totalSize;
  
  if (totalSize > MAX_CACHE_SIZE) {
    cleanupCache(true);
  }
}

/**
 * Clean up expired cache entries and manage cache size
 * @param {boolean} force - Whether to force a more aggressive cleanup
 * @returns {number} - Number of entries removed
 */
function cleanupCache(force = false) {
  const now = Date.now();
  stats.lastCleanup = now;
  
  console.log('[MEMORY-MANAGER] Running regular cache cleanup');
  
  let entriesRemoved = 0;
  const totalBefore = globalCache.size + userCache.size + groupCache.size;
  
  // Helper to clean a specific cache
  const cleanCache = (cache, name) => {
    let removed = 0;
    const expiredEntries = [];
    
    // Find expired entries
    for (const [key, entry] of cache.entries()) {
      if (entry.expires < now || 
          (force && (now - entry.created > MAX_CACHE_AGE))) {
        expiredEntries.push(key);
      }
    }
    
    // Remove expired entries
    for (const key of expiredEntries) {
      cache.delete(key);
      removed++;
    }
    
    // If we need more aggressive cleaning, remove oldest entries
    if (force && cache.size > MAX_CACHE_SIZE / 3) {
      const entries = [...cache.entries()]
        .sort((a, b) => a[1].created - b[1].created);
      
      // Remove oldest 20% of entries
      const toRemove = Math.ceil(entries.length * 0.2);
      for (let i = 0; i < toRemove && i < entries.length; i++) {
        cache.delete(entries[i][0]);
        removed++;
      }
    }
    
    return removed;
  };
  
  // Clean each cache
  entriesRemoved += cleanCache(globalCache, 'Global');
  entriesRemoved += cleanCache(userCache, 'User');
  entriesRemoved += cleanCache(groupCache, 'Group');
  
  // Update stats
  stats.size = globalCache.size + userCache.size + groupCache.size;
  
  console.log(`[MEMORY-MANAGER] Cleanup complete: ${entriesRemoved} items removed`);
  
  return entriesRemoved;
}

/**
 * Get cache statistics
 * @returns {Object} - Object containing cache statistics
 */
function getCacheStats() {
  return {
    ...stats,
    globalSize: globalCache.size,
    userSize: userCache.size,
    groupSize: groupCache.size
  };
}

/**
 * Invalidate specific cache entries
 * @param {string} command - Command to invalidate
 * @param {string} userId - User ID (optional)
 * @param {string} groupId - Group ID (optional)
 */
function invalidateCache(command, userId, groupId) {
  const invalidateInMap = (map) => {
    for (const [key, entry] of map.entries()) {
      if (entry.command === command &&
         (!userId || key.includes(userId)) &&
         (!groupId || key.includes(groupId))) {
        map.delete(key);
      }
    }
  };
  
  invalidateInMap(globalCache);
  invalidateInMap(userCache);
  invalidateInMap(groupCache);
  
  // Update size stat
  stats.size = globalCache.size + userCache.size + groupCache.size;
}

module.exports = {
  getCached,
  setCached,
  cleanupCache,
  getCacheStats,
  invalidateCache
};