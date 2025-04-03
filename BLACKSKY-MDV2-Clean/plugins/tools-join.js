const { getMessage } = require('../lib/languages');

// Regular expression to extract WhatsApp group invite codes
let linkRegex = /chat.whatsapp.com\/([0-9A-Za-z]{20,24})/i

let handler = async (m, { conn, text, args, isOwner }) => {
    // Get user's preferred language
    const user = global.db.data.users[m.sender];
    const chat = global.db.data.chats[m.chat];
    const lang = user?.language || chat?.language || global.language;
    
    // If no link was provided
    if (!text) {
        return m.reply(getMessage('join_link_required', lang, { command: global.prefix + 'join' }));
    }
    
    try {
        // Extract the invite code from the provided link
        let [_, code] = text.match(linkRegex) || [];
        
        // If no valid invite code was found
        if (!code) {
            return m.reply(getMessage('join_invalid_link', lang, { example: 'https://chat.whatsapp.com/AbCdEfGhIjKl' }));
        }
        
        // Log the join attempt
        console.log(`[JOIN] Attempting to join group with code: ${code} (requested by ${m.sender})`);
        
        // Send a processing message
        await m.reply(getMessage('join_processing', lang));
        
        // Try to join the group
        let res = await conn.groupAcceptInvite(code);
        
        // Success - send a confirmation message
        m.reply(getMessage('join_success', lang, { group: res.gid || 'Unknown' }));
        
        // Log the successful join
        console.log(`[JOIN SUCCESS] Joined group: ${res.gid} (requested by ${m.sender})`);
    } catch (e) {
        // Error handling
        console.error(`[JOIN ERROR] ${e.message}`);
        
        // Different error messages based on the error type
        if (e.message.includes('not-authorized')) {
            return m.reply(getMessage('join_not_authorized', lang));
        } else if (e.message.includes('gone')) {
            return m.reply(getMessage('join_link_expired', lang));
        } else if (e.message.includes('temporary-ban')) {
            return m.reply(getMessage('join_temporary_ban', lang));
        } else {
            return m.reply(getMessage('join_failed', lang, { error: e.message }));
        }
    }
}

handler.help = ['join <chat.whatsapp.com link>']
handler.tags = ['tools']
handler.desc = 'Join a WhatsApp group using the provided invite link'

// Command trigger
handler.command = /^join$/i

// Available to all users (not just premium)
handler.premium = false

module.exports = handler
