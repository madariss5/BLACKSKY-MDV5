const { getMessage } = require('../lib/languages');

let handler = async (m, { conn, usedPrefix, text }) => {
    // Get user's preferred language
    const user = global.db.data.users[m.sender];
    const chat = global.db.data.chats[m.chat];
    const lang = user?.language || chat?.language || global.language;
    
    conn.absen = conn.absen ? conn.absen : {}
    let id = m.chat
    if (id in conn.absen) {
        throw `_*${getMessage('attendance_already_taken', lang)}*_\n\n*${usedPrefix}hapusabsen* - ${getMessage('attendance_delete', lang)}`
    }
    
    conn.absen[id] = [
        m.reply(`${getMessage('attendance_started', lang)}\n\n*${usedPrefix}absen* - ${getMessage('attendance', lang)}\n*${usedPrefix}cekabsen* - ${getMessage('attendance_check', lang)}\n*${usedPrefix}hapusabsen* - ${getMessage('attendance_delete', lang)}`),
        [],
        text
    ]
}
handler.help = ['mulaiabsen [teks]']
handler.tags = ['absen']
handler.command = /^(start|mulai)absen$/i
handler.group = true
handler.admin = true
module.exports = handler;