# BLACKSKY-MD Premium - Stable 24/7 Connection on Heroku

This guide outlines how to maintain a stable, 24/7 connection for your WhatsApp bot on Heroku, addressing common disconnection issues and ensuring continuous operation through Heroku's daily dyno cycling.

## Understanding Heroku's Limitations

Heroku has several characteristics that can affect WhatsApp bot connections:

1. **Dyno Cycling**: Heroku restarts all dynos every 24 hours, which can disconnect your WhatsApp session
2. **Ephemeral Filesystem**: Any files (including WhatsApp session data) are lost when dynos restart
3. **Idle Timeout**: Free dynos sleep after 30 minutes of inactivity
4. **Resource Constraints**: Memory limitations can cause issues with long-running Node.js applications

## Implemented Solutions

BLACKSKY-MD Premium includes several features specifically designed to address these Heroku limitations:

### 1. Session Persistence with PostgreSQL

```javascript
// Session data is automatically backed up to PostgreSQL
// This ensures your session survives dyno restarts
ENABLE_SESSION_BACKUP=true
BACKUP_INTERVAL=30  // Backup every 30 minutes
```

### 2. Combined Runner Process

We've implemented a special combined runner (`heroku-combined-runner.js`) that:
- Runs both the bot and connection keeper in a single process
- Handles graceful shutdowns during dyno cycling
- Manages reconnection with exponential backoff
- Provides memory leak prevention

### 3. Anti-Idle System

```javascript
// Prevents Heroku from putting your app to sleep on free dynos
// Requires setting the HEROKU_APP_URL environment variable
ENABLE_HEALTH_CHECK=true
HEROKU_APP_URL=https://your-app-name.herokuapp.com
```

### 4. Memory Management

Memory leaks can cause crashes on Heroku. We've implemented:
- Periodic garbage collection
- Event listener limiting and cleanup
- Unhandled rejection handling
- Optimized connection management

## Configuration Guide

### Required Environment Variables

For optimal stability on Heroku, set these environment variables:

```
SESSION_ID=BLACKSKY-MD              # Your bot session name
OWNER_NUMBER=491556123456           # Your WhatsApp number
NODE_ENV=production                 # Set production mode
HEROKU=true                         # Enable Heroku-specific optimizations
HEROKU_APP_URL=https://your-app.herokuapp.com  # Your Heroku app URL
ENABLE_HEALTH_CHECK=true            # Enable health check endpoint
ENABLE_SESSION_BACKUP=true          # Enable PostgreSQL session backup
BACKUP_INTERVAL=30                  # Backup interval in minutes
ENABLE_MEMORY_OPTIMIZATION=true     # Enable memory optimization
```

### Setting Variables on Heroku

```bash
# Use Heroku CLI to set these variables
heroku config:set SESSION_ID=BLACKSKY-MD --app your-app-name
heroku config:set OWNER_NUMBER=491556123456 --app your-app-name
heroku config:set NODE_ENV=production --app your-app-name
heroku config:set HEROKU=true --app your-app-name
heroku config:set HEROKU_APP_URL=https://your-app-name.herokuapp.com --app your-app-name
heroku config:set ENABLE_HEALTH_CHECK=true --app your-app-name
heroku config:set ENABLE_SESSION_BACKUP=true --app your-app-name
heroku config:set BACKUP_INTERVAL=30 --app your-app-name
heroku config:set ENABLE_MEMORY_OPTIMIZATION=true --app your-app-name
```

## Connection Monitoring

To check if your bot is maintaining a stable connection:

1. View logs with `heroku logs --tail`
2. Monitor the health check endpoint: `https://your-app-name.herokuapp.com/status`
3. Look for these indicators of healthy operation:
   - "Connection keeper active" messages
   - "Session backup completed" messages
   - No repeated disconnection errors

## Troubleshooting Common Issues

### Issue: Bot disconnects after 24 hours (Dyno Cycling)

**Solution**: This should be automatically handled by the session backup and restore system. If problems persist, check:
- PostgreSQL addon is properly configured
- `ENABLE_SESSION_BACKUP` is set to true
- Database connection is working (check logs)

### Issue: High memory usage and crashes

**Solution**: 
- Set `ENABLE_MEMORY_OPTIMIZATION=true`
- Upgrade to a paid dyno with more memory (Eco or Basic)
- Limit the number of complex plugins or features running simultaneously

### Issue: Connection is unstable or drops frequently

**Solution**:
- Check your internet connection when scanning the QR code
- Ensure your phone has a stable connection when linking
- Try relinking your WhatsApp by deleting the session and scanning a new QR code

## Recommended Heroku Plan

While BLACKSKY-MD Premium works on Heroku's free tier, we strongly recommend at least the **Eco** plan ($5/month) for:
- No dyno sleeping (critical for WhatsApp connection)
- Improved performance and stability
- More reliable operation

For business or high-usage scenarios, consider the **Basic** plan ($7/month) which provides even better resources.

---

Follow this guide to ensure your BLACKSKY-MD Premium bot maintains a stable connection 24/7 on Heroku!
