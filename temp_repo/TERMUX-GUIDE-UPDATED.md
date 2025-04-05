# Running WhatsApp Bot in Background on Termux

This updated guide will help you run the WhatsApp bot in the background on Termux, even after closing the Termux app. We have created improved scripts that handle various scenarios automatically.

## Prerequisites

Make sure you have Termux installed from either:
- [Google Play Store](https://play.google.com/store/apps/details?id=com.termux) or
- [F-Droid](https://f-droid.org/packages/com.termux/) (Recommended for better background support)

## Quick Start Guide (Recommended)

For most users, this is the easiest way to get the bot running in the background:

1. Make the new Termux script executable:
   ```bash
   chmod +x run-termux-bot.sh
   ```

2. Run the enhanced Termux script:
   ```bash
   ./run-termux-bot.sh
   ```

3. The script will:
   - Install all necessary packages if they aren't already installed
   - Acquire a wake lock to prevent Termux from killing the process
   - Start the bot with PM2
   - Configure auto-restart settings
   - Set up auto-start after reboot (if Termux:Boot is installed)

4. You can now close Termux, and the bot will continue running in the background.

## Alternative Options

### Full Setup With Multiple Scripts

If you prefer a full setup with separate scripts for different operations:

1. Run the setup script:
   ```bash
   chmod +x termux-setup.sh
   ./termux-setup.sh
   ```

2. This will create:
   - `start-bot.sh` - To start the bot
   - `stop-bot.sh` - To stop the bot
   - `restart-bot.sh` - To restart the bot

3. Use these scripts as needed:
   ```bash
   ./start-bot.sh    # To start the bot
   ./stop-bot.sh     # To stop the bot
   ./restart-bot.sh  # To restart the bot
   ```

### Simple Start

If you just want a simple script that handles the essentials:

```bash
chmod +x run-bot-background.sh
./run-bot-background.sh
```

## Managing Your Running Bot

### Check Status

To check if your bot is running:

```bash
pm2 status
```

### View Logs

To see the bot's logs in real-time:

```bash
pm2 logs WhatsAppBot
```

### Interactive Monitoring

For an interactive dashboard to monitor performance:

```bash
pm2 monit
```

### Stop the Bot

To stop the bot:

```bash
pm2 stop WhatsAppBot
```

Or use the provided script:

```bash
./stop-bot.sh
```

### Restart the Bot

To restart the bot:

```bash
pm2 restart WhatsAppBot
```

Or use the provided script:

```bash
./restart-bot.sh
```

## Troubleshooting

### Bot Stops After Closing Termux

If your bot stops when you close Termux:

1. Make sure the wake lock is acquired:
   ```bash
   termux-wake-lock
   ```

2. Ensure Termux is excluded from battery optimization in your Android settings:
   - Go to **Settings > Apps > Termux > Battery**
   - Select "No restrictions" or "Don't optimize"

3. Try the enhanced script which handles wake locks better:
   ```bash
   ./run-termux-bot.sh
   ```

### Memory Issues

If the bot crashes due to memory limitations:

1. Restart with memory limits:
   ```bash
   pm2 start index.js --name WhatsAppBot --max-memory-restart 250M
   ```

2. Or edit ecosystem.config.js to add memory limits:
   ```javascript
   module.exports = {
     apps: [{
       name: "WhatsAppBot",
       script: "index.js",
       watch: false,
       autorestart: true,
       max_memory_restart: "250M",
       restart_delay: 5000,
       env: {
         NODE_ENV: "production",
       }
     }]
   }
   ```

### PM2 Issues

If PM2 is not working correctly:

1. Reset PM2:
   ```bash
   pm2 kill
   pm2 start ecosystem.config.js
   pm2 save
   ```

2. If that doesn't work, reinstall PM2:
   ```bash
   npm remove -g pm2
   npm install -g pm2
   ./run-termux-bot.sh
   ```

## Auto-Start After Phone Reboot

### Using Termux:Boot (Recommended)

1. Install Termux:Boot from F-Droid (not available on Play Store version)

2. Run our enhanced script which will set up Termux:Boot automatically:
   ```bash
   ./run-termux-bot.sh
   ```

3. Or manually create a boot script:
   ```bash
   mkdir -p ~/.termux/boot
   echo "#!/data/data/com.termux/files/usr/bin/bash" > ~/.termux/boot/start-bot
   echo "cd $(pwd)" >> ~/.termux/boot/start-bot
   echo "termux-wake-lock" >> ~/.termux/boot/start-bot
   echo "pm2 resurrect" >> ~/.termux/boot/start-bot
   chmod +x ~/.termux/boot/start-bot
   ```

4. Always save your PM2 process list after any changes:
   ```bash
   pm2 save
   ```

## Important Notes for Phone Battery Life

1. The bot will use some battery as it runs continuously in the background.

2. To minimize battery usage:
   - Keep your WhatsApp bot code efficient
   - Avoid unnecessary plugins that consume resources
   - Consider setting PM2 to restart periodically to clean up memory

3. Your phone's battery optimization settings might kill the process on some devices:
   - Make sure Termux is excluded from battery optimization
   - Consider using a phone with minimal bloatware
   - Custom ROMs sometimes perform better for background tasks

4. Always exit Termux properly by pressing the back button or typing `exit` rather than force-closing it.

5. Some Android versions may not allow continuous background processes - this varies by manufacturer and Android version.

## Script Location Reference

Here's a summary of all the scripts available to manage your bot:

- `./run-termux-bot.sh` - Enhanced script for Termux with automatic setup (recommended)
- `./run-bot-background.sh` - Simple script to run the bot in the background
- `./termux-setup.sh` - Full setup script that creates separate start/stop/restart scripts
- `./start-bot.sh` - Script to start the bot (created by termux-setup.sh)
- `./stop-bot.sh` - Script to stop the bot
- `./restart-bot.sh` - Script to restart the bot