/**
 * BLACKSKY-MD Premium Notification Queue System
 * This module implements a persistent notification queue that helps handle the
 * "Could not send notification - missing connection or user" error on Heroku.
 * 
 * Features:
 * - Persistent queue that survives restarts and dyno cycling
 * - Automatic retry with exponential backoff
 * - Graceful handling of connection losses
 * - Memory-efficient storage
 */

const fs = require('fs');
const path = require('path');

// Create a persistent notification queue
class NotificationQueue {
  constructor() {
    this.queue = new Map();
    this.queueFile = path.join(process.cwd(), 'notification-queue.json');
    this.loadQueue();
    
    // Set up periodic processing
    setInterval(() => this.processQueue(), 30000);
    
    // Set up periodic saving
    setInterval(() => this.saveQueue(), 60000);
    
    console.log('📋 Notification queue system initialized');
  }
  
  loadQueue() {
    try {
      if (fs.existsSync(this.queueFile)) {
        const data = JSON.parse(fs.readFileSync(this.queueFile, 'utf8'));
        
        // Convert the plain object back to a Map
        for (const [id, item] of Object.entries(data)) {
          this.queue.set(id, item);
        }
        
        console.log(`📥 Loaded ${this.queue.size} pending notifications`);
      }
    } catch (err) {
      console.error('Error loading notification queue:', err);
    }
  }
  
  saveQueue() {
    try {
      if (this.queue.size > 0) {
        // Convert Map to a plain object for JSON serialization
        const queueObj = Object.fromEntries(this.queue);
        fs.writeFileSync(this.queueFile, JSON.stringify(queueObj, null, 2));
        console.log(`📤 Saved ${this.queue.size} pending notifications`);
      } else if (fs.existsSync(this.queueFile)) {
        fs.unlinkSync(this.queueFile);
      }
    } catch (err) {
      console.error('Error saving notification queue:', err);
    }
  }
  
  add(jid, content, options = {}) {
    const id = `${jid}_${Date.now()}`;
    this.queue.set(id, {
      jid,
      content,
      options,
      attempts: 0,
      lastAttempt: null,
      created: Date.now()
    });
    console.log(`📋 Added notification to queue: ${id}`);
    return id;
  }
  
  async processQueue() {
    if (!global.conn?.user) {
      // If connection isn't ready, don't try to process the queue
      return;
    }
    
    if (this.queue.size === 0) {
      return; // No notifications to process
    }
    
    console.log(`🔄 Processing notification queue (${this.queue.size} items)`);
    
    for (const [id, item] of this.queue.entries()) {
      // Skip items that were recently attempted (implement exponential backoff)
      const backoffTime = Math.min(Math.pow(2, item.attempts) * 10000, 3600000);
      if (item.lastAttempt && Date.now() - item.lastAttempt < backoffTime) {
        continue;
      }
      
      try {
        console.log(`📤 Attempting to send notification: ${id}`);
        await global.conn.sendMessage(item.jid, item.content, item.options);
        console.log(`✅ Successfully sent notification: ${id}`);
        this.queue.delete(id);
      } catch (err) {
        console.error(`❌ Failed to send notification: ${err.message}`);
        
        // Update attempt info
        item.attempts++;
        item.lastAttempt = Date.now();
        
        // Remove after too many attempts or too old (24 hours)
        if (item.attempts > 10 || Date.now() - item.created > 24 * 60 * 60 * 1000) {
          console.log(`⏱️ Removing expired notification: ${id}`);
          this.queue.delete(id);
        }
      }
    }
    
    // Save queue after processing
    this.saveQueue();
  }
}

// Create the global queue
global.notificationQueue = new NotificationQueue();

/**
 * Safe send message function that queues messages when connection is unavailable
 * 
 * @param {string} jid - The WhatsApp JID to send the message to
 * @param {object} content - The message content (can be text, buttons, etc.)
 * @param {object} options - Additional options for the message
 * @returns {string|boolean} - Queue ID if queued, true if sent immediately
 */
const safeSendMessage = async (jid, content, options = {}) => {
  try {
    // If connection isn't available, queue for later
    if (!global.conn?.user) {
      return global.notificationQueue.add(jid, content, options);
    }
    
    // Try to send directly
    await global.conn.sendMessage(jid, content, options);
    return true;
  } catch (err) {
    console.error('Error in safeSendMessage:', err);
    // Queue for later if direct send fails
    return global.notificationQueue.add(jid, content, options);
  }
};

/**
 * Handle connection state changes and implement reconnection logic
 * 
 * @param {object} conn - The Baileys connection object
 */
const listenToConnectionEvents = (conn) => {
  const reconnectAttempts = new Map();
  
  const handleConnectionLoss = async () => {
    const jid = conn.user?.jid || 'unknown';
    
    // Initialize or increment reconnection attempts
    reconnectAttempts.set(jid, (reconnectAttempts.get(jid) || 0) + 1);
    const attempts = reconnectAttempts.get(jid);
    
    // Exponential backoff with max 5 minutes
    const delay = Math.min(Math.pow(2, attempts) * 1000, 300000);
    
    console.log(`⚠️ Connection lost for ${jid}. Reconnection attempt ${attempts} in ${delay/1000}s`);
    
    setTimeout(async () => {
      try {
        console.log(`🔄 Attempting to reconnect ${jid}...`);
        // Force refresh connection
        await conn.ev.flush();
        // Reset reconnection counter on successful reconnection
        reconnectAttempts.set(jid, 0);
        console.log(`✅ Successfully reconnected ${jid}`);
      } catch (err) {
        console.error(`❌ Failed to reconnect ${jid}:`, err);
        // Try again
        handleConnectionLoss();
      }
    }, delay);
  };
  
  conn.ev.on('connection.update', (update) => {
    const { connection, lastDisconnect } = update;
    
    if (connection === 'close') {
      console.log('⚠️ Connection closed, attempting to reconnect...');
      
      // If not logged out, try to reconnect
      const statusCode = lastDisconnect?.error?.output?.statusCode;
      const shouldReconnect = statusCode !== 401; // 401 = logged out
      
      if (shouldReconnect) {
        handleConnectionLoss();
      } else {
        console.log('⛔ Connection closed due to logout');
      }
    }
    
    if (connection === 'open') {
      console.log('✅ Connection established, resetting retry counter');
      reconnectAttempts.set(conn.user?.jid || 'unknown', 0);
      
      // Process any pending notifications now that we're connected
      if (global.notificationQueue) {
        global.notificationQueue.processQueue();
      }
    }
  });
};

module.exports = {
  NotificationQueue,
  safeSendMessage,
  listenToConnectionEvents
};