const { getMessage } = require('../lib/languages.js');
/**
 * Blocklist Command
 * Displays a list of contacts that the bot has blocked
 */

const handler = async (m, { conn }) => {
    try {
        // Fetch the block list
        const block = await conn.fetchBlocklist();
        
        // Format the message with better error handling
        let message = '┌─⊷ *BLOCKED CONTACTS* ⊶─┐\n\n';
        
        // Handle undefined or empty block list
        if (!block || block.length === 0) {
            message += '• No contacts are currently blocked\n';
        } else {
            message += `• Total: *${block.length}* blocked contact${block.length !== 1 ? 's' : ''}\n\n`;
            
            // List each blocked contact
            message += block.map((v, i) => `${i + 1}. @${v.replace(/@.+/, '')}`).join('\n');
        }
        
        message += '\n\n└────────────────┘';
        
        // Send the message with mentions
        conn.reply(m.chat, message, m, { 
            mentions: block || [] 
        });
    } catch (e) {
        console.error('Error fetching block list:', e);
        conn.reply(m.chat, 'An error occurred while fetching the block list.', m);
    }
};

handler.help = ['blocklist'];
handler.tags = ['info'];
handler.command = /^listbloc?k|bloc?klist|Listbloc?k|blocks$/i
handler.owner = false;

module.exports = handler;
