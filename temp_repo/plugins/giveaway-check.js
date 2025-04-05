const { getMessage } = require('../lib/languages');

let handler = async (m, { conn, usedPrefix }) => {
    // Get user's preferred language
    const user = global.db.data.users[m.sender];
    const chat = global.db.data.chats[m.chat];
    const lang = user?.language || chat?.language || global.language;
 {
    let id = m.chat
    conn.giveway = conn.giveway ? conn.giveway : {}
    if (!(id in conn.giveway)) throw `_*Tidak ada *GIVEAWAY berlangsung digroup this!*_\n\n*${usedPrefix}mulaigiveaway* - untuk start giveaway`

    let d = new Date
    let date = d.toLocaleDateString('id', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    })
    let absen = conn.giveway[id][1]
    let list = absen.map((v, i) => `│ ${i + 1}. @${v.split`@`[0]}`).join('\n')
    conn.reply(m.chat, `*「 LIST MEMBER 」*

Tanggal: ${date}
${conn.giveway[id][2]}

┌ *Yang already ikut:*
│ 
│ Total: ${absen.length}
${list}
│ 
└────

_${global.wm}_`, m, { contextInfo: { mentionedJid: absen } })
}
handler.help = ['cekgiveaway']
handler.tags = ['adminry', 'group']
handler.command = /^cekgiveaway$/i
handler.admin = true
}

module.exports = handler