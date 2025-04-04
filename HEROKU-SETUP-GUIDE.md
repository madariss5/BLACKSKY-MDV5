# BLACKSKY-MD Premium - Heroku Deployment Guide

This guide provides comprehensive steps to deploy your BLACKSKY-MD Premium WhatsApp bot on Heroku with the optimal configuration for maximum reliability and performance.

## Important Optimizations

- The bot now uses direct `index.js` execution instead of PM2 process management for Heroku compatibility
- Special connection recovery system for Heroku's dyno cycling
- Automatic session backup to prevent connection loss during dyno restarts
- Memory optimization routines specific to Heroku's environment

## Prerequisites

1. A Heroku account ([Sign up here](https://signup.heroku.com/) if you don't have one)
2. [Git](https://git-scm.com/downloads) installed on your computer
3. [Heroku CLI](https://devcenter.heroku.com/articles/heroku-cli) installed

## Deployment Steps

### Option 1: Deploy with Heroku Button (Recommended)

The simplest way to deploy is by clicking the Deploy to Heroku button:

[![Deploy](https://www.herokucdn.com/deploy/button.svg)](https://heroku.com/deploy?template=https://github.com/blackskytech/BLACKSKY-MD)

1. After clicking, you'll be taken to the Heroku deployment page
2. Fill in the required environment variables:
   - `SESSION_ID`: A unique name for your bot session
   - `OWNER_NUMBER`: Your WhatsApp number with country code (e.g., 491556315347)
3. Click "Deploy App" and wait for the deployment to complete
4. Once deployed, go to the Heroku dashboard and select your app
5. Navigate to "Resources" tab and make sure both dyno types are activated:
   - `web`: For the health monitoring system (connection-patch.js)
   - `worker`: For the actual bot (index.js)

### Option 2: Manual Deployment

If you prefer manual deployment or want to deploy your modified version:

1. Clone this repository:
   ```bash
   git clone https://github.com/blackskytech/BLACKSKY-MD.git
   cd BLACKSKY-MD
   ```

2. Login to Heroku CLI:
   ```bash
   heroku login
   ```

3. Create a new Heroku app:
   ```bash
   heroku create your-app-name
   ```

4. Add PostgreSQL add-on:
   ```bash
   heroku addons:create heroku-postgresql:mini
   ```

5. Configure environment variables:
   ```bash
   heroku config:set SESSION_ID=BLACKSKY-MD
   heroku config:set OWNER_NUMBER=your-number-here
   heroku config:set NODE_ENV=production
   heroku config:set ENABLE_HEALTH_CHECK=true
   heroku config:set HEROKU=true
   ```

6. Set the stack to container:
   ```bash
   heroku stack:set container
   ```

7. Add necessary buildpacks:
   ```bash
   heroku buildpacks:add heroku/nodejs
   heroku buildpacks:add https://github.com/jonathanong/heroku-buildpack-ffmpeg-latest
   heroku buildpacks:add https://github.com/clhuang/heroku-buildpack-webp-binaries.git
   ```

8. Deploy to Heroku:
   ```bash
   git push heroku main
   ```

9. Access the Heroku dashboard, go to the "Resources" tab, and ensure both web and worker dynos are enabled.

## Verifying Deployment

1. After deployment, the bot will automatically start up
2. Check the logs for proper initialization:
   ```bash
   heroku logs --tail
   ```
3. You should see messages indicating the bot is running, with lines like:
   - `Running on Heroku platform (dyno: worker.1)`
   - `Using Heroku-optimized connection patches`
   - `Port 5000 is open`
   - `Heroku connection recovery setup complete`

4. Get the QR code (for first-time setup):
   ```bash
   heroku logs --tail
   ```
   Scan the QR code with WhatsApp to link your account

## Optimizing for 24/7 Reliability

The following optimizations are automatically applied when running on Heroku:

1. **Regular Session Backups**: Session data is backed up every 10 minutes to prevent connection loss during dyno cycling
2. **Postgres Database Storage**: Critical data is saved to the PostgreSQL database
3. **Custom Connection Handling**: Heroku-specific connection recovery mechanisms are implemented
4. **Health Check System**: The web dyno periodically checks the worker's health
5. **Graceful Shutdown**: Proper shutdown procedures to prevent data loss during dyno recycling

## Troubleshooting

### Connection Issues
If you see "Connection Could Not Be Established" or similar messages:
- Check that both web and worker dynos are running
- Verify your environment variables are set correctly
- Review the logs for any specific error messages

### Session Problems
If your bot keeps disconnecting or asking for QR rescans:
- Make sure your `SESSION_ID` is properly set
- Verify the Heroku filesystem permissions
- Try deleting the sessions directory and rescanning the QR code

### Resource Limitations
If you experience performance issues:
- Consider upgrading from eco dynos to standard or performance dynos
- Check if you're hitting Heroku's memory limits
- Review CPU usage in the Heroku metrics dashboard

## Additional Configuration

For advanced customization, you can edit the following files:
- `Procfile`: Controls how Heroku runs your application
- `heroku.yml`: Container configuration for Heroku
- `config.js`: Bot's main configuration file
- `heroku-connection-fix.js`: Heroku-specific optimizations

## Need Help?

If you encounter any issues with the Heroku deployment:
1. Check the complete logs using `heroku logs --tail`
2. Refer to the Heroku [troubleshooting guide](https://devcenter.heroku.com/categories/troubleshooting)
3. Join our [support group](https://chat.whatsapp.com/JS4fmVvB1HC7uiM44J3JPO) on WhatsApp for assistance
