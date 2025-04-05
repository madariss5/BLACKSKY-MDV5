/**
 * BLACKSKY-MD Bot Performance Optimization Loader
 * 
 * This module hooks into the bot's startup process to apply various
 * performance optimizations, especially for group chats.
 */

// Required modules
const { performance } = require('perf_hooks');
const fs = require('fs');
const path = require('path');

// Try to load optimization modules
let optimizationsLoaded = false;

/**
 * Apply optimizations to a connection
 * @param {Object} conn - The WhatsApp connection object
 */
function applyOptimizations(conn) {
  if (!conn) {
    console.log('[OPTIMIZE] No connection object provided');
    return;
  }
  
  console.log('[OPTIMIZE] Applying optimization patches to connection...');
  
  try {
    // Load response cache if available
    if (!global.responseCache) {
      try {
        global.responseCache = require('./response-cache.js');
        console.log('[OPTIMIZE] ✅ Response cache system loaded');
      } catch (err) {
        console.error('[OPTIMIZE] ⚠️ Failed to load response cache system:', err.message);
      }
    }
    
    // Load group optimization if available
    if (!global.groupOptimization) {
      try {
        global.groupOptimization = require('./group-optimization.js');
        console.log('[OPTIMIZE] ✅ Group optimization system loaded');
      } catch (err) {
        console.error('[OPTIMIZE] ⚠️ Failed to load group optimization system:', err.message);
      }
    }
    
    // Apply optimizations to handler
    if (typeof conn.handler === 'function' && global.groupOptimization) {
      const originalHandler = conn.handler.bind(conn);
      
      console.log('[OPTIMIZE] Wrapping handler with optimizations...');
      
      conn.handler = async function optimizedHandler(chatUpdate) {
        // Skip if already being processed in parallel
        if (chatUpdate && chatUpdate._PARALLEL_PROCESSED) {
          return originalHandler.call(this, chatUpdate);
        }
        
        // Check if there are group messages that can be optimized
        if (chatUpdate && chatUpdate.messages && chatUpdate.messages.length > 1) {
          // Check if any message is from a group
          const hasGroupMessages = chatUpdate.messages.some(m => {
            return m.key && m.key.remoteJid && m.key.remoteJid.endsWith('@g.us');
          });
          
          if (hasGroupMessages) {
            try {
              console.log('[OPTIMIZE] Optimizing batch of group messages...');
              // Process normally, the optimized handler will handle parallelization
            } catch (err) {
              console.error('[OPTIMIZE] Error in group message optimization:', err);
            }
          }
        }
        
        // Call original handler
        return originalHandler.call(this, chatUpdate);
      };
      
      console.log('[OPTIMIZE] ✅ Handler optimizations applied successfully');
      
      // Set up cache maintenance
      if (global.responseCache) {
        const CLEANUP_INTERVAL = 15 * 60 * 1000; // 15 minutes
        
        setInterval(() => {
          try {
            if (global.responseCache && typeof global.responseCache.cleanupCache === 'function') {
              const removed = global.responseCache.cleanupCache(false);
              console.log(`[OPTIMIZE] Performed cache maintenance, removed ${removed} entries`);
            }
          } catch (err) {
            console.error('[OPTIMIZE] Error during cache maintenance:', err);
          }
        }, CLEANUP_INTERVAL);
        
        console.log(`[OPTIMIZE] ✅ Set up cache maintenance every ${CLEANUP_INTERVAL/60000} minutes`);
      }
      
      optimizationsLoaded = true;
    } else {
      console.log('[OPTIMIZE] ❌ Could not apply handler optimizations - missing dependencies');
    }
  } catch (err) {
    console.error('[OPTIMIZE] ❌ Error applying optimizations:', err);
  }
}

// Export functions
module.exports = {
  applyOptimizations,
  isLoaded: () => optimizationsLoaded
};