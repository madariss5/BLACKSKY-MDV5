/**
 * Banned List Command
 * Shows all banned users, banned chats, and blacklisted users
 */

const handler = async (m, { conn, isOwner, args }) => {
    try {
        // Initialize database objects if they don't exist
        if (!global.db.data.chats) global.db.data.chats = {}
        if (!global.db.data.users) global.db.data.users = {}
        if (!global.db.data.globalBlacklist) global.db.data.globalBlacklist = []
        
        // Get banned chats (groups)
        let chats = Object.entries(global.db.data.chats)
            .filter(chat => chat[1] && typeof chat[1] === 'object' && chat[1].isBanned)
        
        // Get banned users
        let users = Object.entries(global.db.data.users)
            .filter(user => user[1] && typeof user[1] === 'object' && user[1].banned)
        
        // Get global blacklisted users
        let blacklist = global.db.data.globalBlacklist || []
        
        // Get autobanned country codes
        const autoBanCodes = global.db.data.settings && global.db.data.settings.autoBanCodes
            ? Object.entries(global.db.data.settings.autoBanCodes)
                .filter(([_, enabled]) => enabled)
                .map(([code]) => code)
            : []
        
        // Check if a specific category was requested
        let showChats = true
        let showUsers = true
        let showBlacklist = true
        let showAutoBan = true
        
        if (args[0]) {
            const category = args[0].toLowerCase()
            showChats = category === 'chats' || category === 'groups'
            showUsers = category === 'users'
            showBlacklist = category === 'blacklist'
            showAutoBan = category === 'autoban'
            
            // If none match, show all
            if (!showChats && !showUsers && !showBlacklist && !showAutoBan) {
                showChats = showUsers = showBlacklist = showAutoBan = true
            }
        }
        
        // Create the caption sections
        let caption = ''
        
        // Banned Chats section
        if (showChats) {
            caption += `┌─⊷ *BANNED CHATS* ⊶─┐\n`
            caption += `│ Total: ${chats.length} Chat${chats.length !== 1 ? 's' : ''}\n`
            
            if (chats.length) {
                caption += `│\n`
                chats.forEach(([jid], i) => {
                    const chatName = conn.getName(jid) || 'Unknown'
                    caption += `│ ${i + 1}. ${chatName}\n`
                    caption += `│    ${isOwner ? '@' + jid.split('@')[0] : jid}\n`
                })
            }
            
            caption += `└────────────────┘\n\n`
        }
        
        // Banned Users section
        if (showUsers) {
            caption += `┌─⊷ *BANNED USERS* ⊶─┐\n`
            caption += `│ Total: ${users.length} User${users.length !== 1 ? 's' : ''}\n`
            
            if (users.length) {
                caption += `│\n`
                users.forEach(([jid], i) => {
                    const userName = conn.getName(jid) || 'Unknown'
                    caption += `│ ${i + 1}. ${userName}\n`
                    caption += `│    ${isOwner ? '@' + jid.split('@')[0] : jid}\n`
                })
            }
            
            caption += `└────────────────┘\n\n`
        }
        
        // Global Blacklist section
        if (showBlacklist) {
            caption += `┌─⊷ *GLOBAL BLACKLIST* ⊶─┐\n`
            caption += `│ Total: ${blacklist.length} User${blacklist.length !== 1 ? 's' : ''}\n`
            
            if (blacklist.length) {
                caption += `│\n`
                blacklist.forEach((jid, i) => {
                    const userName = conn.getName(jid) || 'Unknown'
                    caption += `│ ${i + 1}. ${userName}\n`
                    caption += `│    ${isOwner ? '@' + jid.split('@')[0] : jid}\n`
                })
            }
            
            caption += `└────────────────┘\n\n`
        }
        
        // Auto-Banned Country Codes section
        if (showAutoBan && autoBanCodes.length) {
            caption += `┌─⊷ *AUTO-BANNED COUNTRY CODES* ⊶─┐\n`
            caption += `│ Total: ${autoBanCodes.length} Code${autoBanCodes.length !== 1 ? 's' : ''}\n│\n`
            
            // Country code mapping for display
            const countryNames = {
                '212': 'Morocco',
                '91': 'India',
                '263': 'Zimbabwe',
                '265': 'Malawi',
                '92': 'Pakistan',
                // Add more as needed
            }
            
            autoBanCodes.forEach((code, i) => {
                const countryName = countryNames[code] || 'Unknown'
                caption += `│ ${i + 1}. +${code} (${countryName})\n`
            })
            
            caption += `└────────────────┘\n\n`
        }
        
        if (!caption) {
            caption = '✓ No banned users, chats, or blacklisted numbers found.'
        }
        
        const mentionedJids = conn.parseMention(caption)
        
        // Send the message with mentions
        conn.reply(m.chat, caption.trim(), m, { 
            contextInfo: { 
                mentionedJid: mentionedJids 
            } 
        })
    } catch (e) {
        console.error(getMessage('error', lang), e)
        conn.reply(m.chat, 'An error occurred while retrieving the banned list.', m)
    }
}

handler.help = ['bannedlist', 'bannedlist [category]']
handler.tags = ['info']
handler.command = /^(listban(ned)?|ban(ned)?list|Listban(ned)?)$/i
handler.owner = false

module.exports = handler
