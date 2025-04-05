/**
 * BLACKSKY-MD Premium - Bot Starter with PM2 and Sharp Fix
 * 
 * This script makes it easy to use PM2 to run the bot with proper
 * Sharp compatibility for both Termux and standard environments.
 */

const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const os = require('os');

// Set up colors for better console output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

// Detect if running in Termux
const isTermux = os.platform() === 'android' || process.env.TERMUX === 'true';

// Log a message with color
function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

// Execute a shell command
function executeCommand(command) {
  return new Promise((resolve, reject) => {
    log(`Executing: ${command}`, colors.blue);
    
    exec(command, (error, stdout, stderr) => {
      if (error) {
        reject(error);
        return;
      }
      
      if (stderr) {
        log(`Command stderr: ${stderr}`, colors.yellow);
      }
      
      resolve(stdout.trim());
    });
  });
}

// Create a banner for the bot
function showBanner() {
  const banner = `
╔════════════════════════════════════════╗
║      🌌 BLACKSKY-MD PREMIUM 🌌         ║
║      ⚡ TERMUX PM2 EDITION ⚡           ║
╚════════════════════════════════════════╝
  `;
  log(banner, colors.magenta);
  log(`Running on: ${os.platform()} ${os.release()} (${os.arch()})`, colors.cyan);
  log(`Environment: ${isTermux ? 'Termux' : 'Standard'}`, colors.cyan);
  log(`Node.js: ${process.version}`, colors.cyan);
  log('');
}

// Show help message
function showHelp() {
  log('🔶 COMMANDS:', colors.yellow);
  log('  start    - Start the bot with PM2');
  log('  stop     - Stop the bot');
  log('  restart  - Restart the bot');
  log('  logs     - Show logs');
  log('  status   - Check PM2 status');
  log('  monitor  - Open PM2 monitoring');
  log('  fix      - Apply Sharp compatibility fix');
  log('  setup    - Full setup (install PM2, apply fixes)');
  log('  save     - Save PM2 process list');
  log('  clean    - Clean temporary files and logs');
  log('  help     - Show this help message');
  log('');
  log('Usage: node start-bot-pm2.js [command]', colors.cyan);
  log('If no command is provided, "setup" will be executed by default.', colors.cyan);
}

// Check if PM2 is installed
async function isPM2Installed() {
  try {
    await executeCommand('pm2 --version');
    return true;
  } catch (error) {
    return false;
  }
}

// Install PM2 if needed
async function installPM2() {
  if (await isPM2Installed()) {
    log('✅ PM2 is already installed', colors.green);
    return true;
  }
  
  try {
    log('🔄 Installing PM2...', colors.yellow);
    await executeCommand('npm install -g pm2');
    log('✅ PM2 installed successfully', colors.green);
    return true;
  } catch (error) {
    log(`❌ Failed to install PM2: ${error.message}`, colors.red);
    return false;
  }
}

// Check if Jimp is installed (needed for Sharp compatibility)
async function checkJimp() {
  try {
    require.resolve('jimp');
    log('✅ Jimp is already installed', colors.green);
    return true;
  } catch (error) {
    return false;
  }
}

// Install Jimp if needed
async function installJimp() {
  if (await checkJimp()) return true;
  
  try {
    log('🔄 Installing Jimp (required for Sharp compatibility)...', colors.yellow);
    await executeCommand('npm install jimp');
    log('✅ Jimp installed successfully', colors.green);
    return true;
  } catch (error) {
    log(`❌ Failed to install Jimp: ${error.message}`, colors.red);
    return false;
  }
}

// Apply the Sharp compatibility fix
async function applySharpFix() {
  log('🔄 Applying Sharp compatibility fixes...', colors.yellow);
  
  try {
    // Check and create sharp-simple-compat.js if it doesn't exist
    const sharpCompatPath = path.join(process.cwd(), 'sharp-simple-compat.js');
    if (!fs.existsSync(sharpCompatPath)) {
      log('⚠️ sharp-simple-compat.js not found, creating it...', colors.yellow);
      
      // Create a simple implementation that uses Jimp
      const sharpCompatContent = `/**
 * BLACKSKY-MD Premium - Simple Sharp Compatibility Layer
 * 
 * This is a simplified compatibility layer for the Sharp image processing library.
 * It provides a minimal subset of Sharp's API using Jimp as a replacement.
 * Use this in environments where the full Sharp library cannot be installed.
 */

let Jimp;
try {
  Jimp = require('jimp');
} catch (err) {
  console.error('Failed to load Jimp as Sharp replacement:', err.message);
  // Provide a dummy module if Jimp is not available
  module.exports = function() {
    return {
      resize: () => module.exports(),
      jpeg: () => module.exports(),
      png: () => module.exports(),
      webp: () => module.exports(),
      toBuffer: async () => Buffer.from([]),
      toFile: async () => {}
    };
  };
  return;
}

// Main Sharp-like function
function sharp(input) {
  let jimpInstance = null;
  let format = 'jpeg';
  let quality = 80;
  let resizeOptions = null;
  
  const api = {
    /**
     * Resize an image
     * @param {number} width - Width in pixels
     * @param {number} height - Height in pixels
     * @param {Object} options - Resize options
     * @returns {Object} - Sharp-like interface for chaining
     */
    resize(width, height, options = {}) {
      resizeOptions = { width, height, options };
      return api;
    },
    
    /**
     * Convert to JPEG format
     * @param {Object} options - JPEG options
     * @returns {Object} - Sharp-like interface for chaining
     */
    jpeg(options = {}) {
      format = 'jpeg';
      quality = options.quality || 80;
      return api;
    },
    
    /**
     * Convert to PNG format
     * @param {Object} options - PNG options
     * @returns {Object} - Sharp-like interface for chaining
     */
    png(options = {}) {
      format = 'png';
      return api;
    },
    
    /**
     * Convert to WebP format
     * @param {Object} options - WebP options
     * @returns {Object} - Sharp-like interface for chaining
     */
    webp(options = {}) {
      format = 'webp';
      quality = options.quality || 80;
      return api;
    },
    
    /**
     * Get image as buffer
     * @returns {Promise<Buffer>} - Image buffer
     */
    async toBuffer() {
      try {
        if (!jimpInstance) {
          if (typeof input === 'string') {
            jimpInstance = await Jimp.read(input);
          } else if (Buffer.isBuffer(input)) {
            jimpInstance = await Jimp.read(input);
          } else {
            throw new Error('Unsupported input type');
          }
        }
        
        // Apply resize if needed
        if (resizeOptions) {
          jimpInstance.resize(
            resizeOptions.width || Jimp.AUTO,
            resizeOptions.height || Jimp.AUTO
          );
        }
        
        // Convert to the proper format
        switch (format) {
          case 'jpeg':
            return await jimpInstance.quality(quality).getBufferAsync(Jimp.MIME_JPEG);
          case 'png':
            return await jimpInstance.getBufferAsync(Jimp.MIME_PNG);
          case 'webp':
            return await jimpInstance.quality(quality).getBufferAsync(Jimp.MIME_WEBP);
          default:
            return await jimpInstance.quality(quality).getBufferAsync(Jimp.MIME_JPEG);
        }
      } catch (err) {
        console.error('Error processing image:', err);
        return Buffer.from([]);
      }
    },
    
    /**
     * Save image to file
     * @param {string} outputPath - Output file path
     * @returns {Promise<Object>} - Result object
     */
    async toFile(outputPath) {
      try {
        if (!jimpInstance) {
          if (typeof input === 'string') {
            jimpInstance = await Jimp.read(input);
          } else if (Buffer.isBuffer(input)) {
            jimpInstance = await Jimp.read(input);
          } else {
            throw new Error('Unsupported input type');
          }
        }
        
        // Apply resize if needed
        if (resizeOptions) {
          jimpInstance.resize(
            resizeOptions.width || Jimp.AUTO,
            resizeOptions.height || Jimp.AUTO
          );
        }
        
        // Set quality if applicable
        if (format === 'jpeg' || format === 'webp') {
          jimpInstance.quality(quality);
        }
        
        // Save to file
        await jimpInstance.writeAsync(outputPath);
        return { path: outputPath };
      } catch (err) {
        console.error('Error saving image:', err);
        throw err;
      }
    }
  };
  
  return api;
}

// Set up module exports to match Sharp's structure
sharp.cache = function() {
  return sharp;
};

sharp.concurrency = function() {
  return sharp;
};

module.exports = sharp;`;
      
      fs.writeFileSync(sharpCompatPath, sharpCompatContent, 'utf8');
      log('✅ Created sharp-simple-compat.js successfully', colors.green);
    }
    
    // Check and create load-sharp.js if it doesn't exist
    const loadSharpPath = path.join(process.cwd(), 'load-sharp.js');
    if (!fs.existsSync(loadSharpPath)) {
      log('⚠️ load-sharp.js not found, creating it...', colors.yellow);
      
      const loadSharpContent = `/**
 * BLACKSKY-MD Premium - Sharp Module Loader
 * 
 * This module handles loading the appropriate sharp implementation based on the environment.
 */

const os = require('os');
const fs = require('fs');
const path = require('path');

// Detect if we're running in Termux
const isTermux = os.platform() === 'android' || process.env.TERMUX === 'true';

// Function to check if a module exists
function moduleExists(name) {
  try {
    require.resolve(name);
    return true;
  } catch (e) {
    return false;
  }
}

// Try to load Sharp or fallback to compatibility layer
let sharpModule;

function loadSharp() {
  // In Termux, always use the compatibility layer
  if (isTermux) {
    console.log('📱 Running in Termux environment, using Jimp-based Sharp compatibility layer');
    
    // Try to load our compatibility module
    if (moduleExists('./sharp-simple-compat.js')) {
      return require('./sharp-simple-compat.js');
    } else {
      console.warn('⚠️ No Sharp compatibility module found, creating minimal stub');
      // Return a minimal stub function
      return function() {
        return {
          resize: () => ({ jpeg: () => ({ toBuffer: async () => Buffer.from([]) }) }),
          jpeg: () => ({ toBuffer: async () => Buffer.from([]) }),
          png: () => ({ toBuffer: async () => Buffer.from([]) }),
          webp: () => ({ toBuffer: async () => Buffer.from([]) }),
          toBuffer: async () => Buffer.from([]),
          toFile: async () => {}
        };
      };
    }
  }
  
  // In standard environments, try native Sharp first
  try {
    // First attempt to load native Sharp
    sharpModule = require('sharp');
    console.log('✅ Native Sharp module loaded successfully');
    return sharpModule;
  } catch (err) {
    console.warn('⚠️ Failed to load native Sharp module:', err.message);
    
    // Try our compatibility modules
    if (moduleExists('./sharp-simple-compat.js')) {
      console.log('🔄 Using Sharp compatibility layer');
      return require('./sharp-simple-compat.js');
    } else {
      console.warn('⚠️ No Sharp compatibility module found, using minimal stub');
      // Return a minimal stub function
      return function() {
        return {
          resize: () => ({ jpeg: () => ({ toBuffer: async () => Buffer.from([]) }) }),
          jpeg: () => ({ toBuffer: async () => Buffer.from([]) }),
          png: () => ({ toBuffer: async () => Buffer.from([]) }),
          webp: () => ({ toBuffer: async () => Buffer.from([]) }),
          toBuffer: async () => Buffer.from([]),
          toFile: async () => {}
        };
      };
    }
  }
}

// Export the appropriate module
module.exports = loadSharp();`;
      
      fs.writeFileSync(loadSharpPath, loadSharpContent, 'utf8');
      log('✅ Created load-sharp.js successfully', colors.green);
    }
    
    // Patch index.js to use our compatibility layer
    const indexPath = path.join(process.cwd(), 'index.js');
    if (!fs.existsSync(indexPath)) {
      log('❌ index.js not found!', colors.red);
      return false;
    }
    
    let indexContent = fs.readFileSync(indexPath, 'utf8');
    
    // Create a backup if one doesn't exist
    const backupPath = path.join(process.cwd(), 'index.js.bak');
    if (!fs.existsSync(backupPath)) {
      fs.writeFileSync(backupPath, indexContent, 'utf8');
      log('✅ Created backup of index.js', colors.green);
    }
    
    // Check if already patched
    if (!indexContent.includes('global.sharp = require') && 
        !indexContent.includes('Sharp compatibility patch')) {
      
      // Add our fix at the beginning of the file
      const sharpPatch = `/**
 * Sharp compatibility patch - Added by start-bot-pm2.js
 */
try {
  // Load Sharp compatibility layer early
  global.sharp = require('./load-sharp.js');
  console.log('✅ Sharp module loaded and patched for compatibility');
} catch (err) {
  console.error('❌ Error loading Sharp compatibility layer:', err);
}

`;
      
      // Add the patch after shebang if present
      if (indexContent.startsWith('#!')) {
        const firstLineEnd = indexContent.indexOf('\n') + 1;
        const firstLine = indexContent.substring(0, firstLineEnd);
        indexContent = firstLine + sharpPatch + indexContent.substring(firstLineEnd);
      } else {
        indexContent = sharpPatch + indexContent;
      }
      
      fs.writeFileSync(indexPath, indexContent, 'utf8');
      log('✅ Patched index.js to load Sharp compatibility layer', colors.green);
    } else {
      log('✅ index.js is already patched with Sharp compatibility layer', colors.green);
    }
    
    return true;
  } catch (error) {
    log(`❌ Failed to apply Sharp fix: ${error.message}`, colors.red);
    return false;
  }
}

// Create Termux start script with wake-lock
async function createTermuxStartScript() {
  if (!isTermux) return true;
  
  try {
    const startScriptPath = path.join(process.cwd(), 'termux-start.sh');
    const startScript = `#!/bin/bash
# Acquire Termux wake-lock to prevent process from being killed
termux-wake-lock
# Run with Sharp compatibility layer
export TERMUX=true
node index.js "$@"
# Release wake-lock when done
termux-wake-unlock
`;
    
    fs.writeFileSync(startScriptPath, startScript, 'utf8');
    await executeCommand('chmod +x termux-start.sh');
    log('✅ Created Termux start script with wake-lock', colors.green);
    return true;
  } catch (error) {
    log(`❌ Failed to create Termux start script: ${error.message}`, colors.red);
    return false;
  }
}

// Create PM2 ecosystem config
async function createPM2Config() {
  try {
    const configPath = path.join(process.cwd(), 'ecosystem.config.js');
    
    // Check if config already exists
    if (fs.existsSync(configPath)) {
      log('✅ PM2 ecosystem config already exists', colors.green);
      return true;
    }
    
    // Create an optimized ecosystem config
    const config = `
module.exports = {
  apps: [
    {
      name: 'blacksky-md',
      script: ${isTermux ? "'./termux-start.sh'" : "'index.js'"},
      watch: false,
      autorestart: true,
      max_memory_restart: '350M',
      env: {
        NODE_ENV: 'production',
        TERMUX: '${isTermux ? 'true' : 'false'}'
      },
      ${isTermux ? `
      // Termux-specific options
      exp_backoff_restart_delay: 1000,
      kill_timeout: 3000,` : ''}
      watch_delay: 3000,
      max_restarts: 10,
      ignore_watch: [
        'node_modules',
        'sessions',
        'logs',
        '*.log',
        'temp',
        'tmp',
        'plugins',
        'database.json'
      ],
      node_args: '--max-old-space-size=350',
      exec_mode: 'fork',
      instances: 1,
      cron_restart: '0 */6 * * *', // Restart every 6 hours for memory cleanup
      shutdown_with_message: true,
      wait_ready: true,
      listen_timeout: 10000
    }
  ]
};
`;
    
    fs.writeFileSync(configPath, config, 'utf8');
    log('✅ Created PM2 ecosystem config', colors.green);
    return true;
  } catch (error) {
    log(`❌ Failed to create PM2 config: ${error.message}`, colors.red);
    return false;
  }
}

// Clean up temp files and logs
async function cleanTempFiles() {
  try {
    // Clean temp directories
    const dirsToClean = ['temp', 'tmp'];
    
    for (const dir of dirsToClean) {
      const dirPath = path.join(process.cwd(), dir);
      if (fs.existsSync(dirPath)) {
        const files = fs.readdirSync(dirPath);
        for (const file of files) {
          try {
            fs.unlinkSync(path.join(dirPath, file));
          } catch (e) {
            log(`Failed to delete ${file}: ${e.message}`, colors.yellow);
          }
        }
        log(`✅ Cleaned ${dir} directory`, colors.green);
      }
    }
    
    // Clean log files in the root directory
    const logFiles = fs.readdirSync(process.cwd())
      .filter(file => file.endsWith('.log') || file.includes('-logs-'));
    
    for (const file of logFiles) {
      try {
        fs.unlinkSync(path.join(process.cwd(), file));
        log(`Deleted log file: ${file}`, colors.green);
      } catch (e) {
        log(`Failed to delete ${file}: ${e.message}`, colors.yellow);
      }
    }
    
    log('✅ Temporary files and logs cleaned up', colors.green);
    return true;
  } catch (error) {
    log(`❌ Failed to clean temporary files: ${error.message}`, colors.red);
    return false;
  }
}

// Setup everything for running the bot
async function setup() {
  log('🚀 Starting full setup...', colors.cyan);
  
  // Install PM2 if needed
  if (!await installPM2()) {
    log('❌ Setup failed: Could not install PM2', colors.red);
    return false;
  }
  
  // Install Jimp if needed
  if (!await installJimp()) {
    log('⚠️ Could not install Jimp, Sharp compatibility may be limited', colors.yellow);
  }
  
  // Apply Sharp compatibility fix
  if (!await applySharpFix()) {
    log('⚠️ Sharp compatibility fix could not be fully applied', colors.yellow);
  }
  
  // Create Termux start script if needed
  if (isTermux && !await createTermuxStartScript()) {
    log('⚠️ Failed to create Termux start script', colors.yellow);
  }
  
  // Create PM2 config if needed
  if (!await createPM2Config()) {
    log('⚠️ Failed to create PM2 config, will use default settings', colors.yellow);
  }
  
  log('✅ Setup completed successfully', colors.green);
  return true;
}

// Start the bot with PM2
async function startBot() {
  try {
    // Kill any existing PM2 process with the same name
    try {
      await executeCommand('pm2 delete blacksky-md');
      log('🔄 Removed existing PM2 process', colors.cyan);
    } catch (e) {
      // Ignore errors if no process exists
    }
    
    // Start with ecosystem config if it exists
    const configPath = path.join(process.cwd(), 'ecosystem.config.js');
    if (fs.existsSync(configPath)) {
      log('🚀 Starting bot with PM2 using ecosystem.config.js...', colors.cyan);
      await executeCommand('pm2 start ecosystem.config.js');
    } else {
      log('🚀 Starting bot with PM2 using default settings...', colors.cyan);
      await executeCommand(`pm2 start index.js --name blacksky-md --max-memory-restart 350M --env TERMUX=${isTermux ? 'true' : 'false'}`);
    }
    
    // Save the process list
    await executeCommand('pm2 save');
    
    log('✅ Bot started with PM2', colors.green);
    return true;
  } catch (error) {
    log(`❌ Failed to start bot: ${error.message}`, colors.red);
    return false;
  }
}

// Stop the bot
async function stopBot() {
  try {
    await executeCommand('pm2 stop blacksky-md');
    log('✅ Bot stopped', colors.green);
    return true;
  } catch (error) {
    log(`❌ Failed to stop bot: ${error.message}`, colors.red);
    return false;
  }
}

// Restart the bot
async function restartBot() {
  try {
    await executeCommand('pm2 restart blacksky-md');
    log('✅ Bot restarted', colors.green);
    return true;
  } catch (error) {
    log(`❌ Failed to restart bot: ${error.message}`, colors.red);
    return false;
  }
}

// Show bot logs
async function showLogs() {
  try {
    const logs = await executeCommand('pm2 logs blacksky-md --lines 50');
    log('📋 Recent logs:', colors.cyan);
    console.log(logs);
    return true;
  } catch (error) {
    log(`❌ Failed to show logs: ${error.message}`, colors.red);
    return false;
  }
}

// Show PM2 status
async function showStatus() {
  try {
    const status = await executeCommand('pm2 status');
    log('📊 PM2 Status:', colors.cyan);
    console.log(status);
    return true;
  } catch (error) {
    log(`❌ Failed to show status: ${error.message}`, colors.red);
    return false;
  }
}

// Open PM2 monitor
async function openMonitor() {
  try {
    log('📈 Opening PM2 monitor...', colors.cyan);
    await executeCommand('pm2 monit');
    return true;
  } catch (error) {
    log(`❌ Failed to open monitor: ${error.message}`, colors.red);
    return false;
  }
}

// Save PM2 process list
async function saveProcessList() {
  try {
    await executeCommand('pm2 save');
    log('✅ PM2 process list saved', colors.green);
    return true;
  } catch (error) {
    log(`❌ Failed to save process list: ${error.message}`, colors.red);
    return false;
  }
}

// Main function
async function main() {
  showBanner();
  
  const command = process.argv[2] || 'setup';
  
  switch (command.toLowerCase()) {
    case 'start':
      await setup();
      await startBot();
      break;
      
    case 'stop':
      await stopBot();
      break;
      
    case 'restart':
      await restartBot();
      break;
      
    case 'logs':
      await showLogs();
      break;
      
    case 'status':
      await showStatus();
      break;
      
    case 'monitor':
      await openMonitor();
      break;
      
    case 'fix':
      await installJimp();
      await applySharpFix();
      if (isTermux) await createTermuxStartScript();
      log('✅ Applied Sharp compatibility fixes', colors.green);
      break;
      
    case 'setup':
      await setup();
      log('Setup completed. Run "node start-bot-pm2.js start" to start the bot.', colors.cyan);
      break;
      
    case 'save':
      await saveProcessList();
      break;
      
    case 'clean':
      await cleanTempFiles();
      break;
      
    case 'help':
      showHelp();
      break;
      
    default:
      log(`❌ Unknown command: ${command}`, colors.red);
      showHelp();
      break;
  }
}

// Run the main function
main().catch(error => {
  log(`❌ Error: ${error.message}`, colors.red);
  process.exit(1);
});