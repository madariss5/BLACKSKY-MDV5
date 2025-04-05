const { getMessage } = require('../lib/languages');

let handler = async (m, { conn }) => {
    // Get user's preferred language
    const user = global.db.data.users[m.sender];
    const chat = global.db.data.chats[m.chat];
    const lang = user?.language || chat?.language || global.language;
 {
    conn.tebakkpop = conn.tebakkpop ? conn.tebakkpop : {}
    let id = m.chat
    if (!(id in conn.tebakkpop)) throw false
    let json = conn.tebakkpop[id][1]
    m.reply('```' + json.jawaban.replace(/[bcdfghjklmnpqrstvwxyz]/gi, '_') + '```\n*BALAS SOALNYA, BUKAN PESAN INI!*')
}
handler.command = /^kpp$/i

handler.limit = true

}

module.exports = handler