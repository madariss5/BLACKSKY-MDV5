/**
 * BLACKSKY-MD Premium - Memory Management and Event Leak Prevention
 * 
 * This module helps prevent memory leaks and properly handles events
 * for stable 24/7 operation, especially on Heroku.
 */

// Increase the default max listeners to prevent warnings
require('events').EventEmitter.defaultMaxListeners = 500;

// Track attached event listeners for cleanup
const attachedListeners = new Map();

/**
 * Safely attach an event listener with automatic cleanup tracking
 * @param {EventEmitter} emitter - The event emitter object
 * @param {string} event - Event name
 * @param {Function} listener - Event callback function
 * @param {Object} options - Optional parameters (once, prepend, etc.)
 * @returns {Function} - Remove function for manual cleanup
 */
function safeOn(emitter, event, listener, options = {}) {
  if (!emitter || typeof emitter.on !== 'function') {
    console.error('Invalid emitter provided to safeOn');
    return () => {};
  }

  // Use once if specified
  if (options.once) {
    emitter.once(event, listener);
  } else {
    emitter.on(event, listener);
  }

  // Track this listener for cleanup
  const emitterKey = emitter.constructor?.name || 'UnknownEmitter';
  if (!attachedListeners.has(emitterKey)) {
    attachedListeners.set(emitterKey, new Map());
  }

  const eventMap = attachedListeners.get(emitterKey);
  if (!eventMap.has(event)) {
    eventMap.set(event, new Set());
  }

  const listenerSet = eventMap.get(event);
  listenerSet.add(listener);

  // Return remove function
  return () => {
    if (emitter && typeof emitter.removeListener === 'function') {
      emitter.removeListener(event, listener);
      listenerSet.delete(listener);
    }
  };
}

/**
 * Clean up all listeners for a specific emitter
 * @param {EventEmitter} emitter - The event emitter to clean
 */
function cleanupEmitterListeners(emitter) {
  if (!emitter || typeof emitter.removeListener !== 'function') {
    return;
  }

  const emitterKey = emitter.constructor?.name || 'UnknownEmitter';
  if (!attachedListeners.has(emitterKey)) {
    return;
  }

  const eventMap = attachedListeners.get(emitterKey);
  for (const [event, listeners] of eventMap.entries()) {
    for (const listener of listeners) {
      emitter.removeListener(event, listener);
    }
    listeners.clear();
  }
  eventMap.clear();
}

/**
 * Handle unhandled promise rejections
 */
function setupUnhandledRejectionHandler() {
  process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Promise Rejection:', reason);

    // Attempt to handle baileys-specific connection errors
    if (reason && reason.isBoom && reason.output && 
        reason.output.payload && reason.output.payload.message === 'Connection Closed') {
      console.log('Baileys connection closed - will reconnect automatically');
      // The reconnection is handled by connection-keeper
      return;
    }

    // Handle WebSocket close code 1006 (connection closed abnormally)
    if (reason === 1006) {
      console.log('WebSocket closed abnormally (1006) - will reconnect automatically');
      return;
    }

    // Log other unhandled rejections but don't crash the process
    console.error('Unhandled rejection details:', reason instanceof Error ? reason.stack : reason);
  });
}

/**
 * Perform a memory cleanup to prevent leaks
 */
function performMemoryCleanup() {
  if (global.gc && typeof global.gc === 'function') {
    try {
      global.gc();
      console.log('Forced garbage collection completed');
    } catch (err) {
      console.error('Error during forced garbage collection:', err);
    }
  }
}

/**
 * Schedule periodic memory cleanup
 * @param {number} intervalMinutes - Cleanup interval in minutes
 */
function scheduleMemoryCleanup(intervalMinutes = 30) {
  setInterval(() => {
    console.log('Performing scheduled memory cleanup');
    performMemoryCleanup();
  }, intervalMinutes * 60 * 1000);
}

/**
 * Initialize memory management
 */
function initialize() {
  // Increase max listeners
  require('events').EventEmitter.defaultMaxListeners = 500;

  // Setup unhandled rejection handler
  setupUnhandledRejectionHandler();

  // Schedule memory cleanup
  scheduleMemoryCleanup();

  // Handle process exit to clean up resources
  process.on('exit', () => {
    console.log('Process exiting, cleaning up resources');
    // Clean up any resources here
  });

  console.log('Memory management initialized');
}

// Export functions
module.exports = {
  safeOn,
  cleanupEmitterListeners,
  performMemoryCleanup,
  scheduleMemoryCleanup,
  initialize
};
function initializeMemoryManagement() {
  const memoryLimit = process.env.MEMORY_LIMIT || 512; // MB

  // Set up memory monitoring
  setInterval(() => {
    const used = process.memoryUsage();
    if (used.heapUsed > memoryLimit * 1024 * 1024) {
      console.log('🧹 Running memory cleanup...');
      global.gc && global.gc();
    }
  }, 30000);

  // Handle memory pressure events
  process.on('memoryUsageHigh', () => {
    console.log('⚠️ High memory usage detected, cleaning up...');
    global.gc && global.gc();
  });

  return true;
}

module.exports = { initializeMemoryManagement };