const { getMessage } = require('../lib/languages');

let handler = async (m, { text }) => {
  // Get user's preferred language
  const user = global.db.data.users[m.sender];
  const chat = global.db.data.chats[m.chat];
  const lang = user?.language || chat?.language || global.language;
  
  // Update user's AFK status
  user.afk = + new Date;
  user.afkReason = text;
  
  // Send notification using translation system
  m.reply(getMessage('afk_reason', lang, {
    user: m.sender.split`@`[0],
    reason: text || 'No reason provided'
  }));
}

handler.help = ['afk [reason]']
handler.tags = ['main']
handler.command = /^afk$/i

module.exports = handler