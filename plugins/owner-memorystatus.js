/**
 * Memory Status Command
 * 
 * This plugin provides a command for bot owners to check memory usage
 * and perform manual cleanup to reduce memory usage.
 */

let handler = async (m, { conn }) => {
  // Memory details
  const memoryUsage = process.memoryUsage();
  const formatMemory = (bytes) => {
    return (bytes / 1024 / 1024).toFixed(2) + ' MB';
  };
  
  // Current session files
  let sessionCount = 0;
  let sessionSize = 0;
  try {
    // Check session files
    const fs = require('fs');
    const path = require('path');
    const sessionDir = './sessions';
    if (fs.existsSync(sessionDir)) {
      const files = fs.readdirSync(sessionDir);
      sessionCount = files.length;
      
      for (const file of files) {
        try {
          const filePath = path.join(sessionDir, file);
          const stats = fs.statSync(filePath);
          if (stats.isFile()) {
            sessionSize += stats.size;
          }
        } catch (err) {
          // Ignore errors for individual files
        }
      }
    }
  } catch (err) {
    console.error('[MEMORY-STATUS] Error counting session files:', err.message);
  }
  
  // Format responses
  const heapUsed = formatMemory(memoryUsage.heapUsed);
  const heapTotal = formatMemory(memoryUsage.heapTotal);
  const rss = formatMemory(memoryUsage.rss);
  const external = formatMemory(memoryUsage.external || 0);
  const heapPercentage = Math.round((memoryUsage.heapUsed / memoryUsage.heapTotal) * 100);
  
  let status = '';
  if (heapPercentage > 85) {
    status = '🔴 Critical - Memory usage is dangerously high';
  } else if (heapPercentage > 75) {
    status = '🟠 Warning - Memory usage is high';
  } else if (heapPercentage > 60) {
    status = '🟡 Notice - Memory usage is moderate';
  } else {
    status = '🟢 Good - Memory usage is normal';
  }

  // Check if memory manager is available
  let memoryManagerStatus = '❌ Not initialized';
  if (global.memoryManager) {
    memoryManagerStatus = '✅ Running and active';
  }
  
  // Build reply
  let reply = `*🧠 Memory Status Report*\n\n`;
  reply += `*Status:* ${status}\n`;
  reply += `*Heap Used:* ${heapUsed} (${heapPercentage}%)\n`;
  reply += `*Heap Total:* ${heapTotal}\n`;
  reply += `*RSS:* ${rss}\n`;
  reply += `*External:* ${external}\n\n`;
  reply += `*Session Files:* ${sessionCount} files\n`;
  reply += `*Session Size:* ${(sessionSize / 1024 / 1024).toFixed(2)} MB\n\n`;
  reply += `*Memory Manager:* ${memoryManagerStatus}\n\n`;
  reply += `Use *.memorycleanup* to perform a memory cleanup.`;

  m.reply(reply);
};

handler.help = ['memorystatus'];
handler.tags = ['owner'];
handler.command = /^(memorystatus|memory|memstat)$/i;
handler.owner = true;

module.exports = handler;