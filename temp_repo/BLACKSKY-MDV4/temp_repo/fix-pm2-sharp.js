/**
 * BLACKSKY-MD Premium - PM2 and Sharp Fixer
 * 
 * This utility script prepares your bot to run properly with PM2 by:
 * 1. Fixing Sharp module integration
 * 2. Patching index.js to load compatibility layers
 * 3. Setting up PM2 with the proper configuration
 */

const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const os = require('os');

// Detect environment
const isTermux = os.platform() === 'android' || process.env.TERMUX === 'true';
const isHeroku = process.env.HEROKU === 'true' || !!process.env.DYNO;

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  underscore: '\x1b[4m',
  blink: '\x1b[5m',
  reverse: '\x1b[7m',
  hidden: '\x1b[8m',
  
  fg: {
    black: '\x1b[30m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m',
    white: '\x1b[37m',
    crimson: '\x1b[38m'
  },
  
  bg: {
    black: '\x1b[40m',
    red: '\x1b[41m',
    green: '\x1b[42m',
    yellow: '\x1b[43m',
    blue: '\x1b[44m',
    magenta: '\x1b[45m',
    cyan: '\x1b[46m',
    white: '\x1b[47m',
    crimson: '\x1b[48m'
  }
};

// Log function with color
function log(message, type = 'INFO') {
  const color = type === 'ERROR' ? colors.fg.red : 
               type === 'WARNING' ? colors.fg.yellow : 
               type === 'SUCCESS' ? colors.fg.green : 
               colors.fg.cyan;
               
  console.log(`${color}[${type}]${colors.reset} ${message}`);
}

// Execute shell command
function runCommand(command) {
  return new Promise((resolve, reject) => {
    exec(command, (error, stdout, stderr) => {
      if (error) {
        return reject(error);
      }
      resolve({ stdout, stderr });
    });
  });
}

// Check if PM2 is installed
async function checkPM2() {
  try {
    await runCommand('pm2 --version');
    log('PM2 is installed ✅', 'SUCCESS');
    return true;
  } catch (error) {
    log('PM2 is not installed ❌', 'ERROR');
    return false;
  }
}

// Install PM2 globally
async function installPM2() {
  log('Installing PM2 globally...', 'INFO');
  try {
    await runCommand('npm install -g pm2');
    log('PM2 installed successfully ✅', 'SUCCESS');
    return true;
  } catch (error) {
    log(`Failed to install PM2: ${error.message}`, 'ERROR');
    return false;
  }
}

// Check if Jimp is installed
async function checkJimp() {
  try {
    const packageJsonPath = path.join(process.cwd(), 'package.json');
    if (!fs.existsSync(packageJsonPath)) {
      log('package.json not found', 'ERROR');
      return false;
    }
    
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    
    return !!(packageJson.dependencies && (packageJson.dependencies.jimp || packageJson.devDependencies && packageJson.devDependencies.jimp));
  } catch (error) {
    log(`Error checking for Jimp: ${error.message}`, 'ERROR');
    return false;
  }
}

// Install Jimp
async function installJimp() {
  log('Installing Jimp for Sharp compatibility...', 'INFO');
  try {
    await runCommand('npm install --save jimp');
    log('Jimp installed successfully ✅', 'SUCCESS');
    return true;
  } catch (error) {
    log(`Failed to install Jimp: ${error.message}`, 'ERROR');
    return false;
  }
}

// Patch index.js to load Sharp compatibility layer
function patchIndexJs() {
  const indexPath = path.join(process.cwd(), 'index.js');
  
  if (!fs.existsSync(indexPath)) {
    log('index.js not found', 'ERROR');
    return false;
  }
  
  log('Patching index.js with Sharp compatibility layer...', 'INFO');
  
  try {
    let content = fs.readFileSync(indexPath, 'utf8');
    
    // Check if already patched
    if (content.includes('global.sharp = require') || content.includes('require(\'./load-sharp.js\')')) {
      log('index.js already patched ✅', 'SUCCESS');
      return true;
    }
    
    // Add the patch at the top of the file
    const patch = `
/**
 * Sharp compatibility patch - Added by fix-pm2-sharp.js
 */
try {
  // Load Sharp compatibility layer early
  global.sharp = require('./load-sharp.js');
  console.log('✅ Sharp module loaded and patched for compatibility');
} catch (err) {
  console.error('❌ Error loading Sharp compatibility layer:', err);
}

`;
    
    // Add patch at the beginning (after shebang if present)
    if (content.startsWith('#!')) {
      const firstLine = content.split('\n')[0];
      content = firstLine + '\n' + patch + content.substring(firstLine.length);
    } else {
      content = patch + content;
    }
    
    fs.writeFileSync(indexPath, content, 'utf8');
    log('index.js patched successfully ✅', 'SUCCESS');
    return true;
  } catch (error) {
    log(`Failed to patch index.js: ${error.message}`, 'ERROR');
    return false;
  }
}

// Main function
async function main() {
  console.log(`${colors.fg.cyan}${colors.bright}=========================================${colors.reset}`);
  console.log(`${colors.fg.cyan}${colors.bright}  BLACKSKY-MD - PM2 & Sharp Fixer       ${colors.reset}`);
  console.log(`${colors.fg.cyan}${colors.bright}=========================================${colors.reset}`);
  console.log();
  
  log(`Running in ${isTermux ? 'Termux' : isHeroku ? 'Heroku' : 'standard'} environment`, 'INFO');
  
  // Step 1: Check and install PM2 if needed
  const hasPM2 = await checkPM2();
  if (!hasPM2) {
    await installPM2();
  }
  
  // Step 2: Check and install Jimp if needed
  const hasJimp = await checkJimp();
  if (!hasJimp) {
    await installJimp();
  }
  
  // Step 3: Ensure all necessary files exist
  const requiredFiles = [
    { name: 'load-sharp.js', exists: fs.existsSync('load-sharp.js') },
    { name: 'sharp-compat.js', exists: fs.existsSync('sharp-compat.js') },
    { name: 'sharp-simple-compat.js', exists: fs.existsSync('sharp-simple-compat.js') },
    { name: 'ecosystem.config.js', exists: fs.existsSync('ecosystem.config.js') },
    { name: 'pm2-integration.js', exists: fs.existsSync('pm2-integration.js') },
    { name: 'pm2-service.js', exists: fs.existsSync('pm2-service.js') },
  ];
  
  const missingFiles = requiredFiles.filter(file => !file.exists);
  
  if (missingFiles.length > 0) {
    log('Some required files are missing:', 'WARNING');
    missingFiles.forEach(file => {
      log(`  - ${file.name}`, 'WARNING');
    });
    log('Please ensure all files are present before running this fixer', 'WARNING');
  } else {
    log('All required files are present ✅', 'SUCCESS');
  }
  
  // Step 4: Patch index.js
  patchIndexJs();
  
  // Step 5: Final check and instructions
  console.log();
  console.log(`${colors.fg.cyan}${colors.bright}=========================================${colors.reset}`);
  console.log(`${colors.fg.cyan}${colors.bright}  Setup Complete                        ${colors.reset}`);
  console.log(`${colors.fg.cyan}${colors.bright}=========================================${colors.reset}`);
  console.log();
  console.log(`${colors.fg.green}To start your bot with PM2:${colors.reset}`);
  console.log(`${colors.fg.white}  pm2 start ecosystem.config.js${colors.reset}`);
  console.log();
  console.log(`${colors.fg.green}To check status:${colors.reset}`);
  console.log(`${colors.fg.white}  pm2 status${colors.reset}`);
  console.log();
  console.log(`${colors.fg.green}To view logs:${colors.reset}`);
  console.log(`${colors.fg.white}  pm2 logs BLACKSKY-MD${colors.reset}`);
  console.log();
  console.log(`${colors.fg.green}To restart the bot:${colors.reset}`);
  console.log(`${colors.fg.white}  pm2 restart BLACKSKY-MD${colors.reset}`);
  console.log();
  console.log(`${colors.fg.green}To save the current process list (important):${colors.reset}`);
  console.log(`${colors.fg.white}  pm2 save${colors.reset}`);
  console.log();
  
  if (isTermux) {
    console.log(`${colors.fg.yellow}Termux-specific notes:${colors.reset}`);
    console.log(`${colors.fg.white}  1. Keep Termux running in the background${colors.reset}`);
    console.log(`${colors.fg.white}  2. Disable battery optimization for Termux in Android settings${colors.reset}`);
    console.log(`${colors.fg.white}  3. To auto-start on boot, install the Termux:Boot app${colors.reset}`);
    console.log();
  }
}

// Run the main function
main().catch(error => {
  log(`Unhandled error: ${error.message}`, 'ERROR');
});