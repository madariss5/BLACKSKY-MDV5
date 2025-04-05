#!/bin/bash
# BLACKSKY-MD Premium - Heroku PM2 Deployment Script
# This script sets up direct PM2 integration for Heroku deployment

# Show info banner
echo "========================================"
echo "  BLACKSKY-MD Heroku PM2 Setup Script  "
echo "========================================"
echo "This script will set up your bot for deployment on Heroku with PM2"
echo ""

# Create Procfile
echo "Creating Procfile..."
echo "web: pm2-runtime start heroku-bot-starter.js --name BLACKSKY-MD -- --autocleartmp --autoread" > Procfile
echo "✅ Procfile created"

# Check if ecosystem.config.js exists and show info
if [ -f "ecosystem.config.js" ]; then
  echo "ℹ️ ecosystem.config.js was found but will not be used for Heroku deployment"
  echo "ℹ️ Heroku uses Procfile first, so PM2 will be configured through the Procfile"
fi

# Create logs directory if it does not exist
if [ ! -d "logs" ]; then
  echo "Creating logs directory..."
  mkdir -p logs
  echo "✅ logs directory created"
fi

# Display deployment instructions
echo ""
echo "========================================"
echo "  DEPLOYMENT INSTRUCTIONS  "
echo "========================================"
echo ""
echo "1. HEROKU CLI DEPLOYMENT:"
echo "------------------------"
echo "heroku login"
echo "heroku create your-app-name"
echo "heroku addons:create heroku-postgresql:mini"
echo "git add ."
echo "git commit -m \"Ready for Heroku deployment with PM2\""
echo "git push heroku main"
echo ""
echo "2. ENVIRONMENT VARIABLES:"
echo "------------------------"
echo "Make sure to set these in Heroku dashboard:"
echo "- SESSION_ID"
echo "- BOT_NAME"
echo "- OWNER_NUMBER"
echo "- PREFIX (optional)"
echo "- NODE_ENV=production"
echo "- HEROKU=true"
echo ""
echo "3. SCHEDULED RESTART (recommended):"
echo "--------------------------------"
echo "Install Heroku Scheduler addon and add daily job:"
echo "heroku addons:create scheduler:standard"
echo "Then create a job with command: heroku restart && echo \"App restarted\""
echo ""
echo "4. TROUBLESHOOTING:"
echo "----------------"
echo "- View logs: heroku logs --tail"
echo "- Force restart: heroku restart"
echo "- Check database: heroku pg:info"
echo ""
echo "✅ Setup complete! Your bot is ready for Heroku deployment with PM2."
