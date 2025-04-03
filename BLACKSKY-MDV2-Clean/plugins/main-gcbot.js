const { getMessage } = require('../lib/languages');

let handler = async (m, { conn }) => {
    // Get user's preferred language
    const user = global.db.data.users[m.sender];
    const chat = global.db.data.chats[m.chat];
    const lang = user?.language || chat?.language || global.language;
 {
conn.reply(m.chat, gc, m) 
}
handler.help = ['gcbot']
handler.tags = ['main']
handler.command = /^(gcbot)$/i

}

module.exports = handler
