#!/bin/bash
# BLACKSKY-MD Termux-specific run script with Sharp fix

# Set Termux environment variable
export TERMUX=true

# Ensure directories exist
mkdir -p tmp
mkdir -p sessions
mkdir -p media

# Set NODE_OPTIONS for better memory management
export NODE_OPTIONS="--max-old-space-size=1024"

# Run the bot with Termux optimizations
node --expose-gc index.js
