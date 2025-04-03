# BLACKSKY-MD Termux Background Running Guide

This guide will help you run BLACKSKY-MD 24/7 in the background on Termux, allowing you to close Termux while the bot continues to run.

## Prerequisites

- Termux app installed
- BLACKSKY-MD already set up according to the main Termux guide

## Install Required Packages

1. Update Termux packages:
```bash
pkg update && pkg upgrade
```

2. Install Node.js, PM2, and other necessary tools:
```bash
pkg install nodejs-lts git ffmpeg imagemagick libwebp
npm install -g pm2
```

## Setting Up PM2 for Background Running

1. Navigate to your BLACKSKY-MD folder:
```bash
cd BLACKSKY-MD
```

2. Make sure you have the latest ecosystem.config.js file:
```bash
# If you don't have the file, create it using the template provided in the repo
touch ecosystem.config.js
# Then edit it with nano
nano ecosystem.config.js
```

3. Start the bot with PM2:
```bash
pm2 start ecosystem.config.js --env production
```

4. Set up PM2 to keep the bot running even if Termux is closed:
```bash
pm2 save
```

5. Set up PM2 to start the bot automatically when Termux is opened:
```bash
pm2 startup
```

## Keeping Termux Running in Background

1. Configure Termux to stay active in the background:
   - Open Termux
   - Go to settings (long press on the Termux screen and select "MORE" → "Settings")
   - Enable "Acquire Wakelock" to prevent Android from killing Termux

2. Allow Termux to run in the background:
   - Go to your Android settings
   - Navigate to "Apps" → "Termux"
   - Select "Battery" → "Battery optimization" → "All apps"
   - Find Termux in the list and select "Don't optimize"

## Managing Your Bot

- Check bot status:
```bash
pm2 status
```

- View bot logs:
```bash
pm2 logs BLACKSKY-MD
```

- Restart the bot:
```bash
pm2 restart BLACKSKY-MD
```

- Stop the bot:
```bash
pm2 stop BLACKSKY-MD
```

## Advanced Power Saving Tips

1. Reduce bot resource usage by editing ecosystem.config.js:
   - Lower the `max_old_space_size` value to 1024 or 512 for more memory savings
   - Add the `--optimize-for-size` flag to reduce memory footprint

2. Consider disabling unnecessary plugins if you need to conserve more resources.

3. Set up a scheduled restart to keep the bot fresh:
```bash
pm2 restart BLACKSKY-MD --cron "0 4 * * *"  # Restarts the bot at 4 AM daily
```

## Troubleshooting

If the bot stops working after closing Termux:

1. Make sure you've enabled "Acquire Wakelock" in Termux settings
2. Disable battery optimization for Termux
3. Some Android devices have aggressive battery saving - install "Don't Kill My App" from Play Store
4. Try using a Termux widget to create a shortcut that runs `pm2 resurrect` when tapped

## Conclusion

Your BLACKSKY-MD bot should now run in the background without needing to keep Termux open. Remember that different Android devices have different background process policies, so you might need to adjust some settings specific to your device.