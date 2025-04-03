const { getMessage } = require('../lib/languages');


let handler = async (m, { conn, participants, usedPrefix }) => {
    // Get user's preferred language
    const user = global.db.data.users[m.sender];
    const chat = global.db.data.chats[m.chat];
    const lang = user?.language || chat?.language || global.language;
 {
    let id = m.chat
    conn.giveway = conn.giveway ? conn.giveway : {}
    if (!(id in conn.giveway)) throw `_*Tidak ada GIVEAWAY berlangsung digroup this!*_\n\n*${usedPrefix}mulaigiveaway* - untuk start giveaway`
    delete conn.giveway[id]
    conn.sendMessage(m.chat, { text: '*GIVEAWAY* has Completed', mentions: participants.map(a => a.id) })
}
handler.help = ['hapusgiveaway']
handler.tags = ['adminry', 'group']
handler.command = /^(delete|delete)giveaway$/i
handler.group = true
handler.admin = true
}

module.exports = handler
