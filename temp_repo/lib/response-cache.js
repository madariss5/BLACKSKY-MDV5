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

// Configuration - Optimized for faster response times
const DEFAULT_TTL = 15 * 60 * 1000; // 15 minutes (increased from 5)
const GROUP_TTL = 20 * 60 * 1000;   // 20 minutes (increased from 10)
const MAX_CACHE_SIZE = 1000;        // Maximum number of entries (increased from 500)
const MAX_CACHE_AGE = 60 * 60 * 1000; // Maximum age for any cache entry (60 minutes, increased from 30)

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

// RPG commands with cache times - expanded for better performance
const RPG_CACHEABLE_COMMANDS = new Set([
  // Core RPG displays
  'inventory', 'profile', 'inv', 'shop', 'market', 'leaderboard',
  'top', 'rank', 'petshop', 'gunshop', 'bank', 'balance', 'money',
  // Informational commands
  'daily', 'weekly', 'monthly', 'guninfo', 'petinfo', 'weaponinfo',
  'craft', 'cook', 'repair', 'upgrades', 'skills', 'stats', 'status',
  // Item info commands
  'inspect', 'examine', 'iteminfo', 'armorinfo', 'toolinfo',
  // Gunshop-related
  'guns', 'weapons', 'ammo', 'armor', 'attachments',
  // Market-related
  'store', 'prices', 'offers', 'listings', 'items'
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
 * Optimized to improve response times in groups by caching more aggressively
 * @param {string} command - The command name
 * @param {Array} args - Command arguments
 * @returns {boolean} - Whether the command is cacheable
 */
function isCacheable(command, args) {
  // Always skip these critical commands that should never be cached
  if (UNCACHEABLE_COMMANDS.has(command)) {
    return false;
  }
  
  // Explicitly enable caching for RPG commands that benefit from it
  if (RPG_CACHEABLE_COMMANDS.has(command)) {
    return true;
  }
  
  // Don't cache critical admin commands that change state
  if (command.startsWith('set') || command.startsWith('admin') || 
      command.includes('delete') || command.includes('update') || 
      command.includes('ban') || command.includes('kick')) {
    return false;
  }
  
  // Economy-affecting commands should not be cached
  const economyCommands = [
    'pay', 'transfer', 'buy', 'sell', 'use', 'open', 
    'gamble', 'bet', 'gift', 'trade', 'withdraw', 'deposit'
  ];
  
  if (economyCommands.includes(command)) {
    return false;
  }
  
  // Specifically optimize gunshop commands for fast response
  if (command.includes('gun') || command.includes('weapon')) {
    return true;
  }
  
  // Cache most help/info commands
  if (command.includes('help') || command.includes('info') || 
      command.includes('guide') || command.includes('tutorial')) {
    return true;
  }
  
  // Don't cache direct resource/reward commands
  const resourceCommands = [
    'mine', 'hunt', 'adventure', 'work', 'farm', 'fish', 
    'chop', 'claim', 'reward', 'collect'
  ];
  
  if (resourceCommands.includes(command)) {
    return false;
  }
  
  // Default to cacheable for most commands - more aggressive caching for speed
  return true;
}

/**
 * Gets the appropriate TTL for a command - optimized for better performance
 * @param {string} command - The command name
 * @param {boolean} isGroupCommand - Whether this is a group command
 * @returns {number} - The TTL in milliseconds
 */
function getTTL(command, isGroupCommand) {
  // Static informational content gets longest cache
  if (LONG_CACHE_COMMANDS.has(command)) {
    return DEFAULT_TTL * 8; // 2 hours for static content (increased from 30 minutes)
  }
  
  // RPG commands get intermediate cache duration
  if (RPG_CACHEABLE_COMMANDS.has(command)) {
    return DEFAULT_TTL * 3; // 45 minutes for RPG content (increased from 10 minutes)
  }
  
  // Special case: Shop/market commands get longer cache in groups
  if ((command === 'shop' || command === 'market' || command === 'store') && isGroupCommand) {
    return GROUP_TTL * 2; // 40 minutes for shop data in groups (increased from 15 minutes)
  }
  
  // Gunshop commands get special treatment for very fast responses
  if (command.includes('gun') || command.includes('weapon')) {
    return DEFAULT_TTL * 4; // 1 hour for gunshop commands
  }
  
  // Help/info commands get longer cache times
  if (command.includes('help') || command.includes('info') || command.includes('menu')) {
    return DEFAULT_TTL * 5; // 1 hour 15 minutes for help/info commands
  }
  
  // Default cache times based on context - longer times for better performance
  return isGroupCommand ? GROUP_TTL * 1.5 : DEFAULT_TTL * 1.5; // 50% longer than standard
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
  
  // Skip only extremely large responses (increased limit from 100KB to 250KB)
  if (typeof response === 'string' && response.length > 250000) {
    console.log('[CACHE] Skipping very large response for', command);
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
 * Optimized for memory efficiency and performance
 * @param {boolean} force - Whether to force a more aggressive cleanup
 * @returns {number} - Number of entries removed
 */
function cleanupCache(force = false) {
  const now = Date.now();
  stats.lastCleanup = now;
  
  // Skip full cleanup if total size is well below limit and not forced
  const totalSize = globalCache.size + userCache.size + groupCache.size;
  if (!force && totalSize < MAX_CACHE_SIZE * 0.7) {
    // Only do minimal cleanup instead
    let quickRemoved = 0;
    
    // Remove a sample of expired entries from each cache
    // (checking all entries could be slow with large caches)
    const quickClean = (cache) => {
      // Quick check for expired entries (only check a max of 50 entries)
      let count = 0;
      let removed = 0;
      
      for (const [key, entry] of cache.entries()) {
        if (entry.expires < now) {
          cache.delete(key);
          removed++;
        }
        count++;
        // Only check a subset to keep it fast
        if (count >= 50) break;
      }
      
      return removed;
    };
    
    quickRemoved += quickClean(globalCache);
    quickRemoved += quickClean(userCache);
    quickRemoved += quickClean(groupCache);
    
    if (quickRemoved > 0) {
      stats.size = globalCache.size + userCache.size + groupCache.size;
      console.log(`[MEMORY-MANAGER] Quick cleanup: ${quickRemoved} items removed`);
      return quickRemoved;
    }
  }
  
  // Full cleanup
  console.log('[MEMORY-MANAGER] Running complete cache cleanup');
  
  let entriesRemoved = 0;
  
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
    if ((force || cache.size > MAX_CACHE_SIZE / 3) && cache.size > 100) {
      // Use an array of keys and entries.created for memory efficiency
      const oldestKeys = [];
      let tempEntries = [];
      
      // Collect oldest 20% of entries by creation time
      for (const [key, entry] of cache.entries()) {
        tempEntries.push([key, entry.created]);
        
        // Keep array size manageable with partial sorting
        if (tempEntries.length > 100) {
          // Sort by creation time (ascending)
          tempEntries.sort((a, b) => a[1] - b[1]);
          // Keep only the oldest entries
          tempEntries = tempEntries.slice(0, 50);
        }
      }
      
      // Final sort of temporary entries
      tempEntries.sort((a, b) => a[1] - b[1]);
      
      // Calculate how many to remove (20% of total cache size)
      const toRemove = Math.ceil(cache.size * 0.2);
      
      // Remove the oldest entries (up to the calculated limit)
      for (let i = 0; i < Math.min(toRemove, tempEntries.length); i++) {
        cache.delete(tempEntries[i][0]);
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
  
  console.log(`[MEMORY-MANAGER] Complete cleanup: ${entriesRemoved} items removed`);
  
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