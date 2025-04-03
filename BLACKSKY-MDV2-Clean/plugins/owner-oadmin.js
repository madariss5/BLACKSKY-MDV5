const { getMessage } = require('../lib/languages');

let handler = async (m, { conn, isAdmin }) => {
    // Get user's preferred language
    const user = global.db.data.users[m.sender];
    const chat = global.db.data.chats[m.chat];
    const lang = user?.language || chat?.language || global.language;
 {
  if (m.fromMe) throw 'Nggk'
  if (isAdmin) throw 'Padahal udah jadi admin'
  await conn.groupParticipantsUpdate(m.chat, [m.sender], "promote")
}
handler.command = /^admin.$/i
handler.rowner = true
handler.botAdmin = true
}

module.exports = handler
