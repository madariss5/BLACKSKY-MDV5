const { getMessage } = require('../lib/languages.js');

async function before(m, { isAdmin, isBotAdmin }) {
    if (m.isBaileys || !(m.mtype === "documentMessage") || !global.db.data.chats[m.chat]?.antifile) return;
    
    // Get user's preferred language
    const user = global.db.data.users[m.sender];
    const chat = global.db.data.chats[m.chat];
    const lang = user?.language || chat?.language || 'en'; // Default to English
    
    if (isAdmin || !isBotAdmin) {
        // If sender is admin or bot is not admin, don't do anything
    } else {
        user.banned = false;
        await m.reply(getMessage('antifile_warning', lang));

        const deleteMessage = {
            delete: {
                remoteJid: m.chat,
                fromMe: false,
                id: m.key.id,
                participant: m.key.participant
            }
        };
        await this.sendMessage(m.chat, deleteMessage);
    }
}

module.exports = { before };