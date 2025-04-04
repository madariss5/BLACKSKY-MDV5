#!/data/data/com.termux/files/usr/bin/bash
# Run WhatsApp Bot in foreground
echo "Starting WhatsApp Bot..."
NODE_OPTIONS="--max-old-space-size=512" node src/termux-connection.js
