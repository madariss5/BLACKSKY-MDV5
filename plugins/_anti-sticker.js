const { getMessage } = require('../lib/languages.js');
async function before(m, { isAdmin, isBotAdmin }) {
    if (m.isBaileys && m.fromMe) return;
    let chat = global.db.data.chats[m.chat];
    let isSticker = m.mtype;
    if (chat.antiSticker && isSticker === "stickerMessage" && m.isGroup) {
        if (!isAdmin || isBotAdmin) {
            await this.sendMessage(m.chat, { delete: m.key });
            m.reply('⚠️ *sticker Terdeteksi!* ⚠️\nfitur antisticker di bot this active! .disable antisticker untuk medeadkan');
        }
    }
    return;
}

module.exports = { before };
