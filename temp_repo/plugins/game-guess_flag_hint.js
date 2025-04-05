const { getMessage } = require('../lib/languages');

let handler = async (m, { conn }) => {
    // Get user's preferred language
    const user = global.db.data.users[m.sender];
    const chat = global.db.data.chats[m.chat];
    const lang = user?.language || chat?.language || global.language;
 {
    conn.tebakbendera2 = conn.tebakbendera2 ? conn.tebakbendera2 : {}
    let id = m.chat
    if (!(id in conn.tebakbendera2)) throw false
    let json = conn.tebakbendera2[id][1]
    let ans = json.nama
    // Generate clue by replacing consonants with underscores
    let clue = ans.replace(/[bcdfghjklmnpqrstvwxyz]/g, '_')
    m.reply('```' + clue + '```')
}
handler.command = /^teii/i
handler.limit = true
}

module.exports = handler

//gh: dana_putra13