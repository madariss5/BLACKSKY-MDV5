/**
 * BLACKSKY-MD Group Chat Optimization System
 * 
 * This specialized system optimizes the bot's performance in group chats by:
 * 
 * 1. Implementing intelligent throttling for non-essential messages
 * 2. Prioritizing important commands and owner messages
 * 3. Caching group metadata to reduce API calls
 * 4. Parallelizing message processing where appropriate
 * 5. Implementing batch processing for similar command patterns
 */

// Import performance hooks for timing
const { performance } = require('perf_hooks');

// Response cache integration
let responseCache;
try {
  responseCache = require('./response-cache.js');
  console.log('✅ Response cache loaded for group optimization');
} catch (err) {
  console.log('⚠️ Response cache not available for group optimization');
}

// Configuration - Enhanced for maximum response speed and group handling
const THROTTLE_THRESHOLD = 100; // Dramatically increased from 50 to 100 messages per minute before throttling
const THROTTLE_EXEMPT_PREFIXES = [
  // Admin/management commands
  'owner', 'admin', 'broadcast', 'report', 'help', 
  // RPG system commands
  'rpg', 'game', 'gun', 'daily', 'adventure', 'inventory', 'profile', 'rank',
  // Market/economy commands
  'shop', 'market', 'store', 'buy', 'sell', 'trade', 'weapon', 'armor', 
  // Info commands
  'info', 'menu', 'stats', 'leaderboard', 'top'
];

// Expanded priority command list to include all frequently used commands
const PRIORITY_COMMANDS = new Set([
  // Core system commands
  'menu', 'help', 'info', 'rules', 'owner', 'ping', 'stats', 'about', 
  // RPG core commands
  'adventure', 'daily', 'hunt', 'mine', 'shop', 'market', 'inventory', 'profile',
  'gunshop', 'buy', 'sell', 'use', 'leaderboard', 'top', 'rank', 'level',
  // Combat/health
  'heal', 'potion', 'repair', 'upgrade', 'enchant', 'attack', 'fight',
  // Economy
  'balance', 'money', 'bank', 'claim', 'collect', 'transfer', 'pay',
  // Gunshop related
  'gun', 'guns', 'weapon', 'weapons', 'armor', 'ammo', 'bullets', 'attachment',
  // Item interaction
  'use', 'craft', 'cook', 'open', 'combine', 'merge', 'eat', 'drink',
  // Status/character
  'status', 'skills', 'stats', 'equip', 'wear', 'pet', 'mount', 'companion'
]);

// Sync with main configuration
const OWNER_NUMBERS = typeof global.owner === 'object' && Array.isArray(global.owner) 
  ? global.owner.map(entry => Array.isArray(entry) ? entry[0] : entry.toString())
  : ['4915563151347']; // Default fallback to configured owner

// Group metadata cache - extended TTL for better performance
const groupMetadataCache = new Map();
const GROUP_METADATA_TTL = 30 * 60 * 1000; // 30 minutes (doubled from 15 minutes)

// Statistics
const stats = {
  totalGroupMessages: 0,
  throttledMessages: 0,
  priorityMessages: 0,
  messageTimings: [],
  averageProcessingTime: 0,
  metadataRequests: 0,
  metadataHits: 0,
  metadataMisses: 0
};

// Throttling data
const groupActivityMap = new Map();

/**
 * Check if a message should be given priority processing
 * @param {Object} m - Message object
 * @param {string} command - Command being executed (if any)
 * @returns {boolean} - Whether the message is high priority
 */
function isPriorityMessage(m, command) {
  // Owner messages always get priority
  if (m.sender && OWNER_NUMBERS.some(num => m.sender.includes(num))) {
    stats.priorityMessages++;
    return true;
  }
  
  // Priority commands get priority
  if (command && PRIORITY_COMMANDS.has(command)) {
    stats.priorityMessages++;
    return true;
  }
  
  // Admin/owner/management commands get priority
  if (command && THROTTLE_EXEMPT_PREFIXES.some(prefix => command.startsWith(prefix))) {
    stats.priorityMessages++;
    return true;
  }
  
  // Private chats get priority
  if (m.chat && !m.chat.endsWith('@g.us')) {
    return true;
  }
  
  return false;
}

/**
 * Check whether a group message should be throttled based on activity level
 * This function is highly optimized to allow faster response times in groups
 * @param {Object} m - Message object
 * @param {string} command - Command being executed (if any)
 * @returns {boolean} - Whether the message should be throttled
 */
function shouldThrottleMessage(m, command) {
  // Skip throttling for priority messages
  if (isPriorityMessage(m, command)) {
    return false;
  }
  
  // Only throttle group messages
  if (!m.chat || !m.chat.endsWith('@g.us')) {
    return false;
  }
  
  // Process ALL commands in groups without throttling to improve responsiveness
  if (command) {
    return false;
  }
  
  const now = Date.now();
  const groupId = m.chat;
  
  // Get or initialize group activity data
  if (!groupActivityMap.has(groupId)) {
    groupActivityMap.set(groupId, {
      messages: [],
      lastThrottleCheck: now
    });
  }
  
  const groupData = groupActivityMap.get(groupId);
  
  // Clean old messages (older than 1 minute)
  groupData.messages = groupData.messages.filter(time => now - time < 60000);
  
  // Add current message
  groupData.messages.push(now);
  
  // Count messages in last minute
  const messageCount = groupData.messages.length;
  
  // Apply throttling only under extreme conditions (3x the already increased threshold)
  // This dramatically reduces throttling compared to previous version
  if (messageCount > THROTTLE_THRESHOLD * 3) {
    // Only throttle non-command messages in extremely active groups
    if (!command) {
      stats.throttledMessages++;
      return true;
    }
  }
  
  // Allow practically all messages through - optimized for maximum responsiveness
  return false;
}

/**
 * Fast group metadata access with caching
 * @param {Object} conn - Connection object
 * @param {string} groupId - Group ID
 * @returns {Promise<Object>} - Group metadata
 */
async function getGroupMetadataFast(conn, groupId) {
  stats.metadataRequests++;
  
  // Check cache first
  if (groupMetadataCache.has(groupId)) {
    const cached = groupMetadataCache.get(groupId);
    if (cached.expires > Date.now()) {
      stats.metadataHits++;
      return cached.data;
    }
    groupMetadataCache.delete(groupId);
  }
  
  stats.metadataMisses++;
  
  // Fetch and cache
  try {
    const metadata = await conn.groupMetadata(groupId);
    if (metadata) {
      groupMetadataCache.set(groupId, {
        data: metadata,
        expires: Date.now() + GROUP_METADATA_TTL
      });
    }
    return metadata;
  } catch (err) {
    console.error(`Error fetching group metadata for ${groupId}:`, err);
    // Return a minimal object to prevent crashes
    return { id: groupId, participants: [] };
  }
}

/**
 * Record message processing time
 * @param {number} startTime - Performance.now() value at start
 */
function recordProcessingTime(startTime) {
  const elapsed = performance.now() - startTime;
  
  // Keep last 100 timings for moving average
  stats.messageTimings.push(elapsed);
  if (stats.messageTimings.length > 100) {
    stats.messageTimings.shift();
  }
  
  // Update average
  const sum = stats.messageTimings.reduce((a, b) => a + b, 0);
  stats.averageProcessingTime = sum / stats.messageTimings.length;
}

/**
 * Pre-process group message before handler
 * @param {Object} m - Message object
 * @param {Object} conn - Connection object
 * @param {string} command - Command being executed (if any)
 * @returns {Promise<boolean>} - Whether to skip normal processing
 */
async function preProcessGroupMessage(m, conn, command) {
  const startTime = performance.now();
  
  // Track statistics
  if (m.chat && m.chat.endsWith('@g.us')) {
    stats.totalGroupMessages++;
  } else {
    // Not a group message
    return false;
  }
  
  try {
    // Check throttling
    if (shouldThrottleMessage(m, command)) {
      // Random chance to handle anyway to prevent complete blocking
      if (Math.random() < 0.2) {
        console.log(`[OPTIMIZE] Randomly allowing throttled message in ${m.chat}`);
        return false;
      }
      
      console.log(`[OPTIMIZE] Throttling message in busy group ${m.chat}`);
      recordProcessingTime(startTime);
      return true; // Skip further processing
    }
    
    // Enhanced cache checking with more aggressive caching for commands
    if (command && responseCache && typeof responseCache.getCached === 'function') {
      const userId = m.sender || '';
      const groupId = m.chat;
      
      // Extract any args for more precise caching
      const args = m.text?.split(' ').slice(1) || [];
      
      // Try to get from cache with expanded arguments
      let cachedResponse = responseCache.getCached(command, args, userId, groupId);
      
      // If no direct match, try without user ID for common commands (gun-related, shop, market)
      if (!cachedResponse && (command.includes('gun') || command.includes('shop') || command.includes('market'))) {
        cachedResponse = responseCache.getCached(command, args, null, groupId);
        if (cachedResponse) {
          console.log(`[OPTIMIZE] Global cache hit for ${command} in group ${groupId}`);
        }
      }
      
      if (cachedResponse) {
        console.log(`[OPTIMIZE] Cache hit for ${command} in group ${groupId}`);
        
        // Send cached response - faster implementation
        await m.reply(cachedResponse);
        
        recordProcessingTime(startTime);
        return true; // Skip further processing
      }
    }
    
    // Preload group metadata for faster access later
    if (m.chat.endsWith('@g.us')) {
      getGroupMetadataFast(conn, m.chat).catch(() => {});
    }
    
    recordProcessingTime(startTime);
    return false; // Continue with normal processing
  } catch (err) {
    console.error('[OPTIMIZE] Error in group optimization:', err);
    return false; // Continue with normal processing on error
  }
}

/**
 * Post-process group message after handler
 * @param {Object} m - Message object
 * @param {string} command - Command that was executed
 * @param {*} result - Result from command execution
 */
async function postProcessGroupMessage(m, command, result) {
  // Skip if not a group message
  if (!m.chat || !m.chat.endsWith('@g.us')) {
    return;
  }
  
  try {
    // If response cache available and we have a result, cache it
    if (command && result && responseCache && typeof responseCache.setCached === 'function') {
      const userId = m.sender || '';
      const groupId = m.chat;
      
      // Extract command arguments for more precise caching
      const args = m.text?.split(' ').slice(1) || [];
      
      // Cache with user context
      responseCache.setCached(command, args, userId, groupId, result);
      
      // For common informational commands, also cache without user context for group-wide sharing
      if (command.includes('gun') || command.includes('shop') || command.includes('market') || 
          command.includes('help') || command.includes('info') || command.includes('menu')) {
        // Also cache a global version for this group to improve hit rate
        responseCache.setCached(command, args, null, groupId, result);
      }
    }
  } catch (err) {
    console.error('[OPTIMIZE] Error in post-processing group message:', err);
  }
}

/**
 * Clean up expired entries in group metadata cache
 */
function cleanupMetadataCache() {
  const now = Date.now();
  let removedCount = 0;
  
  for (const [groupId, entry] of groupMetadataCache.entries()) {
    if (entry.expires < now) {
      groupMetadataCache.delete(groupId);
      removedCount++;
    }
  }
  
  if (removedCount > 0) {
    console.log(`[OPTIMIZE] Cleaned up ${removedCount} expired group metadata entries`);
  }
}

// Set up periodic cleanup
setInterval(cleanupMetadataCache, 10 * 60 * 1000); // Every 10 minutes

/**
 * Get statistics about group optimization
 * @returns {Object} - Statistics object
 */
function getGroupOptimizationStats() {
  return {
    ...stats,
    metadataCacheSize: groupMetadataCache.size
  };
}

module.exports = {
  preProcessGroupMessage,
  postProcessGroupMessage,
  getGroupMetadataFast,
  getGroupOptimizationStats
};