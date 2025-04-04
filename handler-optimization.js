/**
 * BLACKSKY-MD Premium - Handler Optimization Module
 * 
 * This module optimizes message handling for faster response times
 * by implementing:
 * - Command response caching
 * - Optimized plugin execution
 * - Parallel processing where possible
 * - Memory management optimizations
 */

const ResponseCache = require('./lib/response-cache');
const util = require('util');
const events = require('events');
const os = require('os');

// Setup response cache with appropriate size for device memory
const CACHE_SIZE = os.totalmem() < 2 * 1024 * 1024 * 1024 
  ? 50   // Low memory device (< 2GB): smaller cache
  : 100; // Normal memory: larger cache

// Create command response cache
const commandCache = new ResponseCache({
  maxSize: CACHE_SIZE,
  ttl: 5 * 60 * 1000 // 5 minutes TTL for cached responses
});

// Keep track of ongoing command executions to prevent duplicates
const pendingCommands = new Map();

// Track frequently used commands for optimization
const commandStats = new Map();

// Cache plugin command patterns for faster matching
const pluginCommandPatterns = new Map();

// Initialize optimization module
function initializeOptimizations() {
  console.log(`[OPTIMIZATION] Initializing handler optimizations (cache size: ${CACHE_SIZE})`);
  
  // Increase EventEmitter max listeners if not already increased
  if (events.EventEmitter.defaultMaxListeners < 200) {
    events.EventEmitter.defaultMaxListeners = 200;
    console.log('[OPTIMIZATION] Increased EventEmitter max listeners to 200');
  }
  
  // Enable global optimization flags
  global.handlerOptimizationsEnabled = true;
  global.responseCache = commandCache;
  
  // Schedule periodic cache cleanup
  setInterval(() => {
    const stats = commandCache.getStats();
    console.log(`[OPTIMIZATION] Cache stats: ${stats.size} items, ${stats.hitRate} hit rate`);
    
    // If hit rate is below 30%, consider reducing cache size
    if (parseInt(stats.hitRate) < 30 && stats.size > 20) {
      console.log('[OPTIMIZATION] Low cache hit rate, clearing old items');
      commandCache.clear();
    }
  }, 30 * 60 * 1000); // Every 30 minutes
  
  return true;
}

/**
 * Process messages in parallel when appropriate
 * This should be called at the start of the handler function
 * @param {Object} chatUpdate - The chat update object
 * @returns {Boolean} - Whether parallel processing was applied
 */
async function parallelMessageProcessing(chatUpdate) {
  if (!chatUpdate || !chatUpdate.messages || chatUpdate.messages.length <= 0) {
    return false;
  }
  
  // Skip parallel processing for chats with active bot-related commands (sensitive operations)
  const messages = chatUpdate.messages;
  for (const msg of messages) {
    const chatId = msg.key?.remoteJid;
    if (chatId && pendingCommands.has(chatId)) {
      return false;
    }
  }
  
  // For bulk updates (multiple messages), process them concurrently when safe
  if (messages.length > 1) {
    const isGroupChat = messages[0].key?.remoteJid?.endsWith('@g.us') || false;
    
    // Process non-sensitive group messages in parallel
    if (isGroupChat && messages.length <= 5) {
      try {
        console.log(`[OPTIMIZATION] Processing ${messages.length} messages in parallel`);
        
        // Map messages to promises but don't await - they'll be handled in parallel
        const messagePromises = messages.map(msg => {
          const fakeChatUpdate = {
            messages: [msg],
            type: chatUpdate.type
          };
          // Don't return the promise to avoid blocking
          global.conn.handler(fakeChatUpdate);
          return true;
        });
        
        return true;
      } catch (err) {
        console.error('[OPTIMIZATION] Error in parallel processing:', err);
        return false;
      }
    }
  }
  
  return false;
}

/**
 * Optimize specific command execution with caching
 * @param {Object} m - Message object
 * @param {string} command - Command being executed
 * @param {Array} args - Command arguments
 * @param {Object} plugin - Plugin being executed
 * @returns {Object|null} - Cached response or null if not cached
 */
async function optimizeCommandExecution(m, command, args, plugin) {
  if (!m || !command) return null;
  
  const chatId = m.chat;
  const commandWithArgs = `${command}:${args.join(',')}`;
  const cacheKey = `${chatId}:${commandWithArgs}`;
  
  // Skip caching for commands that should never be cached
  const noCacheCommands = ['exec', 'update', 'restart', 'admin', 'ban', 'unban', 'eval'];
  if (noCacheCommands.some(cmd => command.includes(cmd))) {
    return null;
  }
  
  // Check if this is a frequently used command - track stats
  if (!commandStats.has(command)) {
    commandStats.set(command, 1);
  } else {
    commandStats.set(command, commandStats.get(command) + 1);
  }
  
  // Check cache for quick response
  const cachedResponse = commandCache.get(command, args, chatId);
  if (cachedResponse) {
    console.log(`[OPTIMIZATION] Cache hit for command: ${command}`);
    return cachedResponse;
  }
  
  // Track pending command to prevent duplicates
  pendingCommands.set(cacheKey, Date.now());
  
  // Cache will be set after execution completes
  return null;
}

/**
 * Store command response in cache
 * @param {Object} m - Message object
 * @param {string} command - Command that was executed
 * @param {Array} args - Command arguments
 * @param {*} response - Command response to cache
 */
function cacheCommandResponse(m, command, args, response) {
  if (!m || !command || !response) return;
  
  const chatId = m.chat;
  const commandWithArgs = `${command}:${args.join(',')}`;
  const cacheKey = `${chatId}:${commandWithArgs}`;
  
  // Remove from pending commands
  pendingCommands.delete(cacheKey);
  
  // Skip caching for dynamic or sensitive responses
  if (typeof response === 'object' && response !== null) {
    // Don't cache responses with media or dynamic content
    if (response.image || response.video || response.audio) {
      return;
    }
  }
  
  // Cache the response
  commandCache.set(command, args, chatId, response);
  console.log(`[OPTIMIZATION] Cached response for command: ${command}`);
}

/**
 * Optimize plugin matching for faster command detection
 * @param {Object} plugins - Global plugins object
 * @returns {Object} - Optimized patterns mapping
 */
function optimizePluginPatterns(plugins) {
  if (!plugins) return null;
  
  // Only build cache if it's not populated yet
  if (pluginCommandPatterns.size === 0) {
    console.log('[OPTIMIZATION] Building plugin command patterns cache');
    
    for (const [name, plugin] of Object.entries(plugins)) {
      if (!plugin || plugin.disabled) continue;
      
      if (plugin.command) {
        pluginCommandPatterns.set(name, {
          plugin,
          pattern: plugin.command,
          type: plugin.command instanceof RegExp ? 'regex' : 
                Array.isArray(plugin.command) ? 'array' : 'string'
        });
      }
    }
    
    console.log(`[OPTIMIZATION] Cached ${pluginCommandPatterns.size} plugin patterns`);
  }
  
  return pluginCommandPatterns;
}

/**
 * Fast command match using optimized patterns
 * @param {string} command - Command to match
 * @param {string} fullCommand - Full command with parameters
 * @returns {Array} - Array of matching plugin names
 */
function fastCommandMatch(command, fullCommand) {
  if (!command || pluginCommandPatterns.size === 0) return [];
  
  const matches = [];
  
  for (const [name, data] of pluginCommandPatterns.entries()) {
    const { pattern, type } = data;
    
    let isMatch = false;
    
    if (type === 'regex') {
      isMatch = pattern.test(fullCommand) || pattern.test(command);
    } else if (type === 'array') {
      isMatch = pattern.some(cmd => {
        if (cmd instanceof RegExp) {
          return cmd.test(fullCommand) || cmd.test(command);
        }
        return cmd === command;
      });
    } else if (type === 'string') {
      isMatch = pattern === command;
    }
    
    if (isMatch) {
      matches.push(name);
    }
  }
  
  return matches;
}

// Export all optimization functions
module.exports = {
  initializeOptimizations,
  parallelMessageProcessing,
  optimizeCommandExecution,
  cacheCommandResponse,
  optimizePluginPatterns,
  fastCommandMatch,
  getCommandStats: () => Object.fromEntries(commandStats),
  getCacheStats: () => commandCache.getStats(),
  clearCache: () => commandCache.clear()
};