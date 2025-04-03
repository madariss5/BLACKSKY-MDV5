const { getMessage } = require('../lib/languages');

let handler = async (m, { conn, args, command }) => {
    // Get user's preferred language
    const user = global.db.data.users[m.sender];
    const chat = global.db.data.chats[m.chat];
    const lang = user?.language || chat?.language || global.language;
 {
    conn.reply(m.chat, `Waalaikumsalam`,m)
        }
handler.help = ['Karinn']
handler.tags = ['main']
handler.customPrefix = /^(assalamualaikum)$/i 
handler.command = new RegExp
handler.limit = false
handler.group = false


}

module.exports = handler