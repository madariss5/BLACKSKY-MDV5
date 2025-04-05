#!/bin/bash

# BLACKSKY-MD Premium - Termux Bot Starter
# Run the bot in Termux with PM2 and Sharp compatibility

# Set Termux environment
export TERMUX=true
export NODE_OPTIONS="--max-old-space-size=1024"

# Apply Sharp patch to index.js
echo "Applying Sharp compatibility patch..."
node index-sharp-patch.js

# Run the PM2 fixer
echo "Running PM2 & Sharp compatibility fixer..."
node fix-pm2-sharp.js

# Start the bot with PM2
echo "Starting bot with PM2..."
pm2 start ecosystem.config.js

# Save PM2 process list
pm2 save

echo ""
echo "Bot started successfully! ✅"
echo ""
echo "To view logs: pm2 logs BLACKSKY-MD"
echo "To restart: pm2 restart BLACKSKY-MD"
echo "To stop: pm2 stop BLACKSKY-MD"
echo ""
echo "IMPORTANT: For best performance on Android:"
echo "1. Disable battery optimization for Termux in Android settings"
echo "2. Keep Termux running in the background"
echo ""
