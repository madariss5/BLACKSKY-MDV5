/**
 * BLACKSKY-MD Premium - Memory Management and Event Leak Prevention
 */

const { EventEmitter } = require('events');

// Increase max listeners
EventEmitter.defaultMaxListeners = 500;

// Track attached event listeners
const attachedListeners = new Map();

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

function scheduleMemoryCleanup(intervalMinutes = 30) {
  setInterval(() => {
    console.log('🧹 Running scheduled memory cleanup...');
    performMemoryCleanup();
  }, intervalMinutes * 60 * 1000);
}

function initializeMemoryManager() {
  console.log('🧠 Initializing memory management...');

  // Schedule periodic cleanup
  scheduleMemoryCleanup();

  // Handle process exit
  process.on('exit', () => {
    console.log('Process exiting, cleaning up resources');
    performMemoryCleanup();
  });

  console.log('✅ Memory management initialized');

  return {
    scheduleMemoryCleanup,
    performMemoryCleanup,
    safeOn
  };
}


// Export functions
module.exports = {
  safeOn,
  performMemoryCleanup,
  scheduleMemoryCleanup,
  initializeMemoryManager
};