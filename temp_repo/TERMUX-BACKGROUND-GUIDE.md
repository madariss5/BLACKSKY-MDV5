# BLACKSKY-MD Premium Bot - Termux Background Running Guide

This guide will help you run your WhatsApp bot in the background using Termux so that it stays running even when you close the Termux app.

## Prerequisites

1. Termux installed on your Android device
2. BLACKSKY-MD Premium Bot files installed
3. Basic knowledge of terminal commands

## Option 1: Using Our Automated Setup (Recommended)

We've created automated scripts to make running your bot in the background easy:

### Step 1: Make sure Termux packages are up to date

```bash
pkg update && pkg upgrade
```

### Step 2: Install required packages

```bash
pkg install nodejs git ffmpeg libwebp imagemagick
```

### Step 3: Fix Sharp module compatibility

Run our compatibility fixer script:

```bash
node fix-pm2-sharp.js
```

### Step 4: Start the bot using our PM2 starter script

```bash
node start-bot-pm2.js start
```

That's it! Your bot is now running in the background and will continue to run even when you close Termux.

## Option 2: Manual Setup with PM2

If you prefer to set things up manually, follow these steps:

### Step 1: Install PM2 globally

```bash
npm install -g pm2
```

### Step 2: Patch your index.js file

Run:

```bash
node index-sharp-patch.js
```

### Step 3: Start your bot with PM2

```bash
pm2 start ecosystem.config.js
```

### Step 4: Save the PM2 process list

This ensures your bot restarts automatically when Termux restarts:

```bash
pm2 save
```

## Keeping Termux Running in the Background

For optimal performance on Android:

1. **Disable Battery Optimization for Termux**:
   - Go to Android Settings > Apps > Termux > Battery
   - Select "Don't optimize" or "Unrestricted"

2. **Enable Wake Lock** (this is automatically done by our ecosystem.config.js):
   - The bot uses a wake lock to prevent the device from killing the process

3. **Consider installing Termux:Boot**:
   - From F-Droid, install the Termux:Boot add-on
   - This allows Termux to start at device boot

## Common Commands

- Check bot status: `pm2 status`
- View bot logs: `pm2 logs BLACKSKY-MD`
- Restart bot: `pm2 restart BLACKSKY-MD`
- Stop bot: `pm2 stop BLACKSKY-MD`
- Resume bot: `pm2 start BLACKSKY-MD`

## Troubleshooting

### Bot disconnects frequently

If your bot disconnects frequently, try these steps:

1. Check your internet connection stability
2. Make sure Termux has proper permissions
3. Run the connection troubleshooter:
   ```bash
   node connection-patch-termux.js
   ```

### Sharp module errors

If you encounter errors related to the Sharp image processing module:

1. Run our Sharp compatibility fixer:
   ```bash
   node fix-pm2-sharp.js
   ```

2. If the issue persists, try reinstalling the compatibility layer:
   ```bash
   npm uninstall sharp jimp
   npm install jimp
   node fix-pm2-sharp.js
   ```

### PM2 process disappears after Termux restart

Make sure you've saved the PM2 process list:

```bash
pm2 save
```

After that, you can restore the processes with:

```bash
pm2 resurrect
```

## Advanced: Boot-Time Autostart

To make your bot start automatically when your device boots:

1. Install Termux:Boot add-on from F-Droid
2. Grant necessary permissions
3. Create a boot script in the `~/.termux/boot/` directory:

```bash
mkdir -p ~/.termux/boot/
```

Create a file named `start-bot.sh`:

```bash
echo '#!/data/data/com.termux/files/usr/bin/sh
cd ~/BLACKSKY-MD
pm2 resurrect || node start-bot-pm2.js start' > ~/.termux/boot/start-bot.sh
```

Make it executable:

```bash
chmod +x ~/.termux/boot/start-bot.sh
```

Now your bot will start automatically when your device boots up.

## Need More Help?

If you're still experiencing issues, please refer to our troubleshooting guide or contact support.