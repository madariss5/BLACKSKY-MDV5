#!/data/data/com.termux/files/usr/bin/bash

# Termux PM2 Setup Script for WhatsApp Bot
# This script sets up PM2 for running the WhatsApp bot in the background
# even after Termux is closed

echo "=== WhatsApp Bot PM2 Setup for Termux ==="

# Update packages
echo "Updating Termux packages..."
pkg update -y
pkg upgrade -y

# Install Node.js and necessary packages
echo "Installing Node.js and required packages..."
pkg install nodejs -y
pkg install git -y

# Install PM2 globally
echo "Installing PM2..."
npm install -g pm2

# Set up the wake lock to keep the bot running in the background
echo "Setting up wake lock for keeping the process alive..."
pkg install termux-api -y

# Create a ecosystem.config.js file for PM2
echo "Creating PM2 configuration file..."
cat > ecosystem.config.js << 'EOL'
module.exports = {
  apps: [{
    name: "WhatsAppBot",
    script: "main.js", // Your main bot file
    watch: false,
    autorestart: true,
    restart_delay: 5000,
    env: {
      NODE_ENV: "production",
    }
  }]
}
EOL

# Create startup script
echo "Creating startup script..."
cat > start-bot.sh << 'EOL'
#!/data/data/com.termux/files/usr/bin/bash

# Acquire wake lock to prevent the process from being killed
# when Termux is closed
termux-wake-lock

# Start the bot with PM2
pm2 start ecosystem.config.js

# Save the PM2 process list
pm2 save

# Setup PM2 to start on boot
pm2 startup

echo "WhatsApp Bot is now running in the background with PM2"
echo "You can close Termux, and the bot will continue running"
echo ""
echo "Commands you might need:"
echo "- To check status: pm2 status"
echo "- To view logs: pm2 logs WhatsAppBot"
echo "- To stop the bot: pm2 stop WhatsAppBot"
echo "- To restart the bot: pm2 restart WhatsAppBot"
EOL

# Make the startup script executable
chmod +x start-bot.sh

# Create a stop script
echo "Creating stop script..."
cat > stop-bot.sh << 'EOL'
#!/data/data/com.termux/files/usr/bin/bash

# Stop the bot
pm2 stop WhatsAppBot

# Release the wake lock
termux-wake-unlock

echo "WhatsApp Bot has been stopped"
EOL

# Make the stop script executable
chmod +x stop-bot.sh

# Create a restart script
echo "Creating restart script..."
cat > restart-bot.sh << 'EOL'
#!/data/data/com.termux/files/usr/bin/bash

# Restart the bot
pm2 restart WhatsAppBot

echo "WhatsApp Bot has been restarted"
EOL

# Make the restart script executable
chmod +x restart-bot.sh

# Create instructions
echo "Creating README with instructions..."
cat > TERMUX-PM2-INSTRUCTIONS.md << 'EOL'
# WhatsApp Bot PM2 Setup for Termux

This guide explains how to run your WhatsApp bot with PM2 in Termux, allowing it to run in the background even after closing Termux.

## Initial Setup

You've already run the setup script which installed PM2 and created the necessary configuration files.

## Commands

### Starting the Bot for the First Time

```bash
./start-bot.sh
```

This will:
1. Acquire a wake lock to keep the process alive when Termux is closed
2. Start the bot with PM2
3. Configure PM2 to start automatically

### Viewing Bot Status

```bash
pm2 status
```

### Viewing Bot Logs

```bash
pm2 logs WhatsAppBot
```

### Stopping the Bot

```bash
./stop-bot.sh
```

This will stop the bot and release the wake lock.

### Restarting the Bot

```bash
./restart-bot.sh
```

## Troubleshooting

If the bot is not running properly:

1. Check the logs: `pm2 logs WhatsAppBot`
2. Try restarting: `pm2 restart WhatsAppBot`
3. If PM2 is not working: 
   - Kill all Node.js processes: `pkill node`
   - Start fresh: `./start-bot.sh`

## Auto-Starting After Termux Restart

1. Run: `pm2 startup`
2. Follow the instructions provided
3. Then run: `pm2 save`

## Important Notes

1. Never force-close Termux; always exit normally
2. The bot will continue to run in the background even after closing Termux
3. Ensure your Android device doesn't have aggressive battery optimization which might kill background processes
4. Consider adding Termux to battery optimization exceptions in your Android settings
EOL

echo "================================================"
echo "Setup completed! Follow these steps to run your bot:"
echo ""
echo "1. Start your bot in the background:"
echo "   ./start-bot.sh"
echo ""
echo "2. You can now close Termux, and the bot will continue running"
echo ""
echo "3. To stop the bot, run:"
echo "   ./stop-bot.sh"
echo ""
echo "4. See TERMUX-PM2-INSTRUCTIONS.md for more details"
echo "================================================"