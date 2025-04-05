const { getMessage } = require('../lib/languages');

let handler = async (m, { conn, usedPrefix }) => {
    // Get user's preferred language
    const user = global.db.data.users[m.sender];
    const chat = global.db.data.chats[m.chat];
    const lang = user?.language || chat?.language || global.language;
 {

    let user = global.db.data.users[m.sender]
    if (user.job !== 'police') throw 'Anda must menjadi police untuk melakukan tindwill this.'
    
    let penjaraList = Object.entries(global.db.data.users).filter(user => user[1].jail)

    conn.reply(m.chat, `
乂 • *P E N J A R A*\n
- Total : _${prisonList.length} User_
 ${prisonList ? '\n' + prisonList.map(([jid], i) => `
 ${i + 1}. @${jid.split`@`[0]}
`.trim()).join('\n') : ''}
`, m)
}
handler.help = ['jail list']
handler.tags = ['rpg']
handler.command = /^penjaralist|jail list$/i
handler.rpg = true
}

module.exports = handler