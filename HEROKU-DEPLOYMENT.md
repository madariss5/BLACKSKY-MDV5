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
4. Add PostgreSQL database (required for storing sessions and user data):
   ```bash
   heroku addons:create heroku-postgresql:mini -a your-app-name
   ```

### Option 2: Manual Deployment with Git

1. Fork this repository to your GitHub account.
2. Clone your forked repository:
   ```bash
   git clone https://github.com/your-username/BLACKSKY-MD.git
   cd BLACKSKY-MD
   ```
3. Log in to Heroku:
   ```bash
   heroku login
   ```
4. Create a new Heroku app:
   ```bash
   heroku create your-app-name
   ```
5. Add PostgreSQL database:
   ```bash
   heroku addons:create heroku-postgresql:mini
   ```
6. Set the required environment variables:
   ```bash
   heroku config:set SESSION_ID=your_session_id
   heroku config:set BOT_NAME=BLACKSKY-MD
   heroku config:set OWNER_NUMBER=your_number_with_country_code
   heroku config:set PREFIX=.
   ```
7. Push to Heroku:
   ```bash
   git push heroku main
   ```

## Important Notes for Deployment

1. **Database Usage**: The bot uses PostgreSQL to store session data, ensuring persistence across Heroku dyno restarts.

2. **Dyno Configuration**: The bot uses a web dyno to run continuously. Make sure you have sufficient dyno hours available.

3. **Environment Variables**: You can set all config variables in the Heroku dashboard under Settings > Config Vars.

4. **Logs & Troubleshooting**: View the logs using:
   ```bash
   heroku logs --tail -a your-app-name
   ```

5. **WhatsApp Connection**: After deployment, the bot will display a QR code in the logs that you need to scan with your WhatsApp to connect.

6. **24/7 Operation**: To keep the bot running 24/7 on the free tier, use a service like UptimeRobot to ping your app URL every 30 minutes.
