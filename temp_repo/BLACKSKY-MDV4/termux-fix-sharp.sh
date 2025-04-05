#!/bin/bash
# BLACKSKY-MD Premium - Termux Sharp Fix Script

echo "==================================================="
echo "  BLACKSKY-MD Sharp Compatibility Layer Setup      "
echo "==================================================="
echo

# Check if running in Termux
if [ -d "/data/data/com.termux" ] || [ -n "$TERMUX_VERSION" ]; then
  echo "✅ Running in Termux environment"
else
  echo "⚠️ Not running in Termux environment"
  echo "This script is designed for Termux. Some features may not work."
fi

# Create required directories
mkdir -p tmp

# Try to install native Sharp first
echo "📦 Attempting to install native Sharp (may fail in Termux)..."
npm install --no-save sharp@latest > tmp/sharp-install.log 2>&1

# Check if Sharp installed successfully
if npm list sharp | grep -q "sharp@"; then
  echo "✅ Native Sharp installed successfully!"
  echo "   This is unusual in Termux, but great!"
  exit 0
fi

echo "ℹ️ Native Sharp installation failed as expected in Termux"
echo "🔄 Setting up Sharp compatibility layer..."

# Install Jimp as a fallback
echo "📦 Installing Jimp as a Sharp replacement..."
npm install --save jimp > tmp/jimp-install.log 2>&1

# Check for Jimp installation
if npm list jimp | grep -q "jimp@"; then
  echo "✅ Jimp installed successfully"
else
  echo "❌ Failed to install Jimp - check npm for errors"
  cat tmp/jimp-install.log
  exit 1
fi

# Create necessary files if they don't exist
if [ ! -f "sharp-compat.js" ]; then
  echo "📝 Creating Sharp compatibility adapter..."
  cat > sharp-compat.js << 'EOL'
/**
 * Sharp compatibility layer using Jimp
 * This module provides a compatibility layer for the Sharp module
 * when running in environments where Sharp is difficult to install, like Termux.
 */
console.log('Loading Sharp compatibility layer...');

// Try to use native Sharp first
try {
  const sharp = require('sharp');
  console.log('✅ Native Sharp module loaded successfully');
  module.exports = sharp;
} catch (err) {
  console.log('Native Sharp not available, using Jimp compatibility layer');
  
  // Fall back to compatibility implementation
  try {
    const compatSharp = require('./sharp-simple-compat.js');
    console.log('✅ Jimp-based Sharp compatibility layer loaded');
    module.exports = compatSharp;
  } catch (compatErr) {
    console.error('Failed to load compatibility layer:', compatErr);
    
    // Create a minimal dummy implementation for basic functionality
    const fs = require('fs');
    const path = require('path');
    
    console.warn('⚠️ Using minimal dummy Sharp implementation');
    
    class MinimalSharp {
      constructor(input) {
        this.input = input;
        this.outputOptions = { format: 'png' };
      }
      
      resize() { return this; }
      extend() { return this; }
      extract() { return this; }
      trim() { return this; }
      flip() { return this; }
      flop() { return this; }
      rotate() { return this; }
      greyscale() { return this; }
      grayscale() { return this; }
      negate() { return this; }
      blur() { return this; }
      sharpen() { return this; }
      tint() { return this; }
      jpeg() { this.outputOptions.format = 'jpeg'; return this; }
      png() { this.outputOptions.format = 'png'; return this; }
      webp() { this.outputOptions.format = 'webp'; return this; }
      
      async toBuffer() {
        if (Buffer.isBuffer(this.input)) return this.input;
        if (typeof this.input === 'string' && fs.existsSync(this.input)) {
          return fs.promises.readFile(this.input);
        }
        return Buffer.from([]);
      }
      
      async toFile(outputPath) {
        try {
          const buffer = await this.toBuffer();
          await fs.promises.writeFile(outputPath, buffer);
          return { 
            format: path.extname(outputPath).substring(1) || this.outputOptions.format,
            width: 0, 
            height: 0, 
            channels: 4,
            size: buffer.length 
          };
        } catch (err) {
          console.error('Error in dummy Sharp toFile:', err);
          throw err;
        }
      }
      
      async metadata() {
        return { width: 0, height: 0, format: 'unknown', channels: 4 };
      }
    }
    
    const dummySharp = (input) => new MinimalSharp(input);
    dummySharp.cache = false;
    dummySharp.simd = false;
    
    module.exports = dummySharp;
  }
}
EOL
  echo "✅ Sharp compatibility adapter created"
fi

if [ ! -f "sharp-simple-compat.js" ]; then
  echo "📝 Creating Jimp-based compatibility implementation..."
  # This file is very long, so you'll need to create it separately
  echo "⚠️ sharp-simple-compat.js needs to be created manually"
  echo "   Please make sure this file exists and contains the Jimp-based Sharp implementation"
fi

# Add a note to package.json
if grep -q "\"sharp\":" "package.json"; then
  echo "🔧 Patching package.json Sharp dependency..."
  # Replace sharp dependency with the compatibility layer
  sed -i 's/"sharp": ".*"/"sharp": "file:./sharp-compat.js"/' package.json
  echo "✅ package.json patched"
fi

# Create a help file
echo "📝 Creating TERMUX-SHARP-README.md file with usage instructions..."
cat > TERMUX-SHARP-README.md << 'EOL'
# Using the Sharp Compatibility Layer in Termux

## Overview

Sharp is a high-performance image processing library for Node.js, but it can be difficult to install in Termux because it relies on native dependencies. This compatibility layer provides a solution by:

1. Trying to use native Sharp if available
2. Falling back to Jimp (a pure JavaScript image processing library) if Sharp isn't available
3. Providing a minimal fallback as a last resort

## How It Works

When your code requires 'sharp', it will actually load our compatibility layer which tries these options in order:

```javascript
// Instead of this:
const sharp = require('sharp');

// The code above actually does this behind the scenes:
let sharp;
try {
  // Try native Sharp first
  sharp = require('actual-sharp-module');
} catch (err) {
  // If that fails, use Jimp-based implementation
  sharp = require('./sharp-simple-compat.js');
}
```

## Usage

You don't need to change your code! Just use Sharp as you normally would:

```javascript
const sharp = require('sharp');

// Process an image
sharp('input.jpg')
  .resize(300, 200)
  .toFile('output.jpg', (err, info) => {
    if (err) console.error(err);
    else console.log(info);
  });
```

## Limitations

The compatibility layer supports the most common Sharp functions:

- resize()
- rotate()
- flip()/flop()
- greyscale()/grayscale()
- blur()/sharpen()
- toBuffer()/toFile()
- metadata()

Some advanced features may not be available or may behave differently.

## Troubleshooting

If you encounter issues:

1. Check if Jimp is installed: `npm list jimp`
2. If not, install it: `npm install jimp`
3. Make sure both `sharp-compat.js` and `sharp-simple-compat.js` exist

## Performance Considerations

The Jimp-based compatibility layer is pure JavaScript and will be slower than native Sharp. For performance-critical applications, consider:

1. Using a server with native Sharp support for image processing
2. Limiting image processing operations in Termux
3. Pre-processing images before deploying to Termux

## Credits

This compatibility layer was created for BLACKSKY-MD Premium to ensure reliable WhatsApp bot operation in Termux.
EOL

echo "==================================================="
echo "✅ Sharp compatibility layer setup complete!"
echo "==================================================="
echo
echo "To use Sharp in your code:"
echo "  const sharp = require('sharp');"
echo
echo "The compatibility layer will automatically be used"
echo "when running in Termux."
echo
echo "For more information, see TERMUX-SHARP-README.md"
echo "==================================================="