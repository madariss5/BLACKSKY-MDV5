const { getMessage } = require('../lib/languages');

let handler = async (m, { conn, usedPrefix }) => {
    // Get user's preferred language
    const user = global.db.data.users[m.sender];
    const chat = global.db.data.chats[m.chat];
    const lang = user?.language || chat?.language || global.language;
 {
    let id = m.chat
    conn.absen = conn.absen ? conn.absen : {}
    if (!(id in conn.absen)) throw `_*Tidak ada absen berlangsung digroup this!*_\n\n*${usedPrefix}mulaiabsen* - untuk start absen`
    delete conn.absen[id]
    m.reply(`Done!`)
}
handler.help = ['hapusabsen']
handler.tags = ['absen']
handler.command = /^(delete|delete)absen$/i
handler.group = true
handler.admin = true
}

module.exports = handler;