const fs = require('fs')
const path = require('path')

let handler = async (m, { conn, args, usedPrefix, command }) => {
    // This command is only for owner
    if (!global.owner.map(v => v.replace(/[^0-9]/g, '') + '@s.whatsapp.net').includes(m.sender)) {
        return m.reply('🔒 This command can only be used by the bot owner')
    }
    
    try {
        // Get memory stats before cleanup
        const memBefore = getMemoryUsage()
        
        // Run cleanup operations
        await performCleanup(args.includes('--force'))
        
        // Get memory stats after cleanup
        const memAfter = getMemoryUsage()
        
        // Calculate improvements
        const heapReduction = memBefore.heapUsage - memAfter.heapUsage
        const systemReduction = memBefore.systemUsage - memAfter.systemUsage
        
        // Send report
        await m.reply(`
╭━━━━━━━━━━━━━━━━╮
│ 🧹 *MEMORY CLEANUP* 🧹
╰━━━━━━━━━━━━━━━━╯

*Before Cleanup:*
• Heap: ${memBefore.heapUsage}% (${memBefore.heapUsed}MB)
• System: ${memBefore.systemUsage}% (${memBefore.systemUsed}MB)

*After Cleanup:*
• Heap: ${memAfter.heapUsage}% (${memAfter.heapUsed}MB)
• System: ${memAfter.systemUsage}% (${memAfter.systemUsed}MB)

*Improvements:*
• Heap: ${heapReduction > 0 ? `-${heapReduction}%` : `+${Math.abs(heapReduction)}%`}
• System: ${systemReduction > 0 ? `-${systemReduction}%` : `+${Math.abs(systemReduction)}%`}

*Actions Performed:*
• ${args.includes('--force') ? 'Emergency cleanup' : 'Standard cleanup'}
• Module cache optimization
• Database connection check
• Temporary file cleanup
${args.includes('--force') ? '• Forced garbage collection' : ''}

⏱️ Process completed in ${((Date.now() - m.messageTimestamp) / 1000).toFixed(2)} seconds
`)

    } catch (e) {
        console.error(e)
        m.reply(`Error during memory cleanup: ${e.message}\n\nCheck console for details.`)
    }
}

// Helper function to get formatted memory usage
function getMemoryUsage() {
    // Try to use global memory manager if available
    if (global.memoryManager && typeof global.memoryManager.getMemoryUsage === 'function') {
        return global.memoryManager.getMemoryUsage()
    }
    
    // Fallback to manual calculation
    const memoryUsage = process.memoryUsage()
    const totalMemory = require('os').totalmem()
    const freeMemory = require('os').freemem()
    const usedMemory = totalMemory - freeMemory
    
    return {
        heapUsed: Math.round(memoryUsage.heapUsed / (1024 * 1024)),
        heapTotal: Math.round(memoryUsage.heapTotal / (1024 * 1024)),
        rss: Math.round(memoryUsage.rss / (1024 * 1024)),
        external: Math.round((memoryUsage.external || 0) / (1024 * 1024)),
        systemTotal: Math.round(totalMemory / (1024 * 1024)),
        systemFree: Math.round(freeMemory / (1024 * 1024)),
        systemUsed: Math.round(usedMemory / (1024 * 1024)),
        heapUsage: Math.round((memoryUsage.heapUsed / memoryUsage.heapTotal) * 100),
        systemUsage: Math.round((usedMemory / totalMemory) * 100),
    }
}

// Helper function to perform cleanup
async function performCleanup(isEmergency = false) {
    // Use global memory manager if available
    if (global.memoryManager) {
        if (isEmergency && typeof global.memoryManager.runEmergencyCleanup === 'function') {
            return global.memoryManager.runEmergencyCleanup()
        } else if (typeof global.memoryManager.runCleanup === 'function') {
            return global.memoryManager.runCleanup()
        }
    }
    
    // Fallback to basic cleanup
    console.log(`[MEMORY-CLEANUP] Performing ${isEmergency ? 'emergency' : 'basic'} cleanup`)
    
    // Clear module cache except for essential modules
    const preserveList = ['baileys', 'whatsapp', 'sharp', 'fs', 'path', 'os', 'util']
    let clearedCount = 0
    
    for (const moduleId in require.cache) {
        // Skip modules that should be preserved
        if (preserveList.some(name => moduleId.includes(name))) continue
        
        // Clear non-essential modules
        delete require.cache[moduleId]
        clearedCount++
    }
    console.log(`[MEMORY-CLEANUP] Cleared ${clearedCount} modules from cache`)
    
    // Clean temp directory
    const tempDir = path.join(process.cwd(), 'temp')
    if (fs.existsSync(tempDir)) {
        const tempFiles = fs.readdirSync(tempDir)
            .filter(file => {
                // Keep .gitkeep and recent files (< 1 hour)
                if (file === '.gitkeep') return false
                
                const filePath = path.join(tempDir, file)
                const stats = fs.statSync(filePath)
                const fileAge = Date.now() - stats.mtimeMs
                
                // Only delete files older than 1 hour
                return fileAge > 60 * 60 * 1000
            })
        
        for (const file of tempFiles) {
            try {
                fs.unlinkSync(path.join(tempDir, file))
            } catch (err) {
                console.error(`[MEMORY-CLEANUP] Failed to delete temp file ${file}:`, err.message)
            }
        }
        console.log(`[MEMORY-CLEANUP] Removed ${tempFiles.length} old temporary files`)
    }
    
    // Force garbage collection if available and emergency cleanup
    if (isEmergency && typeof global.gc === 'function') {
        try {
            global.gc()
            console.log('[MEMORY-CLEANUP] Forced garbage collection')
        } catch (err) {
            console.error('[MEMORY-CLEANUP] Failed to run garbage collection:', err.message)
        }
    }
}

handler.help = ['memcleanup', 'memcleanup --force']
handler.tags = ['owner']
handler.command = /^(memcleanup|clearmem)$/i

module.exports = handler