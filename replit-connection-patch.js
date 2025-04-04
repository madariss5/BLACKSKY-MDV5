/**
 * Replit-Optimized Connection Handler Patch
 * 
 * This module enhances the WhatsApp connection stability specifically for Replit environment
 * by implementing session management, connection recovery, and notification queuing.
 */

// Import required modules
const fs = require('fs');
const path = require('path');
const { promisify } = require('util');
const { exec } = require('child_process');
const execAsync = promisify(exec);
const os = require('os');
const { Low, JSONFile } = require('./lib/lowdb');

// Configuration
const CONFIG = {
  // How often to check connection status (ms)
  connectionCheckInterval: 60000, 
  
  // Maximum reconnection attempts
  maxReconnectAttempts: 10,
  
  // Base delay between reconnection attempts (ms) 
  reconnectBaseDelay: 5000,
  
  // Session backup interval (ms)
  sessionBackupInterval: 300000, // 5 minutes
  
  // Notification queue processing interval (ms)
  notificationQueueInterval: 10000,
  
  // Session directory
  sessionDir: path.join(process.cwd(), 'sessions'),
  
  // Session backup file
  sessionBackupFile: path.join(process.cwd(), 'sessions', 'session-backup.json'),
  
  // Notification queue file
  notificationQueueFile: path.join(process.cwd(), 'sessions', 'notification-queue.json')
};

// Initialize notification queue
let notificationQueue = [];
const notificationQueueDB = new Low(new JSONFile(CONFIG.notificationQueueFile));

// Load notification queue from file
async function loadNotificationQueue() {
  try {
    await notificationQueueDB.read();
    notificationQueueDB.data = notificationQueueDB.data || { queue: [] };
    notificationQueue = notificationQueueDB.data.queue || [];
    console.log(`[QUEUE] Loaded ${notificationQueue.length} pending notifications`);
  } catch (error) {
    console.error('[QUEUE] Error loading notification queue:', error);
    notificationQueue = [];
  }
}

// Save notification queue to file
async function saveNotificationQueue() {
  try {
    notificationQueueDB.data = { queue: notificationQueue };
    await notificationQueueDB.write();
  } catch (error) {
    console.error('[QUEUE] Error saving notification queue:', error);
  }
}

// Initialize variables
let reconnectAttempts = 0;
let isReconnecting = false;
let lastConnectionCheck = Date.now();

/**
 * Send a notification with retry mechanism
 * @param {Object} conn - Baileys connection object
 * @param {String} jid - JID to send message to
 * @param {Object} content - Message content
 * @param {Object} options - Message options
 * @returns {Promise<Object>} - Message info
 */
async function sendNotificationWithRetry(conn, jid, content, options = {}) {
  if (!conn || !conn.user) {
    // Connection not available, queue the message
    const queueItem = {
      jid,
      content,
      options,
      timestamp: Date.now(),
      attempts: 0
    };
    notificationQueue.push(queueItem);
    await saveNotificationQueue();
    console.log(`[QUEUE] Message to ${jid} queued for later delivery`);
    return null;
  }
  
  try {
    // Try to send the message
    const result = await conn.sendMessage(jid, content, options);
    return result;
  } catch (error) {
    console.error(`[CONNECTION] Error sending notification:`, error);
    
    // Queue the failed message
    const queueItem = {
      jid,
      content,
      options,
      timestamp: Date.now(),
      attempts: 1,
      lastError: error.message
    };
    notificationQueue.push(queueItem);
    await saveNotificationQueue();
    console.log(`[QUEUE] Failed message to ${jid} queued for retry`);
    return null;
  }
}

/**
 * Process the notification queue
 * @param {Object} conn - Baileys connection object
 */
async function processNotificationQueue(conn) {
  if (!conn || !conn.user || notificationQueue.length === 0) {
    return;
  }
  
  console.log(`[QUEUE] Processing ${notificationQueue.length} queued notifications`);
  
  // Process queue from oldest to newest
  const currentQueue = [...notificationQueue];
  notificationQueue = [];
  
  for (const item of currentQueue) {
    // Skip items that have been retried too many times
    if (item.attempts >= 5) {
      console.log(`[QUEUE] Dropping message to ${item.jid} after 5 failed attempts`);
      continue;
    }
    
    try {
      // Calculate delay based on number of attempts
      const delayMs = Math.min(item.attempts * 1000, 5000);
      
      // Add a small delay between messages to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, delayMs));
      
      console.log(`[QUEUE] Retrying message to ${item.jid} (attempt ${item.attempts + 1})`);
      await conn.sendMessage(item.jid, item.content, item.options);
      console.log(`[QUEUE] Successfully delivered queued message to ${item.jid}`);
    } catch (error) {
      console.error(`[QUEUE] Failed to deliver queued message:`, error);
      
      // Update attempt count and requeue
      item.attempts += 1;
      item.lastError = error.message;
      notificationQueue.push(item);
    }
  }
  
  // Save the updated queue
  await saveNotificationQueue();
}

/**
 * Backup session files
 */
async function backupSessionFiles() {
  try {
    if (!fs.existsSync(CONFIG.sessionDir)) {
      console.log(`[BACKUP] Creating session directory: ${CONFIG.sessionDir}`);
      fs.mkdirSync(CONFIG.sessionDir, { recursive: true });
    }
    
    // Get all files in session directory
    const files = fs.readdirSync(CONFIG.sessionDir);
    const sessionFiles = files.filter(file => file.endsWith('.json') && !file.includes('backup'));
    
    if (sessionFiles.length === 0) {
      console.log('[BACKUP] No session files found to backup');
      return;
    }
    
    // Create backup data object
    const backupData = {};
    
    for (const file of sessionFiles) {
      const filePath = path.join(CONFIG.sessionDir, file);
      try {
        const fileContent = fs.readFileSync(filePath, 'utf8');
        backupData[file] = fileContent;
      } catch (error) {
        console.error(`[BACKUP] Error reading file ${file}:`, error);
      }
    }
    
    // Save backup data
    fs.writeFileSync(CONFIG.sessionBackupFile, JSON.stringify(backupData, null, 2));
    console.log(`[BACKUP] Successfully backed up ${Object.keys(backupData).length} session files`);
  } catch (error) {
    console.error('[BACKUP] Error backing up session files:', error);
  }
}

/**
 * Restore session files from backup
 */
async function restoreSessionFiles() {
  try {
    if (!fs.existsSync(CONFIG.sessionBackupFile)) {
      console.log('[RESTORE] No backup file found');
      return false;
    }
    
    const backupData = JSON.parse(fs.readFileSync(CONFIG.sessionBackupFile, 'utf8'));
    const files = Object.keys(backupData);
    
    if (files.length === 0) {
      console.log('[RESTORE] Backup file contains no data');
      return false;
    }
    
    // Create session directory if it doesn't exist
    if (!fs.existsSync(CONFIG.sessionDir)) {
      fs.mkdirSync(CONFIG.sessionDir, { recursive: true });
    }
    
    // Restore each file
    for (const file of files) {
      const filePath = path.join(CONFIG.sessionDir, file);
      fs.writeFileSync(filePath, backupData[file]);
    }
    
    console.log(`[RESTORE] Successfully restored ${files.length} session files`);
    return true;
  } catch (error) {
    console.error('[RESTORE] Error restoring session files:', error);
    return false;
  }
}

/**
 * Handle WhatsApp connection loss
 * @param {Object} conn - Baileys connection object
 */
async function handleConnectionLoss(conn) {
  if (isReconnecting) return;
  isReconnecting = true;
  
  console.log('[CONNECTION] Connection lost. Attempting to reconnect...');
  
  try {
    // Try to backup existing session before reconnecting
    await backupSessionFiles();
    
    // Retry connection with exponential backoff
    while (reconnectAttempts < CONFIG.maxReconnectAttempts) {
      reconnectAttempts++;
      
      // Calculate delay with exponential backoff and jitter
      const delay = CONFIG.reconnectBaseDelay * Math.pow(1.5, reconnectAttempts) * (0.5 + Math.random());
      console.log(`[CONNECTION] Reconnect attempt ${reconnectAttempts}/${CONFIG.maxReconnectAttempts} in ${Math.round(delay/1000)}s`);
      
      await new Promise(resolve => setTimeout(resolve, delay));
      
      // Try to reconnect
      try {
        if (!conn.user) {
          // Try to reload session from backup if needed
          await restoreSessionFiles();
          
          // Trigger reload
          if (typeof global.reloadHandler === 'function') {
            const success = await global.reloadHandler(true);
            if (success && conn.user) {
              console.log('[CONNECTION] Successfully reconnected!');
              reconnectAttempts = 0;
              break;
            }
          }
        } else {
          console.log('[CONNECTION] Connection already restored');
          reconnectAttempts = 0;
          break;
        }
      } catch (err) {
        console.error('[CONNECTION] Error during reconnection attempt:', err);
      }
    }
    
    if (reconnectAttempts >= CONFIG.maxReconnectAttempts) {
      console.error('[CONNECTION] Maximum reconnection attempts reached. Please restart the bot manually.');
    }
  } catch (error) {
    console.error('[CONNECTION] Error in connection recovery:', error);
  } finally {
    isReconnecting = false;
  }
}

/**
 * Check connection status and handle recovery if needed
 */
function checkConnectionStatus() {
  const conn = global.conn;
  
  if (!conn) {
    console.log('[CONNECTION] No connection object found');
    return;
  }
  
  // If not connected, try to reconnect
  if (!conn.user) {
    console.log('[CONNECTION] Not connected to WhatsApp');
    handleConnectionLoss(conn);
    return;
  }
  
  // Process any queued notifications if connected
  if (conn.user && notificationQueue.length > 0) {
    processNotificationQueue(conn);
  }
  
  // Backup session periodically
  const now = Date.now();
  if (now - lastConnectionCheck >= CONFIG.sessionBackupInterval) {
    backupSessionFiles();
    lastConnectionCheck = now;
  }
}

// Initialize everything
async function init() {
  // Ensure session directory exists
  if (!fs.existsSync(CONFIG.sessionDir)) {
    fs.mkdirSync(CONFIG.sessionDir, { recursive: true });
  }
  
  // Load notification queue
  await loadNotificationQueue();
  
  // Set up periodic connection check
  setInterval(checkConnectionStatus, CONFIG.connectionCheckInterval);
  
  // Set up notification queue processing
  setInterval(() => {
    if (global.conn && global.conn.user && notificationQueue.length > 0) {
      processNotificationQueue(global.conn);
    }
  }, CONFIG.notificationQueueInterval);
  
  // Export functions to global space for use in other modules
  global.sendNotificationWithRetry = sendNotificationWithRetry;
  global.notificationQueue = {
    add: async (jid, content, options = {}) => {
      const queueItem = {
        jid,
        content,
        options,
        timestamp: Date.now(),
        attempts: 0
      };
      notificationQueue.push(queueItem);
      await saveNotificationQueue();
      return true;
    },
    process: () => processNotificationQueue(global.conn),
    getCount: () => notificationQueue.length
  };
  
  console.log('[CONNECTION] Replit-optimized connection patch initialized');
}

// Start initialization
init().catch(err => {
  console.error('[CONNECTION] Error initializing connection patch:', err);
});

// Register graceful shutdown
process.on('SIGTERM', async () => {
  console.log('[CONNECTION] Received SIGTERM signal, performing graceful shutdown...');
  await backupSessionFiles();
  await saveNotificationQueue();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('[CONNECTION] Received SIGINT signal, performing graceful shutdown...');
  await backupSessionFiles();
  await saveNotificationQueue();
  process.exit(0);
});

module.exports = {
  sendNotificationWithRetry,
  processNotificationQueue,
  backupSessionFiles,
  restoreSessionFiles
};