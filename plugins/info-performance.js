/**
 * BLACKSKY-MD Premium - Bot Performance Statistics
 * 
 * This plugin provides detailed performance statistics for the bot,
 * including response times, cache hit rates, and memory usage.
 */

let handler = async (m, { conn }) => {
  // Show processing message
  await m.reply('📊 Sammle Performance-Statistiken...');
  
  try {
    // Get memory usage statistics
    const memoryUsage = process.memoryUsage();
    const heapUsedMB = Math.round(memoryUsage.heapUsed / 1024 / 1024);
    const heapTotalMB = Math.round(memoryUsage.heapTotal / 1024 / 1024);
    const rssMB = Math.round(memoryUsage.rss / 1024 / 1024);
    const memoryPercent = Math.round((memoryUsage.heapUsed / memoryUsage.heapTotal) * 100);
    
    // Get process uptime
    const uptimeSeconds = process.uptime();
    const uptimeDays = Math.floor(uptimeSeconds / 86400);
    const uptimeHours = Math.floor((uptimeSeconds % 86400) / 3600);
    const uptimeMinutes = Math.floor((uptimeSeconds % 3600) / 60);
    const uptimeString = `${uptimeDays}d ${uptimeHours}h ${uptimeMinutes}m`;
    
    // Get cache statistics if available
    let cacheStats = {
      available: false,
      size: 0,
      hits: 0,
      misses: 0,
      hitRatio: 0,
      groupHits: 0
    };
    
    if (global.responseCache && typeof global.responseCache.getCacheStats === 'function') {
      cacheStats.available = true;
      const stats = global.responseCache.getCacheStats();
      cacheStats = {
        ...cacheStats,
        size: stats.size || 0,
        hits: stats.hits || 0,
        misses: stats.misses || 0,
        hitRatio: stats.hitRatio || 0,
        groupHits: stats.groupHits || 0
      };
    }
    
    // Get group optimization statistics if available
    let groupStats = {
      available: false,
      totalGroupMessages: 0,
      throttledMessages: 0,
      priorityMessages: 0,
      averageProcessingTime: 0
    };
    
    if (global.groupOptimization && typeof global.groupOptimization.getGroupOptimizationStats === 'function') {
      groupStats.available = true;
      const stats = global.groupOptimization.getGroupOptimizationStats();
      groupStats = {
        ...groupStats,
        totalGroupMessages: stats.totalGroupMessages || 0,
        throttledMessages: stats.throttledMessages || 0,
        priorityMessages: stats.priorityMessages || 0,
        averageProcessingTime: stats.averageProcessingTime ? Math.round(stats.averageProcessingTime) : 0,
        metadataCacheSize: stats.metadataCacheSize || 0,
        metadataHits: stats.metadataHits || 0,
        metadataMisses: stats.metadataMisses || 0
      };
    }
    
    // Build detailed performance report
    let performanceReport = `
╔════════ 📊 PERFORMANCE STATS 📊 ════════╗
║
║ 🖥️ *SYSTEM RESOURCES*
║ • Memory Usage: ${heapUsedMB}MB / ${heapTotalMB}MB (${memoryPercent}%)
║ • RSS: ${rssMB}MB
║ • Uptime: ${uptimeString}
║
`;
    
    // Add cache statistics if available
    if (cacheStats.available) {
      const hitRatioPercent = Math.round(cacheStats.hitRatio * 100);
      performanceReport += `
║ 🚀 *RESPONSE CACHE SYSTEM*
║ • Cache Size: ${cacheStats.size} entries
║ • Cache Hits: ${cacheStats.hits} (${hitRatioPercent}% hit rate)
║ • Group Cache Hits: ${cacheStats.groupHits}
║ • Cache Misses: ${cacheStats.misses}
║
`;
    } else {
      performanceReport += `
║ 🚫 *RESPONSE CACHE SYSTEM*
║ • Not available
║
`;
    }
    
    // Add group optimization statistics if available
    if (groupStats.available) {
      performanceReport += `
║ 👥 *GROUP OPTIMIZATION SYSTEM*
║ • Group Messages: ${groupStats.totalGroupMessages}
║ • Throttled Messages: ${groupStats.throttledMessages}
║ • Priority Messages: ${groupStats.priorityMessages}
║ • Avg. Processing Time: ${groupStats.averageProcessingTime}ms
║ • Group Metadata Cache: ${groupStats.metadataCacheSize} groups
║ • Metadata Cache Hits: ${groupStats.metadataHits}
║ • Metadata Cache Misses: ${groupStats.metadataMisses}
║
`;
    } else {
      performanceReport += `
║ 🚫 *GROUP OPTIMIZATION SYSTEM*
║ • Not available
║
`;
    }
    
    // Add connection information
    performanceReport += `
║ 🔌 *CONNECTION STATUS*
║ • Connected: ${global.conn && global.conn.user ? 'Yes' : 'No'}
`;

    if (global.conn && global.conn.user) {
      performanceReport += `║ • Bot Number: ${global.conn.user.jid.split('@')[0]}
`;
    }
    
    // Check if optimizations are active
    let optimizationsActive = false;
    try {
      // Check if optimization modules are loaded
      optimizationsActive = (
        (global.responseCache && typeof global.responseCache.getCacheStats === 'function') ||
        (global.groupOptimization && typeof global.groupOptimization.getGroupOptimizationStats === 'function')
      );
    } catch (err) {
      console.error('Error checking optimization status:', err);
    }
    
    performanceReport += `
║ ⚡ *OPTIMIZATION STATUS*
║ • Optimizations: ${optimizationsActive ? '✅ Active' : '❌ Inactive'}
`;
    
    performanceReport += `
╚═══════════════════════════════════════╝

⚡ *BLACKSKY-MD PREMIUM* ⚡
Optimized for fast response in groups`;
    
    // Send the performance report
    await m.reply(performanceReport);
  } catch (error) {
    console.error('Error in performance command:', error);
    await m.reply(`❌ Error generating performance statistics: ${error.message}`);
  }
};

handler.help = ['performance', 'stats'];
handler.tags = ['info'];
handler.command = /^(performance|stats)$/i;

module.exports = handler;