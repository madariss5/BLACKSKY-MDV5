const { getMessage } = require('../lib/languages');

let handler = async (m, { conn }) => {
    // Get user's preferred language
    const user = global.db.data.users[m.sender];
    const chat = global.db.data.chats[m.chat];
    const lang = user?.language || chat?.language || global.language;
 {
    conn.susun = conn.susun ? conn.susun : {}
    let id = m.chat
    if (!(id in conn.susun)) throw false
    let json = conn.susun[id][1]
    let ans = json.jawaban
    // kalau this error clue nya ak mau ada tyou (_) nya ganti string dalam function di bawah this jadi huruf small
    let clue = ans.replace(/[AIUEOaiueo]/g, '_')
    m.reply('```' + clue + '```')
}
handler.command = /^susn/i
handler.limit = true
}

module.exports = handler

//gh: dana_putra13