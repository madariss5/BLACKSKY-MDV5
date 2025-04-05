const { getMessage } = require('../lib/languages');

let handler = m => m
handler.before = m => {
  // Get user's preferred language
  const user = global.db.data.users[m.sender];
  const chat = global.db.data.chats[m.chat];
  const lang = user?.language || chat?.language || global.language;
  
  if (user.afk > -1) {
    m.reply(getMessage('afk_return', lang, {
      user: m.sender.split`@`[0],
      time: clockString(new Date - user.afk)
    }));
    
    user.afk = -1
    user.afkReason = ''
  }
  
  let jids = [...new Set([...(m.mentionedJid || []), ...(m.quoted ? [m.quoted.sender] : [])])]
  for (let jid of jids) {
    let mentioned = global.db.data.users[jid]
    if (!mentioned) continue
    let afkTime = mentioned.afk
    if (!afkTime || afkTime < 0) continue
    let reason = mentioned.afkReason || ''
    
    m.reply(getMessage('afk_reason', lang, {
      user: jid.split`@`[0],
      reason: reason || 'No reason provided'
    }));
  }
  return true
}

module.exports = handler

function clockString(ms) {
  let h = isNaN(ms) ? '--' : Math.floor(ms / 3600000)
  let m = isNaN(ms) ? '--' : Math.floor(ms / 60000) % 60
  let s = isNaN(ms) ? '--' : Math.floor(ms / 1000) % 60
  return [h, m, s].map(v => v.toString().padStart(2, 0) ).join(':')
}
