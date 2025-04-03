# BLACKSKY-MD Heroku Deployment Guide

This guide will help you deploy the BLACKSKY-MD WhatsApp bot to Heroku with persistent storage and database support.

## Prerequisites

1. A Heroku account (sign up at [heroku.com](https://heroku.com))
2. The Heroku CLI installed on your computer
3. Git installed on your computer

## Deployment Steps

### Option 1: Quick Deploy with Heroku Button

[![Deploy](https://www.herokucdn.com/deploy/button.svg)](https://heroku.com/deploy?template=https://github.com/blackskytech/BLACKSKY-MD)

1. Click the "Deploy to Heroku" button above.
2. Fill in the required environment variables:
   - `SESSION_ID`: A unique identifier for your WhatsApp session
   - `BOT_NAME`: The name of your WhatsApp bot (default: BLACKSKY-MD)
   - `OWNER_NUMBER`: Your WhatsApp number with country code (e.g., 491556315347)
   - `PREFIX`: Command prefix for the bot (default: .)
3. Click "Deploy App" and wait for the deployment to finish.
4. Add PostgreSQL database (if needed for storing user data):
   ```bash
   heroku addons:create heroku-postgresql:mini -a your-app-name
   ```

### Option 2: Manual Deployment

1. Clone this repository to your local machine:
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

4. Add PostgreSQL database (if needed for storing user data):
```bash
heroku addons:create heroku-postgresql:mini -a your-app-name
```

5. Add Heroku buildpacks:
```bash
heroku buildpacks:add heroku/nodejs
heroku buildpacks:add https://github.com/jonathanong/heroku-buildpack-ffmpeg-latest
heroku buildpacks:add https://github.com/clhuang/heroku-buildpack-webp-binaries.git
```

6. Set environment variables:
```bash
heroku config:set SESSION_ID=BLACKSKY-MD
heroku config:set BOT_NAME=BLACKSKY-MD
heroku config:set OWNER_NUMBER=491556315347
heroku config:set PREFIX=.
heroku config:set NODE_ENV=production
```

7. Enable Docker deployment:
```bash
heroku stack:set container
```

8. Push to Heroku:
```bash
git push heroku main
```

9. Scale the worker dyno:
```bash
heroku ps:scale worker=1
```

## Setting Up Health Monitoring

To keep your bot alive and prevent Heroku's idling after 30 minutes of inactivity:

1. Enable the health check endpoint:
```bash
heroku config:set ENABLE_HEALTH_CHECK=true
```

2. Add a monitoring service like UptimeRobot:
   - Create a free account at [uptimerobot.com](https://uptimerobot.com)
   - Add a new HTTP(s) monitor
   - Set the URL to `https://your-app-name.herokuapp.com/health`
   - Set check interval to 5 minutes

This will ping your bot regularly to keep it active.

## Database Configuration

The bot has integrated PostgreSQL support for storing user data:

1. The database is automatically configured when you add the PostgreSQL addon
2. User data, session information, and game economy data will be stored in the database
3. To view your database connection info:
```bash
heroku pg:credentials:url -a your-app-name
```

4. To connect to your database for management:
```bash
heroku pg:psql -a your-app-name
```

## Verifying Deployment

Once deployed, you can check the logs to see if the bot is running properly:

```bash
heroku logs --tail
```

You can also check the bot's status page at:
`https://your-app-name.herokuapp.com/`

## Troubleshooting

If you encounter any issues during deployment:

1. Check the Heroku logs:
```bash
heroku logs --tail
```

2. Make sure you have set all the required environment variables.

3. Try restarting the worker dyno:
```bash
heroku ps:restart worker
```

4. Check if your PostgreSQL database is properly connected:
```bash
heroku pg:info -a your-app-name
```

### Common Deployment Issues and Solutions

#### Connection Issues

**Issue**: Bot can't establish connection with WhatsApp
**Solution**:
- Clear sessions directory and re-scan QR code
- Make sure your WhatsApp number isn't connected to too many devices
- Check if your IP address isn't blocked by Meta/WhatsApp
- Try upgrading to a larger dyno size

```bash
# Reset sessions
heroku run bash -a your-app-name
cd sessions
rm -rf *
exit
heroku ps:restart worker -a your-app-name
```

#### Memory Issues

**Issue**: Bot crashes with memory errors
**Solution**:
- Upgrade to a larger dyno size
- Check for memory leaks in custom plugins
- Enable daily restarts

```bash
# Monitor memory usage
heroku ps:metrics -a your-app-name
```

#### Database Issues

**Issue**: "Database connection failed" errors
**Solution**:
- Check database credentials
- Verify database is provisioned correctly
- Reset the database connection

```bash
# Reset database connection
heroku addons:detach DATABASE -a your-app-name
heroku addons:attach postgresql-addon-name -a your-app-name --as DATABASE
heroku ps:restart worker -a your-app-name
```

#### Slow Performance

**Issue**: Bot responses are very slow
**Solution**:
- Upgrade to a larger dyno size
- Reduce number of plugins loaded
- Optimize database queries
- Use a geographically closer server region

#### Timeout Errors

**Issue**: Heroku H12 timeout errors
**Solution**:
- Ensure health check endpoints respond quickly
- Add proper error handling for long operations
- Use background processing for resource-intensive tasks

#### Deployment Failures

**Issue**: Failed to deploy to Heroku
**Solution**:
- Check for syntax errors in code
- Ensure all dependencies are properly listed
- Verify Heroku buildpacks are correctly configured
- Check for large files that should be in .gitignore

```bash
# Check deployment logs
heroku builds:info -a your-app-name
```

## Maintaining Persistent Sessions

To maintain your WhatsApp session across restarts:

1. The bot uses the PostgreSQL database to store essential session data.
2. Only QR code scanning is needed for the initial setup.
3. The bot automatically recovers session information after restarts.

## 24/7 Operation with PM2

BLACKSKY-MD Premium uses PM2 (Process Manager 2) to ensure 24/7 operation with automatic restarts and crash recovery.

### PM2 Features Used in BLACKSKY-MD:

1. **Automatic Restart:** The bot automatically restarts if it crashes or encounters fatal errors.
2. **Memory Management:** PM2 monitors memory usage and can restart the process if it exceeds configured limits.
3. **Log Management:** All logs are stored in the `logs` directory for troubleshooting.
4. **Graceful Shutdown:** Properly saves WhatsApp sessions and data during Heroku dyno cycling or shutdowns.
5. **Daily Restart:** Scheduled restart at 4:00 AM for maintenance and memory cleanup.
6. **Error Handling:** Improved error handling to prevent crashes and ensure continuous operation.

### PM2 Configuration:

PM2 configuration is managed through `ecosystem.config.js`. The key settings are:

```javascript
{
  name: "BLACKSKY-MD",
  script: "index.js",
  args: ["--autocleartmp", "--autoread"],
  watch: true,
  ignore_watch: ["node_modules", "tmp", "sessions", "database.json"],
  max_memory_restart: "1G",
  autorestart: true,
  restart_delay: 5000,
  cron_restart: "0 4 * * *" // Daily restart at 4:00 AM
}
```

### Important Notes for 24/7 Operation:

- Heroku free tier has been discontinued. You'll need to use a paid plan.
- Recommended plan: "Eco" dyno ($5/month) + "Mini" PostgreSQL ($5/month).
- For optimal performance, upgrade to a "Basic" dyno ($7/month) if you experience frequent memory issues.
- The health check endpoint keeps the application alive on Heroku.
- WhatsApp session data is persisted across restarts using both database and files.
- To avoid connection throttling, we recommend using only one bot per WhatsApp number.
- For highly active groups, consider upgrading to a "Standard-1X" dyno ($25/month) for better performance.

### Monitoring Your Bot:

Once deployed, you can monitor your bot through:

1. The status page: `https://your-app-name.herokuapp.com/`
2. The health check endpoint: `https://your-app-name.herokuapp.com/health`
3. PM2 metrics: `https://your-app-name.herokuapp.com/metrics`
4. Session status: `https://your-app-name.herokuapp.com/status`
5. Heroku logs: `heroku logs --tail -a your-app-name`

## Support

If you need help with deployment or encounter any issues, create an issue on the GitHub repository or contact the owner via WhatsApp.

## Required Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| SESSION_ID | A unique identifier for your WhatsApp session | BLACKSKY-MD |
| BOT_NAME | The name of your WhatsApp bot | BLACKSKY-MD |
| OWNER_NUMBER | Your WhatsApp number with country code | Required |
| PREFIX | Command prefix for the bot | . |
| NODE_ENV | Environment setting | production |
| ENABLE_HEALTH_CHECK | Enable the health check endpoint | true |