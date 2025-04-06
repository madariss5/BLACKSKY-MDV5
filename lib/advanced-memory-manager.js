/**
 * Advanced Memory Manager
 * Optimized for WhatsApp bots with comprehensive memory management
 */

const EventEmitter = require('events');
const os = require('os');
const fs = require('fs');
const path = require('path');
const { performance } = require('perf_hooks');
const chalk = require('chalk');

const MEMORY_CONFIG = {
  memoryThresholdWarning: 60,
  memoryThresholdCritical: 70,
  emergencyThreshold: 75,
  checkInterval: 45000,
  cleanupDelay: 1000,
  maxMessageCache: 100,
  maxMediaCache: 50,
  gcInterval: 120000
};

class MemoryManager extends EventEmitter {
  constructor() {
    super();
    this.state = {
      lastCleanup: null,
      warningCount: 0,
      emergencyCount: 0,
      isPerformingCleanup: false,
      totalCleanups: 0,
      lastCleanupTime: 0,
      totalCacheHits: 0,
      totalCacheMisses: 0,
      criticalMemoryEvents: 0,

    };
    this.caches = new Map();
    this.memorySnapshots = [];
    this.startTime = performance.now();

    this.startMonitoring();
  }

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

  startMonitoring() {
    setInterval(() => {
      try {
        const usage = this.getMemoryUsage();
        this.emit('memory:stats', usage);

        if (usage.percentageUsed > MEMORY_CONFIG.emergencyThreshold) {
          this.handleEmergencyCleanup();
        } else if (usage.percentageUsed > MEMORY_CONFIG.memoryThresholdCritical) {
          this.handleCriticalCleanup();
        } else if (usage.percentageUsed > MEMORY_CONFIG.memoryThresholdWarning) {
          this.handleWarningCleanup();
        }
      } catch (err) {
        console.error('Memory monitoring error:', err);
      }
    }, MEMORY_CONFIG.checkInterval);

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


  createCache(cacheName, cacheOptions = {}) {
    if (this.caches.has(cacheName)) {
      return this.caches.get(cacheName);
    }

    const options = {
      ttl: 5 * 60 * 1000, // Default TTL: 5 minutes
      maxItems: 1000, // Maximum items in each cache
      cleanupOnFull: true,
      ...cacheOptions,
    };

    const store = new Map();
    const meta = {
      hits: 0,
      misses: 0,
      evictions: 0,
      created: Date.now(),
      lastCleanup: 0,
    };

    const cacheOps = {
      get: async (key, fallbackFn = null) => {
          // ... (original get function implementation)
      },
      set: (key, value, customTTL = null) => {
          // ... (original set function implementation)
      },
      delete: (key) => {
          // ... (original delete function implementation)
      },
      clear: () => {
          // ... (original clear function implementation)
      },
      cleanup: (count = 0) => {
          // ... (original cleanup function implementation)
      },
      getStats: () => {
          // ... (original getStats function implementation)
      },
    };

    this.caches.set(cacheName, cacheOps);
    return cacheOps;
  }

  async handleWarningCleanup() {
    if (this.state.isPerformingCleanup) return;
    this.state.isPerformingCleanup = true;

    try {
      if (global.conn?.chats) {
        for (let chat of Object.values(global.conn.chats)) {
          if (chat.messages?.length > MEMORY_CONFIG.maxMessageCache) {
            chat.messages = chat.messages.slice(-MEMORY_CONFIG.maxMessageCache);
          }
        }
      }

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

      this.emit('cleanup:warning');
      this.state.totalCleanups++;
      this.state.lastCleanupTime = Date.now();
    } catch (err) {
      console.error('Warning cleanup error:', err);
    } finally {
      this.state.isPerformingCleanup = false;
    }
  }

  async handleCriticalCleanup() {
    if (this.state.isPerformingCleanup) return;
    this.state.isPerformingCleanup = true;

    try {
      if (global.conn?.chats) {
        for (let chat of Object.values(global.conn.chats)) {
          if (chat.messages?.length > 50) {
            chat.messages = chat.messages.slice(-50);
          }
        }
      }

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

      Object.keys(require.cache).forEach(key => {
        if (key.includes('node_modules') && 
            !key.includes('baileys') && 
            !key.includes('ws')) {
          delete require.cache[key];
        }
      });

      if (global.gc) global.gc();
      this.state.totalCleanups++;
      this.state.lastCleanupTime = Date.now();
      this.emit('cleanup:critical');
    } catch (err) {
      console.error('Critical cleanup error:', err);
    } finally {
      this.state.isPerformingCleanup = false;
    }
  }

  async handleEmergencyCleanup() {
    if (this.state.isPerformingCleanup) return;
    console.log('🚨 Performing emergency memory cleanup...');
    this.state.isPerformingCleanup = true;

    try {
      if (global.conn?.chats) {
        for (let chat of Object.values(global.conn.chats)) {
          if (chat.messages?.length > 20) {
            chat.messages = chat.messages.slice(-20);
          }
        }
      }

      for (const key in require.cache) {
        if (!key.includes('baileys') && !key.includes('whatsapp')) {
          delete require.cache[key];
        }
      }

      if (global.gc) {
        try {
          global.gc();
          setTimeout(global.gc, 500);
        } catch (err) {
          console.error('GC error:', err);
        }
      }
      this.state.totalCleanups++;
      this.state.lastCleanupTime = Date.now();
      this.emit('cleanup:emergency');
    } catch (err) {
      console.error('Emergency cleanup error:', err);
    } finally {
      this.state.isPerformingCleanup = false;
    }
  }

  getAllCacheStats() {
    const stats = {};
    for (const [cacheName, cache] of this.caches.entries()) {
      stats[cacheName] = cache.getStats();
    }
    return stats;
  }

  getState() {
    return {
      ...this.state,
      uptime: Math.floor((performance.now() - this.startTime) / 1000),
      cacheCount: this.caches.size,
      snapshotCount: this.memorySnapshots.length,
    };
  }

  shutdown() {
    this.removeAllListeners();
  }
}

module.exports = {
  initMemoryManager: () => new MemoryManager(),
  getMemoryUsage: () => {
      const mem = new MemoryManager().getMemoryUsage();
      return mem;
  },
  runCleanup: () => {
      const mm = new MemoryManager();
      mm.handleWarningCleanup()
  },
  runEmergencyCleanup: () => {
      const mm = new MemoryManager();
      mm.handleEmergencyCleanup()
      return true;
  }
};