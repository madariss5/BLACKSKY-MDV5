
/**
 * Advanced Memory Management System for WhatsApp Bot
 * Combines best practices from multiple implementations
 */

const EventEmitter = require('events');
const fs = require('fs');
const path = require('path');
const os = require('os');

// Increase event listener limit
EventEmitter.defaultMaxListeners = 500;

const MEMORY_CONFIG = {
  warningThreshold: 65,    // First warning level
  criticalThreshold: 75,   // Critical level
  emergencyThreshold: 85,  // Emergency cleanup level
  checkInterval: 30000,    // Check every 30 seconds
  gcInterval: 120000,      // Force GC every 2 minutes if enabled
  maxMessageCache: 100,    // Max messages per chat
  maxMediaCache: 50,       // Max cached media files
  tempFileMaxAge: 3600000, // Delete temp files older than 1 hour
  chatHistoryLimit: 50,    // Messages to keep per chat during cleanup
  moduleExclusions: ['baileys', 'whatsapp', 'ws'] // Don't clear these from cache
};

class MemoryManager extends EventEmitter {
  constructor() {
    super();
    this.state = {
      lastCleanup: null,
      warningCount: 0,
      emergencyCount: 0,
      isPerformingCleanup: false,
      startTime: Date.now(),
      cleanupHistory: []
    };

    this.initializeMonitoring();
  }

  getMemoryUsage() {
    const used = process.memoryUsage();
    const totalMem = os.totalmem();
    const freeMem = os.freemem();
    
    return {
      heapUsed: Math.round(used.heapUsed / 1024 / 1024),
      heapTotal: Math.round(used.heapTotal / 1024 / 1024),
      rss: Math.round(used.rss / 1024 / 1024),
      external: Math.round(used.external / 1024 / 1024),
      percentageUsed: Math.round((used.heapUsed / used.heapTotal) * 100),
      systemTotal: Math.round(totalMem / 1024 / 1024),
      systemFree: Math.round(freeMem / 1024 / 1024),
      systemUsed: Math.round((totalMem - freeMem) / 1024 / 1024)
    };
  }

  async initializeMonitoring() {
    // Regular memory checks
    setInterval(() => this.checkMemoryUsage(), MEMORY_CONFIG.checkInterval);

    // Garbage collection interval
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

    // Regular temp file cleanup
    setInterval(() => this.cleanupTempFiles(), MEMORY_CONFIG.checkInterval * 2);
  }

  async checkMemoryUsage() {
    try {
      const usage = this.getMemoryUsage();
      this.emit('memory:stats', usage);

      if (usage.percentageUsed > MEMORY_CONFIG.emergencyThreshold) {
        await this.performEmergencyCleanup();
      } else if (usage.percentageUsed > MEMORY_CONFIG.criticalThreshold) {
        await this.performCriticalCleanup();
      } else if (usage.percentageUsed > MEMORY_CONFIG.warningThreshold) {
        await this.performRegularCleanup();
      }

      // Keep cleanup history
      this.state.cleanupHistory.push({
        time: Date.now(),
        memoryBefore: usage.heapUsed,
        type: usage.percentageUsed > MEMORY_CONFIG.emergencyThreshold ? 'emergency' : 
              usage.percentageUsed > MEMORY_CONFIG.criticalThreshold ? 'critical' : 'regular'
      });

      // Keep only last 10 entries
      if (this.state.cleanupHistory.length > 10) {
        this.state.cleanupHistory.shift();
      }

    } catch (err) {
      console.error('Memory check error:', err);
    }
  }

  async performRegularCleanup() {
    if (this.state.isPerformingCleanup) return;
    this.state.isPerformingCleanup = true;

    try {
      console.log('📊 Performing regular memory cleanup...');

      // Clean chat messages
      if (global.conn?.chats) {
        for (let chat of Object.values(global.conn.chats)) {
          if (chat.messages?.length > MEMORY_CONFIG.maxMessageCache) {
            chat.messages = chat.messages.slice(-MEMORY_CONFIG.maxMessageCache);
          }
        }
      }

      // Clean temp files
      await this.cleanupTempFiles();

      // Try garbage collection
      if (global.gc) {
        global.gc();
      }

      this.state.lastCleanup = Date.now();
      this.emit('cleanup:regular');
      
    } catch (err) {
      console.error('Regular cleanup error:', err);
    } finally {
      this.state.isPerformingCleanup = false;
    }
  }

  async performCriticalCleanup() {
    if (this.state.isPerformingCleanup) return;
    this.state.isPerformingCleanup = true;

    try {
      console.log('⚠️ Performing critical memory cleanup...');

      // Aggressive chat cleanup
      if (global.conn?.chats) {
        for (let chat of Object.values(global.conn.chats)) {
          if (chat.messages?.length > MEMORY_CONFIG.chatHistoryLimit) {
            chat.messages = chat.messages.slice(-MEMORY_CONFIG.chatHistoryLimit);
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

      // Clear module cache except essential modules
      Object.keys(require.cache).forEach(key => {
        if (!MEMORY_CONFIG.moduleExclusions.some(mod => key.includes(mod))) {
          delete require.cache[key];
        }
      });

      // Force garbage collection
      if (global.gc) {
        global.gc();
        setTimeout(global.gc, 1000);
      }

      this.state.lastCleanup = Date.now();
      this.emit('cleanup:critical');

    } catch (err) {
      console.error('Critical cleanup error:', err);
    } finally {
      this.state.isPerformingCleanup = false;
    }
  }

  async performEmergencyCleanup() {
    if (this.state.isPerformingCleanup) return;
    this.state.isPerformingCleanup = true;
    this.state.emergencyCount++;

    try {
      console.log('🚨 Performing emergency memory cleanup...');

      // Drastic chat cleanup
      if (global.conn?.chats) {
        for (let chat of Object.values(global.conn.chats)) {
          if (chat.messages) {
            // Keep only last 20 messages in emergency
            chat.messages = chat.messages.slice(-20);
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

      // Clear almost all module cache
      Object.keys(require.cache).forEach(key => {
        if (!key.includes('baileys')) {
          delete require.cache[key];
        }
      });

      // Multiple garbage collection passes
      if (global.gc) {
        global.gc();
        setTimeout(global.gc, 500);
        setTimeout(global.gc, 1000);
      }

      this.state.lastCleanup = Date.now();
      this.emit('cleanup:emergency');

    } catch (err) {
      console.error('Emergency cleanup error:', err);
    } finally {
      this.state.isPerformingCleanup = false;
    }
  }

  async cleanupTempFiles() {
    const tempDir = path.join(process.cwd(), 'temp');
    if (!fs.existsSync(tempDir)) return;

    const now = Date.now();
    
    fs.readdirSync(tempDir).forEach(file => {
      const filePath = path.join(tempDir, file);
      try {
        const stats = fs.statSync(filePath);
        if (now - stats.mtimeMs > MEMORY_CONFIG.tempFileMaxAge) {
          fs.unlinkSync(filePath);
        }
      } catch (err) {
        console.error('Error cleaning temp file:', err);
      }
    });
  }

  getState() {
    return {
      ...this.state,
      uptime: Date.now() - this.state.startTime,
      memoryUsage: this.getMemoryUsage(),
      cleanupHistory: this.state.cleanupHistory
    };
  }
}

// Export singleton instance
const memoryManager = new MemoryManager();

module.exports = {
  memoryManager,
  getMemoryUsage: () => memoryManager.getMemoryUsage(),
  getState: () => memoryManager.getState(),
  forceCleanup: () => memoryManager.performRegularCleanup(),
  forceCriticalCleanup: () => memoryManager.performCriticalCleanup(),
  forceEmergencyCleanup: () => memoryManager.performEmergencyCleanup()
};
