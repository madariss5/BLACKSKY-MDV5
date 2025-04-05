# BLACKSKY-MD Sharp Module Fix for Termux

The Sharp module is often problematic in Termux environments due to its native dependencies. This document explains the specific fixes included in this repository to address these issues.

## Latest Update: PM2 Integration

We've added PM2 integration for better background running:

1. **Automatic Fix Script**: `node fix-pm2-sharp.js`
   - Fixes Sharp compatibility
   - Patches index.js automatically
   - Configures PM2 properly

2. **Easy Start Command**: `node start-bot-pm2.js start`
   - Starts bot with optimal settings
   - Ensures background operation
   - Automatically saves PM2 process list

3. **Complete Documentation**: See `TERMUX-PM2-GUIDE.txt`

## The Problem

Sharp is a high-performance image processing library that requires native C++ bindings, which can be difficult to compile in Termux. Common errors include:

- `Error: The module was compiled against a different Node.js version`
- `Error: Cannot find module 'sharp'`
- `Error: Command failed: node-gyp rebuild`
- Memory usage spikes causing crashes

## Our Solution

We've implemented a multi-layered approach to fix these issues:

### 1. Sharp Compatibility Layer (`sharp-compat.js`)

We created a drop-in replacement for Sharp using Jimp, a pure JavaScript image processing library:

```javascript
// Usage example (same API as Sharp):
const sharp = require('./sharp-compat.js');

// Use it just like Sharp
sharp('input.jpg')
  .resize(300)
  .jpeg({ quality: 80 })
  .toFile('output.jpg');
```

This compatibility layer implements the most commonly used Sharp functions and provides fallbacks for unsupported features.

### 2. Termux Connection Patch (`connection-patch-termux.js`)

We've built a Termux-specific connection handler that:

- Avoids using Sharp for image processing
- Implements optimized memory management for Android environments
- Provides a health check server to monitor the bot's status
- Handles connection losses gracefully with automatic reconnection
- Implements a notification queue system to prevent message failures

### 3. Termux Setup Script (`termux-fix-sharp.sh`)

This script automates the process of setting up the environment:

- Installs necessary system dependencies
- Sets up Termux detection in the bot's code
- Creates the optimized startup script with memory settings
- Configures alternative image processing tools

### 4. Optimized Startup Script (`run-termux-fixed.sh`)

A specialized startup script that:

- Sets proper environment variables for Termux
- Configures memory limits to prevent crashes
- Enables garbage collection to free up memory
- Creates required directories if missing

## Usage Instructions

1. Run the fix script:
   ```bash
   ./termux-fix-sharp.sh
   ```

2. Start the bot with the optimized script:
   ```bash
   ./run-termux-fixed.sh
   ```

## Technical Details

### Memory Management

Termux has limited resources compared to desktop environments. Our solution:

- Sets Node.js memory limit to 1GB (configurable)
- Enables manual garbage collection 
- Implements an optimized memory manager

### Image Processing Alternatives

Instead of trying to force Sharp to work, we:

- Use Jimp for basic operations
- Fall back to native Android libraries when possible
- Optimize image loading/saving paths

### Connection Resilience

The connection patch provides:

- Automatic reconnection with exponential backoff
- Message queuing when connection is lost
- Session state preservation

## Common Issues and Solutions

| Issue | Solution |
|-------|----------|
| JavaScript heap out of memory | Reduce memory limit in `run-termux-fixed.sh` |
| Cannot create sticker | Use `.sticker nobg` command instead of `.sticker` |
| Slow image processing | Some operations will be slower without Sharp |
| Bot disconnects frequently | Ensure Android isn't killing the process |

---

These fixes make BLACKSKY-MD work reliably on Termux without compromising on functionality, even without the Sharp module.