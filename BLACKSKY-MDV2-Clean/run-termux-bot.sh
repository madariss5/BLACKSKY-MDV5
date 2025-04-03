#!/data/data/com.termux/files/usr/bin/bash

# Enhanced script to run WhatsApp bot in background with PM2 on Termux
# This script has additional features for better Termux compatibility

echo "=== Running WhatsApp Bot on Termux with PM2 ==="

# Check for required packages
check_and_install_package() {
    if ! command -v $1 &> /dev/null; then
        echo "$1 not found. Installing $1..."
        pkg install $1 -y
        
        # Verify installation
        if ! command -v $1 &> /dev/null; then
            echo "Failed to install $1. Please install it manually with: pkg install $1 -y"
            return 1
        fi
        echo "$1 installed successfully."
    else
        echo "$1 is already installed."
    fi
    return 0
}

# Install necessary packages
check_and_install_package nodejs || exit 1
check_and_install_package termux-api || exit 1

# Install PM2 if not already installed
if ! command -v pm2 &> /dev/null; then
    echo "PM2 not found. Installing PM2..."
    npm install -g pm2
    
    # Check if installation was successful
    if ! command -v pm2 &> /dev/null; then
        echo "PM2 installation failed. Please run 'npm install -g pm2' manually."
        exit 1
    fi
    echo "PM2 installed successfully."
else
    echo "PM2 is already installed."
fi

# Apply wake lock to keep the process alive when Termux is closed
echo "Acquiring wake lock..."
termux-wake-lock

# Check for existing PM2 processes
if pm2 list | grep -q "WhatsAppBot"; then
    echo "WhatsApp Bot is already running with PM2."
    echo "Restarting to apply any changes..."
    pm2 restart WhatsAppBot
else
    # Determine the correct startup file
    if [ -f "index.js" ]; then
        START_FILE="index.js"
    elif [ -f "main.js" ]; then
        START_FILE="main.js"
    else
        echo "Error: Could not find index.js or main.js to start the bot."
        echo "Please make sure one of these files exists in the current directory."
        termux-wake-unlock
        exit 1
    fi
    
    echo "Starting WhatsApp Bot with PM2 using $START_FILE..."
    pm2 start $START_FILE --name WhatsAppBot --max-memory-restart 300M
fi

# Save the PM2 process list
echo "Saving PM2 process list..."
pm2 save

# Setup PM2 to start on boot (Termux restart)
echo "Setting up PM2 to start on boot..."
pm2 startup

# Create a simple Termux:Boot script if the directory exists
if [ -d ~/.termux/boot ]; then
    echo "Creating Termux:Boot script..."
    cat > ~/.termux/boot/start-bot << 'EOL'
#!/data/data/com.termux/files/usr/bin/bash
cd $(dirname $(readlink -f $0))/../../..
termux-wake-lock
pm2 resurrect
EOL
    chmod +x ~/.termux/boot/start-bot
    echo "Termux:Boot script created. Bot will auto-start on device reboot."
else
    echo "Note: Termux:Boot is not installed. Install it from F-Droid for auto-start on reboot."
    echo "After installing Termux:Boot, run this script again to configure auto-start."
fi

# Setup battery optimization warning
if [ -f /data/data/com.termux/files/usr/bin/termux-battery-status ]; then
    BATTERY_INFO=$(termux-battery-status)
    if echo "$BATTERY_INFO" | grep -q "powerSaveMode.:true"; then
        echo ""
        echo "⚠️ WARNING: Power saving mode is active on your device ⚠️"
        echo "This may prevent the bot from running properly in the background."
        echo "Please disable battery optimization for Termux in your device settings."
    fi
fi

echo ""
echo "==============================================="
echo "WhatsApp Bot is now running in the background!"
echo "You can safely close Termux, and the bot will continue to run."
echo ""
echo "Useful commands:"
echo "- View bot status: pm2 status"
echo "- View logs: pm2 logs WhatsAppBot"
echo "- Monitor logs in real-time: pm2 monit"
echo "- Stop bot: pm2 stop WhatsAppBot"
echo "- Restart bot: pm2 restart WhatsAppBot"
echo "- Release wake lock (to stop): termux-wake-unlock"
echo "==============================================="