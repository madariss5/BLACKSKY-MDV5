# Sharp Polyfill for Termux in BLACKSKY-MD

This document explains the Sharp compatibility layer implemented for Termux environments in the BLACKSKY-MD WhatsApp bot.

## The Problem

Sharp is a popular high-performance image processing library for Node.js, but it has several challenges when running in Termux:

1. **Native Dependencies**: Sharp relies on libvips, which requires native compilation and is difficult to install in Termux
2. **Memory Usage**: Sharp's memory consumption can be too high for mobile devices
3. **Installation Failures**: The node-gyp compilation process often fails in Termux environments
4. **Versioning Issues**: Incompatibilities between Node.js, Sharp, and Android/Termux architectures

## Our Solution

We've implemented a comprehensive solution that provides Sharp compatibility in Termux.

### 1. Sharp Compatibility Layer (sharp-compat.js)

A drop-in replacement that implements the Sharp API using Jimp, a pure JavaScript image processing library. This allows code written for Sharp to continue working without modifications.

### 2. Termux Environment Detection

The system automatically detects when running in a Termux environment and activates the compatibility layer:

```javascript
const isTermux = os.platform() === 'android' || process.env.TERMUX === 'true';

if (isTermux) {
  global.sharp = require('./sharp-compat.js');
} else {
  try {
    global.sharp = require('sharp');
  } catch (err) {
    global.sharp = require('./sharp-compat.js');
  }
}
```

### 3. Termux-Specific Optimizations (termux-helper.js)

Additional utilities to optimize performance in Termux environments:

- Memory management
- Directory setup
- Garbage collection scheduling
- Native module fixes

### 4. Run Script for Termux

A dedicated script to run the bot in Termux with all necessary optimizations:

```bash
./run-termux.sh
```

## Supported Features

Our Sharp compatibility layer supports most common image operations:

- **Resizing**: resize(), with support for fit modes like 'cover' and 'contain'
- **Format Conversion**: jpeg(), png(), webp()
- **Image Manipulation**: blur(), sharpen(), grayscale(), flip(), flop(), rotate()
- **Output**: toBuffer(), toFile()
- **Metadata**: metadata()

## Performance Considerations

The compatibility layer uses Jimp, which is pure JavaScript and slower than native Sharp. For best performance:

- Limit image sizes when possible
- Use lower quality settings for JPEG/WebP to reduce processing time
- Consider using simple operations when possible (resize is faster than complex filters)
- Use the memory optimizations provided by run-termux.sh

## Troubleshooting

If you encounter issues with image processing in Termux:

1. Ensure Jimp is installed: npm install jimp
2. Check that sharp-compat.js exists in the root directory
3. Run with Termux flag: TERMUX=true node index.js
4. Use the provided run-termux.sh script

## Implementation Details

The compatibility layer provides a SharpCompat class that implements the Sharp API using Jimp functions. It follows the same chainable API pattern as Sharp and handles asynchronous operations properly.

The system attempts to use native Sharp first and only falls back to the compatibility layer when necessary.

---

This implementation ensures that BLACKSKY-MD works reliably in Termux environments, maintaining compatibility with the Sharp API while working around the limitations of mobile platforms.
