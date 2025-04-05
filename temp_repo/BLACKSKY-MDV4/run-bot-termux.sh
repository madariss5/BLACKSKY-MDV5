#!/bin/bash
# BLACKSKY-MD Premium - Termux Launcher Script
# This script helps set up and run the bot in Termux environment with PM2

# Terminal colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}===========================================================${NC}"
echo -e "${BLUE}    BLACKSKY-MD Premium - Termux Setup & Launch Script    ${NC}"
echo -e "${BLUE}===========================================================${NC}"
echo

# Check if running in Termux
if [ -d "/data/data/com.termux" ] || [ -n "$TERMUX_VERSION" ]; then
  echo -e "${GREEN}✓ Running in Termux environment${NC}"
else
  echo -e "${YELLOW}⚠ Not running in Termux. This script is optimized for Termux but will try to continue.${NC}"
fi

# Check for required packages
echo -e "${YELLOW}Checking for required packages...${NC}"
pkg_list=(nodejs git ffmpeg imagemagick python)
pkg_install=()

for pkg in "${pkg_list[@]}"; do
  if ! command -v $pkg &> /dev/null; then
    echo -e "${YELLOW}Package $pkg not found, will install it.${NC}"
    pkg_install+=($pkg)
  fi
done

# Install missing packages
if [ ${#pkg_install[@]} -gt 0 ]; then
  echo -e "${YELLOW}Installing required packages: ${pkg_install[*]}...${NC}"
  pkg update -y
  pkg install -y ${pkg_install[@]}
else
  echo -e "${GREEN}✓ All required packages already installed${NC}"
fi

# Install PM2 if not already installed
if ! command -v pm2 &> /dev/null; then
  echo -e "${YELLOW}Installing PM2 for background process management...${NC}"
  npm install -g pm2
  if ! command -v pm2 &> /dev/null; then
    echo -e "${RED}Failed to install PM2. Trying alternative method...${NC}"
    # Try with sudo if available
    if command -v sudo &> /dev/null; then
      sudo npm install -g pm2
    fi
  fi
  
  if command -v pm2 &> /dev/null; then
    echo -e "${GREEN}✓ PM2 installed successfully${NC}"
  else
    echo -e "${RED}Failed to install PM2. Please install it manually with 'npm install -g pm2'${NC}"
    exit 1
  fi
else
  echo -e "${GREEN}✓ PM2 already installed${NC}"
fi

# Install termux-api if not already installed (for wake lock)
if ! command -v termux-wake-lock &> /dev/null; then
  echo -e "${YELLOW}Installing termux-api for wake lock...${NC}"
  pkg install termux-api -y
fi

# Fix Sharp module issues
echo -e "${YELLOW}Setting up Sharp compatibility layer for Termux...${NC}"

# Check if sharp-compat.js exists
if [ -f "sharp-compat.js" ]; then
  echo -e "${GREEN}✓ Sharp compatibility layer already exists${NC}"
else
  echo -e "${RED}Sharp compatibility layer not found. This may cause issues with image processing.${NC}"
  echo -e "${YELLOW}Attempting to set up a compatibility layer...${NC}"
  
  # Try to install Jimp as a fallback
  npm install --save jimp
  
  # Create a basic compatibility layer if one doesn't exist
  cat > sharp-compat.js << 'EOL'
/**
 * Simple Sharp compatibility layer using Jimp
 * For Termux environments where Sharp is difficult to install
 */
const Jimp = require('jimp');
const fs = require('fs');
const path = require('path');

class SharpCompat {
  constructor(input) {
    this._input = input;
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
      return this;
    } catch (err) {
      console.error('Error loading image:', err);
      throw err;
    }
  }

  async _ensureImage() {
    if (!this._image && this._loadPromise) {
      await this._loadPromise;
    }
    if (!this._image) {
      throw new Error('No image loaded');
    }
    return this._image;
  }

  resize(width, height) {
    this._width = width;
    this._height = height;
    return this;
  }

  toFormat(format) {
    this._format = format;
    return this;
  }

  jpeg() { return this.toFormat('jpeg'); }
  png() { return this.toFormat('png'); }

  async toBuffer() {
    const image = await this._ensureImage();
    let processedImage = image.clone();
    
    if (this._width || this._height) {
      processedImage.resize(this._width || Jimp.AUTO, this._height || Jimp.AUTO);
    }
    
    return new Promise((resolve, reject) => {
      processedImage.getBuffer(
        this._format === 'jpeg' ? Jimp.MIME_JPEG : Jimp.MIME_PNG,
        (err, buffer) => {
          if (err) reject(err);
          else resolve(buffer);
        }
      );
    });
  }

  async toFile(outputPath) {
    const image = await this._ensureImage();
    await image.writeAsync(outputPath);
    return {
      format: this._format,
      width: image.getWidth(),
      height: image.getHeight(),
      channels: 4,
      size: fs.statSync(outputPath).size
    };
  }
}

module.exports = (input) => new SharpCompat(input);
module.exports.cache = false;
EOL

  echo -e "${GREEN}✓ Created basic Sharp compatibility layer${NC}"
fi

# Make sure logs directory exists
if [ ! -d "logs" ]; then
  echo -e "${YELLOW}Creating logs directory...${NC}"
  mkdir -p logs
fi

# Make sure sessions directory exists
if [ ! -d "sessions" ]; then
  echo -e "${YELLOW}Creating sessions directory...${NC}"
  mkdir -p sessions
fi

# Update ecosystem.config.js to set TERMUX=true
if [ -f "ecosystem.config.js" ]; then
  echo -e "${YELLOW}Making sure ecosystem.config.js has TERMUX=true...${NC}"
  if grep -q "TERMUX:" "ecosystem.config.js"; then
    echo -e "${GREEN}✓ TERMUX environment variable already in ecosystem.config.js${NC}"
  else
    echo -e "${YELLOW}Adding TERMUX environment variable to ecosystem.config.js...${NC}"
    sed -i "s/env: {/env: {\n      TERMUX: 'true',/" ecosystem.config.js
  fi
else
  echo -e "${YELLOW}ecosystem.config.js not found, creating it...${NC}"
  cat > ecosystem.config.js << 'EOL'
module.exports = {
  apps: [{
    name: "BLACKSKY-MD",
    script: "heroku-bot-starter.js",
    args: ["--autocleartmp", "--autoread"],
    watch: false,
    autorestart: true,
    restart_delay: 5000,
    max_memory_restart: "512M",
    env: {
      NODE_ENV: "production",
      TERMUX: "true",
      SESSION_ID: process.env.SESSION_ID || "BLACKSKY-MD",
      BOT_NAME: process.env.BOT_NAME || "BLACKSKY-MD",
      OWNER_NUMBER: process.env.OWNER_NUMBER || "",
      PORT: process.env.PORT || 5000,
      ENABLE_MEMORY_OPTIMIZATION: "true",
      ENABLE_SESSION_BACKUP: "true",
      OPTIMIZE_FOR_TERMUX: "true",
      KEEP_ALIVE: "true", 
      NO_WARNINGS: "true"
    },
    node_args: [
      "--expose-gc",
      "--max-old-space-size=512",
      "--optimize-for-size",
      "--no-warnings"
    ],
    error_file: "./logs/pm2-error.log",
    out_file: "./logs/pm2-out.log",
    log_file: "./logs/combined.log", 
    merge_logs: true
  }]
};
EOL
  echo -e "${GREEN}✓ Created ecosystem.config.js with Termux configuration${NC}"
fi

# Detect if connection-patch-termux.js exists
if [ -f "connection-patch-termux.js" ]; then
  echo -e "${GREEN}✓ Termux connection patch file exists${NC}"
else
  echo -e "${YELLOW}Termux connection patch file not found, this might cause connection issues${NC}"
fi

# Check for index.js Termux detection
if [ -f "index.js" ]; then
  if grep -q "const isTermux" "index.js"; then
    echo -e "${GREEN}✓ Termux detection already exists in index.js${NC}"
  else
    echo -e "${YELLOW}Adding Termux detection to index.js...${NC}"
    # Create backup
    cp index.js index.js.backup
    
    # Insert Termux detection code at the beginning of the file
    TMP_FILE=$(mktemp)
    cat > "$TMP_FILE" << 'EOL'
// Detect if running in Termux and handle Sharp compatibility
const os = require('os');
const isTermux = os.platform() === 'android' || process.env.TERMUX === 'true';

// Set environment variable for Termux
if (isTermux) {
  console.log('📱 Running in Termux environment, using Termux compatibility adaptations');
  process.env.TERMUX = 'true';
  
  // Use Sharp compatibility layer in Termux
  try {
    global.sharp = require('./sharp-compat.js');
    console.log('✅ Using Jimp-based Sharp compatibility layer for Termux');
  } catch (err) {
    console.error('Failed to load Sharp compatibility layer:', err);
    // Create a dummy sharp object for basic functionality
    global.sharp = (input) => ({
      resize: () => ({ toBuffer: async () => input, toFile: async (path) => fs.writeFileSync(path, input) })
    });
  }
} else {
  console.log('💻 Running in standard environment');
  // Try to use native Sharp in non-Termux environments
  try {
    global.sharp = require('sharp');
  } catch (err) {
    console.error('Failed to load Sharp, falling back to compatibility layer:', err);
    try {
      global.sharp = require('./sharp-compat.js');
    } catch (compErr) {
      console.error('Failed to load compatibility layer:', compErr);
      // Create a dummy sharp object for basic functionality
      global.sharp = (input) => ({
        resize: () => ({ toBuffer: async () => input, toFile: async (path) => fs.writeFileSync(path, input) })
      });
    }
  }
}

EOL
    
    # Prepend to index.js
    cat "$TMP_FILE" index.js > index.js.new
    mv index.js.new index.js
    rm "$TMP_FILE"
    
    echo -e "${GREEN}✓ Added Termux detection and Sharp handling to index.js${NC}"
  fi
else
  echo -e "${RED}index.js not found. This script may need to be run from the bot's root directory.${NC}"
  exit 1
fi

# Apply wake lock to keep the process alive when Termux is closed
echo -e "${YELLOW}Acquiring wake lock to keep the process alive...${NC}"
termux-wake-lock || echo -e "${YELLOW}Could not acquire wake lock. Make sure termux-api is installed.${NC}"

# Start the bot with PM2
echo -e "${YELLOW}Starting bot with PM2...${NC}"
if pm2 list | grep -q "BLACKSKY-MD"; then
  echo -e "${YELLOW}Bot is already running with PM2. Restarting to apply any changes...${NC}"
  pm2 restart BLACKSKY-MD
else
  pm2 start ecosystem.config.js
fi

# Save the PM2 process list
echo -e "${YELLOW}Saving PM2 process list...${NC}"
pm2 save

# Setup PM2 to start on boot (Termux restart)
echo -e "${YELLOW}Setting up PM2 to start on Termux boot...${NC}"
pm2 startup

# Create a helper script for checking logs
echo -e "${YELLOW}Creating helper scripts...${NC}"
cat > check-logs.sh << 'EOL'
#!/bin/bash
echo "=== BLACKSKY-MD PM2 Logs ==="
echo "Showing last 50 lines of logs..."
pm2 logs BLACKSKY-MD --lines 50
EOL
chmod +x check-logs.sh

cat > restart-bot.sh << 'EOL'
#!/bin/bash
echo "=== Restarting BLACKSKY-MD Bot ==="
pm2 restart BLACKSKY-MD
echo "Bot restarted. To view logs, run ./check-logs.sh"
EOL
chmod +x restart-bot.sh

cat > stop-bot.sh << 'EOL'
#!/bin/bash
echo "=== Stopping BLACKSKY-MD Bot ==="
pm2 stop BLACKSKY-MD
echo "Bot stopped. To start it again, run ./run-bot-termux.sh"
EOL
chmod +x stop-bot.sh

echo -e "${GREEN}===========================================================${NC}"
echo -e "${GREEN}    BLACKSKY-MD Premium is now running in the background    ${NC}"
echo -e "${GREEN}===========================================================${NC}"
echo
echo -e "You can now close Termux, and the bot will keep running."
echo -e "To check bot logs, run: ${YELLOW}./check-logs.sh${NC}"
echo -e "To restart the bot, run: ${YELLOW}./restart-bot.sh${NC}"
echo -e "To stop the bot, run: ${YELLOW}./stop-bot.sh${NC}"
echo
echo -e "${BLUE}PM2 helpful commands:${NC}"
echo -e "  ${YELLOW}pm2 status${NC}       - Show bot status"
echo -e "  ${YELLOW}pm2 logs BLACKSKY-MD${NC} - Show live logs"
echo -e "  ${YELLOW}pm2 monit${NC}        - Monitor CPU and memory usage"
echo -e "  ${YELLOW}pm2 restart BLACKSKY-MD${NC} - Restart the bot"
echo -e "  ${YELLOW}pm2 stop BLACKSKY-MD${NC} - Stop the bot"
echo