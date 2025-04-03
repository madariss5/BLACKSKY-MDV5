const { getMessage } = require('../lib/languages');

let handler = async (m, { conn }) => {
    // Get user's preferred language
    const user = global.db.data.users[m.sender];
    const chat = global.db.data.chats[m.chat];
    const lang = user?.language || chat?.language || global.language;
 {
    conn.tebakemoji = conn.tebakemoji ? conn.tebakemoji : {}
    let id = m.chat
    if (!(id in conn.tebakemoji)) throw false
    let json = conn.tebakemoji[id][1]
    conn.reply(m.chat, '```' + (json.unicodeName).replace(/[AIUEOaiueo]/ig, '_') + '```', m)
}
handler.command = /^hemo$/i

handler.limit = true

}

module.exports = handler

//danaputra133