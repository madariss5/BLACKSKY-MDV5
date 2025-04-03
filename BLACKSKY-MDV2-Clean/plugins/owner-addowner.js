const { getMessage } = require('../lib/languages');

/**
 * Add Owner Command
 * Allows the bot's real owner to add additional owners
 * Enhanced with strict security checks
 */

let handler = async (m, { conn, text, isROwner }) => {
    // Get user's preferred language
    const user = global.db.data.users[m.sender];
    const chat = global.db.data.chats[m.chat];
    const lang = user?.language || chat?.language || global.language;
 {
    // CRITICAL SECURITY FIX: Only the real owner can add other owners
    if (!isROwner) {
        console.log(`[SECURITY ALERT] Non-ROwner attempted to add an owner: ${m.sender}`)
        return conn.reply(m.chat, getMessage('addowner_security', lang), m)
    }
    
    let who
    if (m.isGroup) who = m.mentionedJid[0] ? m.mentionedJid[0] : m.quoted ? m.quoted.sender : text
    else who = m.chat
    
    if (!who) return conn.reply(m.chat, getMessage('addowner_tag', lang), m)
    
    // Validate the user ID is in proper format
    if (typeof who === 'string' && !who.includes('@')) {
        // Format as proper WhatsApp ID
        who = who.replace(/[^0-9]/g, '') + '@s.whatsapp.net'
    }
    
    // Check if already an owner
    if (global.owner.includes(who.split`@`[0])) {
        return conn.reply(m.chat, getMessage('addowner_already', lang).replace('%user%', `@${who.split`@`[0]}`), m, {
            mentions: [who]
        })
    }
    
    // Log this sensitive operation
    console.log(`[SECURITY] ROwner ${m.sender} adding new owner: ${who}`)
    
    // Add the new owner
    global.owner.push(`${who.split`@`[0]}`)
    
    conn.reply(m.chat, getMessage('addowner_success', lang).replace('%user%', `@${who.split`@`[0]}`), m, {
        mentions: [who]
    })
}
handler.help = ['addowner [@user]']
handler.tags = ['owner']
handler.command = /^(add|tambah|\+)owner$/i

handler.owner = true
handler.rowner = true  // Set to true to restrict to real owners only

}

module.exports = handler