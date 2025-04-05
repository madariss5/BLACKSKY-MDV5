/**
 * BLACKSKY-MD Premium - Connection Fix Integrator
 * 
 * This module integrates the enhanced connection keeper directly into
 * the main connection object to fix "connection appears to be closed" errors.
 */

// Load required modules
const fs = require('fs');
const path = require('path');

// Try to load the enhanced connection keeper
let enhancedConnectionKeeper;
try {
  enhancedConnectionKeeper = require('./enhanced-connection-keeper');
  console.log('✅ Enhanced connection keeper loaded successfully in integrator');
} catch (err) {
  console.error('❌ Failed to load enhanced connection keeper in integrator:', err.message);
  enhancedConnectionKeeper = null;
}

/**
 * Apply connection fixes to the WhatsApp connection
 * @param {Object} conn - The WhatsApp connection object
 */
function applyConnectionFixes(conn) {
  if (!conn) {
    console.log('⚠️ No connection object provided to connection-fix-integrator');
    return false;
  }

  console.log('🔄 Applying connection fixes to prevent "connection appears to be closed" errors');

  // Apply enhanced connection keeper if available
  if (enhancedConnectionKeeper) {
    try {
      console.log('🛡️ Initializing enhanced connection keeper...');
      enhancedConnectionKeeper.initializeConnectionKeeper(conn);
      
      console.log('🛡️ Applying connection patch for improved error handling...');
      enhancedConnectionKeeper.applyConnectionPatch(conn);
      
      console.log('✅ Enhanced connection keeper applied successfully');
      
      // Save a reference to the enhanced connection keeper
      global.enhancedConnectionKeeper = enhancedConnectionKeeper;
      return true;
    } catch (err) {
      console.error('❌ Error applying enhanced connection keeper:', err);
    }
  }

  // If enhanced connection keeper is not available, apply basic fixes
  console.log('⚠️ Enhanced connection keeper not available, applying basic fixes');
  
  // Apply basic connection recovery patch
  applyBasicConnectionPatch(conn);
  return true;
}

/**
 * Apply a basic connection patch if the enhanced version is not available
 * @param {Object} conn - The WhatsApp connection object
 */
function applyBasicConnectionPatch(conn) {
  // Save original query function
  const originalQuery = conn.query.bind(conn);
  
  // Patch the query function with improved error handling
  conn.query = async (node, timeout = 10000) => {
    try {
      return await originalQuery(node, timeout);
    } catch (error) {
      // If it's a connection closed error, try to reconnect
      if (error.message && (
        error.message.includes('Connection closed') ||
        error.message.includes('connection closed') ||
        error.message.includes('timed out') ||
        error.message.includes('socket') ||
        error.message.includes('WebSocket')
      )) {
        console.log(`⚠️ Connection error detected: ${error.message}`);
        
        // If global.reloadHandler exists, use it for reconnection
        if (global.reloadHandler) {
          console.log('🔄 Using global reloadHandler for reconnection');
          setTimeout(() => {
            global.reloadHandler(true);
          }, 3000);
        }
      }
      throw error;
    }
  };
  
  console.log('✅ Basic connection patch applied');
  
  // Set up basic heartbeat mechanism to keep connection alive
  const heartbeatInterval = setInterval(() => {
    try {
      if (conn.user && conn.ws.readyState === 1) {
        conn.sendPresenceUpdate('available', conn.user.id).catch(() => {});
      }
    } catch (err) {
      // Ignore errors in heartbeat
    }
  }, 60000); // Every minute
  
  // Save interval reference to global scope to prevent garbage collection
  global.heartbeatInterval = heartbeatInterval;
  
  console.log('✅ Basic heartbeat mechanism set up');
}

// Export the function for external use
module.exports = {
  applyConnectionFixes
};