# How to Fix "Could not send notification - missing connection or user" Error

If you're seeing the error message "Could not send notification - missing connection or user" after deploying BLACKSKY-MD to Heroku, this guide will help you resolve the issue.

## What Causes This Error?

This error occurs when the bot tries to send a notification (e.g., connection status) but doesn't have an active connection to WhatsApp yet or has lost its connection. Common causes include:

1. **Ephemeral Filesystem**: Heroku's filesystem is ephemeral, meaning session data can be lost during dyno cycling
2. **Memory Constraints**: Limited memory on free/hobby dynos can cause connection issues
3. **Connection Timeout**: WhatsApp connections might time out after periods of inactivity
4. **Session Corruption**: Session files might become corrupted during Heroku's dyno cycling

## Solution 1: Update connection-patch.js

Add better connection handling to your `connection-patch.js` file by creating or modifying it to include this code:

```javascript
// Add this to the bottom of your existing connection-patch.js file

// Connection retry handling
const reconnectAttempts = new Map();

async function handleConnectionLoss(conn) {
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
      handleConnectionLoss(conn);
    }
  }, delay);
}

// Add a connection state change listener
const listenToConnectionEvents = (conn) => {
  conn.ev.on('connection.update', (update) => {
    const { connection, lastDisconnect } = update;
    
    if (connection === 'close') {
      console.log('⚠️ Connection closed, attempting to reconnect...');
      
      // If not logged out, try to reconnect
      const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== 401;
      
      if (shouldReconnect) {
        handleConnectionLoss(conn);
      } else {
        console.log('⛔ Connection closed due to logout');
      }
    }
    
    if (connection === 'open') {
      console.log('✅ Connection established, resetting retry counter');
      reconnectAttempts.set(conn.user?.jid || 'unknown', 0);
    }
  });
};

// Export the function
module.exports.listenToConnectionEvents = listenToConnectionEvents;
```

## Solution 2: Create a Notification Queue

Create a file called `notification-queue.js` with this content:

```javascript
// notification-queue.js
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
  }
  
  loadQueue() {
    try {
      if (fs.existsSync(this.queueFile)) {
        const data = JSON.parse(fs.readFileSync(this.queueFile, 'utf8'));
        this.queue = new Map(Object.entries(data));
        console.log(`📥 Loaded ${this.queue.size} pending notifications`);
      }
    } catch (err) {
      console.error('Error loading notification queue:', err);
    }
  }
  
  saveQueue() {
    try {
      if (this.queue.size > 0) {
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
      console.log('⏳ Connection not ready, postponing notification processing');
      return;
    }
    
    console.log(`🔄 Processing notification queue (${this.queue.size} items)`);
    
    for (const [id, item] of this.queue.entries()) {
      // Skip items that were recently attempted
      if (item.lastAttempt && Date.now() - item.lastAttempt < 60000) {
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
        
        // Remove after too many attempts or too old
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

// Create a safe send function
const safeSendMessage = async (jid, content, options = {}) => {
  try {
    if (!global.conn?.user) {
      // Queue for later
      return global.notificationQueue.add(jid, content, options);
    }
    
    // Try to send directly
    await global.conn.sendMessage(jid, content, options);
    return true;
  } catch (err) {
    console.error('Error in safeSendMessage:', err);
    // Queue for later
    return global.notificationQueue.add(jid, content, options);
  }
};

module.exports = {
  NotificationQueue,
  safeSendMessage
};
```

## Solution 3: Update Your `index.js` File

Add these lines to your `index.js` file, right after your imports:

```javascript
// Import connection helpers
require('./connection-patch.js');

// Import notification queue
const { safeSendMessage } = require('./notification-queue.js');

// Make it available globally
global.safeSendMessage = safeSendMessage;
```

## Solution 4: Update Your Heroku Configuration

1. **Add Buildpacks**: In your Heroku app settings, make sure you have these buildpacks:
   - `heroku/nodejs`
   - `https://github.com/jonathanong/heroku-buildpack-ffmpeg-latest.git`
   - `https://github.com/clhuang/heroku-buildpack-webp-binaries.git`

2. **Add Environment Variables**:
   ```
   TZ=Europe/London
   KEEP_ALIVE_URL=https://your-app-name.herokuapp.com/
   NODE_ENV=production
   ```

3. **Update your Procfile**:
   ```
   worker: node --expose-gc index.js
   ```

4. **Upgrade to a Paid Dyno**:
   The free tier of Heroku has been discontinued. Use at least the "Eco" tier ($5/month) for more reliable operation.

## Solution 5: Clean Installation on Heroku

Sometimes, a clean installation is the best solution:

1. **Delete the app** from Heroku
2. **Create a new app** with the same name
3. **Deploy from a clean repository**
4. **Add the buildpacks** mentioned in Solution 4
5. **Set the environment variables** mentioned in Solution 4

## Conclusion

By implementing these solutions, you should be able to resolve the "Could not send notification - missing connection or user" error. The key is to properly handle connection state changes and implement a queuing mechanism for notifications that can survive Heroku's dyno cycling.

If you continue experiencing problems, consider upgrading to the "Basic" dyno ($7/month) which provides more memory and better performance.