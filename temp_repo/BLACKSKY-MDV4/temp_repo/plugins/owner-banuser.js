/**
 * Ban User/Chat Command
 * Allows the bot owner to ban users and chats
 * Enhanced with strict permission checks for security
 */

const handler = async (m, { conn, isOwner, isROwner, text, args, usedPrefix, command }) => {
    // CRITICAL SECURITY FIX: Ensure only real owners can use this command
    if (!isROwner) {
        console.log(`[SECURITY ALERT] Non-owner attempted to use ban command: ${m.sender}`)
        return conn.reply(m.chat, '❌ *SECURITY WARNING*\nOnly the real owner can use this command.', m)
    }
    // Command format guide
    if (!text) {
        return conn.reply(m.chat, `*Usage:*
${usedPrefix + command} @user - Ban a user
${usedPrefix + command} 628xxxxxxxx - Ban a number
${usedPrefix + command} group - Ban the current group

*Example:* ${usedPrefix + command} @user or ${usedPrefix + command} 628xxxxxxxx`, m)
    }
  
    // Initialize database objects if they don't exist
    if (!global.db.data.users) global.db.data.users = {}
    if (!global.db.data.chats) global.db.data.chats = {}
    if (!global.db.data.globalBlacklist) global.db.data.globalBlacklist = []
  
    // Determine if this is a global blacklist ban (stricter than regular ban)
    const isGlobalBan = args[0] && args[0].toLowerCase() === 'global'
    
    // If using global blacklist option, remove it from text
    if (isGlobalBan) {
        text = text.replace(/global\s*/i, '').trim()
        if (!text) {
            return conn.reply(m.chat, `Please specify a user to add to the global blacklist.`, m)
        }
    }
  
    // Get target to ban
    let who
    if (m.isGroup) {
        // In group, we can ban a member, quoted message sender, or the group itself
        if (text === 'group' || text === 'chat' || text === 'gc') {
            who = m.chat // Ban the group
        } else if (isOwner) {
            who = m.mentionedJid[0] || (m.quoted ? m.quoted.sender : null) || (text ? text.replace(/[^0-9]/g, '') + '@s.whatsapp.net' : null)
            if (!who) return conn.reply(m.chat, `Please mention a user, reply to their message, or provide a phone number.`, m)
        } else {
            who = m.chat // Non-owners in group can only ban the group
        }
    } else {
        // In private chat, only owner can ban
        if (!isOwner) {
            global.dfail('owner', m, conn)
            return
        }
        who = text ? text.replace(/[^0-9]/g, '') + '@s.whatsapp.net' : m.chat
    }

    try {
        // Check if it's a group chat
        if (who.endsWith('g.us')) {
            // Ban a group chat
            if (typeof global.db.data.chats[who] !== 'object') 
                global.db.data.chats[who] = {}
            
            global.db.data.chats[who].isBanned = true
            return conn.reply(m.chat, `✅ Successfully banned group *${await conn.getName(who) || 'this group'}*!

The bot will no longer respond to commands in this group.`, m)
        } else {
            // Ban a user
            if (typeof global.db.data.users[who] !== 'object')
                global.db.data.users[who] = {}
            
            // Set ban in user data
            global.db.data.users[who].banned = true
            
            // If it's a global ban, also add to blacklist
            if (isGlobalBan) {
                if (!global.db.data.globalBlacklist.includes(who)) {
                    global.db.data.globalBlacklist.push(who)
                    
                    // Attempt to kick from all groups where bot is admin
                    try {
                        // Fetch all groups where the bot is a member
                        const allGroups = await conn.groupFetchAllParticipating()
                        const groupIds = Object.keys(allGroups)
                        
                        // Number of groups user was removed from
                        let removedCount = 0
                        
                        // Kick user from all groups where they and the bot are members
                        await conn.reply(m.chat, `🔄 User added to global blacklist. Removing from all groups...`, m)
                        
                        for (let groupId of groupIds) {
                            const groupInfo = allGroups[groupId]
                            const isMember = groupInfo.participants.some(member => member.id === who)
                            const botIsAdmin = groupInfo.participants.some(member => 
                                member.id === conn.user.jid && ['admin', 'superadmin'].includes(member.admin))
                            
                            if (isMember && botIsAdmin) {
                                try {
                                    await conn.groupParticipantsUpdate(groupId, [who], 'remove')
                                    removedCount++
                                    
                                    // Notify the group
                                    await conn.sendMessage(groupId, {
                                        text: `❌ User @${who.split('@')[0]} has been globally blacklisted and removed from this group.`,
                                        mentions: [who]
                                    })
                                    
                                    // Small delay to avoid rate limiting
                                    await new Promise(resolve => setTimeout(resolve, 1000))
                                } catch (error) {
                                    console.error(`Failed to remove user from group ${groupId}:`, error)
                                }
                            }
                        }
                        
                        return conn.reply(m.chat, `✅ *Global Ban Complete*

• User: @${who.split('@')[0]}
• status: Added to global blacklist
• Action: Removed from ${removedCount} group${removedCount !== 1 ? 's' : ''}

User will be autodeadcally removed from any groups where the bot is admin.`, m, {
                            mentions: [who]
                        })
                    } catch (e) {
                        console.error(getMessage('error', lang), e)
                        return conn.reply(m.chat, `✅ Added @${who.split('@')[0]} to global blacklist, but there was an error removing from groups: ${e.message}`, m, {
                            mentions: [who]
                        })
                    }
                } else {
                    return conn.reply(m.chat, `User @${who.split('@')[0]} is already on the global blacklist.`, m, {
                        mentions: [who]
                    })
                }
            } else {
                // Regular ban
                return conn.reply(m.chat, `✅ Successfully banned @${who.split('@')[0]}!

The bot will ignore commands from this user.`, m, {
                    mentions: [who]
                })
            }
        }
    } catch (e) {
        console.error(getMessage('error', lang), e)
        throw `Error while banning: ${e.message}`
    }
}

handler.help = ['ban', 'ban global']
handler.tags = ['owner']
handler.command = /^ban(chat|user)?$/i

handler.owner = true

module.exports = handler
