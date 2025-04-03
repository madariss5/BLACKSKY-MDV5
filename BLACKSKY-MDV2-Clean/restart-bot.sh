#!/data/data/com.termux/files/usr/bin/bash

# Script to restart the WhatsApp bot with PM2

echo "=== Restarting WhatsApp Bot ==="

# Check if PM2 is installed
if ! command -v pm2 &> /dev/null; then
    echo "PM2 not found. Cannot restart the bot with PM2."
    echo "Installing PM2..."
    npm install -g pm2
    
    # Check if installation was successful
    if ! command -v pm2 &> /dev/null; then
        echo "PM2 installation failed. Please run 'npm install -g pm2' manually."
        exit 1
    fi
fi

# Check if the bot is running with PM2
if pm2 list | grep -q "WhatsAppBot"; then
    echo "Restarting WhatsApp Bot with PM2..."
    pm2 restart WhatsAppBot
    echo "WhatsApp Bot has been restarted successfully."
else
    echo "WhatsApp Bot is not running with PM2. Starting it now..."
    
    # Install termux-api if not already installed (for wake lock)
    if ! command -v termux-wake-lock &> /dev/null; then
        echo "Installing termux-api for wake lock..."
        pkg install termux-api -y
    fi
    
    # Apply wake lock to keep the process alive when Termux is closed
    echo "Acquiring wake lock..."
    termux-wake-lock
    
    # Start the bot with PM2
    echo "Starting WhatsApp Bot with PM2..."
    pm2 start main.js --name WhatsAppBot
    
    # Save the PM2 process list
    pm2 save
    
    echo "WhatsApp Bot has been started successfully."
fi

echo ""
echo "=== Bot has been restarted ==="
echo "To check the status, run: pm2 status"
echo "To view logs, run: pm2 logs WhatsAppBot"