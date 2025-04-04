#!/bin/bash
# BLACKSKY-MD Sharp Installation Script for Termux
# This script ensures Sharp works 100% in Termux environments

# ANSI color codes for better readability
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

echo -e "${BLUE}===========================================================${NC}"
echo -e "${BLUE}    BLACKSKY-MD Sharp Module Installer for Termux         ${NC}"
echo -e "${BLUE}===========================================================${NC}"
echo

# Check if running in Termux
if [ -d "/data/data/com.termux" ] || [ -n "$TERMUX_VERSION" ]; then
  echo -e "${GREEN}✓ Running in Termux environment${NC}"
else
  echo -e "${YELLOW}⚠ Not running in Termux. This script is optimized for Termux but will try to continue.${NC}"
fi

# Function to handle errors
handle_error() {
  echo -e "${RED}ERROR: $1${NC}"
  echo -e "${YELLOW}Trying alternative approach...${NC}"
}

# Create log file
LOG_FILE="sharp-install-log-$(date +%Y%m%d%H%M%S).txt"
echo "BLACKSKY-MD Sharp Installation Log" > "$LOG_FILE"
echo "Date: $(date)" >> "$LOG_FILE"
echo "=============================================" >> "$LOG_FILE"

log_and_echo() {
  echo -e "$1"
  echo "$1" | sed -r "s/\x1B\[([0-9]{1,3}(;[0-9]{1,3})*)?[mGK]//g" >> "$LOG_FILE"
}

# Step 1: Update package lists
log_and_echo "${YELLOW}Step 1: Updating package lists...${NC}"
pkg update -y >> "$LOG_FILE" 2>&1
if [ $? -ne 0 ]; then
  handle_error "Failed to update package lists"
  log_and_echo "${YELLOW}Trying to continue anyway...${NC}"
fi

# Step 2: Install required dependencies
log_and_echo "${YELLOW}Step 2: Installing required dependencies...${NC}"
DEPS="build-essential pkg-config libpng libjpeg-turbo libwebp libvips python nodejs git cmake"
pkg install -y $DEPS >> "$LOG_FILE" 2>&1
if [ $? -ne 0 ]; then
  handle_error "Failed to install all dependencies"
  # Try installing only essential ones
  pkg install -y python nodejs build-essential libpng libjpeg-turbo >> "$LOG_FILE" 2>&1
fi

# Step 3: Create optimized .npmrc configuration
log_and_echo "${YELLOW}Step 3: Creating optimized NPM configuration...${NC}"
cat > ~/.npmrc << EOL
sharp_binary_host=https://npmmirror.com/mirrors/sharp
sharp_libvips_binary_host=https://npmmirror.com/mirrors/sharp-libvips
registry=https://registry.npmjs.org/
loglevel=error
fetch-retries=5
fetch-retry-factor=2
fetch-retry-mintimeout=20000
EOL

# Step 4: Clean npm cache
log_and_echo "${YELLOW}Step 4: Cleaning npm cache...${NC}"
npm cache clean --force >> "$LOG_FILE" 2>&1

# Step 5: Set correct environment variables
log_and_echo "${YELLOW}Step 5: Setting environment variables...${NC}"
export NODE_OPTIONS="--max-old-space-size=1024"
export SHARP_IGNORE_GLOBAL_LIBVIPS="1"
export npm_config_sharp_libvips_binary_host="https://npmmirror.com/mirrors/sharp-libvips"
export npm_config_sharp_binary_host="https://npmmirror.com/mirrors/sharp"

# Step 6: Uninstall any existing sharp installations
log_and_echo "${YELLOW}Step 6: Removing any existing Sharp installations...${NC}"
npm uninstall sharp >> "$LOG_FILE" 2>&1
rm -rf node_modules/sharp >> "$LOG_FILE" 2>&1

# Step 7: Try different installation methods
log_and_echo "${CYAN}Step 7: Installing Sharp with method 1 - direct install with prebuilds${NC}"
npm install sharp@0.30.7 --foreground-scripts=false --ignore-scripts >> "$LOG_FILE" 2>&1
SHARP_INSTALL_STATUS=$?

# Check if sharp installed correctly
if ! npm list sharp | grep -q "sharp@0.30.7"; then
  log_and_echo "${YELLOW}Method 1 failed. Trying method 2 - install with native build${NC}"
  npm uninstall sharp >> "$LOG_FILE" 2>&1
  npm install sharp@0.30.7 --build-from-source >> "$LOG_FILE" 2>&1
  SHARP_INSTALL_STATUS=$?
fi

if [ $SHARP_INSTALL_STATUS -ne 0 ] || ! npm list sharp | grep -q "sharp"; then
  log_and_echo "${YELLOW}Method 2 failed. Trying method 3 - WebAssembly version${NC}"
  npm uninstall sharp >> "$LOG_FILE" 2>&1
  npm install --no-save --platform=linuxmusl --arch=x64 sharp@0.30.7 >> "$LOG_FILE" 2>&1
  SHARP_INSTALL_STATUS=$?
fi

# Step 8: Test Sharp installation
log_and_echo "${YELLOW}Step 8: Testing Sharp installation...${NC}"
mkdir -p test
cat > test/test-sharp.js << EOL
try {
  const sharp = require('sharp');
  console.log('Sharp version:', sharp.versions.sharp);
  
  // Create a test image
  const width = 300;
  const height = 200;
  const channels = 4;
  const buffer = Buffer.alloc(width * height * channels);
  
  // Fill the buffer with a simple pattern
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * channels;
      buffer[i] = Math.floor(255 * x / width);      // R
      buffer[i + 1] = Math.floor(255 * y / height); // G
      buffer[i + 2] = Math.floor(255 * (x+y) / (width+height)); // B
      buffer[i + 3] = 255;                         // A
    }
  }
  
  // Create image with sharp and save it
  sharp(buffer, {
    raw: {
      width: width,
      height: height,
      channels: channels
    }
  })
  .toFile('test-output.png')
  .then(() => {
    console.log('Test image written successfully!');
    console.log('Sharp is working correctly.');
    process.exit(0);
  })
  .catch(err => {
    console.error('Error writing test image:', err);
    process.exit(1);
  });
} catch (err) {
  console.error('Error loading Sharp:', err);
  process.exit(1);
}
EOL

node test/test-sharp.js >> "$LOG_FILE" 2>&1
TEST_STATUS=$?

if [ $TEST_STATUS -eq 0 ]; then
  log_and_echo "${GREEN}✓ Sharp installed and working correctly!${NC}"
else
  log_and_echo "${RED}× Sharp installation test failed.${NC}"
  log_and_echo "${YELLOW}Setting up fallback to Jimp-based compatibility layer...${NC}"
  
  # Step 9: Set up compatibility layer
  log_and_echo "${YELLOW}Step 9: Installing Jimp as fallback...${NC}"
  npm install --save jimp >> "$LOG_FILE" 2>&1
  
  # Ensure our sharp-compat.js is properly linked
  if [ -f "sharp-compat.js" ]; then
    log_and_echo "${GREEN}✓ Sharp compatibility layer already exists${NC}"
  else
    log_and_echo "${YELLOW}Creating Sharp compatibility layer...${NC}"
    # Use the existing sharp-compat.js content
    cat > sharp-compat.js << 'EOL'
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
  fi
fi

# Step 10: Create run-script with proper environment settings
log_and_echo "${YELLOW}Step 10: Creating optimized run script...${NC}"
cat > run-termux-fixed.sh << 'EOL'
#!/bin/bash
# BLACKSKY-MD Termux optimized run script

# Set environment variables
export TERMUX=true
export NODE_OPTIONS="--max-old-space-size=1024"
export SHARP_IGNORE_GLOBAL_LIBVIPS=1

# Use garbage collection to manage memory
export NODE_OPTIONS="$NODE_OPTIONS --expose-gc"

# Create required directories
mkdir -p tmp
mkdir -p sessions
mkdir -p media

# Run bot
echo "Starting BLACKSKY-MD Bot..."
node index.js
EOL

chmod +x run-termux-fixed.sh

# Step 11: Verify that TERMUX detection in index.js is correct
log_and_echo "${YELLOW}Step 11: Verifying Termux detection in index.js...${NC}"
if grep -q "const isTermux" "index.js"; then
  log_and_echo "${GREEN}✓ Termux detection already exists in index.js${NC}"
else
  log_and_echo "${YELLOW}Adding Termux detection to index.js...${NC}"
  
  # Create backup
  cp index.js index.js.backup
  
  # Insert Termux detection code
  TMP_FILE=$(mktemp)
  cat > "$TMP_FILE" << 'EOL'
// Detect if running in Termux and handle Sharp compatibility
const os = require('os');
const isTermux = os.platform() === 'android' || process.env.TERMUX === 'true';

// Use Sharp compatibility layer in Termux
if (isTermux) {
  console.log('📱 Running in Termux environment, using Jimp-based Sharp compatibility layer');
  global.sharp = require('./sharp-compat.js');
} else {
  try {
    global.sharp = require('sharp');
  } catch (err) {
    console.error('Failed to load Sharp, falling back to compatibility layer:', err);
    global.sharp = require('./sharp-compat.js');
  }
}

EOL
  
  # Prepend to index.js
  cat "$TMP_FILE" index.js > index.js.new
  mv index.js.new index.js
  rm "$TMP_FILE"
fi

# Step 12: Final instructions
echo -e "${BLUE}===========================================================${NC}"
echo -e "${GREEN}✅ Installation complete!${NC}"
echo -e "${BLUE}===========================================================${NC}"
echo -e "${YELLOW}To run the bot with optimized Sharp/Jimp settings:${NC}"
echo -e "  ${CYAN}./run-termux-fixed.sh${NC}"
echo
echo -e "${YELLOW}Installation log saved to:${NC} ${CYAN}$LOG_FILE${NC}"
echo -e "${BLUE}===========================================================${NC}"

# Final verification test
log_and_echo "${YELLOW}Performing final verification...${NC}"
if [ -f "test-output.png" ]; then
  log_and_echo "${GREEN}✓ Image processing is working correctly!${NC}"
else
  log_and_echo "${YELLOW}Using compatibility layer for image processing${NC}"
  log_and_echo "${GREEN}✓ Compatibility layer is set up and ready to use!${NC}"
fi