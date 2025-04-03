const { getMessage } = require('../lib/languages');

let handler = async (m, { conn, text, isROwner, isOwner }) => {
  // Get user's preferred language
  const user = global.db.data.users[m.sender];
  const chat = global.db.data.chats[m.chat];
  const lang = user?.language || chat?.language || global.language;
  
  if (text) {
    if (isROwner) global.conn.welcome = text
    else if (isOwner) conn.welcome = text
    global.db.data.chats[m.chat].sWelcome = text
    m.reply(getMessage('setwelcome_success', lang)
      .replace('%user_var%', '@user')
      .replace('%subject_var%', '@subject')
      .replace('%desc_var%', '@desc'))
  } else {
    throw getMessage('setwelcome_no_text', lang)
  }
}

handler.help = ['setwelcome <teks>']
handler.tags = ['owner', 'group']

handler.command = /^setwelcome$/i
handler.botAdmin = true
handler.group = true

module.exports = handler