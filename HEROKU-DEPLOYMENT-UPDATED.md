# BLACKSKY-MD Premium - Heroku Deployment Guide (2025 Updated)

This guide provides instructions for deploying BLACKSKY-MD Premium WhatsApp Bot on Heroku with 24/7 uptime and stable connections.

## Prerequisites

1. A Heroku account (paid tier recommended for 24/7 operation)
2. Git installed on your computer
3. Basic knowledge of command line operations

## Deployment Options

### Option 1: Direct Deployment (Easiest)

[![Deploy](https://www.herokucdn.com/deploy/button.svg)](https://heroku.com/deploy)

1. Click the "Deploy to Heroku" button above
2. Fill in the required environment variables:
   - `SESSION_ID`: A unique identifier for your bot (e.g., BLACKSKY-MD)
   - `OWNER_NUMBER`: Your WhatsApp number with country code (e.g., 491556315347)
   - `BOT_NAME`: Name for your bot (defaults to BLACKSKY-MD)
   - `HEROKU_APP_URL`: Your Heroku app URL after deployment (e.g., https://your-app-name.herokuapp.com)
3. Click "Deploy App" and wait for the build to complete
4. After deployment, go to "Resources" tab and ensure the web dyno is enabled

### Option 2: Manual Deployment via Heroku CLI

```bash
# Clone the repository
git clone https://github.com/your-username/your-bot-repo.git
cd your-bot-repo

# Login to Heroku
heroku login

# Create a new Heroku app
heroku create your-app-name

# Add PostgreSQL database
heroku addons:create heroku-postgresql:mini

# Set environment variables
heroku config:set SESSION_ID=BLACKSKY-MD
heroku config:set BOT_NAME=BLACKSKY-MD
heroku config:set OWNER_NUMBER=your-number-here
heroku config:set NODE_ENV=production
heroku config:set HEROKU=true
heroku config:set HEROKU_APP_URL=https://your-app-name.herokuapp.com
heroku config:set ENABLE_HEALTH_CHECK=true
heroku config:set ENABLE_SESSION_BACKUP=true

# Push to Heroku
git push heroku main

# Scale to one web dyno
heroku ps:scale web=1

# View logs
heroku logs --tail
```

## Recommended Heroku Settings

For optimal 24/7 operation on Heroku:

1. **Use Heroku Eco or Basic Plan**: Free dynos sleep after 30 minutes of inactivity and have monthly usage limits.
2. **Enable PostgreSQL Database**: Essential for session persistence across dyno restarts.
3. **Set Up Automatic Dyno Cycling**: In app.json we have configured proper handling of Heroku's 24-hour dyno cycling.
4. **Enable Health Checks**: Set `ENABLE_HEALTH_CHECK=true` to prevent dyno sleeping.
5. **Enable Session Backups**: Set `ENABLE_SESSION_BACKUP=true` to automatically backup your WhatsApp session data.

## Verifying Deployment

1. After deployment completes, visit `https://your-app-name.herokuapp.com/status` to verify the bot is running
2. Check Heroku logs for any errors: `heroku logs --tail`
3. Scan the QR code that will be displayed in the logs using your WhatsApp
4. Once connected, your bot will show "Connected to WhatsApp" in the logs

## Maintaining 24/7 Operation

BLACKSKY-MD Premium includes specialized modules for maintaining 24/7 operation:

1. **heroku-combined-runner.js**: Runs both the bot and connection keeper in a single process
2. **heroku-connection-keeper.js**: Implements advanced connection stability mechanisms
3. **Session backup system**: Automatically backs up WhatsApp session data to PostgreSQL

These components work together to ensure your bot stays connected even during Heroku's dyno cycling (every 24 hours).

## Troubleshooting

If your bot disconnects frequently or has other issues:

1. **Check Logs**: `heroku logs --tail` to identify errors
2. **Verify Environment Variables**: Make sure all required variables are set
3. **Restart Dyno**: `heroku ps:restart` to force a clean restart
4. **Check Database**: `heroku pg:info` to ensure PostgreSQL is running
5. **Upgrade Plan**: Consider upgrading to Heroku Basic or Standard plan for better reliability

## Additional Resources

- [Heroku Documentation](https://devcenter.heroku.com/categories/reference)
- [Node.js on Heroku](https://devcenter.heroku.com/categories/nodejs-support)
- [PostgreSQL on Heroku](https://devcenter.heroku.com/categories/heroku-postgres)

For support or feature requests, please open an issue on GitHub.

---

*Last updated: April 2025*
