/**
 * BLACKSKY-MD Premium - Handler Optimizations
 * 
 * This module enhances the bot's message handler with:
 * 1. Response caching for frequent commands
 * 2. Parallel message processing for increased throughput
 * 3. Optimized command matching for faster command detection
 * 4. Performance tracking and metrics collection
 */

// Core dependencies
const { performance } = require('perf_hooks');

// Try to load optimizer module
let botOptimizer;
try {
  botOptimizer = require('./optimize-bot.js');
  console.log('✅ Bot optimizer loaded for handler optimization');
} catch (err) {
  console.error('⚠️ Failed to load bot optimizer, handler will run without optimizations:', err);
  botOptimizer = null;
}

// Optimization state tracking
const optimizationState = {
  isOptimized: false,
  patternOptimizationApplied: false,
  originalHandler: null,
  optimizedPatterns: {},
  processingTimes: {},
};

/**
 * Initialize handler optimizations
 */
function initializeOptimizations() {
  try {
    // Skip if already initialized or optimizer not available
    if (optimizationState.isOptimized || !botOptimizer) {
      return false;
    }
    
    console.log('🔧 Initializing handler optimizations...');
    
    // Initialize the bot optimizer
    botOptimizer.initializeOptimizations();
    
    // Check if global.conn exists
    if (global.conn && typeof global.conn.handler === 'function') {
      // Store original handler
      optimizationState.originalHandler = global.conn.handler;
      
      // Create optimized handler
      global.conn.handler = createOptimizedHandler(global.conn.handler);
      
      console.log('✅ Handler optimization complete');
      optimizationState.isOptimized = true;
    } else {
      console.log('⚠️ Global connection not found, handler optimizations pending');
    }
    
    return optimizationState.isOptimized;
  } catch (err) {
    console.error('❌ Error initializing handler optimizations:', err);
    return false;
  }
}

/**
 * Create an optimized message handler wrapper around the original handler
 * @param {Function} originalHandler - The original message handler function
 * @returns {Function} - The optimized handler function
 */
function createOptimizedHandler(originalHandler) {
  // Return the optimized handler function
  return async function optimizedHandler(chatUpdate) {
    try {
      // Skip if already processed or no valid messages
      if (
        chatUpdate._OPTIMIZED_PROCESSED ||
        !chatUpdate || 
        !chatUpdate.messages || 
        !Array.isArray(chatUpdate.messages) ||
        chatUpdate.messages.length === 0
      ) {
        return await originalHandler(chatUpdate);
      }
      
      // Mark as processed to avoid recursive handling
      chatUpdate._OPTIMIZED_PROCESSED = true;
      
      // Try parallel processing first for multi-message updates
      if (chatUpdate.messages.length > 1 && botOptimizer) {
        const parallelProcessed = await botOptimizer.processMessageParallel(chatUpdate);
        if (parallelProcessed) {
          return; // Already processed in parallel, no need to continue
        }
      }
      
      // Extract the main message
      const m = chatUpdate.messages[0];
      
      // If not a text message, process normally
      if (!m.message || !m.message.conversation && !m.message.extendedTextMessage) {
        return await originalHandler(chatUpdate);
      }
      
      // Extract command from message
      const text = (m.message.conversation || (m.message.extendedTextMessage?.text || ''));
      
      // Skip processing if not a command (doesn't start with command prefix)
      if (!text.startsWith('.')) {
        return await originalHandler(chatUpdate);
      }
      
      // Extract command and args
      const [command, ...args] = text.slice(1).trim().split(' ');
      
      // Skip if no command
      if (!command || command.length === 0) {
        return await originalHandler(chatUpdate);
      }
      
      // Try to get cached response if available
      if (botOptimizer) {
        const cachedResponse = botOptimizer.getCachedResponse(m, command, args);
        if (cachedResponse) {
          // Process cached response
          return cachedResponse;
        }
      }
      
      // Measure performance of command execution
      const startTime = performance.now();
      
      // Process message with original handler
      const result = await originalHandler(chatUpdate);
      
      // Calculate processing time
      const endTime = performance.now();
      const processingTime = endTime - startTime;
      
      // Update processing time stats
      if (!optimizationState.processingTimes[command]) {
        optimizationState.processingTimes[command] = [];
      }
      optimizationState.processingTimes[command].push(processingTime);
      
      // Only keep the last 10 processing times
      if (optimizationState.processingTimes[command].length > 10) {
        optimizationState.processingTimes[command].shift();
      }
      
      // Calculate average processing time
      const avgProcessingTime = optimizationState.processingTimes[command].reduce((a, b) => a + b, 0) / 
        optimizationState.processingTimes[command].length;
      
      // Cache response if appropriate
      if (botOptimizer && result && processingTime > 100) {
        botOptimizer.cacheResponse(m, command, args, result, processingTime);
      }
      
      // If this command consistently takes a long time to process,
      // log for potential optimization
      if (avgProcessingTime > 500 && optimizationState.processingTimes[command].length >= 3) {
        console.log(`[OPTIMIZATION] Command '${command}' is slow (avg: ${Math.round(avgProcessingTime)}ms)`);
      }
      
      return result;
    } catch (err) {
      console.error('Error in optimized handler:', err);
      
      // Fall back to original handler on error
      return await originalHandler(chatUpdate);
    }
  };
}

/**
 * Process messages in parallel when appropriate
 * This should be called at the start of the handler function
 * @param {Object} chatUpdate - The chat update object
 * @returns {Boolean} - Whether parallel processing was applied
 */
async function parallelMessageProcessing(chatUpdate) {
  if (!botOptimizer) {
    return false;
  }
  
  return botOptimizer.processMessageParallel(chatUpdate);
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
  if (!botOptimizer) {
    return null;
  }
  
  // Get cached response if available
  const cachedResponse = botOptimizer.getCachedResponse(m, command, args);
  
  // If no cached response, return null
  if (!cachedResponse) {
    return null;
  }
  
  return cachedResponse;
}

/**
 * Store command response in cache
 * @param {Object} m - Message object
 * @param {string} command - Command that was executed
 * @param {Array} args - Command arguments
 * @param {*} response - Command response to cache
 */
function cacheCommandResponse(m, command, args, response) {
  if (!botOptimizer) {
    return;
  }
  
  // Cache response
  botOptimizer.cacheResponse(m, command, args, response, 500); // Assuming it was worth caching
}

/**
 * Optimize plugin matching for faster command detection
 * @param {Object} plugins - Global plugins object
 * @returns {Object} - Optimized patterns mapping
 */
function optimizePluginPatterns(plugins) {
  if (!botOptimizer || !plugins) {
    return {};
  }
  
  if (!optimizationState.patternOptimizationApplied) {
    botOptimizer.initializePatterns(plugins);
    optimizationState.patternOptimizationApplied = true;
  }
  
  return optimizationState.optimizedPatterns;
}

/**
 * Fast command match using optimized patterns
 * @param {string} command - Command to match
 * @param {string} fullCommand - Full command with parameters
 * @returns {Array} - Array of matching plugin names
 */
function fastCommandMatch(command, fullCommand) {
  if (!botOptimizer) {
    return [];
  }
  
  return botOptimizer.fastCommandLookup(command);
}

// Export the public API
module.exports = {
  initializeOptimizations,
  parallelMessageProcessing,
  optimizeCommandExecution,
  cacheCommandResponse,
  optimizePluginPatterns,
  fastCommandMatch,
};