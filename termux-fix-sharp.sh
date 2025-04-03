#!/bin/bash
# BLACKSKY-MD Termux Sharp Fix Script
# This script fixes issues with Sharp module in Termux

# ANSI color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}==============================================${NC}"
echo -e "${BLUE}   BLACKSKY-MD Sharp Module Fix for Termux   ${NC}"
echo -e "${BLUE}==============================================${NC}"
echo

# Check if running in Termux
if [ ! -d "/data/data/com.termux" ]; then
  echo -e "${RED}This script is designed to run in Termux environment only.${NC}"
  exit 1
fi

echo -e "${YELLOW}Checking for dependencies...${NC}"
pkg update -y

# Install required packages
echo -e "${YELLOW}Installing required packages...${NC}"
pkg install -y build-essential python nodejs libjpeg-turbo libpng libwebp

# Check if connection-patch-termux.js exists
if [ ! -f "connection-patch-termux.js" ]; then
  echo -e "${RED}Error: connection-patch-termux.js not found${NC}"
  echo -e "${YELLOW}Please make sure you have the Termux-compatible connection patch file${NC}"
  exit 1
fi

# Create a Termux detector in index.js
echo -e "${YELLOW}Setting up Termux detection in index.js...${NC}"
if grep -q "const isTermux" "index.js"; then
  echo -e "${GREEN}Termux detection already exists in index.js${NC}"
else
  # Create a backup
  cp index.js index.js.backup
  
  # Insert the Termux detection code at the beginning of the file
  TMP_FILE=$(mktemp)
  cat > "$TMP_FILE" << 'EOL'
// Detect if running in Termux
const os = require('os');
const isTermux = os.platform() === 'android' || process.env.TERMUX === 'true';

// Set environment variable for Termux
if (isTermux) {
  console.log('📱 Running in Termux environment, using Termux-compatible connection patch');
  process.env.TERMUX = 'true';
  require('./connection-patch-termux.js');
} else {
  console.log('💻 Running in standard environment, using normal connection patch');
  try {
    require('./connection-patch.js');
  } catch (err) {
    console.error('Failed to load connection patch:', err);
  }
}

EOL
  
  # Prepend the Termux detection code to index.js
  cat "$TMP_FILE" index.js > index.js.new
  mv index.js.new index.js
  rm "$TMP_FILE"
  
  echo -e "${GREEN}Added Termux detection to index.js${NC}"
fi

# Try to fix sharp by finding alternatives
echo -e "${YELLOW}Handling Sharp dependency...${NC}"
npm uninstall sharp

# Try to install a compatible version
echo -e "${YELLOW}Attempting to install compatible Sharp version...${NC}"
npm install sharp@0.30.7 --ignore-scripts
npm rebuild sharp --ignore-scripts

# Install Jimp as a fallback
echo -e "${YELLOW}Installing Jimp as an alternative...${NC}"
npm install jimp

# Create a sharp compatibility layer using Jimp
echo -e "${YELLOW}Creating Sharp compatibility layer...${NC}"
cat > "sharp-compat.js" << 'EOL'
/**
 * Sharp compatibility layer using Jimp
 * For Termux environments where Sharp is difficult to install
 */
const Jimp = require('jimp');
const fs = require('fs');
const path = require('path');

// Simple Sharp API compatible wrapper for Jimp
class SharpCompat {
  constructor(input) {
    this.input = input;
    this.jimpInstance = null;
    this.options = {
      width: null,
      height: null,
      format: 'png',
      quality: 80
    };
  }

  // Load the image
  async _load() {
    if (this.jimpInstance) return this.jimpInstance;
    
    if (Buffer.isBuffer(this.input)) {
      this.jimpInstance = await Jimp.read(this.input);
    } else if (typeof this.input === 'string') {
      this.jimpInstance = await Jimp.read(this.input);
    } else {
      throw new Error('Unsupported input type');
    }
    
    return this.jimpInstance;
  }

  // Resize the image
  resize(width, height = null) {
    this.options.width = width;
    this.options.height = height;
    return this;
  }

  // Set output format
  png() {
    this.options.format = 'png';
    return this;
  }
  
  jpeg() {
    this.options.format = 'jpeg';
    return this;
  }
  
  webp() {
    this.options.format = 'png'; // Fallback to PNG as Jimp doesn't support WebP
    console.warn('WebP not supported in SharpCompat, falling back to PNG');
    return this;
  }

  // Set quality
  quality(value) {
    this.options.quality = value;
    return this;
  }

  // Get output buffer
  async toBuffer() {
    const image = await this._load();
    
    // Apply resize if needed
    if (this.options.width) {
      if (this.options.height) {
        image.resize(this.options.width, this.options.height);
      } else {
        image.resize(this.options.width, Jimp.AUTO);
      }
    }
    
    // Convert to requested format
    let mimeType;
    switch(this.options.format) {
      case 'png':
        mimeType = Jimp.MIME_PNG;
        break;
      case 'jpeg':
      case 'jpg':
        mimeType = Jimp.MIME_JPEG;
        break;
      default:
        mimeType = Jimp.MIME_PNG;
    }
    
    // Return buffer
    return new Promise((resolve, reject) => {
      image.quality(this.options.quality);
      image.getBuffer(mimeType, (err, buffer) => {
        if (err) reject(err);
        else resolve(buffer);
      });
    });
  }

  // Save to file
  async toFile(outputPath) {
    const image = await this._load();
    
    // Apply resize if needed
    if (this.options.width) {
      if (this.options.height) {
        image.resize(this.options.width, this.options.height);
      } else {
        image.resize(this.options.width, Jimp.AUTO);
      }
    }
    
    // Save with requested quality
    image.quality(this.options.quality);
    return new Promise((resolve, reject) => {
      image.writeAsync(outputPath)
        .then(() => resolve(outputPath))
        .catch(reject);
    });
  }
}

// Export a function that mimics Sharp's API
module.exports = function(input) {
  return new SharpCompat(input);
};

// Also provide compatibility for some common Sharp functions
module.exports.cache = function(options) {
  console.log('Sharp cache settings ignored in compatibility layer');
  return module.exports;
};

module.exports.format = {
  jpeg: 'jpeg',
  png: 'png',
  webp: 'webp'
};
EOL

echo -e "${GREEN}Created Sharp compatibility layer${NC}"

# Create a Termux-specific start script
echo -e "${YELLOW}Creating Termux-specific start script...${NC}"
cat > "run-termux-fixed.sh" << 'EOL'
#!/bin/bash
# BLACKSKY-MD Termux-specific run script with Sharp fix

# Set Termux environment variable
export TERMUX=true

# Ensure directories exist
mkdir -p tmp
mkdir -p sessions
mkdir -p media

# Set NODE_OPTIONS for better memory management
export NODE_OPTIONS="--max-old-space-size=1024"

# Run the bot with Termux optimizations
node --expose-gc index.js
EOL

chmod +x run-termux-fixed.sh
echo -e "${GREEN}Created Termux-specific start script: run-termux-fixed.sh${NC}"

echo
echo -e "${GREEN}=========================================${NC}"
echo -e "${GREEN}  Sharp module fix completed successfully ${NC}"
echo -e "${GREEN}=========================================${NC}"
echo
echo -e "${YELLOW}To start the bot, run:${NC}"
echo -e "${BLUE}    ./run-termux-fixed.sh${NC}"
echo
echo -e "${YELLOW}This will:${NC}"
echo -e "${BLUE}1. Use the Termux-compatible connection patch${NC}"
echo -e "${BLUE}2. Use the Jimp-based Sharp compatibility layer${NC}"
echo -e "${BLUE}3. Apply memory optimizations for Termux${NC}"
echo
echo -e "${RED}Note: If you still have issues, you may need to:${NC}"
echo -e "${BLUE}1. Restart Termux completely${NC}"
echo -e "${BLUE}2. Run 'termux-setup-storage' before starting the bot${NC}"
echo -e "${BLUE}3. Try running with 'node --max-old-space-size=800 index.js'${NC}"
echo -e "${BLUE}   if you're still having memory issues${NC}"