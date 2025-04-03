# BLACKSKY-MD Termux Installation Guide (Updated)

This guide provides detailed instructions for installing and running BLACKSKY-MD on Android devices using Termux.

## Prerequisites

- Termux app installed from [F-Droid](https://f-droid.org/en/packages/com.termux/) (Google Play version may have issues)
- At least 1GB of free storage
- Android 7.0 or higher recommended

## Installation Steps

### 1. Setup Termux

Open Termux and update packages:

```bash
pkg update && pkg upgrade -y
```

Install required dependencies:

```bash
pkg install -y nodejs git ffmpeg libwebp imagemagick python build-essential
```

Grant storage permission:

```bash
termux-setup-storage
```

### 2. Clone the Repository

```bash
git clone https://github.com/madariss5/BLACKSKY-MDV2.git
cd BLACKSKY-MDV2
```

### 3. Install Node.js Dependencies

```bash
npm install
```

### 4. Fix Sharp Module Issues

We've included a special script to fix issues with the Sharp module on Termux:

```bash
chmod +x termux-fix-sharp.sh
./termux-fix-sharp.sh
```

This script will:
- Install necessary system packages 
- Create a Termux-compatible connection patch
- Setup a Sharp compatibility layer using Jimp
- Create a Termux-optimized startup script

### 5. Configure the Bot

Copy the example configuration:

```bash
cp config.example.js config.js
```

Then edit the config file:

```bash
nano config.js
```

Set your WhatsApp number as the owner, adjust the prefix, and other settings.

### 6. Start the Bot

Use our specialized Termux script:

```bash
./run-termux-fixed.sh
```

Scan the QR code with your WhatsApp when prompted to log in.

## Advanced Troubleshooting

### Memory Errors

If you encounter "JavaScript heap out of memory" errors:

1. Edit the `run-termux-fixed.sh` file to reduce memory usage:

```bash
nano run-termux-fixed.sh
```

2. Change the memory limit to a lower value:

```
export NODE_OPTIONS="--max-old-space-size=800"
```

### Connection Issues

If you experience connection problems:

1. Ensure you have a stable internet connection
2. Try restarting Termux completely
3. Check if your WhatsApp number is banned or restricted
4. Clear your WhatsApp session by removing the `sessions` folder:

```bash
rm -rf sessions
mkdir sessions
```

### Image Processing Errors

If you encounter errors related to image processing:

1. Our `sharp-compat.js` should handle most cases automatically
2. Ensure imagemagick and libwebp are installed:

```bash
pkg install -y imagemagick libwebp
```

3. For specific sticker creation issues, try:

```bash
pkg install -y libpng libjpeg-turbo
```

## Running in Background

To keep the bot running when you close Termux:

1. Install Termux:API:

```bash
pkg install termux-api
```

2. Use the `nohup` command:

```bash
nohup ./run-termux-fixed.sh > bot.log 2>&1 &
```

This will start the bot in the background and save logs to `bot.log`.

## Checking Bot Status

To see if the bot is running in the background:

```bash
ps aux | grep node
```

## Stopping the Bot

To stop the bot running in the background:

```bash
pkill -f "node --expose-gc index.js"
```

## Support and Updating

For updates:

```bash
git pull
npm install
```

If you encounter any issues, refer to our FAQ or join our support group for assistance.

---

**Note:** This guide is specifically optimized for the BLACKSKY-MD bot running on Termux. The special fixes and optimizations included here address common issues faced by Termux users with the Sharp module and other components.