/**
 * BLACKSKY-MD Memory Cleanup Command
 * This plugin allows the bot owner to manually trigger memory cleanup
 */

const os = require('os');

// Command info
let handler = async (m, { conn, args, usedPrefix, command }) => {
  try {
    // Check if memory management is initialized
    if (!global.memoryManager) {
      await m.reply('⚠️ Memory manager is not initialized. Bot is running without memory management.');
      return;
    }

    await m.reply('🧹 Running memory cleanup...');
    
    // Check if emergency cleanup flag is set
    const emergency = args[0]?.toLowerCase() === 'emergency';
    
    // Run the appropriate cleanup function
    if (emergency) {
      await m.reply('⚡ Running *EMERGENCY* memory cleanup. This will clear all caches!');
      global.memoryManager.runEmergencyCleanup();
    } else {
      global.memoryManager.runCleanup();
    }
    
    // Try running garbage collection
    if (global.safeGC && global.safeGC()) {
      await m.reply('♻️ Garbage collection completed successfully');
    }
    
    // Get updated memory usage
    const memory = process.memoryUsage();
    const total = os.totalmem();
    const used = total - os.freemem();
    const heapUsage = Math.round((memory.heapUsed / memory.heapTotal) * 100);
    const systemUsage = Math.round((used / total) * 100);
    
    // Format size
    const formatMB = (bytes) => Math.round(bytes / 1024 / 1024) + ' MB';
    
    // Send success message with memory stats
    await m.reply(`
✅ Memory cleanup completed!

*Current memory usage:*
• Heap: ${formatMB(memory.heapUsed)}/${formatMB(memory.heapTotal)} (${heapUsage}%)
• RSS: ${formatMB(memory.rss)}
• System: ${formatMB(used)}/${formatMB(total)} (${systemUsage}%)

Use ${usedPrefix}memorystatus to see detailed memory information.
    `);
    
  } catch (error) {
    console.error('Error in memory cleanup command:', error);
    await m.reply(`❌ Error: ${error.message}`);
  }
};

// Set command properties
handler.help = ['memorycleanup'];
handler.tags = ['owner'];
handler.command = /^(memorycleanup|memclean|clearmem)$/i;
handler.owner = true;

module.exports = handler;