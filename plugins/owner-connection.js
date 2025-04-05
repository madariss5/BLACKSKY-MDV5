const os = require('os')

let handler = async (m, { conn, args, usedPrefix, command }) => {
    // This command is only for owner
    if (!global.owner.map(v => v.replace(/[^0-9]/g, '') + '@s.whatsapp.net').includes(m.sender)) {
        return m.reply('🔒 This command can only be used by the bot owner')
    }
    
    try {
        const startTime = new Date()
        const uptime = process.uptime()
        const formattedUptime = formatUptime(uptime)
        const memoryUsage = getMemoryUsage()
        const { heapUsed, heapTotal, systemUsed, systemTotal, heapUsage, systemUsage } = memoryUsage
        
        const connectionStatus = await getConnectionStatus(conn)
        
        // Check if the enhanced connection keeper is available
        const connectionKeeper = getConnectionKeeperStatus()
        
        // Check if we're on Heroku
        const isHeroku = process.env.HEROKU_APP_NAME || process.env.DYNO ? true : false
        
        // Send status report
        await m.reply(`
╭━━━━━━━━━━━━━━━━╮
│ 🔌 *CONNECTION STATUS* 🔌
╰━━━━━━━━━━━━━━━━╯

*System Information:*
• Platform: ${os.platform()} ${os.release()}
• Uptime: ${formattedUptime}
• Environment: ${isHeroku ? 'Heroku' : 'Standard'}
• Node.js: ${process.version}

*Memory Status:*
• Heap: ${heapUsage}% (${heapUsed}/${heapTotal} MB)
• System: ${systemUsage}% (${systemUsed}/${systemTotal} MB)
• Memory Optimization: ${process.env.ENABLE_MEMORY_OPTIMIZATION === 'true' ? '✅ Enabled' : '❌ Disabled'}

*Connection Status:*
• State: ${connectionStatus.state}
• WA Version: ${connectionStatus.version || 'N/A'}
• Connection Keeper: ${connectionKeeper.available ? '✅ Active' : '❌ Inactive'}
• Reconnect Attempts: ${connectionKeeper.reconnectAttempts || 0}
• Last Updated: ${connectionStatus.lastUpdated}

*Database Status:*
• PostgreSQL: ${isDatabaseConnected() ? '✅ Connected' : '❌ Disconnected'}
• Session Backup: ${isSessionBackupWorking() ? '✅ Working' : '❌ Not Working'}

*Command Usage:*
• ${usedPrefix}${command} fix - Attempt to fix connection issues
• ${usedPrefix}${command} reconnect - Force reconnection
${connectionKeeper.available ? `• ${usedPrefix}${command} keeper - Toggle connection keeper` : ''}
`)

        // Additional actions based on arguments
        if (args[0] === 'fix') {
            await m.reply('🔄 Attempting to fix connection issues...')
            await fixConnection(conn)
            await m.reply('✅ Connection fix applied. Monitor for improvements.')
        } else if (args[0] === 'reconnect') {
            await m.reply('🔄 Forcing reconnection...')
            await forceReconnect(conn)
            await m.reply('✅ Reconnection initiated. This may take a moment.')
        } else if (args[0] === 'keeper' && connectionKeeper.available) {
            await m.reply('🔄 Toggling connection keeper state...')
            await toggleConnectionKeeper(conn)
            await m.reply('✅ Connection keeper toggled. Check status again.')
        }

    } catch (e) {
        console.error(e)
        m.reply(`Error checking connection status: ${e.message}\n\nCheck console for details.`)
    }
}

// Helper function to format uptime nicely
function formatUptime(uptime) {
    const days = Math.floor(uptime / (24 * 60 * 60))
    const hours = Math.floor((uptime % (24 * 60 * 60)) / (60 * 60))
    const minutes = Math.floor((uptime % (60 * 60)) / 60)
    const seconds = Math.floor(uptime % 60)
    
    return `${days}d ${hours}h ${minutes}m ${seconds}s`
}

// Helper function to get memory usage metrics
function getMemoryUsage() {
    // Try to use global memory manager if available
    if (global.memoryManager && typeof global.memoryManager.getMemoryUsage === 'function') {
        return global.memoryManager.getMemoryUsage()
    }
    
    // Fallback to manual calculation
    const memoryUsage = process.memoryUsage()
    const totalMemory = os.totalmem()
    const freeMemory = os.freemem()
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

// Helper function to get connection status
async function getConnectionStatus(conn) {
    const state = conn.user ? 'Connected' : 'Disconnected'
    const lastUpdated = new Date().toLocaleString()
    let version = 'Unknown'
    
    try {
        // Try to get the WhatsApp version
        if (conn.version) {
            version = `${conn.version[0]}.${conn.version[1]}.${conn.version[2]}`
        }
    } catch (err) {
        console.error('Error getting WhatsApp version:', err.message)
    }
    
    return { state, version, lastUpdated }
}

// Check if connection keeper is available and active
function getConnectionKeeperStatus() {
    let available = false
    let active = false
    let reconnectAttempts = 0
    
    // Check if enhanced connection keeper is available
    if (global.enhancedConnectionKeeper) {
        available = true
        active = true
        
        // Try to get reconnection attempts if available
        if (global.enhancedConnectionKeeper.getState) {
            const state = global.enhancedConnectionKeeper.getState()
            reconnectAttempts = state.reconnectAttempts || 0
            active = state.active !== false
        }
    }
    
    return { available, active, reconnectAttempts }
}

// Check if database is connected
function isDatabaseConnected() {
    return global.db && global.db.data ? true : false
}

// Check if session backup is working
function isSessionBackupWorking() {
    try {
        // Check if the session directory exists and has files
        const fs = require('fs')
        const sessionDir = './sessions'
        const backupDir = './sessions-backup'
        
        if (!fs.existsSync(sessionDir)) return false
        
        // Check if there are any session files
        const files = fs.readdirSync(sessionDir)
        return files.length > 1 // More than just .gitkeep
    } catch (err) {
        console.error('Error checking session backup:', err.message)
        return false
    }
}

// Attempt to fix connection issues
async function fixConnection(conn) {
    try {
        // Try to use the connection keeper's fix function if available
        if (global.enhancedConnectionKeeper && global.enhancedConnectionKeeper.applyConnectionPatch) {
            global.enhancedConnectionKeeper.applyConnectionPatch(conn)
            return true
        }
        
        // Try to find fix functions in various modules
        const potentialFixes = [
            './enhanced-connection-keeper.js',
            './heroku-connection-keeper.js',
            './connection-fix.js',
            './lib/connection-patch.js'
        ]
        
        for (const fixPath of potentialFixes) {
            try {
                const fixer = require(fixPath)
                if (typeof fixer.applyConnectionPatch === 'function') {
                    fixer.applyConnectionPatch(conn)
                    console.log(`Applied connection fix from ${fixPath}`)
                    return true
                } else if (typeof fixer.applyConnectionFixes === 'function') {
                    fixer.applyConnectionFixes(conn)
                    console.log(`Applied connection fixes from ${fixPath}`)
                    return true
                }
            } catch (err) {
                // Continue to next potential fix
            }
        }
        
        // Basic connection fix as fallback
        console.log('No specialized connection fix found, applying basic fix')
        if (conn.ev) {
            conn.ev.on('connection.update', (update) => {
                const { connection, lastDisconnect } = update
                if (connection === 'close') {
                    console.log('Reconnecting due to connection close...')
                    setTimeout(() => {
                        try {
                            conn.connect()
                        } catch (err) {
                            console.error('Error reconnecting:', err.message)
                        }
                    }, 3000)
                }
            })
        }
        
        return true
    } catch (err) {
        console.error('Error applying connection fix:', err.message)
        return false
    }
}

// Force reconnection
async function forceReconnect(conn) {
    try {
        // Try to use the connection keeper's reconnect function if available
        if (global.enhancedConnectionKeeper && global.enhancedConnectionKeeper.forceReconnect) {
            global.enhancedConnectionKeeper.forceReconnect(conn)
            return true
        }
        
        // Manual reconnect fallback
        console.log('No specialized reconnect function found, using basic reconnect')
        if (conn.user) {
            // Only attempt reconnect if we were previously connected
            try {
                conn.ev.emit('connection.update', { 
                    connection: 'close', 
                    lastDisconnect: { error: { output: { statusCode: 500 } } } 
                })
                setTimeout(() => {
                    conn.connect()
                }, 3000)
            } catch (err) {
                console.error('Error during basic reconnect:', err.message)
            }
        } else {
            // If never connected, try direct connect
            conn.connect()
        }
        
        return true
    } catch (err) {
        console.error('Error forcing reconnection:', err.message)
        return false
    }
}

// Toggle connection keeper state
async function toggleConnectionKeeper(conn) {
    if (!global.enhancedConnectionKeeper) return false
    
    try {
        // Check current state and toggle
        const currentState = global.enhancedConnectionKeeper.getState()
        const newState = !currentState.active
        
        if (newState) {
            // Reactivate connection keeper
            if (typeof global.enhancedConnectionKeeper.start === 'function') {
                global.enhancedConnectionKeeper.start(conn)
            } else if (typeof global.enhancedConnectionKeeper.initialize === 'function') {
                global.enhancedConnectionKeeper.initialize(conn)
            }
        } else {
            // Deactivate connection keeper
            if (typeof global.enhancedConnectionKeeper.stop === 'function') {
                global.enhancedConnectionKeeper.stop()
            } else {
                // Set internal state if no stop function
                global.enhancedConnectionKeeper.getState().active = false
            }
        }
        
        return true
    } catch (err) {
        console.error('Error toggling connection keeper:', err.message)
        return false
    }
}

handler.help = ['connection', 'connection fix', 'connection reconnect', 'connection keeper']
handler.tags = ['owner']
handler.command = /^(connection|connstatus|conn)$/i

module.exports = handler