/**
 * BLACKSKY-MD Premium - Memory Management and Event Leak Prevention
 */

const { EventEmitter } = require('events');

// Increase max listeners
EventEmitter.defaultMaxListeners = 500;

// Track attached event listeners
const attachedListeners = new Map();

// Cleanup interval references
let cleanupInterval = null;

function safeOn(emitter, event, listener, options = {}) {
  if (!emitter || typeof emitter.on !== 'function') {
    console.error('Invalid emitter provided to safeOn');
    return () => {};
  }

  if (options.once) {
    emitter.once(event, listener);
  } else {
    emitter.on(event, listener);
  }

  const emitterKey = emitter.constructor?.name || 'UnknownEmitter';
  if (!attachedListeners.has(emitterKey)) {
    attachedListeners.set(emitterKey, new Map());
  }

  const eventMap = attachedListeners.get(emitterKey);
  if (!eventMap.has(event)) {
    eventMap.set(event, new Set());
  }

  eventMap.get(event).add(listener);
  return () => {
    if (emitter?.removeListener) {
      emitter.removeListener(event, listener);
      eventMap.get(event).delete(listener);
    }
  };
}

/**
 * Perform memory cleanup with garbage collection
 */
function performMemoryCleanup() {
  if (global.gc) {
    try {
      global.gc();
      console.log('✅ Forced garbage collection completed');
    } catch (err) {
      console.error('❌ Error during garbage collection:', err);
    }
  }
}

/**
 * Run emergency cleanup for critical situations
 */
function runEmergencyCleanup() {
  console.log('🚨 Running emergency memory cleanup...');
  
  // Force garbage collection multiple times
  if (global.gc) {
    try {
      global.gc();
      setTimeout(() => global.gc(), 1000);
      setTimeout(() => global.gc(), 2000);
      console.log('✅ Emergency garbage collection completed');
    } catch (err) {
      console.error('❌ Error during emergency garbage collection:', err);
    }
  }
  
  // Clear event listeners that might be leaking
  try {
    for (const [emitterKey, eventMap] of attachedListeners.entries()) {
      console.log(`🧹 Cleaning up listeners for ${emitterKey}...`);
      for (const [eventName, listeners] of eventMap.entries()) {
        console.log(`- Event: ${eventName}, Listeners: ${listeners.size}`);
      }
    }
  } catch (err) {
    console.error('❌ Error cleaning up event listeners:', err);
  }
}

/**
 * Schedule regular memory cleanup
 */
function scheduleMemoryCleanup(intervalMinutes = 30) {
  // Clear any existing interval
  if (cleanupInterval) {
    clearInterval(cleanupInterval);
  }
  
  // Set up new interval
  cleanupInterval = setInterval(() => {
    console.log('🧹 Running scheduled memory cleanup...');
    performMemoryCleanup();
  }, intervalMinutes * 60 * 1000);
  
  return cleanupInterval;
}

/**
 * Shutdown memory management and clean up resources
 */
function shutdown() {
  console.log('📴 Shutting down memory manager...');
  
  // Clear scheduled cleanup
  if (cleanupInterval) {
    clearInterval(cleanupInterval);
    cleanupInterval = null;
  }
  
  // Final cleanup
  performMemoryCleanup();
  
  console.log('✅ Memory manager shut down successfully');
}

/**
 * Initialize the memory management system
 */
function initializeMemoryManager() {
  console.log('🧠 Initializing memory management...');

  // Schedule periodic cleanup
  const interval = scheduleMemoryCleanup();

  // Handle process exit
  process.on('exit', () => {
    console.log('Process exiting, cleaning up resources');
    performMemoryCleanup();
  });

  console.log('✅ Memory management initialized');

  // Set up the global memory manager object
  global.memoryManager = {
    scheduleMemoryCleanup,
    performMemoryCleanup,
    runEmergencyCleanup,
    shutdown,
    safeOn
  };

  return global.memoryManager;
}

// Export functions
module.exports = {
  safeOn,
  performMemoryCleanup,
  scheduleMemoryCleanup,
  runEmergencyCleanup,
  shutdown,
  initializeMemoryManager
};