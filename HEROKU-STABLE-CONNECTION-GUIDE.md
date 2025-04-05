# Heroku Stable Connection Guide for BLACKSKY-MD Premium

This guide explains how to maintain stable WhatsApp connections for your BLACKSKY-MD Premium bot when deployed on Heroku.

## Understanding Heroku Connection Challenges

Heroku's infrastructure presents several challenges for maintaining stable WhatsApp connections:

1. **Dyno Cycling**: Heroku dynos restart at least once every 24 hours
2. **30-Minute Inactivity Sleep**: Free tier dynos sleep after 30 minutes of inactivity
3. **Ephemeral Filesystem**: Files are not persisted between dyno restarts
4. **Connection Interruptions**: Network hiccups can cause "connection appears to be closed" errors

## Connection Stability Features in BLACKSKY-MD Premium

Your bot includes several features specifically designed to maintain stable connections on Heroku:

### 1. Enhanced Connection Keeper

The Enhanced Connection Keeper automatically:

- Detects connection loss and reconnects with smart exponential backoff
- Monitors websocket health and takes proactive action
- Applies fixes for "connection appears to be closed" errors
- Sends periodic heartbeats to prevent connection timeouts

### 2. PostgreSQL Session Persistence

Critical session data is automatically backed up to the PostgreSQL database:

- Session files are saved every 30 minutes by default
- Sessions are automatically restored after dyno restarts
- Multiple backup/restore methods provide redundancy

### 3. Anti-Idle System

An anti-idle system prevents free dynos from sleeping after 30 minutes:

- Periodically sends requests to keep the dyno active
- Health check endpoint provides uptime information
- Configurable ping intervals to balance stability and resource usage

## Connection Configuration Options

Fine-tune connection stability with these environment variables:

- `CONNECTION_CHECK_INTERVAL=60000` - Interval in ms for connection checks (default: 60000)
- `RECONNECT_MAX_RETRIES=15` - Maximum number of reconnection attempts (default: 15)
- `RECONNECT_INITIAL_DELAY=3000` - Initial reconnection delay in ms (default: 3000)
- `RECONNECT_MAX_DELAY=60000` - Maximum reconnection delay in ms (default: 60000)
- `ENABLE_ANTI_IDLE=true` - Enable or disable anti-idle system (default: true)
- `HEALTH_CHECK_PORT=28111` - Secondary port for health check endpoint (default: 28111)

## Best Practices for Maintaining Stable Connections

### 1. Use Proper Logout/Login Procedures

Improper logout can corrupt session files. Use these commands:

- `.logout` - Properly log out of WhatsApp
- `.clearsession` - Clear session files for a fresh start

### 2. Scheduled Reconnections

Consider scheduling periodic reconnections for long-term stability:

```javascript
// In your config.js
global.scheduledReconnect = {
  enabled: true,
  interval: 6, // Hours between reconnections
  quietHours: [0, 6] // Avoid reconnecting during these hours (midnight to 6am)
}
```

### 3. Connection Monitoring

Monitor connection stability using:

- The `/health` endpoint for uptime and connection state information
- Bot status updates in the console or owner's private chat
- `.status` command for quick connection health checks

### 4. Handle Multiple Devices

WhatsApp multi-device can sometimes cause conflicts:

- Limit to 2-3 active devices including the bot
- Log out from rarely used devices
- Avoid rapid device changes

### 5. Optimize Network Usage

Reduce the risk of network-related disconnections:

- Enable network optimization in config.js
- Reduce message history limits for groups
- Use auto-delete for old messages to reduce network load

## Troubleshooting Connection Issues

If you experience persistent connection problems:

1. Check Heroku logs for connection-related errors
2. Verify the PostgreSQL database is properly connected
3. Use `.clearsession` followed by rescanning the QR code for a fresh connection
4. Ensure you're not exceeding Heroku resource limits
5. Check for WhatsApp service disruptions

## Advanced Connection Stability

For critical deployments, consider these advanced options:

1. **Multiple Hobby Dynos**: Use 2 hobby dynos instead of one free dyno to avoid sleeping
2. **Professional Tier**: Upgrade to Heroku Professional for improved stability and resources
3. **Custom Connection Scripts**: Modify `heroku-connection-keeper.js` for your specific needs

## Conclusion

By leveraging the enhanced connection features and following these best practices, your BLACKSKY-MD Premium bot should maintain stable WhatsApp connections even in the challenging Heroku environment.
