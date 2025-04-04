/**
 * BLACKSKY-MD Memory Status Command
 * This plugin allows the bot owner to check memory usage and status
 */

const os = require('os');
const { performance } = require('perf_hooks');

// Command info
let handler = async (m, { conn, args, usedPrefix, command }) => {
  try {
    // Check if memory management is initialized
    if (!global.memoryManager) {
      await m.reply('⚠️ Memory manager is not initialized. Bot is running without memory management.');
      return;
    }

    // Format filesize
    const formatSize = (bytes) => {
      const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
      if (bytes === 0) return '0 Byte';
      const i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
      return Math.round(bytes / Math.pow(1024, i), 2) + ' ' + sizes[i];
    };

    // Get memory usage
    const memory = process.memoryUsage();
    const systemMemory = {
      total: os.totalmem(),
      free: os.freemem(),
      used: os.totalmem() - os.freemem()
    };

    // Get memory manager stats
    const cacheStats = global.memoryManager.getAllCacheStats ? 
                      global.memoryManager.getAllCacheStats() : 
                      { 'No cache stats available': { size: 0 } };

    // Create status message
    let statusMessage = `╭─「 🧠 *MEMORY STATUS* 🧠 」\n`;
    
    // System memory
    statusMessage += `│ 💻 *System Memory*:\n`;
    statusMessage += `│   Total: ${formatSize(systemMemory.total)}\n`;
    statusMessage += `│   Free: ${formatSize(systemMemory.free)}\n`;
    statusMessage += `│   Used: ${formatSize(systemMemory.used)} (${Math.round((systemMemory.used / systemMemory.total) * 100)}%)\n`;
    
    // Process memory
    statusMessage += `│ 🤖 *Bot Memory*:\n`;
    statusMessage += `│   Heap Used: ${formatSize(memory.heapUsed)}\n`;
    statusMessage += `│   Heap Total: ${formatSize(memory.heapTotal)}\n`;
    statusMessage += `│   RSS: ${formatSize(memory.rss)}\n`;
    statusMessage += `│   External: ${formatSize(memory.external || 0)}\n`;

    // Memory manager stats
    statusMessage += `│ 🔍 *Memory Manager*:\n`;
    statusMessage += `│   Status: Active\n`;
    
    if (global.memoryManager.state) {
      statusMessage += `│   Total Cleanups: ${global.memoryManager.state.totalCleanups || 0}\n`;
      statusMessage += `│   Critical Events: ${global.memoryManager.state.criticalMemoryEvents || 0}\n`;
    }

    // Cache info
    statusMessage += `│ 📦 *Cache Stats*:\n`;
    
    Object.entries(cacheStats).slice(0, 3).forEach(([cacheName, stats]) => {
      statusMessage += `│   ${cacheName}: ${stats.size || 0} items\n`;
    });

    // Manual control commands
    statusMessage += `│ 📋 *Commands*:\n`;
    statusMessage += `│   ${usedPrefix}memorycleanup - Run cleanup\n`;
    statusMessage += `│   ${usedPrefix}gc - Run garbage collection\n`;
    statusMessage += `╰──────────────`

    // Send formatted message
    await m.reply(statusMessage);

  } catch (error) {
    console.error('Error in memory status command:', error);
    await m.reply(`❌ Error: ${error.message}`);
  }
};

// Set command properties
handler.help = ['memorystatus'];
handler.tags = ['owner'];
handler.command = /^(memorystatus|memstat|memorystat)$/i;
handler.owner = true;

module.exports = handler;