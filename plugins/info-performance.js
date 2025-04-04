/**
 * BLACKSKY-MD Premium - Performance Monitor Plugin
 * 
 * Shows real-time bot performance metrics including:
 * - Response time statistics
 * - Memory usage
 * - Command hit rates
 * - System information
 * - Connection statistics
 */

let handler = async (m, { conn, usedPrefix, command }) => {
  try {
    // Check if running on Heroku or has optimization system
    const isHeroku = !!process.env.DYNO || process.env.HEROKU === 'true';
    const hasOptimizer = !!global.botOptimizer;
    const hasMemoryManager = !!require('../lib/advanced-memory-manager');
    
    // Get performance stats
    let msgStats = global.msgProcessingStats || { 
      messages: 0, 
      avgTime: 0, 
      maxTime: 0 
    };
    
    // Get memory usage
    const memoryUsage = process.memoryUsage();
    const formatMemory = (bytes) => (bytes / 1024 / 1024).toFixed(2) + ' MB';
    
    // Get uptime
    const uptime = process.uptime();
    const formatUptime = (seconds) => {
      const days = Math.floor(seconds / 86400);
      const hours = Math.floor((seconds % 86400) / 3600);
      const minutes = Math.floor((seconds % 3600) / 60);
      const secs = Math.floor(seconds % 60);
      return `${days}d ${hours}h ${minutes}m ${secs}s`;
    };
    
    // Get cache stats if available
    let cacheStats = { hitRate: 0, size: 0, maxSize: 0 };
    if (hasOptimizer && global.botOptimizer.performanceStats) {
      const stats = global.botOptimizer.performanceStats;
      cacheStats = {
        commandsProcessed: stats.commandsProcessed || 0,
        cacheHits: stats.cacheHits || 0,
        cacheMisses: stats.cacheMisses || 0,
        hitRate: stats.cacheHits / (stats.cacheHits + stats.cacheMisses) || 0
      };
    }
    
    // Get memory manager stats if available
    let memoryManagerStats = { peak: 0, collections: 0 };
    if (hasMemoryManager) {
      const memManager = require('../lib/advanced-memory-manager');
      memoryManagerStats = memManager.getStats();
    }
    
    // Format the message with ANSI color codes for terminal and markdown for WhatsApp
    const reply = `
*🚀 BLACKSKY-MD PERFORMANCE MONITOR 🚀*

⏱️ *Response Times*
• Average: ${msgStats.avgTime.toFixed(2)}ms
• Maximum: ${msgStats.maxTime.toFixed(2)}ms
• Messages processed: ${msgStats.messages}

💾 *Memory Usage*
• Heap: ${formatMemory(memoryUsage.heapUsed)} / ${formatMemory(memoryUsage.heapTotal)}
• RSS: ${formatMemory(memoryUsage.rss)}
• Peak memory: ${hasMemoryManager ? formatMemory(memoryManagerStats.peak * 1024 * 1024) : 'N/A'}

⚡ *Cache Performance*
• Commands processed: ${cacheStats.commandsProcessed || 'N/A'}
• Cache hit rate: ${((cacheStats.hitRate || 0) * 100).toFixed(2)}%
• Cache hits/misses: ${cacheStats.cacheHits || 0}/${cacheStats.cacheMisses || 0}

🖥️ *System Information*
• Platform: ${process.platform} (${process.arch})
• Node.js: ${process.version}
• Uptime: ${formatUptime(uptime)}
• Heroku: ${isHeroku ? 'Yes' : 'No'}
• GC enabled: ${typeof global.gc === 'function' ? 'Yes' : 'No'}
• GC collections: ${memoryManagerStats.collections || 'N/A'}

💎 *Optimization Status*
• Performance mode: ${process.env.PERFORMANCE_MODE === 'true' ? 'Enabled' : 'Disabled'}
• Parallel processing: ${hasOptimizer && global.botOptimizer.config.enableParallelProcessing ? 'Enabled' : 'Disabled'}
• Response caching: ${hasOptimizer && global.botOptimizer.config.enableCache ? 'Enabled' : 'Disabled'}
• Memory management: ${hasMemoryManager ? 'Active' : 'Inactive'}
• Heroku optimization: ${isHeroku && global.herokuKeeper ? 'Active' : 'Inactive'}

_To enable 24/7 Heroku operation, the bot uses advanced connection management and database persistence._
`.trim();

    // Send the performance report
    await conn.reply(m.chat, reply, m);
    
    // Send optimization tips if on Heroku
    if (isHeroku) {
      await conn.reply(m.chat, `
*📈 HEROKU 24/7 OPTIMIZATION TIPS*

• Keep the dyno awake with an auto-pinger
• Use the PostgreSQL database for session persistence
• Ensure proper session backups before dyno cycling
• Set HEROKU=true in your environment variables
• Consider upgrading to Eco or Basic dynos for better performance
`.trim(), m);
    }
    
  } catch (e) {
    console.error('Error in performance command:', e);
    await conn.reply(m.chat, '⚠️ An error occurred while retrieving performance data', m);
  }
};

handler.help = ['performance', 'stats', 'benchmark'];
handler.tags = ['info', 'tools', 'owner'];
handler.command = /^(perf(ormance)?|stats|benchmark)$/i;

module.exports = handler;