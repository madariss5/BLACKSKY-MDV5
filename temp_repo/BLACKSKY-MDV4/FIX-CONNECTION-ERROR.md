# BLACKSKY-MD Connection Error Fixes

This guide helps fix the common "Could not send notification - missing connection or user" errors on Heroku deployments.

## Understanding the Problem

When running BLACKSKY-MD on Heroku, you may encounter these errors:

- `🔴 ERROR: Could not send notification - missing connection or user`
- `❌ Failed to send message: Error: Connection Closed`
- Messages not being delivered when the dyno cycles

These issues occur because:

1. Heroku dynos restart every 24 hours
2. Heroku may put applications to sleep after inactivity
3. Memory constraints can cause connection issues
4. Network interruptions disrupt WhatsApp connections

## Solutions Included in This Repository

We've implemented multiple solutions to address these issues:

### 1. Notification Queue System

The `notification-queue.js` module queues messages when the connection is lost and retries with exponential backoff.

```javascript
// Example usage inside any plugin:
const { sendNotificationWithRetry } = require('../notification-queue.js');

// Use this instead of conn.sendMessage for important notifications
sendNotificationWithRetry(conn, jid, content, options);
```

### 2. Connection Recovery Handler

The `connection-patch.js` module provides:

- Automatic reconnection with smart retry logic
- Connection state preservation
- Health check endpoints for monitoring

### 3. Session Backup System

The `backup-sessions.js` script:

- Regularly backs up WhatsApp session data to PostgreSQL
- Automatically restores sessions when needed
- Prevents authentication issues during dyno cycling

## Implementation Instructions

### Step 1: Configure Connection Patch

The connection patch is already included in the codebase. Ensure your `index.js` loads it:

```javascript
// At the top of your index.js file
try {
  require('./connection-patch.js');
  console.log('Connection patch loaded successfully');
} catch (err) {
  console.error('Failed to load connection patch:', err);
}
```

### Step 2: Set Up Notification Queue

The notification queue system is already implemented. For critical messages that must be delivered even during connection issues, use:

```javascript
const { sendNotificationWithRetry } = global.notificationQueue || 
                                      require('../notification-queue.js');

// Then use this instead of conn.sendMessage
sendNotificationWithRetry(conn, jid, { text: 'Important message' });
```

### Step 3: Configure Session Backup

1. Ensure you have PostgreSQL database configured on Heroku
2. Add these environment variables to your Heroku app:
   - `DATABASE_URL` (should be automatically set by Heroku PostgreSQL addon)
   - `BACKUP_ENABLED=true`
   - `BACKUP_INTERVAL=30` (in minutes)

3. The backup script is already configured in the codebase. To manually trigger a backup:

```bash
node backup-sessions.js
```

### Step 4: Optimize your `app.json`

Your `app.json` should include the following to ensure optimal performance:

```json
{
  "stack": "heroku-22",
  "formation": {
    "worker": {
      "quantity": 1,
      "size": "eco"
    }
  },
  "buildpacks": [
    {
      "url": "heroku/nodejs"
    },
    {
      "url": "https://github.com/jonathanong/heroku-buildpack-ffmpeg-latest.git"
    }
  ]
}
```

### Step 5: Add Monitoring (Optional)

For better visibility, you can set up a monitoring add-on on Heroku:

1. Install New Relic or similar monitoring tool
2. Configure the health check endpoint in your monitoring tool
3. Set up alerts for connection issues

## Troubleshooting Persistent Issues

If you still experience connection problems:

1. **Check Logs**: Run `heroku logs --tail` to see real-time logs
2. **Memory Issues**: Upgrade to a larger dyno if seeing memory errors
3. **Session Problems**: Try clearing sessions and re-scanning QR code
4. **Database Issues**: Verify PostgreSQL connection is working properly

## Common Error Messages and Solutions

| Error Message | Solution |
|---------------|----------|
| `Cannot send message after client was logged out` | Re-authenticate by scanning QR code |
| `connection closed` | Wait for automatic reconnection or restart dyno |
| `Error: Unexpected error in state` | Clear session data and re-authenticate |
| `Too many requests` | WhatsApp rate limit - wait before trying again |

## Prevention Best Practices

1. **Avoid Sudden Shutdowns**: Use the performGracefulShutdown function
2. **Implement Keepalive**: The connection patch maintains activity
3. **Regular Backups**: Session data is automatically backed up
4. **Memory Management**: Regularly clean old data and optimize code

By implementing these solutions, you can significantly improve the reliability of your BLACKSKY-MD bot on Heroku.