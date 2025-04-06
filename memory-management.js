/**
 * BLACKSKY-MD Premium - Memory Management and Event Leak Prevention
 */

const { EventEmitter } = require('events');
const fs = require('fs');
const path = require('path');
const os = require('os');

// Increase max listeners
EventEmitter.defaultMaxListeners = 500;

// Track attached event listeners
const attachedListeners = new Map();

// Configuration 
const MEMORY_CONFIG = {
  warningThreshold: 70,  // 70% memory usage
  criticalThreshold: 85, // 85% memory usage
  checkInterval: 30000,  // Check every 30 seconds
  cleanupDelay: 1000    // Delay between cleanups
};

function getMemoryUsage() {
  const used = process.memoryUsage();
  const total = os.totalmem();
  const free = os.freemem();

  return {
    heapUsed: Math.round(used.heapUsed / 1024 / 1024),
    heapTotal: Math.round(used.heapTotal / 1024 / 1024),
    rss: Math.round(used.rss / 1024 / 1024),
    systemTotal: Math.round(total / 1024 / 1024),
    systemFree: Math.round(free / 1024 / 1024),
    percentUsed: Math.round((used.heapUsed / used.heapTotal) * 100)
  };
}

function performCleanup(emergency = false) {
  if (global.gc) {
    try {
      global.gc();
      console.log('🧹 Garbage collection completed');
    } catch (err) {
      console.error('❌ Garbage collection failed:', err);
    }
  }

  // Clear cached modules
  Object.keys(require.cache).forEach(key => {
    if (!key.includes('node_modules')) {
      delete require.cache[key];
    }
  });

  // Clear message cache if emergency
  if (emergency && global.conn?.chats) {
    for (let chat of Object.values(global.conn.chats)) {
      if (chat.messages) chat.messages.clear();
    }
    console.log('🧹 Cleared message cache');
  }
}

function initMemoryManager() {
  // Initial cleanup
  performCleanup();

  // Set up periodic monitoring
  setInterval(() => {
    const memory = getMemoryUsage();

    if (memory.percentUsed > MEMORY_CONFIG.criticalThreshold) {
      console.log('🚨 Critical memory usage! Performing emergency cleanup...');
      performCleanup(true);
    } else if (memory.percentUsed > MEMORY_CONFIG.warningThreshold) {
      console.log('⚠️ High memory usage! Performing cleanup...');
      performCleanup();
    }
  }, MEMORY_CONFIG.checkInterval);

  console.log('✅ Memory manager initialized');
}


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


// Export functions (retaining original safeOn)
module.exports = {
  safeOn,
  performCleanup,
  initMemoryManager,
  getMemoryUsage
};