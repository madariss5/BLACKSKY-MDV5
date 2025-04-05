const { getMessage } = require('../lib/languages');

/**
 * Auto-Remove Foreign Country Codes
 * This plugin autodeadcally removes users with specific country codes from groups
 */

let handler = m => m

handler.before = async function (m, { conn }) {
    // Only process group messages
    if (!m.isGroup) return
    
    // Ensure settings exist
    if (!global.db.data.settings) global.db.data.settings = {}
    if (typeof global.db.data.settings.autoBanCodes !== 'object') {
        global.db.data.settings.autoBanCodes = {
            '212': true, // Morocco
            '91': true,  // India
            '263': true, // Zimbabwe
            '265': true, // Malawi
            '92': true,  // Pakistan
            // Add more country codes as needed
        }
    }
    
    // Extract the country code from sender
    const numberString = m.sender.split('@')[0]
    const countryCode = Object.keys(global.db.data.settings.autoBanCodes).find(code => 
        numberString.startsWith(code)
    )
    
    // Get group settings and check for exemption
    if (!global.db.data.chats[m.chat]) global.db.data.chats[m.chat] = {}
    const chatSettings = global.db.data.chats[m.chat]
    
    // Skip if this group has disabled auto-removal
    if (chatSettings.disableAutoRemove) return
    
    // If this sender has a country code that should be banned and removed
    if (countryCode && global.db.data.settings.autoBanCodes[countryCode]) {
        try {
            // Initialize user if doesn't exist
            if (typeof global.db.data.users[m.sender] !== 'object') {
                global.db.data.users[m.sender] = {}
            }
            
            // Set the user as banned
            global.db.data.users[m.sender].banned = true
            
            // Check if bot is admin in this group
            const groupMetadata = await conn.groupMetadata(m.chat)
            const botAdmin = groupMetadata.participants.find(participant => 
                participant.id === conn.user.jid && ['admin', 'superadmin'].includes(participant.admin))
            
            // Only attempt to remove if bot is admin
            if (botAdmin) {
                // Reply and remove
                await conn.reply(m.chat, 'User removed: country code restriction', m)
                await conn.groupParticipantsUpdate(m.chat, [m.sender], "remove")
                
                // Log for debugging
                console.log(`[AUTO-REMOVE] Removed user with country code ${countryCode}: ${m.sender} from ${m.chat}`)
            }
        } catch (error) {
            console.error('[AUTO-REMOVE] Error:', error)
        }
    }
}

module.exports = handler