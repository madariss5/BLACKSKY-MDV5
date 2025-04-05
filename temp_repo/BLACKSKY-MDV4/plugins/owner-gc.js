/**
 * BLACKSKY-MD Garbage Collection Command
 * This plugin allows the bot owner to manually trigger garbage collection
 */

const os = require('os');

// Command info
let handler = async (m, { conn, args, usedPrefix, command }) => {
  try {
    await m.reply('♻️ Running garbage collection...');
    
    // Check if the exposed GC is available and use it
    if (global.safeGC) {
      const result = global.safeGC();
      if (result) {
        // Get updated memory usage after GC
        const memory = process.memoryUsage();
        const formatMB = (bytes) => Math.round(bytes / 1024 / 1024) + ' MB';
        
        // Send success message
        await m.reply(`
✅ Garbage collection completed successfully!

*Memory after GC:*
• Heap Used: ${formatMB(memory.heapUsed)}
• Heap Total: ${formatMB(memory.heapTotal)}
• RSS: ${formatMB(memory.rss)}

Memory usage has been optimized.
        `);
      } else {
        await m.reply('⚠️ Garbage collection function is not available. Make sure you start the bot with NODE_OPTIONS="--expose-gc"');
      }
    } else {
      await m.reply('⚠️ Garbage collection function is not available. Make sure you start the bot with NODE_OPTIONS="--expose-gc"');
    }
    
  } catch (error) {
    console.error('Error in GC command:', error);
    await m.reply(`❌ Error: ${error.message}`);
  }
};

// Set command properties
handler.help = ['gc'];
handler.tags = ['owner'];
handler.command = /^(gc|garbagecollect|forcegc)$/i;
handler.owner = true;

module.exports = handler;