# BLACKSKY-MD HEROKU STABLE CONNECTION GUIDE

This guide explains how to set up your BLACKSKY-MD WhatsApp bot on Heroku with enhanced connection stability to prevent disconnections.

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Setting Up Heroku](#setting-up-heroku)
3. [Database Configuration](#database-configuration)
4. [Environment Variables](#environment-variables)
5. [Deploying to Heroku](#deploying-to-heroku)
6. [Maintaining Connection Stability](#maintaining-connection-stability)
7. [Troubleshooting](#troubleshooting)

## Prerequisites

- A Heroku account (sign up at [heroku.com](https://www.heroku.com))
- Git installed on your computer ([Download Git](https://git-scm.com/downloads))
- Node.js and npm installed ([Download Node.js](https://nodejs.org/))
- BLACKSKY-MD WhatsApp bot codebase

## Setting Up Heroku

1. **Create a new Heroku app:**
   - Log in to your Heroku Dashboard
   - Click "New" and select "Create new app"
   - Choose a unique app name and select your region
   - Click "Create app"

2. **Set up Heroku CLI:**
   - Install the Heroku CLI: `npm install -g heroku`
   - Log in to your Heroku account: `heroku login`

## Database Configuration

To maintain persistent sessions across dyno restarts, we use PostgreSQL:

1. **Add PostgreSQL to your Heroku app:**
   - In your app dashboard, go to the "Resources" tab
   - In the "Add-ons" section, search for "Heroku Postgres"
   - Select the plan you want (Hobby Dev is free)
   - Click "Submit Order Form"

2. **Verify Database Configuration:**
   - The `DATABASE_URL` environment variable will be automatically added to your app
   - You can view it by going to Settings -> Config Vars in your Heroku dashboard

## Environment Variables

Set the following environment variables in Heroku (Settings -> Config Vars):

| Variable Name | Description | Example Value |
|--------------|-------------|---------------|
| `SESSION_ID` | Identifier for your bot | `BLACKSKY-MD` |
| `HEROKU_APP_URL` | URL of your Heroku app | `https://your-app-name.herokuapp.com` |
| `DEBUG` | Enable debug logs | `true` |

## Deploying to Heroku

### Method 1: Deploy with Git

1. **Initialize Git (if not already done):**
   ```bash
   cd your-bot-directory
   git init
   ```

2. **Add Heroku as a remote:**
   ```bash
   heroku git:remote -a your-heroku-app-name
   ```

3. **Deploy to Heroku:**
   ```bash
   git add .
   git commit -m "Initial deployment with connection stability"
   git push heroku main
   ```

### Method 2: Deploy with Heroku Dashboard

1. **Connect your GitHub repository:**
   - Go to the "Deploy" tab in your Heroku app dashboard
   - Choose "GitHub" as the deployment method
   - Connect to your GitHub repository
   - Choose the branch to deploy
   - Enable automatic deploys (optional)

2. **Manual Deploy:**
   - Scroll down to the "Manual deploy" section
   - Choose your branch
   - Click "Deploy Branch"

## Maintaining Connection Stability

The following files handle connection stability on Heroku:

1. **heroku-bot-starter.js**: Main entry point for the bot on Heroku
2. **heroku-connection-patch.js**: Specialized connection handling for Heroku
3. **connection-keeper.js**: Generic connection monitoring and maintenance

### Important Settings

For optimal stability, ensure that:

1. **Procfile**
   
   Your Procfile should contain:
   ```
   web: node heroku-bot-starter.js
   ```

2. **package.json**
   
   The start script should be:
   ```json
   "scripts": {
     "start": "node heroku-bot-starter.js"
   }
   ```

3. **Database Persistence**
   
   Make sure PostgreSQL is properly set up as explained above. This ensures your session persists through dyno restarts.

## Key Features for Stability

Our Heroku connection stability solution includes:

1. **PostgreSQL Session Persistence**
   - WhatsApp session credentials are stored in PostgreSQL
   - Automatic restoration after dyno restarts
   - Regular session backups (every 5 minutes)

2. **Connection Monitoring**
   - Continuous monitoring of WebSocket connection
   - Automatic reconnection with exponential backoff
   - Heartbeat mechanism to prevent timeouts

3. **Dyno Cycling Preparation**
   - Graceful handling of SIGTERM signals
   - Quick session backup before shutdown
   - Rapid restoration on startup

4. **Anti-Idle System**
   - Prevents Heroku free dynos from sleeping
   - Internal ping mechanism
   - Web endpoint accessible externally

## Troubleshooting

### WhatsApp Connection Issues

**Problem**: Bot disconnects after a few hours  
**Solution**: Check the Heroku logs (`heroku logs --tail`) for any error messages. Ensure the DATABASE_URL is properly set.

**Problem**: Session doesn't persist after dyno restart  
**Solution**: Confirm that PostgreSQL is properly connected and the bot can access it. Check logs for database connection errors.

**Problem**: "Session not created" error  
**Solution**: Delete the `sessions` folder in your repo, redeploy, and scan a new QR code.

### Heroku-Specific Issues

**Problem**: H12 - Request timeout errors  
**Solution**: This is normal during QR code scanning. The connection process takes longer than Heroku's 30-second timeout. Wait for it to complete.

**Problem**: R10 - Boot timeout errors  
**Solution**: Your app is taking too long to start. Check startup logs for errors and optimize the startup sequence.

**Problem**: H10 - App crashed errors  
**Solution**: Check your logs for JavaScript errors. Most commonly this is due to missing dependencies or environment variables.

### Getting Additional Help

If you're still experiencing issues:

1. Check the full logs: `heroku logs --tail`
2. Enable debug mode by setting `DEBUG=true` in your Heroku config vars
3. Check the PostgreSQL connection: `heroku pg:info`

## Validating Stability

To verify your bot is running stably:

1. **Monitor Connection Status**: 
   - Visit `https://your-app-name.herokuapp.com/status` to see uptime
   - Check logs for "Connection established" messages

2. **Test Persistence**:
   - Restart your dyno: `heroku restart`
   - Monitor logs to see if the session is restored without requiring a new QR code

3. **Extended Testing**:
   - Let the bot run for 24+ hours
   - Monitor for any disconnections or issues

## Advanced Configuration

For even better stability, consider:

1. **Multiple Dynos** (paid plans only):
   - Scale your app to multiple dynos for redundancy
   - Use `heroku ps:scale web=2` to run 2 web dynos

2. **Scheduler Add-on**:
   - Add the Heroku Scheduler add-on
   - Create a task that pings your app every 10 minutes

3. **Memory Management**:
   - Monitor memory usage with `heroku metrics:web`
   - Adjust NODE_OPTIONS in config vars if needed

## Keep Your Bot Running 24/7

For best results:

1. Use a paid Heroku plan (Basic or higher) to avoid the free plan's limitations
2. Implement all the stability features in this guide
3. Set up external monitoring to alert you of any downtime
4. Regularly backup your session data using `heroku pg:backups`