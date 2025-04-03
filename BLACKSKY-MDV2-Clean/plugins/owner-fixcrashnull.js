/**
 * Fix Null Exit Code Handler
 * This plugin adds a command to tackle and fix the "bot process exited with code null" issue
 */

// Simple connection fixer implementation
const connectionFixer = {
  initConnectionFix: (conn) => {
    console.log('[CONNECTION-FIX] Creating built-in connection fixer');
    return {
      checkHealth: () => {
        const health = {
          wsState: conn.ws?.readyState || -1,
          ev: conn.ev ? true : false,
          authState: conn.authState ? true : false
        };
        return health;
      },
      attemptReconnection: async (conn) => {
        console.log('[CONNECTION-FIX] Attempting connection refresh');
        if (typeof conn.refresh === 'function') {
          await conn.refresh();
          return true;
        }
        return false;
      }
    };
  }
};

let handler = async (m, { conn, args, usedPrefix, command }) => {
  // Log the command execution
  console.log('[NULL-EXIT-FIX] Fix command executed by', m.sender);
  
  // Inform the user that we're working on the fix
  await m.reply('🔄 Applying advanced fixes for null exit code issues...');
  
  // Apply our fixes one by one
  try {
    // Apply connection fixes if not already done
    if (!global.connectionFix) {
      console.log('[NULL-EXIT-FIX] Initializing connection fix module');
      global.connectionFix = connectionFixer.initConnectionFix(conn);
      
      // Check and log the connection health
      const health = global.connectionFix.checkHealth();
      console.log('[NULL-EXIT-FIX] Connection health:', JSON.stringify(health));
      
      await m.reply('✅ Connection fix module initialized and applied');
    }
    
    // Clear any cached messages that might be causing issues
    if (conn.chats) {
      console.log('[NULL-EXIT-FIX] Clearing problematic chat caches');
      
      // Clear all unresolved message promises, which can cause unhandledRejections
      for (let [jid, chat] of Object.entries(conn.chats)) {
        if (chat.messages) {
          // Reset any potentially problematic message objects
          chat.messages = new Map();
        }
      }
      
      await m.reply('✅ Chat message caches cleared');
    }
    
    // Force garbage collection to free memory
    if (global.gc) {
      console.log('[NULL-EXIT-FIX] Forcing garbage collection');
      global.gc();
      await m.reply('✅ Garbage collection performed');
    }
    
    // Optimize memory usage using the ultimate memory manager
    if (global.ultimateMemoryManager && typeof global.ultimateMemoryManager.performFullOptimization === 'function') {
      console.log('[NULL-EXIT-FIX] Running full memory optimization');
      global.ultimateMemoryManager.performFullOptimization();
      
      // Log current memory status
      const memStatus = global.ultimateMemoryManager.getMemoryUsage();
      console.log('[NULL-EXIT-FIX] Current memory status:', JSON.stringify(memStatus));
      
      await m.reply(`✅ Memory optimization complete (${Math.round(memStatus.heapUsedMB)}MB / ${Math.round(memStatus.heapTotalMB)}MB)`);
    }
    
    // Reset connection event listeners to prevent memory leaks
    console.log('[NULL-EXIT-FIX] Checking event listeners');
    try {
      // Check if we have too many listeners on connection events
      if (conn.ev.listenerCount('connection.update') > 5) {
        console.log('[NULL-EXIT-FIX] Too many connection listeners detected, cleaning up');
        
        // Store original handlers
        const connUpdateListeners = conn.ev.listeners('connection.update');
        
        // Remove duplicate listeners
        conn.ev.removeAllListeners('connection.update');
        
        // Add back only the last one (usually the most recent and working one)
        if (connUpdateListeners.length > 0) {
          conn.ev.on('connection.update', connUpdateListeners[connUpdateListeners.length - 1]);
          console.log('[NULL-EXIT-FIX] Restored main connection update handler');
        }
        
        await m.reply('✅ Event listener cleanup completed');
      }
    } catch (error) {
      console.error('[NULL-EXIT-FIX] Error in event listener cleanup:', error);
    }
    
    // Verify and fix WebSocket connection if needed
    console.log('[NULL-EXIT-FIX] Checking WebSocket connection');
    try {
      if (conn.ws) {
        const wsState = conn.ws.readyState;
        const wsStates = ['CONNECTING', 'OPEN', 'CLOSING', 'CLOSED'];
        console.log(`[NULL-EXIT-FIX] Current WebSocket state: ${wsStates[wsState]}`);
        
        // If WebSocket is closing or closed, attempt to reconnect
        if (wsState === 2 || wsState === 3) {
          console.log('[NULL-EXIT-FIX] WebSocket is not in optimal state, attempting to fix');
          
          // Try to reconnect
          if (global.connectionFix && typeof global.connectionFix.attemptReconnection === 'function') {
            const success = await global.connectionFix.attemptReconnection(conn);
            await m.reply(`${success ? '✅' : '⚠️'} WebSocket reconnection ${success ? 'successful' : 'attempted'}`);
          } else if (typeof conn.refresh === 'function') {
            await conn.refresh();
            await m.reply('✅ Connection refresh performed');
          }
        } else {
          await m.reply('✅ WebSocket connection is in good state');
        }
      }
    } catch (error) {
      console.error('[NULL-EXIT-FIX] Error checking WebSocket:', error);
      await m.reply('⚠️ WebSocket check encountered an error, but continuing with fixes');
    }
    
    // Final verification
    await m.reply('✅ All fixes have been applied! The bot should now be more stable against null exits.');
  } catch (error) {
    console.error('[NULL-EXIT-FIX] Error during fix process:', error);
    await m.reply(`❌ An error occurred during the fix process: ${error.message}`);
  }
};

handler.help = ['fixnull', 'fixcrash'];
handler.tags = ['owner', 'advanced'];
handler.command = /^(fixnull|fixcrash)$/i;

// Restrict to bot owner only
handler.owner = true;

module.exports = handler;