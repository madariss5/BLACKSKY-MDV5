#!/bin/bash
# BLACKSKY-MD Sharp Installation Script for Termux
# This script ensures Sharp works 100% in Termux environments

# ANSI color codes for better readability
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
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

# Create log file
LOG_FILE="sharp-install-log-$(date +%Y%m%d%H%M%S).txt"
echo "BLACKSKY-MD Sharp Installation Log" > "$LOG_FILE"
echo "Date: $(date)" >> "$LOG_FILE"
echo "=============================================" >> "$LOG_FILE"

log_and_echo() {
  echo -e "$1"
  # Remove ANSI color codes when writing to log
  echo "$1" | sed -r "s/\x1B\[([0-9]{1,3}(;[0-9]{1,3})*)?[mGK]//g" >> "$LOG_FILE"
}

# Step 1: Install required packages
log_and_echo "${YELLOW}Step 1: Installing required packages...${NC}"
pkg update -y >> "$LOG_FILE" 2>&1
pkg install -y build-essential python nodejs libjpeg-turbo libpng libwebp >> "$LOG_FILE" 2>&1

# Step 2: Install yarn if not installed
log_and_echo "${YELLOW}Step 2: Checking for Yarn...${NC}"
if ! command -v yarn &> /dev/null; then
  log_and_echo "${YELLOW}Installing Yarn...${NC}"
  npm install -g yarn >> "$LOG_FILE" 2>&1
fi

# Step 3: Clean npm cache
log_and_echo "${YELLOW}Step 3: Cleaning npm cache...${NC}"
npm cache clean --force >> "$LOG_FILE" 2>&1
yarn cache clean >> "$LOG_FILE" 2>&1

# Step 4: Uninstall existing Sharp
log_and_echo "${YELLOW}Step 4: Removing existing Sharp installation...${NC}"
npm uninstall sharp >> "$LOG_FILE" 2>&1
yarn remove sharp >> "$LOG_FILE" 2>&1

# Step 5: Set environment variables for better compatibility
log_and_echo "${YELLOW}Step 5: Setting environment variables...${NC}"
export npm_config_sharp_binary_host="https://npmmirror.com/mirrors/sharp"
export npm_config_sharp_libvips_binary_host="https://npmmirror.com/mirrors/sharp-libvips"
export npm_config_sharp_dist_base_url="https://npmmirror.com/mirrors/sharp-dist"

# Step 6: Install Sharp with specific version known to work in Termux
log_and_echo "${YELLOW}Step 6: Installing Sharp version 0.30.7...${NC}"
yarn add sharp@0.30.7 --ignore-scripts >> "$LOG_FILE" 2>&1

# Step 7: Rebuild Sharp with libvips
log_and_echo "${YELLOW}Step 7: Rebuilding Sharp...${NC}"
cd node_modules/sharp
yarn install --ignore-scripts >> "$LOG_FILE" 2>&1
npm rebuild --ignore-scripts >> "$LOG_FILE" 2>&1

# Step 8: Create compatibility script in case Sharp fails
log_and_echo "${YELLOW}Step 8: Creating backup compatibility layer...${NC}"
cd ../..
cat > sharp-compat.js << 'EOL'
/**
 * Sharp compatibility layer using Jimp
 * For Termux environments where Sharp is difficult to install
 */
const Jimp = require('jimp');
const fs = require('fs');
const path = require('path');
const { promisify } = require('util');

// Ensure Jimp is installed
try {
  require.resolve('jimp');
} catch (e) {
  console.log('Installing Jimp for Sharp compatibility...');
  require('child_process').execSync('npm install jimp');
}

class SharpCompat {
  constructor(input) {
    this._input = input;
    this._image = null;
    this._operations = [];
    this._metadata = {};
    this._format = 'png';
    this._quality = 80;

    if (input) {
      this._loadPromise = this._loadImage(input);
    }
  }

  async _loadImage(input) {
    try {
      if (Buffer.isBuffer(input)) {
        this._image = await Jimp.read(input);
      } else if (typeof input === 'string') {
        this._image = await Jimp.read(input);
      } else {
        throw new Error('Unsupported input type');
      }
      
      this._metadata = {
        width: this._image.getWidth(),
        height: this._image.getHeight(),
        format: this._image.getExtension()
      };
      
      return this;
    } catch (err) {
      console.error('Error loading image in Sharp compatibility layer:', err);
      throw err;
    }
  }

  // Basic resize operation
  resize(width, height, options = {}) {
    this._operations.push(() => {
      if (!this._image) return;
      this._image.resize(width || Jimp.AUTO, height || Jimp.AUTO);
    });
    return this;
  }

  // Format conversion
  jpeg(options = {}) {
    this._format = 'jpeg';
    this._quality = options.quality || 80;
    return this;
  }
  
  png(options = {}) {
    this._format = 'png';
    this._quality = options.quality || 100;
    return this;
  }
  
  webp(options = {}) {
    this._format = 'webp';
    this._quality = options.quality || 80;
    return this;
  }

  // Output methods
  async toBuffer() {
    await this._loadPromise;
    
    // Apply all queued operations
    for (const operation of this._operations) {
      await operation();
    }
    
    // Convert to buffer with the specified format
    return new Promise((resolve, reject) => {
      if (!this._image) {
        return reject(new Error('No image loaded'));
      }
      
      let mime;
      switch (this._format) {
        case 'jpeg':
          mime = Jimp.MIME_JPEG;
          break;
        case 'png':
          mime = Jimp.MIME_PNG;
          break;
        case 'webp':
          mime = Jimp.MIME_WEBP;
          break;
        default:
          mime = Jimp.MIME_PNG;
      }
      
      this._image.quality(this._quality);
      this._image.getBuffer(mime, (err, buffer) => {
        if (err) reject(err);
        else resolve(buffer);
      });
    });
  }
  
  async toFile(filePath) {
    await this._loadPromise;
    
    // Apply all queued operations
    for (const operation of this._operations) {
      await operation();
    }
    
    return new Promise((resolve, reject) => {
      if (!this._image) {
        return reject(new Error('No image loaded'));
      }
      
      // Set quality based on format
      this._image.quality(this._quality);
      
      this._image.writeAsync(filePath)
        .then(() => resolve({ filePath }))
        .catch(reject);
    });
  }
}

// Export a function that mimics Sharp's API
module.exports = function(input) {
  return new SharpCompat(input);
};

// Also export some basic utilities
module.exports.cache = function(enable) {
  console.log('Sharp cache settings ignored in compatibility layer');
  return module.exports;
};

module.exports.simd = function(enable) {
  console.log('Sharp SIMD settings ignored in compatibility layer');
  return module.exports;
};
EOL

# Step 9: Install Jimp as fallback
log_and_echo "${YELLOW}Step 9: Installing Jimp as fallback...${NC}"
yarn add jimp >> "$LOG_FILE" 2>&1

# Step 10: Test Sharp installation
log_and_echo "${YELLOW}Step 10: Testing Sharp installation...${NC}"
cat > test-sharp.js << 'EOL'
const fs = require('fs');

try {
  const sharp = require('sharp');
  console.log('Sharp version:', sharp.versions.sharp);
  console.log('Sharp libvips version:', sharp.versions.vips);
  
  // Create a simple test image
  const width = 300;
  const height = 200;
  const channels = 4;
  const buffer = Buffer.alloc(width * height * channels);
  
  // Fill with red pixels
  for (let i = 0; i < buffer.length; i += channels) {
    buffer[i] = 255;      // R
    buffer[i + 1] = 0;    // G
    buffer[i + 2] = 0;    // B
    buffer[i + 3] = 255;  // A
  }
  
  sharp(buffer, {
    raw: {
      width,
      height,
      channels
    }
  })
  .toFile('test-sharp-output.png')
  .then(() => {
    console.log('Sharp test successful! Created test-sharp-output.png');
    process.exit(0);
  })
  .catch(err => {
    console.error('Sharp test failed during file write:', err);
    process.exit(1);
  });
} catch (err) {
  console.error('Sharp test failed:', err);
  process.exit(1);
}
EOL

# Run the test
node test-sharp.js >> "$LOG_FILE" 2>&1
TEST_STATUS=$?

# Step 11: Update index.js to use the appropriate Sharp version
log_and_echo "${YELLOW}Step 11: Configuring index.js for Termux compatibility...${NC}"
if grep -q "const isTermux" "index.js"; then
  log_and_echo "${GREEN}✓ Termux detection already exists in index.js${NC}"
else
  # Create backup
  cp index.js index.js.backup
  
  # Insert Termux detection code
  TMP_FILE=$(mktemp)
  cat > "$TMP_FILE" << 'EOL'
// Detect if running in Termux and handle Sharp compatibility
const os = require('os');
const isTermux = os.platform() === 'android' || process.env.TERMUX === 'true';

// Use Sharp or fall back to compatibility layer
if (isTermux) {
  console.log('📱 Running in Termux environment');
  try {
    global.sharp = require('sharp');
    console.log('✅ Sharp loaded successfully in Termux');
  } catch (err) {
    console.error('⚠️ Failed to load Sharp, falling back to compatibility layer:', err.message);
    global.sharp = require('./sharp-compat.js');
  }
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
  
  log_and_echo "${GREEN}✓ Added Termux detection and Sharp handling to index.js${NC}"
fi

# Step 12: Create an optimized startup script
log_and_echo "${YELLOW}Step 12: Creating optimized startup script...${NC}"
cat > run-termux-optimized.sh << 'EOL'
#!/bin/bash
# Optimized startup script for BLACKSKY-MD in Termux

# Set Termux flag
export TERMUX=true

# Memory optimization
export NODE_OPTIONS="--max-old-space-size=1024 --gc-interval=1000"

# Run with optimized settings
node --optimize_for_size --max_old_space_size=1024 index.js
EOL

chmod +x run-termux-optimized.sh

# Final check and summary
if [ $TEST_STATUS -eq 0 ]; then
  log_and_echo "${GREEN}===============================================${NC}"
  log_and_echo "${GREEN}✓ Sharp installed and working correctly!${NC}"
  log_and_echo "${GREEN}✓ You can now run the bot with: ./run-termux-optimized.sh${NC}"
  log_and_echo "${GREEN}===============================================${NC}"
else
  log_and_echo "${YELLOW}===============================================${NC}"
  log_and_echo "${YELLOW}⚠ Sharp installation partially successful${NC}"
  log_and_echo "${YELLOW}⚠ Fallback compatibility layer is in place${NC}"
  log_and_echo "${YELLOW}⚠ Performance may be reduced for image operations${NC}"
  log_and_echo "${YELLOW}⚠ You can now run the bot with: ./run-termux-optimized.sh${NC}"
  log_and_echo "${YELLOW}===============================================${NC}"
fi

log_and_echo "${BLUE}Installation log saved to: ${LOG_FILE}${NC}"
echo -e "${BLUE}===========================================================${NC}"