const { getMessage } = require('../lib/languages');

async function before(m, { isAdmin, isBotAdmin }) {
    if (m.isBaileys && m.fromMe) return;
    let chat = global.db.data.chats[m.chat];
    
    // Get user's preferred language
    const user = global.db.data.users[m.sender];
    const chatData = global.db.data.chats[m.chat];
    const lang = user?.language || chatData?.language || 'en'; // Default to English
    
    let isSticker = m.mtype;
    if (chat.antiSticker && isSticker === "stickerMessage" && m.isGroup) {
        if (!isAdmin || isBotAdmin) {
            await this.sendMessage(m.chat, { delete: m.key });
            m.reply(getMessage('antisticker_warning', lang));
        }
    }
    return;
}

module.exports = { before };
