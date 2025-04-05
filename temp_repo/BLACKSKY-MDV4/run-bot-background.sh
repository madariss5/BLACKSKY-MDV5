#!/data/data/com.termux/files/usr/bin/bash

# Simple script to run WhatsApp bot in background with PM2
# This is a simplified alternative to the full setup script

echo "=== Running WhatsApp Bot in background with PM2 ==="

# Install PM2 if not already installed
if ! command -v pm2 &> /dev/null; then
    echo "PM2 not found. Installing PM2..."
    npm install -g pm2
    
    # Check if installation was successful
    if ! command -v pm2 &> /dev/null; then
        echo "PM2 installation failed. Please run 'npm install -g pm2' manually."
        exit 1
    fi
fi

# Install termux-api if not already installed (for wake lock)
if ! command -v termux-wake-lock &> /dev/null; then
    echo "Installing termux-api for wake lock..."
    pkg install termux-api -y
fi

# Apply wake lock to keep the process alive when Termux is closed
echo "Acquiring wake lock..."
termux-wake-lock

# Start the bot with PM2 if not already running
if pm2 list | grep -q "WhatsAppBot"; then
    echo "WhatsApp Bot is already running with PM2."
    echo "Restarting to apply any changes..."
    pm2 restart WhatsAppBot
else
    echo "Starting WhatsApp Bot with PM2..."
    pm2 start main.js --name WhatsAppBot
fi

# Save the PM2 process list
pm2 save

# Setup PM2 to start on boot (Termux restart)
pm2 startup

echo ""
echo "==============================================="
echo "WhatsApp Bot is now running in the background!"
echo "You can safely close Termux, and the bot will continue to run."
echo ""
echo "Useful commands:"
echo "- View bot status: pm2 status"
echo "- View logs: pm2 logs WhatsAppBot"
echo "- Stop bot: pm2 stop WhatsAppBot"
echo "- To release wake lock: termux-wake-unlock"
echo "==============================================="