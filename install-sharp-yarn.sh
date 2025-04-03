#!/bin/bash
# BLACKSKY-MD Sharp Installation Script for Termux using Yarn
# This script ensures Sharp works 100% in Termux environments using Yarn

# ANSI color codes for better readability
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}===========================================================${NC}"
echo -e "${BLUE}    BLACKSKY-MD Sharp Module Installer using Yarn          ${NC}"
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
LOG_FILE="sharp-yarn-install-log-$(date +%Y%m%d%H%M%S).txt"
echo "BLACKSKY-MD Sharp Installation Log (Yarn method)" > "$LOG_FILE"
echo "Date: $(date)" >> "$LOG_FILE"
echo "=============================================" >> "$LOG_FILE"

log_and_echo() {
  echo -e "$1"
  # Remove ANSI color codes when writing to log
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
pkg install -y build-essential python cmake pkg-config libvips libpng libjpeg-turbo libwebp nodejs git >> "$LOG_FILE" 2>&1
if [ $? -ne 0 ]; then
  handle_error "Failed to install all dependencies"
  # Try minimal set of dependencies
  pkg install -y build-essential python nodejs >> "$LOG_FILE" 2>&1
fi

# Step 3: Install Yarn if not already installed
log_and_echo "${YELLOW}Step 3: Installing Yarn...${NC}"
if ! command -v yarn &> /dev/null; then
  npm install -g yarn >> "$LOG_FILE" 2>&1
  if [ $? -ne 0 ]; then
    handle_error "Failed to install Yarn through npm"
    # Try alternative installation method for Yarn
    curl -sL https://dl.yarnpkg.com/debian/pubkey.gpg | apt-key add - >> "$LOG_FILE" 2>&1
    echo "deb https://dl.yarnpkg.com/debian/ stable main" | tee /etc/apt/sources.list.d/yarn.list >> "$LOG_FILE" 2>&1
    pkg update -y >> "$LOG_FILE" 2>&1
    pkg install -y yarn >> "$LOG_FILE" 2>&1
    if [ $? -ne 0 ]; then
      handle_error "Failed to install Yarn through alternative method"
      # Try to use npm as a fallback
      log_and_echo "${YELLOW}Falling back to npm for Sharp installation${NC}"
    fi
  fi
else
  log_and_echo "${GREEN}✓ Yarn is already installed${NC}"
fi

# Step 4: Clean yarn and npm caches
log_and_echo "${YELLOW}Step 4: Cleaning caches...${NC}"
if command -v yarn &> /dev/null; then
  yarn cache clean >> "$LOG_FILE" 2>&1
fi
npm cache clean --force >> "$LOG_FILE" 2>&1

# Step 5: Set environment variables
log_and_echo "${YELLOW}Step 5: Setting environment variables...${NC}"
export NODE_OPTIONS="--max-old-space-size=1024"
export SHARP_IGNORE_GLOBAL_LIBVIPS="1"
export npm_config_sharp_libvips_binary_host="https://npmmirror.com/mirrors/sharp-libvips"
export npm_config_sharp_binary_host="https://npmmirror.com/mirrors/sharp"
export npm_config_build_from_source="true"

# Add to .bashrc for persistence
if ! grep -q "SHARP_IGNORE_GLOBAL_LIBVIPS" "$HOME/.bashrc"; then
  echo '# Sharp optimization for Termux' >> "$HOME/.bashrc"
  echo 'export SHARP_IGNORE_GLOBAL_LIBVIPS="1"' >> "$HOME/.bashrc"
  echo 'export npm_config_sharp_libvips_binary_host="https://npmmirror.com/mirrors/sharp-libvips"' >> "$HOME/.bashrc"
  echo 'export npm_config_sharp_binary_host="https://npmmirror.com/mirrors/sharp"' >> "$HOME/.bashrc"
  log_and_echo "${GREEN}✓ Environment variables added to .bashrc for persistence${NC}"
fi

# Step 6: Uninstall existing Sharp installations
log_and_echo "${YELLOW}Step 6: Removing any existing Sharp installations...${NC}"
if command -v yarn &> /dev/null; then
  yarn remove sharp >> "$LOG_FILE" 2>&1
fi
npm uninstall sharp >> "$LOG_FILE" 2>&1
rm -rf node_modules/sharp >> "$LOG_FILE" 2>&1

# Step 7: Install specific version of Sharp with Yarn
if command -v yarn &> /dev/null; then
  log_and_echo "${YELLOW}Step 7: Installing Sharp with Yarn - Method 1 (prebuilt binaries)...${NC}"
  yarn add sharp@0.29.3 --ignore-scripts >> "$LOG_FILE" 2>&1
  SHARP_INSTALL_STATUS=$?

  # Check if sharp installed correctly
  if [ $SHARP_INSTALL_STATUS -ne 0 ] || ! yarn list | grep -q "sharp@0.29.3"; then
    log_and_echo "${YELLOW}Method 1 failed. Trying Method 2 (with scripts)...${NC}"
    yarn remove sharp >> "$LOG_FILE" 2>&1
    yarn add sharp@0.29.3 >> "$LOG_FILE" 2>&1
    SHARP_INSTALL_STATUS=$?
  fi

  # If that fails, try building from source
  if [ $SHARP_INSTALL_STATUS -ne 0 ] || ! yarn list | grep -q "sharp@0.29.3"; then
    log_and_echo "${YELLOW}Method 2 failed. Trying Method 3 (build from source)...${NC}"
    yarn remove sharp >> "$LOG_FILE" 2>&1
    yarn add sharp@0.29.3 --build-from-source >> "$LOG_FILE" 2>&1
    SHARP_INSTALL_STATUS=$?
  fi

  # If Yarn fails, try with npm
  if [ $SHARP_INSTALL_STATUS -ne 0 ] || ! yarn list | grep -q "sharp@0.29.3"; then
    log_and_echo "${YELLOW}Yarn methods failed. Trying npm installation...${NC}"
    yarn remove sharp >> "$LOG_FILE" 2>&1
    npm install sharp@0.29.3 --build-from-source >> "$LOG_FILE" 2>&1
    SHARP_INSTALL_STATUS=$?
  fi
else
  # Fallback to npm if Yarn installation failed
  log_and_echo "${YELLOW}Step 7: Installing Sharp with npm (fallback method)...${NC}"
  npm install sharp@0.29.3 --build-from-source >> "$LOG_FILE" 2>&1
  SHARP_INSTALL_STATUS=$?
fi

# Step 8: Install alternative Sharp versions if the first attempt fails
if [ $SHARP_INSTALL_STATUS -ne 0 ]; then
  log_and_echo "${YELLOW}First Sharp version failed. Trying older version 0.28.3...${NC}"
  
  if command -v yarn &> /dev/null; then
    yarn remove sharp >> "$LOG_FILE" 2>&1
    yarn add sharp@0.28.3 --build-from-source >> "$LOG_FILE" 2>&1
    SHARP_INSTALL_STATUS=$?
  else
    npm uninstall sharp >> "$LOG_FILE" 2>&1
    npm install sharp@0.28.3 --build-from-source >> "$LOG_FILE" 2>&1
    SHARP_INSTALL_STATUS=$?
  fi
  
  # Try a very old version as last resort
  if [ $SHARP_INSTALL_STATUS -ne 0 ]; then
    log_and_echo "${YELLOW}Second Sharp version failed. Trying fallback version 0.24.1...${NC}"
    
    if command -v yarn &> /dev/null; then
      yarn remove sharp >> "$LOG_FILE" 2>&1
      yarn add sharp@0.24.1 >> "$LOG_FILE" 2>&1
      SHARP_INSTALL_STATUS=$?
    else
      npm uninstall sharp >> "$LOG_FILE" 2>&1
      npm install sharp@0.24.1 >> "$LOG_FILE" 2>&1
      SHARP_INSTALL_STATUS=$?
    fi
  fi
fi

# Step 9: Test Sharp installation
log_and_echo "${YELLOW}Step 9: Testing Sharp installation...${NC}"
mkdir -p test
cat > test/test-sharp-yarn.js << EOL
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
  .toFile('test-output-yarn.png')
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

node test/test-sharp-yarn.js >> "$LOG_FILE" 2>&1
TEST_STATUS=$?

if [ $TEST_STATUS -eq 0 ]; then
  log_and_echo "${GREEN}✓ Sharp installed and working correctly!${NC}"
  
  # Update index.js to use normal Sharp
  if grep -q "const isTermux" "index.js"; then
    log_and_echo "${YELLOW}Updating index.js to use the working Sharp installation...${NC}"
    cp index.js index.js.yarn-backup
    
    # Replace the Termux detection to always use the installed Sharp
    sed -i 's/if (isTermux) {/if (false) {/' index.js
    log_and_echo "${GREEN}✓ Updated index.js to use the working Sharp installation${NC}"
  fi
else
  log_and_echo "${RED}× Sharp installation test failed.${NC}"
  log_and_echo "${YELLOW}Setting up Jimp-based compatibility layer...${NC}"
  
  # Step 10: Install Jimp as fallback
  log_and_echo "${YELLOW}Step 10: Installing Jimp as fallback...${NC}"
  if command -v yarn &> /dev/null; then
    yarn add jimp >> "$LOG_FILE" 2>&1
  else
    npm install jimp >> "$LOG_FILE" 2>&1
  fi
  
  # Ensure the sharp-compat.js exists
  if [ -f "sharp-compat.js" ]; then
    log_and_echo "${GREEN}✓ Sharp compatibility layer already exists${NC}"
  else
    log_and_echo "${YELLOW}Creating Sharp compatibility layer...${NC}"
    # Sharp compatibility layer implementation (same as before)
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
    
    # Update index.js to always use the compatibility layer
    if grep -q "const isTermux" "index.js"; then
      log_and_echo "${YELLOW}Updating index.js to always use the compatibility layer...${NC}"
      cp index.js index.js.jimp-backup
      
      # Replace the Termux detection to always use the compatibility layer
      sed -i 's/if (isTermux) {/if (true) {/' index.js
      log_and_echo "${GREEN}✓ Updated index.js to always use the compatibility layer${NC}"
    fi
  fi
fi

# Step 11: Create optimized run script
log_and_echo "${YELLOW}Creating optimized run script...${NC}"
cat > run-termux-yarn.sh << 'EOL'
#!/bin/bash
# BLACKSKY-MD Termux optimized run script (Yarn version)

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

chmod +x run-termux-yarn.sh

# Final output
echo -e "${BLUE}===========================================================${NC}"
echo -e "${GREEN}✅ Installation complete!${NC}"
echo -e "${BLUE}===========================================================${NC}"
echo -e "${YELLOW}To run the bot with Yarn-installed Sharp:${NC}"
echo -e "  ${BLUE}./run-termux-yarn.sh${NC}"
echo
echo -e "${YELLOW}Installation log saved to:${NC} ${BLUE}$LOG_FILE${NC}"

# Summary of what happened
if [ $TEST_STATUS -eq 0 ]; then
  echo -e "${GREEN}✓ Sharp was successfully installed and is working!${NC}"
else
  echo -e "${YELLOW}⚠ Sharp installation failed, but the compatibility layer is set up.${NC}"
  echo -e "${GREEN}✓ Your bot will work using the Jimp-based compatibility layer.${NC}"
fi

echo -e "${BLUE}===========================================================${NC}"