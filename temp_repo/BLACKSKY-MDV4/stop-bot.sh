#!/data/data/com.termux/files/usr/bin/bash

# Script to stop the WhatsApp bot and release wake lock

echo "=== Stopping WhatsApp Bot ==="

# Check if PM2 is installed
if ! command -v pm2 &> /dev/null; then
    echo "PM2 not found. Cannot stop the bot with PM2."
    echo "Trying alternative methods..."
    
    # Try to find and kill the Node.js process
    if pgrep -f "node.*main.js" > /dev/null; then
        echo "Killing Node.js processes running main.js..."
        pkill -f "node.*main.js"
        echo "Process terminated."
    else
        echo "No running Node.js processes found for the bot."
    fi
else
    # Stop the bot with PM2
    echo "Stopping WhatsApp bot with PM2..."
    pm2 stop WhatsAppBot
    
    # Optional: Completely remove from PM2
    # Uncomment the line below if you want to remove it from PM2's list
    # pm2 delete WhatsAppBot
    
    echo "WhatsApp bot stopped successfully."
fi

# Release wake lock if termux-api is installed
if command -v termux-wake-unlock &> /dev/null; then
    echo "Releasing wake lock..."
    termux-wake-unlock
    echo "Wake lock released."
else
    echo "termux-api not found. Cannot release wake lock."
    echo "Install it with: pkg install termux-api"
fi

echo ""
echo "=== Bot has been stopped ==="
echo "To start it again, run: ./run-bot-background.sh"