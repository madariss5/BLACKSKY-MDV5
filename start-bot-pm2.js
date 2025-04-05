#!/usr/bin/env node

/**
 * BLACKSKY-MD Premium - PM2 Starter
 * 
 * This script makes it easy to start the bot with PM2
 * with proper Sharp compatibility and configuration
 */

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

const isTermux = os.platform() === 'android' || process.env.TERMUX === 'true';

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m',
};

// Log function with color
function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

// Execute command and pipe output
function executeCommand(command, args) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, { stdio: 'inherit' });
    
    child.on('close', (code) => {
      if (code === 0) {
        resolve(true);
      } else {
        reject(new Error(`Command exited with code ${code}`));
      }
    });
    
    child.on('error', (err) => {
      reject(err);
    });
  });
}

// Get command line arguments
const args = process.argv.slice(2);
const commands = {
  start: 'start',
  stop: 'stop',
  restart: 'restart',
  status: 'status',
  logs: 'logs',
  delete: 'delete',
  save: 'save',
  resurrect: 'resurrect',
  fix: 'fix',
  help: 'help',
};

// Parse command
const command = args[0] ? args[0].toLowerCase() : 'help';

async function main() {
  // Display header
  log('======================================================', colors.cyan);
  log('  BLACKSKY-MD Premium - PM2 Bot Manager', colors.cyan + colors.bright);
  log('======================================================', colors.cyan);
  log('');
  
  // Check if PM2 is installed
  try {
    await executeCommand('pm2', ['--version']);
  } catch (error) {
    log('PM2 is not installed. Installing now...', colors.yellow);
    try {
      await executeCommand('npm', ['install', '-g', 'pm2']);
      log('PM2 installed successfully!', colors.green);
    } catch (installError) {
      log('Failed to install PM2. Please install it manually:', colors.red);
      log('  npm install -g pm2', colors.red);
      process.exit(1);
    }
  }
  
  // Process command
  switch (command) {
    case commands.start:
      log('Starting bot with PM2...', colors.blue);
      
      // First run the fixer if available
      if (fs.existsSync(path.join(process.cwd(), 'fix-pm2-sharp.js'))) {
        log('Running PM2 & Sharp compatibility fixer...', colors.blue);
        try {
          await executeCommand('node', ['fix-pm2-sharp.js']);
        } catch (error) {
          log('Warning: Fix script failed, continuing anyway', colors.yellow);
        }
      }
      
      // Start with ecosystem file if available
      if (fs.existsSync(path.join(process.cwd(), 'ecosystem.config.js'))) {
        log('Using ecosystem.config.js configuration...', colors.green);
        await executeCommand('pm2', ['start', 'ecosystem.config.js']);
      } else {
        log('No ecosystem.config.js found, starting index.js directly...', colors.yellow);
        await executeCommand('pm2', ['start', 'index.js', '--name', 'BLACKSKY-MD', '--', '--autocleartmp']);
      }
      
      // Start monitor service if available
      if (fs.existsSync(path.join(process.cwd(), 'pm2-service.js'))) {
        log('Starting PM2 monitor service...', colors.blue);
        try {
          await executeCommand('pm2', ['start', 'pm2-service.js', '--name', 'PM2-Monitor']);
        } catch (error) {
          log('Warning: Could not start monitor service', colors.yellow);
        }
      }
      
      // Save PM2 state
      log('Saving PM2 process list...', colors.blue);
      await executeCommand('pm2', ['save']);
      
      log('', colors.reset);
      log('Bot started successfully! ✅', colors.green + colors.bright);
      log('', colors.reset);
      break;
      
    case commands.stop:
      log('Stopping bot...', colors.blue);
      await executeCommand('pm2', ['stop', 'BLACKSKY-MD']);
      log('Bot stopped', colors.green);
      break;
      
    case commands.restart:
      log('Restarting bot...', colors.blue);
      await executeCommand('pm2', ['restart', 'BLACKSKY-MD']);
      log('Bot restarted', colors.green);
      break;
      
    case commands.status:
      log('Checking bot status...', colors.blue);
      await executeCommand('pm2', ['status']);
      break;
      
    case commands.logs:
      log('Showing bot logs (Ctrl+C to exit)...', colors.blue);
      await executeCommand('pm2', ['logs', 'BLACKSKY-MD']);
      break;
      
    case commands.delete:
      log('Deleting bot from PM2...', colors.yellow);
      await executeCommand('pm2', ['delete', 'BLACKSKY-MD']);
      log('Bot deleted from PM2', colors.green);
      break;
      
    case commands.save:
      log('Saving PM2 process list...', colors.blue);
      await executeCommand('pm2', ['save']);
      log('PM2 process list saved', colors.green);
      break;
      
    case commands.resurrect:
      log('Resurrecting saved PM2 processes...', colors.blue);
      await executeCommand('pm2', ['resurrect']);
      log('PM2 processes resurrected', colors.green);
      break;
      
    case commands.fix:
      log('Running PM2 & Sharp compatibility fixer...', colors.blue);
      if (fs.existsSync(path.join(process.cwd(), 'fix-pm2-sharp.js'))) {
        await executeCommand('node', ['fix-pm2-sharp.js']);
      } else {
        log('Error: fix-pm2-sharp.js not found', colors.red);
      }
      break;
      
    case commands.help:
    default:
      log('Available commands:', colors.green);
      log('', colors.reset);
      log('  start     - Start the bot with PM2', colors.reset);
      log('  stop      - Stop the bot', colors.reset);
      log('  restart   - Restart the bot', colors.reset);
      log('  status    - Show bot status', colors.reset);
      log('  logs      - Show bot logs', colors.reset);
      log('  delete    - Delete bot from PM2', colors.reset);
      log('  save      - Save PM2 process list', colors.reset);
      log('  resurrect - Restore saved PM2 processes', colors.reset);
      log('  fix       - Run PM2 & Sharp compatibility fixer', colors.reset);
      log('  help      - Show this help message', colors.reset);
      log('', colors.reset);
      log('Example usage:', colors.blue);
      log('  node start-bot-pm2.js start', colors.reset);
      break;
  }
}

// Run the main function
main().catch(error => {
  log(`Error: ${error.message}`, colors.red);
  process.exit(1);
});