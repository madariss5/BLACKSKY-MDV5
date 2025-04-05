# BLACKSKY-MD Premium - Heroku Deployment with PM2

This guide explains how to deploy BLACKSKY-MD on Heroku using PM2 runtime without relying on ecosystem.config.js.

## Setup Steps

### 1. Create a Procfile

Create a file named `Procfile` in the root directory with the following content:

```
web: pm2-runtime start heroku-bot-starter.js --name BLACKSKY-MD -- --autocleartmp --autoread
```

### 2. Prepare your app.json

Ensure your `app.json` has the following:

```json
{
  "name": "BLACKSKY-MD Premium",
  "description": "Advanced Multilingual WhatsApp Bot - Premium 24/7 Edition",
  "repository": "https://github.com/blackskytech/BLACKSKY-MD",
  "logo": "https://raw.githubusercontent.com/blackskytech/BLACKSKY-MD/main/blacksky-premium-gradient.svg",
  "website": "https://blacksky.tech",
  "success_url": "/status",
  "buildpacks": [
    {
      "url": "heroku/nodejs"
    },
    {
      "url": "https://github.com/jonathanong/heroku-buildpack-ffmpeg-latest"
    }
  ],
  "env": {
    "SESSION_ID": {
      "description": "A unique session ID for your WhatsApp connection",
      "value": "BLACKSKY-MD",
      "required": true
    },
    "BOT_NAME": {
      "description": "Name of your WhatsApp bot",
      "value": "BLACKSKY-MD",
      "required": true
    },
    "OWNER_NUMBER": {
      "description": "Your WhatsApp number with country code (e.g. 491556315347)",
      "value": "",
      "required": true
    },
    "PREFIX": {
      "description": "Prefix for bot commands",
      "value": ".",
      "required": false
    },
    "NODE_ENV": {
      "description": "Environment setting",
      "value": "production",
      "required": true
    },
    "MAX_MEMORY_MB": {
      "description": "Maximum memory allowed before auto-restart (in MB)",
      "value": "512",
      "required": false
    },
    "PM2_RESTART_CRON": {
      "description": "Cron schedule for daily restart (default: 4:00 AM)",
      "value": "0 4 * * *",
      "required": false
    },
    "HEROKU": {
      "description": "Flag to enable Heroku-specific optimizations",
      "value": "true",
      "required": false
    }
  },
  "addons": [
    {
      "plan": "heroku-postgresql:mini",
      "as": "DATABASE"
    }
  ]
}
```

### 3. Package.json modifications

For local development (this doesn't affect Heroku deployment), you can manually modify the scripts section of package.json:

```json
"scripts": {
  "start": "pm2-runtime start heroku-bot-starter.js --name BLACKSKY-MD -- --autocleartmp --autoread",
  "start:pm2": "pm2 start heroku-bot-starter.js --name BLACKSKY-MD -- --autocleartmp --autoread",
  "start:dev": "node heroku-bot-starter.js --autocleartmp --autoread",
  "heroku-postbuild": "npm install pm2 -g"
}
```

### 4. PM2 Configuration for Heroku

PM2 Runtime (pm2-runtime) is automatically installed on Heroku. Your Procfile will start the application using PM2 runtime with the following optimized settings:

- Memory limit: 512MB
- Auto restart: Enabled
- Daily restart at 4:00 AM (via the Heroku Scheduler addon)
- Log management: PM2 handles logs which can be viewed via `heroku logs`

### 5. Deploying to Heroku

You can deploy to Heroku using either the Heroku CLI or the Heroku Dashboard:

#### Using Heroku CLI:

```bash
# Login to Heroku
heroku login

# Create a new Heroku app
heroku create your-app-name

# Add PostgreSQL addon
heroku addons:create heroku-postgresql:mini

# Push your code to Heroku
git push heroku main

# Check logs
heroku logs --tail
```

#### Using Heroku Dashboard:

1. Create a new app on Heroku Dashboard
2. Connect to your GitHub repository
3. Enable automatic deploys or manually deploy
4. Add the PostgreSQL addon from the Resources tab

### 6. Setting up Scheduled Restart

For even more stability, add a scheduled restart using the Heroku Scheduler addon:

1. Install the Heroku Scheduler addon
2. Create a new job with the following command:
   ```
   heroku restart && echo "App restarted"
   ```
3. Set the frequency to "Daily" and choose a time (e.g. 4:00 AM)

### 7. Environment Variables

Make sure to set all necessary environment variables in the Heroku dashboard:

- SESSION_ID
- BOT_NAME
- OWNER_NUMBER
- PREFIX
- NODE_ENV=production
- HEROKU=true

## Troubleshooting

### Connection Issues

If the bot disconnects frequently:

1. Check Heroku logs: `heroku logs --tail`
2. Ensure the PostgreSQL session persistence is working
3. Verify that the Heroku dyno isn't sleeping (use a keepalive service)

### Memory Issues

If you encounter memory-related crashes:

1. Increase the MAX_MEMORY_MB setting
2. Upgrade to a larger Heroku dyno
3. Optimize the bot code to use less memory

### Session Persistence Problems

If session doesn't persist after dyno restarts:

1. Verify PostgreSQL connection string
2. Check database session backup/restore in the logs
3. Manually trigger a session backup: `heroku run node -e "require('./backup-sessions.js').backupSessionToDatabase()"`