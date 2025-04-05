const { getMessage } = require('../lib/languages');

let handler = async (m, { conn, text, isROwner, isOwner }) => {
  // Get user's preferred language
  const user = global.db.data.users[m.sender];
  const chat = global.db.data.chats[m.chat];
  const lang = user?.language || chat?.language || global.language;
  
  if (text) {
    if (isROwner) global.conn.bye = text
    else if (isOwner) conn.bye = text
    global.db.data.chats[m.chat].sBye = text
    m.reply(getMessage('setbye_success', lang)
      .replace('%user_var%', '@user'))
  } else {
    throw getMessage('setbye_no_text', lang)
  }
}

handler.help = ['setbye <teks>']
handler.tags = ['owner', 'group']

handler.command = /^setbye$/i
handler.group = true
handler.botAdmin = true

module.exports = handler
