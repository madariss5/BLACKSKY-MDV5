const { getMessage } = require('../lib/languages');

let handler = async (m, { conn }) => {
    // Get user's preferred language
    const user = global.db.data.users[m.sender];
    const chat = global.db.data.chats[m.chat];
    const lang = user?.language || chat?.language || global.language;
 {
    conn.tebakkode = conn.tebakkode ? conn.tebakkode : {}
    let id = m.chat
    if (!(id in conn.tebakkode)) throw false
    let json = conn.tebakkode[id][1]
    let ans = json.jawaban
    // kalau this error clue nya ak mau ada tyou (_) nya ganti string dalam function di bawah this jadi huruf small
    let clue = ans.replace(/[bcdfghjklmnpqrstvwxyz123456789]/g, '_')
    m.reply('```' + clue + '```')
}
handler.command = /^kdo/i
handler.limit = true
}

module.exports = handler

//gh: dana_putra13