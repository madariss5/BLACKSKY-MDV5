# BLACKSKY-MD Premium - Heroku Stable Connection Guide

This guide provides detailed instructions for maintaining a stable, 24/7 connection for your BLACKSKY-MD Premium WhatsApp bot on Heroku using worker dynos and the enhanced connection keeper.

## Overview of the Solution

The implementation uses several key mechanisms to ensure your bot stays online 24/7:

1. **Worker Dynos**: Using Heroku worker dynos instead of web dynos
2. **PostgreSQL Session Storage**: Persisting sessions across dyno restarts
3. **Enhanced Connection Keeper**: Preventing "connection appears to be closed" errors
4. **Internal Anti-Idle**: Keeping the process active without external pinging

## Step-by-Step Deployment Instructions

### 1. Create a Heroku App

```bash
# Login to Heroku
heroku login

# Create a new app
heroku create your-app-name

# Add PostgreSQL addon
heroku addons:create heroku-postgresql:mini
```

### 2. Configure Environment Variables

```bash
# Required variables
heroku config:set SESSION_ID=BLACKSKY-MD
heroku config:set BOT_NAME=BLACKSKY-MD
heroku config:set OWNER_NUMBER=your-whatsapp-number
heroku config:set NODE_ENV=production
heroku config:set HEROKU=true

# Optional but recommended
heroku config:set ENABLE_HEALTH_CHECK=true
heroku config:set HEALTH_CHECK_PORT=28111
heroku config:set ENABLE_SESSION_BACKUP=true
heroku config:set BACKUP_INTERVAL=30
```

### 3. Deploy Using the Procfile

Our Procfile is configured to use a worker dyno instead of a web dyno. This is crucial for 24/7 operation.

```bash
# Clone the repository
git clone https://github.com/blackskytech/BLACKSKY-MD.git
cd BLACKSKY-MD

# Push to Heroku
git push heroku main

# Scale dynos properly - IMPORTANT!
heroku ps:scale worker=1 web=0
```

### 4. Monitor the Connection

```bash
# Watch the logs for QR code and connection status
heroku logs --tail
```

## Key Features for Stable Connection

### 1. PostgreSQL Session Persistence

The bot automatically backs up and restores session data to PostgreSQL, so even if your dyno restarts, the connection is maintained. This happens in the background every 30 minutes.

### 2. Internal Anti-Idle Mechanism

Even without setting HEROKU_APP_URL, the bot implements an internal activity mechanism that prevents the dyno from becoming idle. This works by:

- Updating profile status periodically
- Sending presence updates
- Performing minimal actions to keep the process active

### 3. Enhanced Connection Keeper

The Enhanced Connection Keeper detects and fixes "connection appears to be closed" errors by:

- Monitoring connection state changes
- Implementing exponential backoff for reconnection attempts
- Applying connection patches to fix common issues
- Using heartbeat mechanisms to keep the connection alive

### 4. Health Check Server

A built-in health check server runs on port 28111 (configurable) and provides:

- Connection status information
- Uptime monitoring
- Memory usage statistics
- Session backup status

You can access it at: `https://your-app-name.herokuapp.com:28111/health`

## Troubleshooting

### Bot Disconnecting Frequently

1. Check the logs:
   ```bash
   heroku logs --tail
   ```

2. Look for specific error patterns:
   - "Connection closed" - Usually temporary, will reconnect
   - "Database error" - Check PostgreSQL addon status
   - "Memory usage high" - Consider upgrading dyno size

3. Restart the worker dyno:
   ```bash
   heroku dyno:restart worker
   ```

### QR Code Not Appearing

1. Check if worker dyno is running:
   ```bash
   heroku ps
   ```

2. Ensure the logs are showing startup messages:
   ```bash
   heroku logs --tail
   ```

3. Try restarting the process:
   ```bash
   heroku dyno:restart worker
   ```

### Database Connection Issues

1. Verify PostgreSQL addon is provisioned:
   ```bash
   heroku addons | grep postgresql
   ```

2. Check database credentials:
   ```bash
   heroku config | grep DATABASE_URL
   ```

3. Ensure the DATABASE_URL is being properly used in the application

## Advanced Configuration

You can further optimize your deployment by:

1. **Memory Management**: Adjust MAX_MEMORY_MB environment variable based on your dyno size
2. **Backup Frequency**: Change BACKUP_INTERVAL for more or less frequent session backups
3. **Health Check**: Configure HEALTH_CHECK_PORT if the default port conflicts with other services

## Support

If you encounter issues not covered in this guide:

1. Check the detailed logs for specific error messages
2. Refer to the HEROKU-FIXES-SUMMARY.md file for technical details
3. Search for similar issues in the GitHub repository

---

© 2025 BLACKSKY-MD Premium - Stable Heroku Connection Guide
