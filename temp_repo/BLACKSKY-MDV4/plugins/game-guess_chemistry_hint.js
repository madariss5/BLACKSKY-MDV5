const { getMessage } = require('../lib/languages');

let handler = async (m, { conn }) => {
    // Get user's preferred language
    const user = global.db.data.users[m.sender];
    const chat = global.db.data.chats[m.chat];
    const lang = user?.language || chat?.language || global.language;
 {
    conn.kimia = conn.kimia ? conn.kimia : {}
    let id = m.chat
    if (!(id in conn.kimia)) throw false
    let json = conn.kimia[id][1]
    let ans = json.lambang
    // kalau this error clue nya ak mau ada tyou (_) nya ganti string dalam function di bawah this jadi huruf small
    let clue = ans.replace(/[BCDFGHJKLMNPQRSTVWXYZ]/g, '_')
    m.reply('```' + clue + '```')
}
handler.command = /^kmi/i
handler.limit = true
}

module.exports = handler

//gh: dana_putra13