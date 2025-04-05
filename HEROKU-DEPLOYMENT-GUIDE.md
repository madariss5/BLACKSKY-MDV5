# BLACKSKY-MD Premium WhatsApp Bot - Heroku Deployment Guide

This comprehensive guide walks you through deploying your BLACKSKY-MD Premium WhatsApp Bot on Heroku for 24/7 operation with optimal stability.

## Prerequisites

1. A [Heroku account](https://signup.heroku.com/) (credit card required for verification, but you can use the free tier)
2. [Git](https://git-scm.com/downloads) installed on your computer
3. [Heroku CLI](https://devcenter.heroku.com/articles/heroku-cli) installed
4. Your WhatsApp number for the bot owner

## Deployment Options

### Option 1: One-Click Deployment (Recommended)

1. Click the "Deploy to Heroku" button in the main README.md file
2. Fill in the required environment variables when prompted
3. Wait for the deployment to complete
4. Click "View" to open your app dashboard
5. Follow the instructions to scan the QR code

### Option 2: Using Procfile (Worker Process)

This method uses our optimized Procfile configuration for greater reliability:

1. Clone this repository:
   ```bash
   git clone https://github.com/blackskytech/BLACKSKY-MD.git
   cd BLACKSKY-MD
   ```

2. Log in to Heroku:
   ```bash
   heroku login
   ```

3. Create a new Heroku app:
   ```bash
   heroku create your-app-name
   ```

4. Add the PostgreSQL addon (required for session persistence):
   ```bash
   heroku addons:create heroku-postgresql:mini -a your-app-name
   ```

5. Set required environment variables:
   ```bash
   heroku config:set SESSION_ID=BLACKSKY-MD
   heroku config:set BOT_NAME=BLACKSKY-MD
   heroku config:set OWNER_NUMBER=your-whatsapp-number
   heroku config:set NODE_ENV=production
   heroku config:set HEROKU=true
   heroku config:set HEALTH_CHECK_PORT=28111
   ```

6. Push to Heroku:
   ```bash
   git push heroku main
   ```

7. Scale worker dyno:
   ```bash
   heroku ps:scale worker=1 web=0
   ```

8. Check the logs:
   ```bash
   heroku logs --tail
   ```

9. Follow the instructions to scan the QR code shown in the logs.

### Option 3: Docker-based Deployment

This method uses the Heroku Container Registry for environment control.

1. Clone this repository:
   ```bash
   git clone https://github.com/blackskytech/BLACKSKY-MD.git
   cd BLACKSKY-MD
   ```

2. Log in to Heroku:
   ```bash
   heroku login
   heroku container:login
   ```

3. Create a new Heroku app:
   ```bash
   heroku create your-app-name
   ```

4. Add the PostgreSQL addon:
   ```bash
   heroku addons:create heroku-postgresql:mini -a your-app-name
   ```

5. Set required environment variables:
   ```bash
   heroku config:set SESSION_ID=BLACKSKY-MD
   heroku config:set BOT_NAME=BLACKSKY-MD
   heroku config:set OWNER_NUMBER=your-whatsapp-number
   heroku config:set NODE_ENV=production
   heroku config:set HEROKU=true
   heroku config:set HEALTH_CHECK_PORT=28111
   ```

6. Build and push the Docker container:
   ```bash
   heroku container:push worker
   heroku container:release worker
   ```

7. Scale worker dyno:
   ```bash
   heroku ps:scale worker=1
   ```

8. Check the logs:
   ```bash
   heroku logs --tail
   ```

### Option 4: Manual Deployment via Heroku Dashboard

1. Fork this repository to your GitHub account
2. Create a new app in the [Heroku Dashboard](https://dashboard.heroku.com/)
3. Go to the "Deploy" tab and connect your GitHub repository
4. Add the PostgreSQL addon from the "Resources" tab
5. In the Settings tab, set the required environment variables
6. Deploy from the "Deploy" tab
7. Scale worker dyno to 1 and web dyno to 0 in the "Resources" tab
8. View the logs and follow the instructions to scan the QR code

## Required Environment Variables

| Variable | Description | Example Value |
|----------|-------------|---------------|
| SESSION_ID | Your WhatsApp session identifier | BLACKSKY-MD |
| BOT_NAME | Name of your bot | BLACKSKY-MD |
| OWNER_NUMBER | Your WhatsApp number with country code | 491556315347 |
| NODE_ENV | Environment setting | production |
| HEROKU | Enable Heroku-specific optimizations | true |

## Optional Environment Variables

| Variable | Description | Default Value |
|----------|-------------|---------------|
| PREFIX | Command prefix | . |
| TZ | Timezone | UTC |
| LANGUAGE | Bot language (en/de) | en |
| ENABLE_HEALTH_CHECK | Enable health monitoring | true |
| ENABLE_SESSION_BACKUP | Enable session backup to DB | true |
| BACKUP_INTERVAL | Minutes between backups | 30 |
| MAX_MEMORY_MB | Memory threshold for auto-restart | 1024 |
| HEROKU_APP_URL | Your app's URL (for anti-idle) | (not required) |
| HEALTH_CHECK_PORT | Port for health monitoring | 28111 |

## Maintaining 24/7 Operation

BLACKSKY-MD Premium includes enhanced features to ensure reliable 24/7 operation on Heroku:

1. **PostgreSQL Session Persistence**: Automatically backs up and restores sessions across dyno restarts
2. **Internal Anti-Idle Mechanism**: Keeps the bot active even without HEROKU_APP_URL configuration
3. **Enhanced Connection Keeper**: Advanced mechanisms to prevent "connection appears to be closed" errors
4. **Automatic Reconnection**: Handles WhatsApp disconnects with intelligent exponential backoff
5. **Health Monitoring**: Built-in health check server with detailed status information
6. **Memory Management**: Prevents crashes due to memory leaks with periodic garbage collection
7. **Graceful Shutdown**: Ensures proper session backup before dyno cycling
8. **Scheduled Backups**: Automatic session backups to both PostgreSQL and local files

## Troubleshooting

### QR Code Not Showing
- Check the logs with `heroku logs --tail`
- Restart the dynos with `heroku dyno:restart worker`
- Make sure worker dyno is running with `heroku ps`

### Connection Issues
- Verify your Heroku app is not sleeping (`heroku ps`)
- Ensure the PostgreSQL addon is properly attached
- Check if your WhatsApp account has been temporarily blocked

### Performance Problems
- Check memory usage in the Heroku dashboard
- Consider upgrading to a larger dyno size
- Adjust MAX_MEMORY_MB if needed

## Advanced Configuration

For advanced users, you can modify:

- `ecosystem.config.js`: PM2 process management settings
- `Procfile`: Dyno process definitions
- `heroku-bot-starter.js`: Main entry point for Heroku
- `heroku-connection-keeper.js`: Connection stability mechanisms

## Support

If you encounter any issues with deployment, please:

1. Check the logs: `heroku logs --tail`
2. Review the troubleshooting section
3. Open an issue on the GitHub repository

## Security Notes

- Store your WhatsApp session securely
- Do not expose your `.env` file or session credentials
- Regularly check for suspicious activities
- Be aware that Heroku's free tier has limitations

---

© 2025 BLACKSKY-MD Premium - Enjoy your 24/7 WhatsApp bot!
