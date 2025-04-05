/**
 * BLACKSKY-MD Premium - Sharp Patch for index.js
 * 
 * This script patches the index.js file to ensure that the Sharp compatibility
 * layer is loaded before any other code. This is crucial for Termux environments
 * where Sharp might not be available or might have compatibility issues.
 */

const fs = require('fs');
const path = require('path');
const os = require('os');

// Set up logging with colors
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

// Log a message with color
function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

// Handle errors
function handleError(message, error) {
  log(`Error: ${message}`, colors.red);
  if (error) log(`${error.message}`, colors.red);
  process.exit(1);
}

// Detect if we're running in Termux
const isTermux = os.platform() === 'android' || process.env.TERMUX === 'true';
log(`Running patcher in ${isTermux ? 'Termux' : 'standard'} environment`, colors.cyan);

// Define the patch to apply
const sharpPatch = `
/**
 * Sharp compatibility patch - Added by index-sharp-patch.js
 */
try {
  // Load Sharp compatibility layer early
  global.sharp = require('./load-sharp.js');
  console.log('✅ Sharp module loaded and patched for compatibility');
} catch (err) {
  console.error('❌ Error loading Sharp compatibility layer:', err);
}
`;

// Main function to patch index.js
function patchIndexFile() {
  const indexPath = path.join(process.cwd(), 'index.js');
  
  // Check if index.js exists
  if (!fs.existsSync(indexPath)) {
    handleError('index.js not found. Make sure you are in the correct directory.');
  }
  
  try {
    // Read the current file content
    let content = fs.readFileSync(indexPath, 'utf8');
    
    // Check if already patched
    if (content.includes('require(\'./load-sharp.js\')') || 
        content.includes('require("./load-sharp.js")') ||
        content.includes('global.sharp = require') ||
        content.includes('Sharp compatibility patch')) {
      log('index.js is already patched with Sharp compatibility layer.', colors.green);
      return true;
    }
    
    // Create a backup first
    const backupPath = `${indexPath}.bak`;
    fs.writeFileSync(backupPath, content, 'utf8');
    log(`Backup created at ${backupPath}`, colors.green);
    
    // Add patch at the beginning (after shebang if present)
    if (content.startsWith('#!')) {
      // Handle files with shebang
      const firstLineEnd = content.indexOf('\n') + 1;
      const firstLine = content.substring(0, firstLineEnd);
      content = firstLine + sharpPatch + content.substring(firstLineEnd);
    } else {
      // No shebang, just add at the beginning
      content = sharpPatch + content;
    }
    
    // Write the patched content back
    fs.writeFileSync(indexPath, content, 'utf8');
    log('index.js has been successfully patched with Sharp compatibility layer.', colors.green);
    
    return true;
  } catch (error) {
    handleError('Failed to patch index.js', error);
    return false;
  }
}

// Check if load-sharp.js exists
if (!fs.existsSync(path.join(process.cwd(), 'load-sharp.js'))) {
  log('Warning: load-sharp.js not found. You may need to create it first.', colors.yellow);
}

// Run the patcher
patchIndexFile();