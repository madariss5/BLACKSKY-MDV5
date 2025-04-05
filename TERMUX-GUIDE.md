# BLACKSKY-MD Premium Bot - Termux Guide

This guide helps you run your WhatsApp bot in Termux with proper background operation.

## Prerequisites

1. Termux installed on your Android device
2. BLACKSKY-MD Premium Bot files installed
3. Basic terminal knowledge

## Quick Setup (Recommended)

### Step 1: Update Termux packages

```bash
pkg update && pkg upgrade
```

### Step 2: Install required packages

```bash
pkg install nodejs git ffmpeg libwebp imagemagick
```

### Step 3: Fix Sharp module compatibility

```bash
node fix-pm2-sharp.js
```

### Step 4: Start the bot using PM2

```bash
node start-bot-pm2.js start
```

That's it! Your bot will now run in the background.

## Manual Setup

If you prefer manual setup:

### Step 1: Install PM2 globally

```bash
npm install -g pm2
```

### Step 2: Patch index.js with Sharp compatibility

```bash
node index-sharp-patch.js
```

### Step 3: Start with PM2

```bash
pm2 start ecosystem.config.js
```

### Step 4: Save PM2 process list

```bash
pm2 save
```

## Keep Termux Running

For best performance:

1. **Disable Battery Optimization for Termux**:
   - Settings > Apps > Termux > Battery > Unrestricted

2. **Wake Lock** (automatic in our config)

3. **Consider Termux:Boot** for auto-start on device boot

## Common Commands

- Check status: `pm2 status`
- View logs: `pm2 logs BLACKSKY-MD`
- Restart: `pm2 restart BLACKSKY-MD`
- Stop: `pm2 stop BLACKSKY-MD`
- Resume: `pm2 start BLACKSKY-MD`

## Troubleshooting

### Connection Issues

1. Check internet stability
2. Verify Termux permissions
3. Run troubleshooter:
   ```bash
   node connection-patch-termux.js
   ```

### Sharp Module Problems

1. Run fixer:
   ```bash
   node fix-pm2-sharp.js
   ```

2. If needed, reinstall:
   ```bash
   npm uninstall sharp jimp
   npm install jimp
   node fix-pm2-sharp.js
   ```

### PM2 Reset After Restart

Always run:
```bash
pm2 save
```

To restore:
```bash
pm2 resurrect
```

## Auto-start on Boot

1. Install Termux:Boot from F-Droid
2. Create boot script:
   ```bash
   mkdir -p ~/.termux/boot/
   echo '#!/data/data/com.termux/files/usr/bin/sh
   cd ~/BLACKSKY-MD
   pm2 resurrect || node start-bot-pm2.js start' > ~/.termux/boot/start-bot.sh
   chmod +x ~/.termux/boot/start-bot.sh
   ```