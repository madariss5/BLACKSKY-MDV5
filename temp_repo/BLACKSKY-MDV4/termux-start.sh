#!/bin/bash
# BLACKSKY-MD Premium - Termux Startup Script

# Show banner
echo "=============================================="
echo "  BLACKSKY-MD Premium - Termux Starter        "
echo "=============================================="
echo

# Check if running in Termux
if [ -d "/data/data/com.termux" ] || [ -n "$TERMUX_VERSION" ]; then
  echo "✅ Running in Termux environment"
else
  echo "⚠️ Not running in Termux environment"
  echo "This script is designed for Termux. Some features may not work."
fi

# Set environment variable
export TERMUX=true
export TERMUX_PM2=true

# Check for required packages
check_and_install() {
  if ! command -v $1 > /dev/null; then
    echo "📦 Installing $1..."
    pkg install -y $1
  else
    echo "✅ $1 is already installed"
  fi
}

# Install essential packages
echo "Checking for required packages..."
check_and_install nodejs
check_and_install git
check_and_install ffmpeg
check_and_install imagemagick
check_and_install termux-api

# Install PM2 if not already installed
if ! command -v pm2 > /dev/null; then
  echo "📦 Installing PM2 globally..."
  npm install -g pm2
  
  # Initialize PM2
  echo "🔄 Initializing PM2..."
  pm2 update
else
  echo "✅ PM2 is already installed"
fi

# Check for npm dependencies
if [ ! -d "node_modules" ]; then
  echo "📦 Installing npm dependencies..."
  npm install
else
  echo "✅ npm dependencies already installed"
fi

# Fix Sharp compatibility for Termux
if [ ! -f "sharp-compat.js" ] || [ ! -f "sharp-simple-compat.js" ]; then
  echo "🔧 Setting up Sharp compatibility layer..."
  
  # Create Sharp compatibility layer if it doesn't exist
  if [ ! -f "sharp-simple-compat.js" ]; then
    echo "📝 Creating Sharp compatibility layer..."
    
    # Install Jimp if not already installed
    if ! grep -q "jimp" package.json; then
      echo "📦 Installing Jimp as a fallback for Sharp..."
      npm install --save jimp
    fi
  fi
  
  # Run the Sharp fix script if it exists
  if [ -f "termux-fix-sharp.sh" ]; then
    echo "🔧 Running Sharp fix script..."
    chmod +x termux-fix-sharp.sh
    ./termux-fix-sharp.sh
  fi
else
  echo "✅ Sharp compatibility layer already set up"
fi

# Create necessary directories
echo "📁 Creating necessary directories..."
mkdir -p sessions
mkdir -p sessions-backup
mkdir -p logs
mkdir -p tmp
mkdir -p media
mkdir -p pm2-logs

# Acquire wake lock to prevent sleep
echo "🔒 Acquiring wake lock to prevent device sleep..."
termux-wake-lock

# Set up termux-boot for automatic start after device reboot
setup_boot_script() {
  # Check if termux-boot is installed
  if command -v termux-boot > /dev/null; then
    echo "📱 Setting up auto-start on boot..."
    mkdir -p ~/.termux/boot
    
    # Create boot script
    cat > ~/.termux/boot/start-bot << 'EOL'
#!/data/data/com.termux/files/usr/bin/sh
# Auto-start script for BLACKSKY-MD Premium
cd $(pwd)
termux-wake-lock
sleep 30
pm2 resurrect
EOL
    
    chmod +x ~/.termux/boot/start-bot
    echo "✅ Boot script created in ~/.termux/boot/start-bot"
    echo "⚠️ Make sure Termux:Boot app is installed and has permission to auto-start"
  else
    echo "⚠️ Termux:Boot not installed. Auto-start on device reboot not available."
    echo "ℹ️ You can install it with 'pkg install termux-boot'"
  fi
}

# Ask if user wants to set up auto-start
read -p "Do you want to set up auto-start on device reboot? (y/n): " setup_autostart
if [ "$setup_autostart" = "y" ] || [ "$setup_autostart" = "Y" ]; then
  setup_boot_script
else
  echo "ℹ️ Skipping auto-start setup"
fi

# Apply Sharp patch to index.js
echo "🔧 Applying Sharp compatibility patch to index.js..."
node index-sharp-patch.js

# Start the bot with PM2
echo "🚀 Starting bot with PM2..."
pm2 start ecosystem.config.js

# Check if the bot started successfully
if [ $? -eq 0 ]; then
  echo "✅ Bot started successfully!"
  pm2 save
  
  # Start the monitor service
  echo "🔄 Starting PM2 Monitor service..."
  pm2 start pm2-service.js --name PM2-Monitor
  pm2 save
  
  echo
  echo "=============================================="
  echo "  BLACKSKY-MD Premium is now running!         "
  echo "=============================================="
  echo
  echo "✅ The bot is running in the background with PM2"
  echo "ℹ️ To view logs, run: pm2 logs BLACKSKY-MD"
  echo "ℹ️ To restart the bot, run: pm2 restart BLACKSKY-MD"
  echo "ℹ️ To stop the bot, run: pm2 stop BLACKSKY-MD"
  echo
  echo "⚠️ Keep Termux running in the background to maintain the bot"
  echo "⚠️ Disable battery optimization for Termux in Android settings"
  echo "   for better reliability"
  echo "=============================================="
else
  echo "❌ Failed to start the bot"
  echo "Please check the logs for errors"
fi