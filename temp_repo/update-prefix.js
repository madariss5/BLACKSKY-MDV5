/**
 * Update Prefix Utility - Sets the prefix to '.' only
 */

// Load required modules
const fs = require('fs');
const path = require('path');

// Get config file path
const configPath = path.join(__dirname, 'config.js');

// Read current config file
let configContent = fs.readFileSync(configPath, 'utf8');

// Replace any prefix definition with the dot prefix
configContent = configContent.replace(
  /global\.prefix\s*=\s*['"](.*?)['"];?/,
  "global.prefix = '.';"
);

// Write the updated config back to the file
fs.writeFileSync(configPath, configContent);

// Verify the update
try {
  // Clear require cache to reload with new values
  delete require.cache[require.resolve('./config.js')];
  
  // Reload the config
  require('./config.js');
  
  // Check if the prefix is correctly set to '.'
  if (global.prefix === '.') {
    console.log('✅ Prefix successfully updated to "." (dot)');
    
    // Reset any custom prefix in conn object if it exists
    if (global.conn) {
      global.conn.prefix = '.';
      console.log('✅ Connection prefix also updated to "." (dot)');
    }
    
    // Update prefix in memory as well
    global.prefix = new RegExp('^[.]');
    console.log('✅ Prefix regex updated in memory');
  } else {
    console.log(`❌ Prefix update failed. Current prefix: ${global.prefix}`);
  }
} catch (error) {
  console.error('Error verifying prefix update:', error);
}

console.log('⭐ IMPORTANT: Please restart the bot for the changes to take full effect.');