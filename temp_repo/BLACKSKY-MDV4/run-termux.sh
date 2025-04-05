#!/bin/bash

# BLACKSKY-MD Premium - Termux Run Script
# 
# This script simplifies running the WhatsApp bot in Termux
# with proper Sharp compatibility and PM2 integration.

# Set terminal colors
NC='\033[0m'       # No Color
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'

# Display banner
echo -e "${PURPLE}"
echo "╔════════════════════════════════════════╗"
echo "║      🌌 BLACKSKY-MD PREMIUM 🌌         ║"
echo "║      ⚡ TERMUX LAUNCHER ⚡             ║"
echo "╚════════════════════════════════════════╝"
echo -e "${NC}"

# Detect if running in Termux
if [ -d "/data/data/com.termux" ] || [ -n "$TERMUX_VERSION" ]; then
  echo -e "${GREEN}✅ Running in Termux environment${NC}"
  export TERMUX=true
else
  echo -e "${YELLOW}⚠️ Not running in Termux environment${NC}"
  echo -e "${YELLOW}Some features may not work correctly.${NC}"
fi

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
  echo -e "${RED}❌ Node.js is not installed.${NC}"
  echo -e "${YELLOW}Please install Node.js first:${NC}"
  echo -e "${CYAN}pkg install nodejs${NC}"
  exit 1
fi

# Show menu
show_menu() {
  echo -e "${BLUE}Choose an option:${NC}"
  echo -e "${CYAN}1. Start bot with PM2${NC}"
  echo -e "${CYAN}2. Stop bot${NC}"
  echo -e "${CYAN}3. Restart bot${NC}"
  echo -e "${CYAN}4. Show logs${NC}"
  echo -e "${CYAN}5. Show status${NC}"
  echo -e "${CYAN}6. Fix Sharp compatibility issues${NC}"
  echo -e "${CYAN}7. Full setup${NC}"
  echo -e "${CYAN}8. Clean temporary files${NC}"
  echo -e "${CYAN}9. Exit${NC}"
  echo ""
  echo -e "${YELLOW}Enter your choice [1-9]:${NC} "
}

# Run command with PM2 starter
run_command() {
  COMMAND=$1
  echo -e "${BLUE}Running: ${COMMAND}${NC}"
  node start-bot-pm2.js $COMMAND
}

# Acquire Termux wake-lock
acquire_wakelock() {
  if [ "$TERMUX" = true ] && command -v termux-wake-lock &> /dev/null; then
    echo -e "${GREEN}Acquiring Termux wake-lock...${NC}"
    termux-wake-lock
  fi
}

# Release Termux wake-lock
release_wakelock() {
  if [ "$TERMUX" = true ] && command -v termux-wake-unlock &> /dev/null; then
    echo -e "${GREEN}Releasing Termux wake-lock...${NC}"
    termux-wake-unlock
  fi
}

# Create shortcut script if it doesn't exist
create_shortcut() {
  if [ ! -f "$HOME/../usr/bin/blacksky" ]; then
    echo -e "${YELLOW}Creating termux shortcut command...${NC}"
    echo '#!/bin/bash' > $HOME/../usr/bin/blacksky
    echo "cd $PWD && bash run-termux.sh" >> $HOME/../usr/bin/blacksky
    chmod +x $HOME/../usr/bin/blacksky
    echo -e "${GREEN}✅ Created 'blacksky' command. You can now start the bot by typing 'blacksky' anywhere in Termux.${NC}"
  fi
}

# Check if start-bot-pm2.js exists, if not, create it
if [ ! -f "start-bot-pm2.js" ]; then
  echo -e "${YELLOW}⚠️ start-bot-pm2.js not found. Creating it...${NC}"
  node -e "
  const fs = require('fs');
  const url = 'https://raw.githubusercontent.com/BLACKSKYMEEZ/BLACKSKY-MD/main/start-bot-pm2.js';
  const https = require('https');
  
  https.get(url, (res) => {
    if (res.statusCode !== 200) {
      console.error('Failed to download start-bot-pm2.js');
      process.exit(1);
    }
    
    const data = [];
    res.on('data', (chunk) => data.push(chunk));
    res.on('end', () => {
      fs.writeFileSync('start-bot-pm2.js', Buffer.concat(data));
      console.log('Downloaded start-bot-pm2.js successfully');
    });
  }).on('error', (err) => {
    console.error('Error downloading start-bot-pm2.js:', err.message);
    process.exit(1);
  });
  " || {
    echo -e "${RED}❌ Failed to create start-bot-pm2.js${NC}"
    echo -e "${YELLOW}Please run this script in the bot directory${NC}"
    exit 1
  }
  
  if [ ! -f "start-bot-pm2.js" ]; then
    echo -e "${RED}❌ Failed to download start-bot-pm2.js${NC}"
    echo -e "${YELLOW}Creating a simple starter script...${NC}"
    
    echo "// Simple PM2 starter script" > start-bot-pm2.js
    echo "const { exec } = require('child_process');" >> start-bot-pm2.js
    echo "const fs = require('fs');" >> start-bot-pm2.js
    echo "const cmd = process.argv[2] || 'help';" >> start-bot-pm2.js
    echo "if (cmd === 'start') {" >> start-bot-pm2.js
    echo "  console.log('Starting bot with PM2...');" >> start-bot-pm2.js
    echo "  exec('pm2 start index.js --name blacksky-md');" >> start-bot-pm2.js
    echo "} else if (cmd === 'stop') {" >> start-bot-pm2.js
    echo "  console.log('Stopping bot...');" >> start-bot-pm2.js
    echo "  exec('pm2 stop blacksky-md');" >> start-bot-pm2.js
    echo "} else if (cmd === 'restart') {" >> start-bot-pm2.js
    echo "  console.log('Restarting bot...');" >> start-bot-pm2.js
    echo "  exec('pm2 restart blacksky-md');" >> start-bot-pm2.js
    echo "} else if (cmd === 'logs') {" >> start-bot-pm2.js
    echo "  console.log('Showing logs...');" >> start-bot-pm2.js
    echo "  exec('pm2 logs blacksky-md', {stdio: 'inherit'});" >> start-bot-pm2.js
    echo "} else if (cmd === 'help') {" >> start-bot-pm2.js
    echo "  console.log('Commands: start, stop, restart, logs');" >> start-bot-pm2.js
    echo "}" >> start-bot-pm2.js
  fi
fi

# Create shortcut for easy access
create_shortcut

# Execute main menu loop
while true; do
  echo ""
  show_menu
  read choice
  
  case $choice in
    1)
      acquire_wakelock
      run_command "start"
      ;;
    2)
      run_command "stop"
      release_wakelock
      ;;
    3)
      run_command "restart"
      ;;
    4)
      run_command "logs"
      ;;
    5)
      run_command "status"
      ;;
    6)
      run_command "fix"
      ;;
    7)
      acquire_wakelock
      run_command "setup"
      ;;
    8)
      run_command "clean"
      ;;
    9)
      echo -e "${GREEN}Exiting...${NC}"
      release_wakelock
      exit 0
      ;;
    *)
      echo -e "${RED}Invalid option. Please try again.${NC}"
      ;;
  esac
  
  echo ""
  echo -e "${YELLOW}Press Enter to continue...${NC}"
  read
done
