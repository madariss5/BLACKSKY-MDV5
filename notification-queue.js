/**
 * BLACKSKY-MD Premium - WhatsApp Notification Queue System
 * This module provides a robust notification queue for ensuring messages
 * get sent even during connection issues or Heroku dyno cycling
 */

// Map to store pending notifications
const pendingNotifications = new Map();

// Stats for monitoring
const stats = {
  queued: 0,
  sent: 0,
  failed: 0,
  retries: 0
};

/**
 * Send a WhatsApp message with automatic retry on connection failure
 * @param {Object} conn - The WhatsApp connection object
 * @param {String} jid - JID of recipient
 * @param {Object|String} content - Message content
 * @param {Object} options - Message options
 * @returns {Promise<Object>} - Message info if sent
 */
async function sendNotificationWithRetry(conn, jid, content, options = {}) {
  // Generate unique message ID
  const msgId = `${jid}_${Date.now()}_${Math.floor(Math.random() * 1000)}`;

  // Initial attempt counter
  let attempts = 0;
  const maxAttempts = options.maxRetries || 5;
  const initialDelay = options.initialDelay || 5000; // 5 seconds
  const maxDelay = options.maxDelay || 300000; // 5 minutes

  // Process to attempt sending the message
  const attemptSend = async () => {
    try {
      // Check if connection is ready
      if (!conn.user) {
        // Connection not ready, queue for later processing
        if (!pendingNotifications.has(msgId) && attempts < maxAttempts) {
          pendingNotifications.set(msgId, { 
            jid, 
            content, 
            options, 
            attempts,
            createdAt: Date.now()
          });

          console.log(`[NOTIFICATION] Queued message for later: ${msgId} (Attempt: ${attempts + 1}/${maxAttempts})`);
          stats.queued++;

          // Schedule retry with exponential backoff
          const delay = Math.min(initialDelay * Math.pow(2, attempts), maxDelay);

          setTimeout(() => {
            // Get the latest notification data
            const notification = pendingNotifications.get(msgId);
            if (notification) {
              notification.attempts++;
              attempts = notification.attempts;
              attemptSend(); // Try again
              stats.retries++;
            }
          }, delay);
        } else if (attempts >= maxAttempts) {
          console.error(`[NOTIFICATION] Max attempts reached for message ${msgId}, giving up`);
          pendingNotifications.delete(msgId);
          stats.failed++;
        }
        return null;
      }

      // Connection is ready, try to send
      const result = await conn.sendMessage(jid, content, { 
        ...options,
        // Add message queue ID for tracking
        msgId
      });

      console.log(`[NOTIFICATION] Successfully sent message: ${msgId}`);
      pendingNotifications.delete(msgId);
      stats.sent++;
      return result;
    } catch (err) {
      console.error(`[NOTIFICATION] Error sending message: ${err.message}`);

      // Retry with backoff if haven't reached max attempts
      if (attempts < maxAttempts) {
        attempts++;
        const delay = Math.min(initialDelay * Math.pow(2, attempts), maxDelay);

        console.log(`[NOTIFICATION] Will retry in ${delay/1000}s (attempt ${attempts}/${maxAttempts})`);

        return new Promise((resolve) => {
          setTimeout(async () => {
            const result = await attemptSend();
            resolve(result);
          }, delay);
        });
      } else {
        console.error(`[NOTIFICATION] Failed to send notification after ${maxAttempts} attempts`);
        pendingNotifications.delete(msgId);
        stats.failed++;
        throw err; // Re-throw for the caller to handle
      }
    }
  };

  return attemptSend();
}

/**
 * Process all queued notifications when connection is re-established
 * @param {Object} conn - The WhatsApp connection object
 */
function processNotificationQueue(conn) {
  if (!conn.user || pendingNotifications.size === 0) return;

  console.log(`[NOTIFICATION] Processing ${pendingNotifications.size} queued notifications`);

  const now = Date.now();
  const maxAge = 3600000; // 1 hour max age for notifications

  // Process all pending notifications
  for (const [id, notification] of pendingNotifications.entries()) {
    // Skip notifications that are too old
    if (now - notification.createdAt > maxAge) {
      console.log(`[NOTIFICATION] Dropping old notification ${id} (${(now - notification.createdAt) / 1000}s old)`);
      pendingNotifications.delete(id);
      stats.failed++;
      continue;
    }

    // Try to send the notification
    sendNotificationWithRetry(
      conn, 
      notification.jid, 
      notification.content, 
      notification.options
    ).catch(err => {
      console.error(`[NOTIFICATION] Failed to process queued notification: ${err.message}`);
    });
  }
}

/**
 * Clear the notification queue
 */
function clearNotificationQueue() {
  const count = pendingNotifications.size;
  pendingNotifications.clear();
  console.log(`[NOTIFICATION] Cleared ${count} pending notifications`);
  return count;
}

/**
 * Get notification queue statistics
 */
function getNotificationStats() {
  return {
    ...stats,
    queueSize: pendingNotifications.size,
    oldestMessage: pendingNotifications.size > 0 ? 
      Math.min(...Array.from(pendingNotifications.values()).map(n => n.createdAt)) : null,
    newestMessage: pendingNotifications.size > 0 ?
      Math.max(...Array.from(pendingNotifications.values()).map(n => n.createdAt)) : null,
  };
}

/**
 * Add notification queue listener to connection events
 * @param {Object} conn - The WhatsApp connection object
 */
function setupNotificationQueue(conn) {
  if (!conn || !conn.user) {
    console.log('[CONNECTION] Waiting for WhatsApp connection...');
    return false;
  }

  // Verify we have a valid connection
  if (!conn.user.id) {
    console.log('[CONNECTION] Invalid connection state');
    return false;
  }

  console.log('[CONNECTION] Notification queue initialized with user:', conn.user.id);

  // Process queue when connection is established
  conn.ev.on('connection.update', (update) => {
    const { connection } = update;

    if (connection === 'open') {
      // Wait a short while for connection to stabilize
      setTimeout(() => {
        processNotificationQueue(conn);
      }, 5000); // 5 second delay
    }
  });

  // Periodically attempt to process the queue for messages stuck for a while
  setInterval(() => {
    if (conn.user && pendingNotifications.size > 0) {
      processNotificationQueue(conn);
    }
  }, 60000); // Check every minute

  console.log('[NOTIFICATION] Notification queue system initialized');
  return true;
}

// Make functions available globally
global.notificationQueue = {
  sendNotificationWithRetry,
  processNotificationQueue,
  clearNotificationQueue,
  getNotificationStats,
  setupNotificationQueue
};

// Export functions for direct require
module.exports = {
  sendNotificationWithRetry,
  processNotificationQueue,
  clearNotificationQueue,
  getNotificationStats,
  setupNotificationQueue
};