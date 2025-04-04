#!/bin/bash
# BLACKSKY-MD Termux-specific run script with Sharp support

echo "Starting BLACKSKY-MD WhatsApp Bot in Termux environment..."

# Set Termux environment variable
export TERMUX=true

# Ensure directories exist
mkdir -p tmp
mkdir -p sessions
mkdir -p media

# Set NODE_OPTIONS for better memory management in Termux
export NODE_OPTIONS="--max-old-space-size=1024 --expose-gc"

# Run the bot with Termux optimizations
echo "Launching bot with Termux optimizations..."
node index.js

# If the bot exits, show information
echo "Bot has stopped. To restart, run this script again."
