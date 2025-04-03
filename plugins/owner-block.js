/**
 * Block/Unblock Command
 * Allows the bot owner to block or unblock contacts
 * 
 * Credit to original author: FokusDotId (Fokus ID)
 * https://github.com/fokusdotid
 */

const { getMessage } = require('../lib/languages');

const handler = async (m, { text, conn, usedPrefix, command }) => {
    // Get user's preferred language
    const user = global.db.data.users[m.sender];
    const chat = global.db.data.chats[m.chat];
    const lang = user?.language || chat?.language || global.language;
    try {
        // Example message if no user specified
        let helpMessage = getMessage('block_help', lang).replace('%usage%', `${usedPrefix + command} @${m.sender.split("@")[0]}`);
        
        // Parse the user to block/unblock from mentions, quoted messages or text
        let who = m.mentionedJid[0] 
            ? m.mentionedJid[0] 
            : m.quoted 
                ? m.quoted.sender 
                : text 
                    ? text.replace(/[^0-9]/g, '') + '@s.whatsapp.net' 
                    : false;
                    
        // If no target is specified, show the help message
        if (!who) {
            return conn.reply(m.chat, helpMessage, m, { mentions: [m.sender] });
        }
        
        // Array to track users successfully processed
        let processedUsers = [];
        
        // Execute the appropriate command
        switch (command.toLowerCase()) {
            case "block":
            case "blok":
                try {
                    await conn.updateBlockstatus(who, "block");
                    processedUsers.push(who);
                    
                    // Log to console for debugging
                    console.log(`[BLOCK] Successfully blocked ${who}`);
                } catch (error) {
                    console.error(`[BLOCK] Error blocking ${who}:`, error);
                    return conn.reply(
                        m.chat, 
                        getMessage('block_error', lang)
                            .replace('%user%', `@${who.split("@")[0]}`)
                            .replace('%error%', error.message), 
                        m, 
                        { mentions: [who] }
                    );
                }
                break;
                
            case "unblock":
            case "unblok":
                try {
                    await conn.updateBlockstatus(who, "unblock");
                    processedUsers.push(who);
                    
                    // Log to console for debugging
                    console.log(`[UNBLOCK] Successfully unblocked ${who}`);
                } catch (error) {
                    console.error(`[UNBLOCK] Error unblocking ${who}:`, error);
                    return conn.reply(
                        m.chat, 
                        getMessage('unblock_error', lang)
                            .replace('%user%', `@${who.split("@")[0]}`)
                            .replace('%error%', error.message), 
                        m, 
                        { mentions: [who] }
                    );
                }
                break;
        }
        
        // Send Success message if any users were processed
        if (processedUsers.length > 0) {
            const isUnblock = command.toLowerCase().includes('unblock');
            const messageKey = isUnblock ? 'unblock_success' : 'block_success';
            
            conn.reply(
                m.chat, 
                getMessage(messageKey, lang).replace('%user%', `@${processedUsers.map(v => v.split("@")[0]).join(', @')}`), 
                m, 
                { mentions: processedUsers }
            );
        }
    } catch (error) {
        console.error('[BLOCK/UNBLOCK] Unexpected error:', error);
        conn.reply(m.chat, getMessage('error', lang) + ': ' + error.message, m);
    }
};

handler.help = ["block", "unblock"];
handler.tags = ["owner"];
handler.command = /^(block|unblock|blok|unblok)$/i;
handler.owner = true;

module.exports = handler;