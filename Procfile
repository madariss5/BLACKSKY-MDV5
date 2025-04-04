# BLACKSKY-MD Premium WhatsApp Bot Heroku Procfile
# Configure both web and worker processes for optimal 24/7 operation

# Web process for health monitoring, metrics and status page
web: node connection-patch.js

# Worker process for WhatsApp bot with PM2 for robust process management
worker: npm install -g pm2 && mkdir -p logs sessions sessions-backup tmp media && pm2-runtime ecosystem.config.js --env production

# Release phase tasks to prepare the environment
release: bash -c "echo Preparing environment for BLACKSKY-MD Premium"
