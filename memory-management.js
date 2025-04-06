/**
 * BLACKSKY-MD Premium - Memory Management and Event Leak Prevention
 */

const { EventEmitter } = require('events');
const fs = require('fs');
const path = require('path');

// Increase max listeners
EventEmitter.defaultMaxListeners = 500;

// Track attached event listeners
const attachedListeners = new Map();

// Configuration 
const MEMORY_CONFIG = {
  memoryThresholdWarning: 70, // Memory usage percentage for warning
  memoryThresholdCritical: 80, // Memory usage percentage for critical warning
  emergencyThreshold: 85, // Emergency cleanup at 85%
  checkInterval: 60000, // Check every 60 seconds
  cleanupDelay: 1000, // Delay between cleanups
  maxMessageCache: 100, // Max messages per chat
  maxMediaCache: 50, // Max media files cached
  gcInterval: 120000 // Force GC every 2 minutes if enabled
};

class MemoryManager extends EventEmitter {
  constructor() {
    super();
    this.state = {
      lastCleanup: null,
      warningCount: 0,
      emergencyCount: 0,
      isPerformingCleanup: false
    };

    // Initialize monitoring
    this.startMonitoring();
  }

  // Get current memory usage
  getMemoryUsage() {
    const used = process.memoryUsage();
    return {
      heapUsed: Math.round(used.heapUsed / 1024 / 1024),
      heapTotal: Math.round(used.heapTotal / 1024 / 1024),
      rss: Math.round(used.rss / 1024 / 1024),
      external: Math.round(used.external / 1024 / 1024),
      percentageUsed: Math.round((used.heapUsed / used.heapTotal) * 100)
    };
  }

  // Start memory monitoring
  startMonitoring() {
    setInterval(() => {
      try {
        const usage = this.getMemoryUsage();

        // Emit memory stats
        this.emit('memory:stats', usage);

        // Check thresholds
        if (usage.percentageUsed > MEMORY_CONFIG.emergencyThreshold) {
          this.handleEmergencyCleanup();
        } else if (usage.percentageUsed > MEMORY_CONFIG.criticalThreshold) {
          this.handleCriticalCleanup();
        } else if (usage.percentageUsed > MEMORY_CONFIG.warningThreshold) {
          this.handleWarningCleanup();
        }
      } catch (err) {
        console.error('Memory monitoring error:', err);
      }
    }, MEMORY_CONFIG.checkInterval);

    // Set up GC interval if available
    if (global.gc) {
      setInterval(() => {
        try {
          global.gc();
          this.emit('memory:gc');
        } catch (err) {
          console.error('GC error:', err);
        }
      }, MEMORY_CONFIG.gcInterval);
    }
  }

  // Handle warning level cleanup
  async handleWarningCleanup() {
    if (this.state.isPerformingCleanup) return;

    this.state.isPerformingCleanup = true;
    this.state.warningCount++;

    try {
      // Clear message caches
      if (global.conn?.chats) {
        for (let chat of Object.values(global.conn.chats)) {
          if (chat.messages?.length > MEMORY_CONFIG.maxMessageCache) {
            chat.messages = chat.messages.slice(-MEMORY_CONFIG.maxMessageCache);
          }
        }
      }

      // Clear media cache
      const tempDir = path.join(process.cwd(), 'temp');
      if (fs.existsSync(tempDir)) {
        const files = fs.readdirSync(tempDir);
        if (files.length > MEMORY_CONFIG.maxMediaCache) {
          files
            .map(f => ({file: f, time: fs.statSync(path.join(tempDir, f)).mtime}))
            .sort((a, b) => a.time - b.time)
            .slice(0, files.length - MEMORY_CONFIG.maxMediaCache)
            .forEach(f => {
              try {
                fs.unlinkSync(path.join(tempDir, f.file));
              } catch (err) {
                console.error('Error deleting file:', err);
              }
            });
        }
      }

      this.emit('memory:cleanup', 'warning');
    } catch (err) {
      console.error('Warning cleanup error:', err);
    } finally {
      this.state.isPerformingCleanup = false;
    }
  }

  // Handle critical level cleanup
  async handleCriticalCleanup() {
    if (this.state.isPerformingCleanup) return;

    this.state.isPerformingCleanup = true;

    try {
      // More aggressive cleanup
      if (global.conn?.chats) {
        // Clear all but last 50 messages
        for (let chat of Object.values(global.conn.chats)) {
          if (chat.messages?.length > 50) {
            chat.messages = chat.messages.slice(-50);
          }
        }
      }

      // Clear all temp files
      const tempDir = path.join(process.cwd(), 'temp');
      if (fs.existsSync(tempDir)) {
        fs.readdirSync(tempDir).forEach(file => {
          try {
            fs.unlinkSync(path.join(tempDir, file));
          } catch (err) {
            console.error('Error deleting temp file:', err);
          }
        });
      }

      // Clear module cache
      Object.keys(require.cache).forEach(key => {
        if (key.includes('node_modules') && 
            !key.includes('baileys') && 
            !key.includes('ws')) {
          delete require.cache[key];
        }
      });

      if (global.gc) global.gc();

      this.emit('memory:cleanup', 'critical');
    } catch (err) {
      console.error('Critical cleanup error:', err);
    } finally {
      this.state.isPerformingCleanup = false;
    }
  }

  // Handle emergency level cleanup
  async handleEmergencyCleanup() {
    if (this.state.isPerformingCleanup) return;

    console.log('🚨 Performing emergency memory cleanup...');

    // Clear message caches
    if (global.conn?.chats) {
      for (let chat of Object.values(global.conn.chats)) {
        if (chat.messages?.length > 20) {
          chat.messages = chat.messages.slice(-20);
        }
      }
    }

    // Clear module cache
    for (const key in require.cache) {
      if (!key.includes('baileys') && !key.includes('whatsapp')) {
        delete require.cache[key];
      }
    }

    // Force garbage collection
    if (global.gc) {
      try {
        global.gc();
        setTimeout(global.gc, 500);
      } catch (err) {
        console.error('GC error:', err);
      }
    }
  }
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


// Export singleton instance
const memoryManager = new MemoryManager();

// Export functions (retaining original safeOn)
module.exports = {
  safeOn,
  performMemoryCleanup: memoryManager.handleWarningCleanup,
  scheduleMemoryCleanup: () => {}, //Removed as handled internally by MemoryManager
  runEmergencyCleanup: memoryManager.handleEmergencyCleanup,
  shutdown: memoryManager.removeAllListeners,
  initializeMemoryManager: () => {
    console.log('🧠 Initializing memory management...');
    //Removed process exit listener as handled internally
    console.log('✅ Memory management initialized');
    return memoryManager;
  },
  getMemoryUsage: memoryManager.getMemoryUsage
};