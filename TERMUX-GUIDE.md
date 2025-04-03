# Running WhatsApp Bot in Background on Termux

This guide will help you run your WhatsApp bot in the background on Termux, even after closing the Termux app.

## Prerequisites

Make sure you have Termux installed from either:
- [Google Play Store](https://play.google.com/store/apps/details?id=com.termux) or
- [F-Droid](https://f-droid.org/packages/com.termux/)

## Step 1: Install Required Packages

First, update Termux and install the necessary packages:

```bash
pkg update -y && pkg upgrade -y
pkg install nodejs git termux-api -y
```

## Step 2: Clone the Bot Repository (Skip if you already have the bot)

```bash
git clone https://github.com/yourusername/whatsapp-bot.git
cd whatsapp-bot
npm install
```

## Step 3: Install PM2

PM2 is a process manager that will keep your bot running in the background:

```bash
npm install -g pm2
```

## Step 4: Using the Provided Scripts

We've created several scripts to make running your bot in the background easier:

### Option A: Simple Start (Recommended for most users)

1. Make the script executable:
   ```bash
   chmod +x run-bot-background.sh
   ```

2. Run the script:
   ```bash
   ./run-bot-background.sh
   ```

3. The bot will now run in the background, and you can close Termux.

### Option B: Complete Setup

If you want a more comprehensive setup with start/stop scripts:

1. Make the script executable:
   ```bash
   chmod +x termux-setup.sh
   ```

2. Run the setup script:
   ```bash
   ./termux-setup.sh
   ```

3. Follow the on-screen instructions to start your bot.

## Step 5: Managing Your Bot

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

### Stop the Bot

To stop the bot:

```bash
pm2 stop WhatsAppBot
```

### Restart the Bot

To restart the bot:

```bash
pm2 restart WhatsAppBot
```

## Troubleshooting

### Bot Stops After Closing Termux

If your bot stops when you close Termux:

1. Make sure the wake lock is acquired:
   ```bash
   termux-wake-lock
   ```

2. Ensure Termux is excluded from battery optimization in your Android settings.

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
   ```

### Permission Denied

If you get "Permission denied" when running the scripts:

```bash
chmod +x *.sh
```

## Advanced: Auto-restart After Phone Reboot

To make your bot start automatically when your phone restarts:

1. Install Termux:Boot from F-Droid (not available on Play Store version)

2. Give Termux:Boot the required permissions

3. Create a boot script:
   ```bash
   mkdir -p ~/.termux/boot
   echo "#!/data/data/com.termux/files/usr/bin/sh" > ~/.termux/boot/start-bot
   echo "cd /path/to/your/whatsapp-bot" >> ~/.termux/boot/start-bot
   echo "termux-wake-lock" >> ~/.termux/boot/start-bot
   echo "pm2 resurrect" >> ~/.termux/boot/start-bot
   chmod +x ~/.termux/boot/start-bot
   ```

4. Save your PM2 process list:
   ```bash
   pm2 save
   ```

## Important Notes

1. Always exit Termux properly by pressing the back button or typing `exit`, rather than force-closing it.
   
2. Your phone's battery optimization might still kill the process on some devices. Consider using a phone with minimal bloatware or custom ROMs that don't aggressively kill background processes.

3. Keep your bot code efficient to minimize battery usage.

4. Some Android versions may not allow continuous background processes - this varies by manufacturer and Android version.