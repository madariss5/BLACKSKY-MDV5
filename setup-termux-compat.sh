#!/bin/bash
# Simple setup script for BLACKSKY-MD in Termux without Sharp
# This uses a simple pass-through compatibility layer that doesn't rely on Jimp

# ANSI color codes for better readability
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}===========================================================${NC}"
echo -e "${BLUE}    BLACKSKY-MD Simple Termux Compatibility Setup          ${NC}"
echo -e "${BLUE}===========================================================${NC}"
echo

# Check if running in Termux
if [ -d "/data/data/com.termux" ] || [ -n "$TERMUX_VERSION" ]; then
  echo -e "${GREEN}✓ Running in Termux environment${NC}"
else
  echo -e "${YELLOW}⚠ Not running in Termux. This script is optimized for Termux but will try to continue.${NC}"
fi

# Make sure the simplified compatibility layer exists
if [ ! -f "sharp-simple-compat.js" ]; then
  echo -e "${RED}Error: sharp-simple-compat.js not found!${NC}"
  echo -e "${YELLOW}Please create this file first.${NC}"
  exit 1
fi

# Update index.js to use the simplified compatibility layer
echo -e "${YELLOW}Updating index.js to use simplified compatibility layer...${NC}"

# Make a backup of index.js first
cp index.js index.js.simple-backup

# Check if Termux detection is already in index.js
if grep -q "const isTermux" "index.js"; then
  # Replace the Sharp loading part
  sed -i 's/global.sharp = require(.\.\/sharp-compat\.js.);/global.sharp = require(\'.\/sharp-simple-compat.js\');/' index.js
  sed -i 's/global.sharp = require(.sharp.);/global.sharp = require(\'.\/sharp-simple-compat.js\');/' index.js
  
  echo -e "${GREEN}✓ Updated index.js to use simplified compatibility layer${NC}"
else
  # Add Termux detection and compatibility layer loading to the beginning of index.js
  TMP_FILE=$(mktemp)
  cat > "$TMP_FILE" << 'EOL'
// Detect if running in Termux and handle Sharp compatibility
const os = require('os');
const isTermux = os.platform() === 'android' || process.env.TERMUX === 'true';

// Use simplified compatibility layer in Termux
if (isTermux) {
  console.log('📱 Running in Termux environment, using simplified compatibility layer');
  global.sharp = require('./sharp-simple-compat.js');
} else {
  try {
    global.sharp = require('sharp');
  } catch (err) {
    console.error('Failed to load Sharp, falling back to simplified compatibility layer:', err);
    global.sharp = require('./sharp-simple-compat.js');
  }
}

EOL
  
  # Prepend to index.js (only if the detection isn't already there)
  cat "$TMP_FILE" index.js > index.js.new
  mv index.js.new index.js
  rm "$TMP_FILE"
  
  echo -e "${GREEN}✓ Added Termux detection and simplified compatibility layer to index.js${NC}"
fi

# Create a simple run script
echo -e "${YELLOW}Creating simple run script...${NC}"
cat > run-termux-simple.sh << 'EOL'
#!/bin/bash
# BLACKSKY-MD Termux simple run script

# Set environment variables
export TERMUX=true
export NODE_OPTIONS="--max-old-space-size=1024"

# Create required directories
mkdir -p tmp
mkdir -p sessions
mkdir -p media

# Run bot
echo "Starting BLACKSKY-MD Bot with simplified compatibility..."
node index.js
EOL

chmod +x run-termux-simple.sh

echo -e "${BLUE}===========================================================${NC}"
echo -e "${GREEN}✅ Setup complete!${NC}"
echo -e "${BLUE}===========================================================${NC}"
echo -e "${YELLOW}To run the bot with simplified compatibility:${NC}"
echo -e "  ${BLUE}./run-termux-simple.sh${NC}"
echo
echo -e "${YELLOW}IMPORTANT NOTES:${NC}"
echo -e "1. This simplified compatibility layer ${RED}does not${NC} perform image processing"
echo -e "2. Features that require image resizing/manipulation will be limited"
echo -e "3. But the bot should run and most features will work without crashing"
echo -e "${BLUE}===========================================================${NC}"