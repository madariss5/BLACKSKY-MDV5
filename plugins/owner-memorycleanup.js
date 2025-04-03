/**
 * Memory Cleanup Command
 * 
 * This plugin provides a command for bot owners to manually clean up memory
 * and reduce memory usage when needed.
 */

let handler = async (m, { conn, isOwner }) => {
  if (!isOwner) {
    m.reply('⚠️ This command is only for the bot owner.');
    return;
  }
  
  // Function to calculate size
  const formatSize = (bytes) => {
    return (bytes / 1024 / 1024).toFixed(2) + ' MB';
  };
  
  // Get memory info before
  const beforeMemory = process.memoryUsage();
  const beforeHeap = beforeMemory.heapUsed;
  
  m.reply('🧹 Starting memory cleanup process...');
  
  // Clean caches that might exist
  let cleanedItems = [];
  
  // 1. Clean message cache
  if (global.messageCache) {
    const beforeSize = global.messageCache.size || 0;
    global.messageCache.clear();
    cleanedItems.push(`Message cache: ${beforeSize} items`);
  }
  
  // 2. Clean deduplicated messages
  if (global.processedMessages) {
    const beforeSize = global.processedMessages.size || 0;
    global.processedMessages.clear();
    cleanedItems.push(`Deduplication cache: ${beforeSize} items`);
  }
  
  // 3. Clean ciphertext cache
  if (global.processedCiphertext) {
    const beforeSize = global.processedCiphertext.size || 0;
    global.processedCiphertext.clear();
    cleanedItems.push(`Ciphertext cache: ${beforeSize} items`);
  }
  
  // 4. Clean session files (older ones)
  try {
    const fs = require('fs');
    const path = require('path');
    
    // Get all session directories
    const sessionDirs = ['./sessions', './sessions-backup'];
    let totalRemoved = 0;
    let totalSize = 0;
    
    for (const dir of sessionDirs) {
      if (!fs.existsSync(dir)) continue;
      
      const files = fs.readdirSync(dir)
        .filter(f => f.endsWith('.json') || f.endsWith('.data'))
        .map(filename => {
          const filePath = path.join(dir, filename);
          const stats = fs.statSync(filePath);
          return {
            path: filePath,
            size: stats.size,
            mtime: stats.mtime.getTime()
          };
        })
        .sort((a, b) => b.mtime - a.mtime); // Sort newest first
      
      // Keep only the 3 newest files
      if (files.length > 3) {
        const toRemove = files.slice(3);
        for (const file of toRemove) {
          try {
            fs.unlinkSync(file.path);
            totalRemoved++;
            totalSize += file.size;
          } catch (err) {
            console.error(`[MEMORY-CLEANUP] Error removing file ${file.path}:`, err.message);
          }
        }
      }
    }
    
    if (totalRemoved > 0) {
      cleanedItems.push(`Session files: ${totalRemoved} files (${formatSize(totalSize)})`);
    }
  } catch (err) {
    console.error('[MEMORY-CLEANUP] Error cleaning session files:', err.message);
  }
  
  // 5. Run garbage collection if available
  if (global.gc) {
    global.gc();
    cleanedItems.push('Executed garbage collection');
  }
  
  // 6. Use connection optimizer if available
  if (conn.connectionOptimizer) {
    conn.connectionOptimizer.cleanCache?.();
    cleanedItems.push('Optimized connection cache');
  }
  
  // 7. Free up memory from message queue if exists
  if (conn._levels?.map) {
    const beforeSize = conn._levels.size || 0;
    conn._levels.clear();
    cleanedItems.push(`Message priority queue: ${beforeSize} items`);
  }
  
  // Wait a moment for GC to potentially run
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Get memory info after
  const afterMemory = process.memoryUsage();
  const afterHeap = afterMemory.heapUsed;
  const savedMemory = beforeHeap - afterHeap;
  
  const heapPercentageBefore = Math.round((beforeHeap / beforeMemory.heapTotal) * 100);
  const heapPercentageAfter = Math.round((afterHeap / afterMemory.heapTotal) * 100);
  
  let reply = `*🧹 Memory Cleanup Complete*\n\n`;
  reply += `*Items Cleaned:*\n- ${cleanedItems.join('\n- ')}\n\n`;
  reply += `*Memory Before:* ${formatSize(beforeHeap)} (${heapPercentageBefore}%)\n`;
  reply += `*Memory After:* ${formatSize(afterHeap)} (${heapPercentageAfter}%)\n`;
  reply += `*Memory Saved:* ${formatSize(Math.max(0, savedMemory))}\n\n`;
  
  if (savedMemory > 0) {
    reply += `✅ Cleanup successful! Memory usage reduced by ${formatSize(savedMemory)}.`;
  } else {
    reply += `ℹ️ Cleanup completed, but memory usage didn't decrease immediately.\nSome effects may take time to show.`;
  }
  
  m.reply(reply);
};

handler.help = ['memorycleanup'];
handler.tags = ['owner'];
handler.command = /^(memorycleanup|memclean|clearmem|cleanmem)$/i;
handler.owner = true;

module.exports = handler;