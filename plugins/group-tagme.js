const { getMessage } = require('../lib/languages');

let handler = async (m, { conn, text }) => {
    // Get user's preferred language
    const user = global.db.data.users[m.sender];
    const chat = global.db.data.chats[m.chat];
    const lang = user?.language || chat?.language || global.language;
 {

let orang = (await conn.groupMetadata(m.chat)).participants.map(u => u.jid)
let tag = `@${m.sender.replace(/@.+/, '')}`
let mentionedJid = [m.sender]

  conn.reply(m.chat, tag, m, { contextInfo: { mentionedJid }})
}
handler.help = ['tagme']
handler.tags = ['group']
handler.command = /^tagme$/i

handler.group = true

}

module.exports = handler
