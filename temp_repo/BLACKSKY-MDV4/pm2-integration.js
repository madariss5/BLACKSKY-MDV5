/**
 * BLACKSKY-MD Premium - PM2 Integration Module
 * 
 * This module provides integration with PM2 process manager to ensure
 * stable 24/7 operation in Termux environment.
 * 
 * Features:
 * - Termux wake-lock acquisition to prevent process termination
 * - Auto-restart on crashes
 * - Graceful shutdown with session saving
 * - Memory optimization for resource-constrained devices
 * - Termux compatibility layer for Sharp image processing
 */

const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const os = require('os');

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

/**
 * Log a message with color
 * @param {string} message - Message to log
 * @param {string} color - Color to use
 */
function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

/**
 * Execute a shell command
 * @param {string} command - Command to execute
 * @returns {Promise<string>} - Command output
 */
function executeCommand(command) {
  return new Promise((resolve, reject) => {
    exec(command, (error, stdout, stderr) => {
      if (error) {
        reject(error);
        return;
      }
      resolve(stdout.trim());
    });
  });
}

/**
 * Check if PM2 is installed
 * @returns {Promise<boolean>}
 */
async function isPM2Installed() {
  try {
    await executeCommand('pm2 --version');
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Install PM2 if not already installed
 * @returns {Promise<boolean>}
 */
async function installPM2IfNeeded() {
  try {
    if (await isPM2Installed()) {
      log('PM2 is already installed', colors.green);
      return true;
    }
    
    log('Installing PM2...', colors.yellow);
    await executeCommand('npm install -g pm2');
    log('PM2 installed successfully', colors.green);
    return true;
  } catch (error) {
    log(`Failed to install PM2: ${error.message}`, colors.red);
    return false;
  }
}

/**
 * Create a PM2 ecosystem.config.js file optimized for Termux
 * @returns {Promise<boolean>}
 */
async function createPM2Config() {
  const configPath = path.join(process.cwd(), 'ecosystem.config.js');
  
  // Check if config already exists
  if (fs.existsSync(configPath)) {
    log('PM2 ecosystem config already exists', colors.cyan);
    return true;
  }
  
  try {
    // Create an optimized ecosystem config for Termux
    const config = `
module.exports = {
  apps: [
    {
      name: 'blacksky-md',
      script: 'index.js',
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
      kill_timeout: 3000,
      // Execute Termux wake-lock to keep process alive
      exec_interpreter: 'bash',
      interpreter_args: '-c',
      exec_mode: 'fork',
      // For Termux, we use a wrapper that acquires wake-lock
      script: './termux-start.sh',
      ` : ''}
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
    log('Created PM2 ecosystem config', colors.green);
    
    // Create Termux start script if in Termux
    if (isTermux) {
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
      log('Created Termux start script with wake-lock', colors.green);
    }
    
    return true;
  } catch (error) {
    log(`Failed to create PM2 config: ${error.message}`, colors.red);
    return false;
  }
}

/**
 * Apply Sharp compatibility patch if needed
 * @returns {Promise<boolean>}
 */
async function applySharpPatch() {
  try {
    // Check if load-sharp.js exists
    const loadSharpPath = path.join(process.cwd(), 'load-sharp.js');
    const sharpCompatPath = path.join(process.cwd(), 'sharp-simple-compat.js');
    
    if (!fs.existsSync(loadSharpPath)) {
      log('load-sharp.js not found, skipping Sharp patch', colors.yellow);
    }
    
    if (!fs.existsSync(sharpCompatPath)) {
      log('sharp-simple-compat.js not found, skipping Sharp patch', colors.yellow);
    }
    
    // Make sure index.js is patched to include the compatibility layer
    const indexPath = path.join(process.cwd(), 'index.js');
    if (!fs.existsSync(indexPath)) {
      log('index.js not found!', colors.red);
      return false;
    }
    
    const indexContent = fs.readFileSync(indexPath, 'utf8');
    if (!indexContent.includes('global.sharp = require')) {
      log('Patching index.js to include Sharp compatibility layer...', colors.yellow);
      // Execute the index-sharp-patch.js script
      const patchScriptPath = path.join(process.cwd(), 'index-sharp-patch.js');
      if (fs.existsSync(patchScriptPath)) {
        await executeCommand(`node ${patchScriptPath}`);
        log('Applied Sharp compatibility patch', colors.green);
      } else {
        log('index-sharp-patch.js not found, skipping auto-patching', colors.yellow);
      }
    } else {
      log('index.js already contains Sharp compatibility patch', colors.green);
    }
    
    return true;
  } catch (error) {
    log(`Failed to apply Sharp patch: ${error.message}`, colors.red);
    return false;
  }
}

/**
 * Start the bot with PM2
 * @returns {Promise<boolean>}
 */
async function startWithPM2() {
  try {
    // Check if we have a custom ecosystem config
    const configPath = path.join(process.cwd(), 'ecosystem.config.js');
    if (fs.existsSync(configPath)) {
      log('Starting with custom ecosystem config...', colors.cyan);
      await executeCommand('pm2 start ecosystem.config.js');
    } else {
      // Start with default settings
      log('Starting with default settings...', colors.cyan);
      await executeCommand('pm2 start index.js --name "blacksky-md" --max-memory-restart 350M');
    }
    
    log('Bot started with PM2. You can check status with "pm2 status"', colors.green);
    return true;
  } catch (error) {
    log(`Failed to start with PM2: ${error.message}`, colors.red);
    return false;
  }
}

/**
 * Save PM2 process list
 * @returns {Promise<boolean>}
 */
async function savePM2Process() {
  try {
    await executeCommand('pm2 save');
    log('PM2 process list saved', colors.green);
    return true;
  } catch (error) {
    log(`Failed to save PM2 process list: ${error.message}`, colors.red);
    return false;
  }
}

/**
 * Get a summary of the running process
 * @returns {Promise<string>}
 */
async function getProcessSummary() {
  try {
    const status = await executeCommand('pm2 status');
    const logs = await executeCommand('pm2 logs --lines 5 blacksky-md');
    return `
Status:
${status}

Recent logs:
${logs}
`;
  } catch (error) {
    return `Error getting process summary: ${error.message}`;
  }
}

/**
 * Main integration function
 * @param {Object} options - Options
 * @returns {Promise<boolean>}
 */
async function integrate(options = {}) {
  log('🤖 Starting PM2 integration for BLACKSKY-MD Premium...', colors.cyan);
  
  // Install PM2 if needed
  if (!await installPM2IfNeeded()) {
    log('Cannot continue without PM2', colors.red);
    return false;
  }
  
  // Create PM2 config
  if (!await createPM2Config()) {
    log('Failed to create PM2 config, using defaults', colors.yellow);
  }
  
  // Apply Sharp compatibility patch if needed
  if (!await applySharpPatch()) {
    log('Warning: Sharp compatibility patch not applied', colors.yellow);
  }
  
  // Start with PM2
  if (options.start !== false) {
    if (!await startWithPM2()) {
      log('Failed to start with PM2', colors.red);
      return false;
    }
    
    // Save PM2 process list
    await savePM2Process();
    
    // Show process summary
    const summary = await getProcessSummary();
    log('📊 Process Summary:\n' + summary, colors.magenta);
  }
  
  log('✅ PM2 integration completed successfully', colors.green);
  return true;
}

// Export functions for external use
module.exports = {
  integrate,
  installPM2IfNeeded,
  createPM2Config,
  applySharpPatch,
  startWithPM2,
  savePM2Process,
  getProcessSummary,
  isTermux
};