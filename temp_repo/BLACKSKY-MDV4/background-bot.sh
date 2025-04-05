#!/data/data/com.termux/files/usr/bin/bash
# Run WhatsApp Bot in background
echo "Starting WhatsApp Bot in background..."
NODE_OPTIONS="--max-old-space-size=512" nohup node src/termux-connection.js > bot.log 2>&1 &
echo "Bot is running in background. Check bot.log for output."
echo "Process ID: $!"
