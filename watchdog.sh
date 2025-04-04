#!/data/data/com.termux/files/usr/bin/bash
# WhatsApp Bot Watchdog for Auto-restart
LOG_FILE="watchdog.log"

echo "Starting Watchdog at $(date)" > "$LOG_FILE"

while true; do
    # Check if bot is running
    if ! pgrep -f "node src/termux-connection.js" > /dev/null; then
        echo "$(date): Bot is not running, restarting..." >> "$LOG_FILE"
        # Kill any existing node processes (avoid duplicates)
        pkill -f "node src/termux-connection.js" || true
        # Start the bot
        NODE_OPTIONS="--max-old-space-size=512" nohup node src/termux-connection.js > bot.log 2>&1 &
        echo "$(date): Bot restarted with PID: $!" >> "$LOG_FILE"
    else
        echo "$(date): Bot is running normally" >> "$LOG_FILE"
    fi
    
    # Wait 5 minutes before checking again
    sleep 300
done
