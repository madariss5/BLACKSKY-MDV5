# BLACKSKY-MD Premium Termux Guide

This guide explains how to run BLACKSKY-MD Premium WhatsApp bot on Termux with PM2 for 24/7 operation.

## Quick Start

The simplest way to get started is to run our automated setup script:

```bash
./termux-start.sh
```

This script will:
1. Install all required dependencies
2. Set up PM2 for background operation
3. Configure the bot for Termux
4. Install and set up the Sharp compatibility layer
5. Start the bot in the background

## Manual Setup Guide

If you prefer to set things up manually or if the automated script didn't work, follow these steps:

### 1. Install Required Packages

Open Termux and run:

```bash
pkg update -y
pkg upgrade -y
pkg install nodejs git python ffmpeg imagemagick termux-api -y
```

### 2. Install PM2

```bash
npm install -g pm2
```

### 3. Set Up Sharp Compatibility

Since the Sharp module is difficult to install on Termux, we use a compatibility layer:

```bash
./termux-fix-sharp.sh
```

This creates a compatibility layer that uses Jimp instead of Sharp for image processing.

### 4. Configure Termux for Background Operation

To keep the bot running when Termux is closed:

```bash
termux-wake-lock
```

Also, go to Android Settings > Apps > Termux > Battery and disable battery optimization.

### 5. Start the Bot

```bash
pm2 start ecosystem.config.js
pm2 save
```

## Managing Your Bot

After setup, you can use these scripts to manage your bot:

- Check logs: `./check-logs.sh`
- Restart bot: `./restart-bot.sh`
- Stop bot: `./stop-bot.sh`

Or use PM2 commands directly:

- Check status: `pm2 status`
- View logs: `pm2 logs BLACKSKY-MD`
- Monitor resources: `pm2 monit`

## Troubleshooting

### Sharp Module Issues

If you encounter errors related to image processing:

```bash
./termux-fix-sharp.sh
```

Then restart the bot with: `pm2 restart BLACKSKY-MD`

### Connection Issues

If the bot disconnects frequently:

1. Make sure Termux has "Acquire Wakelock" enabled
2. Disable battery optimization for Termux in Android settings
3. Restart the bot with: `pm2 restart BLACKSKY-MD`

### Memory Issues

If Termux or your device runs out of memory:

1. Edit `ecosystem.config.js`
2. Reduce `max_memory_restart` value to `"256M"`
3. Reduce `max-old-space-size` to `192`
4. Restart the bot: `pm2 restart BLACKSKY-MD`

## Keeping the Bot Running 24/7

For best results on Termux:

1. **Battery Optimization:**
   - Go to Android Settings > Apps > Termux
   - Select "Battery" > "Unrestricted" or "No restrictions"
   - Enable "Allow background activity"

2. **Notification Anchor:**
   To prevent Android from killing Termux, add this to your `.bashrc`:
   ```bash
   echo "termux-notification -c 'WhatsApp Bot Running' -t 'BLACKSKY-MD Premium'" >> ~/.bashrc
   ```

3. **Auto-restart on Boot:**
   If you have Termux:Boot installed:
   ```bash
   mkdir -p ~/.termux/boot
   echo "#!/data/data/com.termux/files/usr/bin/sh" > ~/.termux/boot/start-bot
   echo "cd $(pwd)" >> ~/.termux/boot/start-bot
   echo "termux-wake-lock" >> ~/.termux/boot/start-bot
   echo "pm2 resurrect" >> ~/.termux/boot/start-bot
   chmod +x ~/.termux/boot/start-bot
   ```

## Notes on Memory Usage

Termux has limited resources compared to a server. To optimize:

1. Reduce the number of plugins loaded
2. Set a lower value for `max_memory_restart` in `ecosystem.config.js`
3. Use the PM2 monitor (`pm2 monit`) to check resource usage
4. Schedule periodic restarts with `cron_restart` in `ecosystem.config.js`