/**
 * BLACKSKY-MD Premium - Advanced Connection Keeper
 * Enhanced version with best practices from multiple implementations
 */

const EventEmitter = require('events');
const fs = require('fs');
const path = require('path');
const { promisify } = require('util');
const os = require('os');

// Optimal configuration for stable connection
const CONFIG = {
  heartbeatInterval: 25000, // 25 seconds
  connectionCheckInterval: 20000, // 20 seconds
  keepAliveInterval: 45000, // 45 seconds
  initialReconnectDelay: 1000, // Start with 1 second
  maxReconnectDelay: 10000, // Max 10 seconds
  maxReconnectAttempts: 50, // More attempts before giving up
  memoryWarningThreshold: 75, // 75% memory usage warning
  memoryCriticalThreshold: 85, // 85% critical threshold
  sessionBackupInterval: 300000, // 5 minutes
  sessionDir: './sessions',
  backupDir: './sessions-backup',
  socketTimeout: 60000, // 1 minute socket timeout
  debug: true
};

class AdvancedConnectionKeeper {
  constructor() {
    this.conn = null;
    this.state = {
      isConnected: false,
      lastHeartbeat: 0,
      reconnectAttempts: 0,
      lastBackup: 0,
      isReconnecting: false,
      socketErrorCount: 0
    };
    this.config = CONFIG;

    // Create backup directory
    if (!fs.existsSync(this.config.backupDir)) {
      fs.mkdirSync(this.config.backupDir, { recursive: true });
    }
  }

  init(conn) {
    if (!conn) {
      this.log('No connection object provided', 'ERROR');
      return false;
    }

    this.conn = conn;
    this.setupConnectionHandlers();
    this.startHeartbeat();
    this.startConnectionChecker();
    this.setupSocketHandlers();
    this.setupMemoryMonitoring();

    this.log('Advanced connection keeper initialized', 'SUCCESS');
    return true;
  }

  setupConnectionHandlers() {
    this.conn.ev.on('connection.update', async (update) => {
      const { connection, lastDisconnect } = update;

      if (connection === 'open') {
        this.state.isConnected = true;
        this.state.reconnectAttempts = 0;
        this.state.lastHeartbeat = Date.now();
        this.log('Connection opened successfully', 'SUCCESS');
        await this.backupSession();
      }

      if (connection === 'close') {
        this.state.isConnected = false;
        const statusCode = lastDisconnect?.error?.output?.statusCode;
        const shouldReconnect = statusCode !== 401 && statusCode !== 403;

        if (shouldReconnect) {
          this.log(`Connection closed (${statusCode}), attempting reconnection`, 'WARN');
          this.handleReconnection();
        } else {
          this.log('Authentication error, manual intervention required', 'ERROR');
        }
      }
    });
  }

  setupSocketHandlers() {
    if (!this.conn.ws) return;

    this.conn.ws.on('error', (err) => {
      this.state.socketErrorCount++;
      this.log(`WebSocket error: ${err.message}`, 'ERROR');

      if (this.state.socketErrorCount >= 3) {
        this.handleReconnection();
      }
    });

    this.conn.ws.on('close', () => {
      if (this.state.isConnected) {
        this.log('WebSocket closed unexpectedly', 'WARN');
        this.handleReconnection();
      }
    });

    setInterval(() => {
      this.state.socketErrorCount = 0;
    }, 60000);
  }

  startHeartbeat() {
    setInterval(async () => {
      if (!this.state.isConnected) return;

      try {
        await this.conn.sendPresenceUpdate('available');
        this.state.lastHeartbeat = Date.now();
      } catch (err) {
        this.log(`Heartbeat error: ${err.message}`, 'ERROR');
        this.handleReconnection();
      }
    }, this.config.heartbeatInterval);
  }

  async handleReconnection() {
    if (this.state.isReconnecting) return;
    this.state.isReconnecting = true;

    try {
      this.state.reconnectAttempts++;

      const delay = Math.min(
        this.config.initialReconnectDelay * Math.pow(1.5, this.state.reconnectAttempts - 1),
        this.config.maxReconnectDelay
      );

      this.log(`Reconnection attempt ${this.state.reconnectAttempts} in ${delay}ms`, 'WARN');

      await new Promise(resolve => setTimeout(resolve, delay));

      if (this.state.reconnectAttempts % 3 === 0) {
        await this.restoreSession();
      }

      if (typeof global.reloadHandler === 'function') {
        await global.reloadHandler(true);
      }

      await new Promise(resolve => setTimeout(resolve, 5000));

      if (this.conn.user && this.conn.ws?.readyState === 1) {
        this.log('Reconnection successful', 'SUCCESS');
        this.state.isConnected = true;
        this.state.reconnectAttempts = 0;
      }
    } catch (err) {
      this.log(`Reconnection error: ${err.message}`, 'ERROR');
    } finally {
      this.state.isReconnecting = false;
    }
  }

  startConnectionChecker() {
    setInterval(async () => {
      if (!this.state.isConnected) return;

      const now = Date.now();

      // Check heartbeat age
      if (now - this.state.lastHeartbeat > this.config.keepAliveInterval) {
        this.log('Connection appears stale, initiating reconnection', 'WARN');
        this.handleReconnection();
        return;
      }

      // Verify connection is responsive
      try {
        await this.conn.sendPresenceUpdate('available');
      } catch (err) {
        this.log('Connection check failed, initiating reconnection', 'WARN');
        this.handleReconnection();
      }

      // Backup session periodically
      if (now - this.state.lastBackup > this.config.sessionBackupInterval) {
        await this.backupSession();
      }
    }, this.config.connectionCheckInterval);
  }


  setupMemoryMonitoring() {
    setInterval(() => {
      const memoryUsage = process.memoryUsage();
      const heapUsedMB = Math.round(memoryUsage.heapUsed / 1024 / 1024);
      const heapTotalMB = Math.round(memoryUsage.heapTotal / 1024 / 1024);
      const usagePercent = Math.round((heapUsedMB / heapTotalMB) * 100);

      if (usagePercent > this.config.memoryCriticalThreshold) {
        this.log(`Critical memory usage: ${usagePercent}%, initiating cleanup`, 'ERROR');
        this.performMemoryCleanup();
      } else if (usagePercent > this.config.memoryWarningThreshold) {
        this.log(`High memory usage: ${usagePercent}%`, 'WARN');
      }
    }, 60000);
  }

  async performMemoryCleanup() {
    try {
      // Clear message cache
      if (this.conn.store) {
        this.conn.store.messages = {};
      }

      // Force garbage collection if available
      if (global.gc) {
        global.gc();
      }

      this.log('Memory cleanup completed', 'SUCCESS');
    } catch (err) {
      this.log(`Memory cleanup error: ${err.message}`, 'ERROR');
    }
  }

  async backupSession() {
    try {
      if (!fs.existsSync(this.config.sessionDir)) return;

      const timestamp = Date.now();
      const backupPath = path.join(this.config.backupDir, `backup-${timestamp}`);
      fs.mkdirSync(backupPath, { recursive: true });

      const files = fs.readdirSync(this.config.sessionDir)
        .filter(f => f.endsWith('.json'));

      for (const file of files) {
        fs.copyFileSync(
          path.join(this.config.sessionDir, file),
          path.join(backupPath, file)
        );
      }

      this.state.lastBackup = Date.now();
      this.log('Session backup completed', 'SUCCESS');
    } catch (err) {
      this.log(`Session backup error: ${err.message}`, 'ERROR');
    }
  }

  async restoreSession() {
    try {
      const backups = fs.readdirSync(this.config.backupDir)
        .filter(f => f.startsWith('backup-'))
        .sort()
        .reverse();

      if (backups.length === 0) return;

      const latestBackup = backups[0];
      const backupPath = path.join(this.config.backupDir, latestBackup);

      const files = fs.readdirSync(backupPath);
      for (const file of files) {
        fs.copyFileSync(
          path.join(backupPath, file),
          path.join(this.config.sessionDir, file)
        );
      }

      this.log('Session restored from backup', 'SUCCESS');
    } catch (err) {
      this.log(`Session restore error: ${err.message}`, 'ERROR');
    }
  }

  log(message, level = 'INFO') {
    const timestamp = new Date().toISOString();
    console.log(`[KEEPER][${level}][${timestamp}] ${message}`);
  }
}

const keeper = new AdvancedConnectionKeeper();
module.exports = keeper;