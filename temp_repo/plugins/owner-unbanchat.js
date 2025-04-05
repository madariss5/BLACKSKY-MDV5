/**
 * Unban User/Chat Command
 * Allows the bot owner to unban users and chats
 * Enhanced with strict permission checks for security
 */

const handler = async (m, { conn, isOwner, isROwner, text, args, usedPrefix, command }) => {
    // CRITICAL SECURITY FIX: Ensure only real owners can use this command
    if (!isROwner) {
        console.log(`[SECURITY ALERT] Non-owner attempted to use unban command: ${m.sender}`)
        return conn.reply(m.chat, '❌ *SECURITY WARNING*\nOnly the real owner can use this command.', m)
    }
    // Command format guide
    if (!text) {
        return conn.reply(m.chat, `*Usage:*
${usedPrefix + command} @user - Unban a user
${usedPrefix + command} 628xxxxxxxx - Unban a number
${usedPrefix + command} group - Unban the current group
${usedPrefix + command} global @user - Remove from global blacklist

*Example:* ${usedPrefix + command} @user or ${usedPrefix + command} 628xxxxxxxx`, m)
    }
  
    // Initialize database objects if they don't exist
    if (!global.db.data.users) global.db.data.users = {}
    if (!global.db.data.chats) global.db.data.chats = {}
    if (!global.db.data.globalBlacklist) global.db.data.globalBlacklist = []
  
    // Determine if this is a global blacklist unban
    const isGlobalUnban = args[0] && args[0].toLowerCase() === 'global'
    
    // If using global blacklist option, remove it from text
    if (isGlobalUnban) {
        text = text.replace(/global\s*/i, '').trim()
        if (!text) {
            return conn.reply(m.chat, `Please specify a user to remove from the global blacklist.`, m)
        }
    }
  
    // Get target to unban
    let who
    if (m.isGroup) {
        // In group, we can unban a member, quoted message sender, or the group itself
        if (text === 'group' || text === 'chat' || text === 'gc') {
            who = m.chat // Unban the group
        } else if (isOwner) {
            who = m.mentionedJid[0] || (m.quoted ? m.quoted.sender : null) || (text ? text.replace(/[^0-9]/g, '') + '@s.whatsapp.net' : null)
            if (!who) return conn.reply(m.chat, `Please mention a user, reply to their message, or provide a phone number.`, m)
        } else {
            who = m.chat // Non-owners in group can only unban the group
        }
    } else {
        // In private chat, only owner can unban
        if (!isOwner) {
            global.dfail('owner', m, conn)
            return
        }
        who = text ? text.replace(/[^0-9]/g, '') + '@s.whatsapp.net' : m.chat
    }

    try {
        // Check if it's a group chat
        if (who.endsWith('g.us')) {
            // Unban a group chat
            if (typeof global.db.data.chats[who] !== 'object') 
                global.db.data.chats[who] = {}
            
            global.db.data.chats[who].isBanned = false
            return conn.reply(m.chat, `✅ Successfully unbanned group *${await conn.getName(who) || 'this group'}*!

The bot will now respond to commands in this group.`, m)
        } else {
            // Unban a user
            if (typeof global.db.data.users[who] !== 'object')
                global.db.data.users[who] = {}
            
            // Set unban in user data
            global.db.data.users[who].banned = false
            
            // If it's a global unban, also remove from blacklist
            if (isGlobalUnban) {
                const index = global.db.data.globalBlacklist.indexOf(who)
                if (index !== -1) {
                    // Remove from global blacklist
                    global.db.data.globalBlacklist.splice(index, 1)
                    
                    return conn.reply(m.chat, `✅ *Global Unban Complete*

• User: @${who.split('@')[0]}
• status: Removed from global blacklist

User can now join groups without being autodeadcally removed.`, m, {
                        mentions: [who]
                    })
                } else {
                    return conn.reply(m.chat, `User @${who.split('@')[0]} is not on the global blacklist.`, m, {
                        mentions: [who]
                    })
                }
            } else {
                // Regular unban
                return conn.reply(m.chat, `✅ Successfully unbanned @${who.split('@')[0]}!

The bot will now respond to commands from this user.`, m, {
                    mentions: [who]
                })
            }
        }
    } catch (e) {
        console.error(getMessage('error', lang), e)
        throw `Error while unbanning: ${e.message}`
    }
}

handler.help = ['unban', 'unban global']
handler.tags = ['owner']
handler.command = /^unban(chat|user)?$/i

handler.owner = true

module.exports = handler
