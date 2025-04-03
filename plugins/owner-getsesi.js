const { getMessage } = require('../lib/languages');

let fs = require('fs');
let handler = async (m, { conn, text }) => {
    // Get user's preferred language
    const user = global.db.data.users[m.sender];
    const chat = global.db.data.chats[m.chat];
    const lang = user?.language || chat?.language || global.language;
 {
    m.reply('Wait Sebentar, Proses Getting File creds.json')
    let sesi = await fs.readFileSync('./sessions/creds.json')
    return await conn.sendMessage(m.chat, { document: sesi, mimetype: 'application/json', fileName: 'creds.json' }, { quoted: m })
}
handler.help = ['getsesi']
handler.tags = ['internet']
handler.command = /^(getsesi)$/i

handler.rowner = true

}

module.exports = handler