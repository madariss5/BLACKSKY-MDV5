# BLACKSKY-MD Premium - Heroku Deployment Guide

This guide will help you deploy your BLACKSKY-MD Premium WhatsApp bot to Heroku smoothly, avoiding common connection issues.

## Prerequisites

- A Heroku account
- Basic understanding of Git
- Your bot code ready to deploy

## Important Files for Heroku Deployment

The following files have been optimized for Heroku deployment:

1. `heroku-connection-fix.js` - Special optimizations for Heroku deployment
2. `connection-patch.js` - Enhanced connection handling
3. `notification-queue.js` - Robust notification queue system
4. `backup-sessions.js` - Session backup system
5. `Procfile` - Heroku process file

## Step 1: Prepare Your Bot for Heroku

Ensure you have the following files in your repository:

### Procfile
```
worker: npm start
```

### package.json
Make sure your `package.json` has the correct start script:
```json
"scripts": {
  "start": "node index.js"
}
```

### app.json
This helps with one-click deploy to Heroku:
```json
{
  "name": "BLACKSKY-MD Premium",
  "description": "Advanced WhatsApp Bot with premium features",
  "keywords": ["whatsapp", "bot", "premium"],
  "repository": "https://github.com/yourusername/blacksky-md",
  "env": {
    "SESSION_ID": {
      "description": "A session name for your bot",
      "value": "BLACKSKY-MD",
      "required": true
    }
  },
  "buildpacks": [
    {
      "url": "heroku/nodejs"
    },
    {
      "url": "https://github.com/jonathanong/heroku-buildpack-ffmpeg-latest.git"
    },
    {
      "url": "https://github.com/clhuang/heroku-buildpack-webp-binaries.git"
    }
  ]
}
```

## Step 2: Configure Heroku-Specific Variables

The bot now automatically detects if it's running on Heroku and applies appropriate optimizations. 

## Step 3: Deploy to Heroku

### Method 1: Deploy with Heroku CLI

1. Install the Heroku CLI
2. Login to Heroku: `heroku login`
3. Create a new Heroku app: `heroku create your-app-name`
4. Add the required buildpacks:
   ```
   heroku buildpacks:add heroku/nodejs
   heroku buildpacks:add https://github.com/jonathanong/heroku-buildpack-ffmpeg-latest.git
   heroku buildpacks:add https://github.com/clhuang/heroku-buildpack-webp-binaries.git
   ```
5. Push to Heroku: `git push heroku master`

### Method 2: Deploy from GitHub

1. Connect your GitHub account to Heroku
2. Select your repository
3. Enable automatic deploys (optional)
4. Deploy the master branch

## Step 4: Check Logs for Issues

After deployment, check your logs for any errors:
```
heroku logs --tail
```

## Special Fixes for Common Heroku Issues

### Fix 1: Missing connection or user

The error message "[CONNECTION] Could not send notification - missing connection or user" occurs when the bot tries to send a notification before the WhatsApp connection is fully established.

Our optimizations include:
- Connection retry mechanism with backoff
- Persistent notification queue
- Improved session handling
- Database backup system

### Fix 2: Connection Lost After Dyno Cycling

Heroku dynos restart every 24 hours, which can cause connection issues. Our fixes include:
- Automatic reconnection after dyno restart
- Session backup and recovery
- Database persistence

### Fix 3: Memory Leaks

To prevent memory leaks, we've implemented:
- Regular garbage collection
- Monitoring of memory usage
- Automatic cleanup of temporary files

## Advanced Configuration

For advanced users, you can tweak the Heroku behavior by setting environment variables:

- `HEROKU_KEEPALIVE_INTERVAL`: Interval for the keepalive ping (default: 5 minutes)
- `HEROKU_CONNECTION_CHECK_INTERVAL`: Interval to check connection health (default: 30 seconds)
- `HEROKU_RECONNECT_DELAY`: Delay before reconnection attempts (default: 10 seconds)
- `DB_SAVE_INTERVAL`: Interval to save database (default: 5 minutes)

Set these in Heroku settings under Config Vars.

## Troubleshooting

If you still encounter issues, try these steps:

1. Restart the dyno: `heroku restart`
2. Check the logs: `heroku logs --tail`
3. Enable debug mode by setting `DEBUG=true` in Heroku Config Vars
4. Make sure you have set up the necessary environment variables

## Need More Help?

Join our support channel for additional assistance:
https://whatsapp.com/channel/0029Va8ZH8fFXUuc69TGVw1q

## Credits

BLACKSKY-MD Premium WhatsApp Bot
© 2025 Premium Edition