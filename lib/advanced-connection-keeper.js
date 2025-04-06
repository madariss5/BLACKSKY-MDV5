/**
 * BLACKSKY-MD Premium - Advanced Connection Keeper 
 * Combines best practices from multiple WhatsApp bot implementations
 */

const EventEmitter = require('events');
const fs = require('fs');
const path = require('path');
const { promisify } = require('util');
const os = require('os');

// Configuration
const CONFIG = {
  // Connection check intervals
  heartbeatInterval: 25000,
  connectionCheckInterval: 20000, 
  keepAliveInterval: 45000,
  
  // Reconnection settings
  initialReconnectDelay: 3000,
  maxReconnectDelay: 10000,
  maxReconnectAttempts: 15,
  
  // Memory thresholds
  memoryWarningThreshold: 85,
  memoryCriticalThreshold: 90,
  
  // Session management
  sessionBackupInterval: 300000,
  sessionDir: './sessions',
  backupDir: './sessions-backup'
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
      socketErrorCount: 0,
      lastSocketError: 0
    };
    this.config = CONFIG;

    // Ensure backup directory exists
    if (!fs.existsSync(this.config.backupDir)) {
      fs.mkdirSync(this.config.backupDir, { recursive: true });
    }
  }

  /**
   * Initialize the connection keeper
   * @param {Object} conn - Baileys connection object
   */
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

  /**
   * Set up connection state handlers
   */
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

  /**
   * Set up WebSocket handlers
   */
  setupSocketHandlers() {
    if (!this.conn.ws) return;

    this.conn.ws.on('error', (err) => {
      this.state.socketErrorCount++;
      this.state.lastSocketError = Date.now();
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

    // Reset socket error count periodically
    setInterval(() => {
      if (Date.now() - this.state.lastSocketError > 60000) {
        this.state.socketErrorCount = 0;
      }
    }, 60000);
  }

  /**
   * Start heartbeat mechanism
   */
  startHeartbeat() {
    setInterval(async () => {
      if (!this.state.isConnected) return;

      try {
        // Send presence update
        await this.conn.sendPresenceUpdate('available');
        
        // Send ping to server
        if (this.conn.ws?.readyState === 1) {
          this.conn.ws.send(JSON.stringify(['admin', 'test']));
        }

        this.state.lastHeartbeat = Date.now();
        this.log('Heartbeat sent', 'DEBUG');
      } catch (err) {
        this.log(`Heartbeat error: ${err.message}`, 'ERROR');
        if (this.state.isConnected) {
          this.handleReconnection();
        }
      }
    }, this.config.heartbeatInterval);
  }

  /**
   * Start connection checker
   */
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

  /**
   * Handle reconnection with exponential backoff
   */
  async handleReconnection() {
    if (this.state.isReconnecting) return;
    this.state.isReconnecting = true;

    try {
      this.state.reconnectAttempts++;
      
      // Calculate delay with exponential backoff
      const delay = Math.min(
        this.config.initialReconnectDelay * Math.pow(1.5, this.state.reconnectAttempts - 1),
        this.config.maxReconnectDelay
      );

      this.log(`Reconnection attempt ${this.state.reconnectAttempts} in ${delay}ms`, 'WARN');
      
      await new Promise(resolve => setTimeout(resolve, delay));

      // Try session restore if needed
      if (this.state.reconnectAttempts % 3 === 0) {
        await this.restoreSession();
      }

      // Trigger reconnection
      if (typeof global.reloadHandler === 'function') {
        await global.reloadHandler(true);
      }

      // Wait for connection to reestablish
      await new Promise(resolve => setTimeout(resolve, 5000));

      // Check if reconnection was successful
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

  /**
   * Monitor memory usage
   */
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

  /**
   * Perform memory cleanup
   */
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

  /**
   * Backup session files
   */
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

  /**
   * Restore session from backup
   */
  async restoreSession() {
    try {
      const backups = fs.readdirSync(this.config.backupDir)
        .filter(f => f.startsWith('backup-'))
        .sort()
        .reverse();

      if (backups.length === 0) return;

      const latestBackup = backups[0];
      const backupPath = path.join(this.config.backupDir, latestBackup);

      if (!fs.existsSync(this.config.sessionDir)) {
        fs.mkdirSync(this.config.sessionDir, { recursive: true });
      }

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

  /**
   * Log helper with timestamp
   */
  log(message, level = 'INFO') {
    const timestamp = new Date().toISOString();
    console.log(`[KEEPER][${level}][${timestamp}] ${message}`);
  }
}

// Export singleton instance
const keeper = new AdvancedConnectionKeeper();
module.exports = keeper;