const { getMessage } = require('../lib/languages');

// Test file to verify translations

let handler = async (m, { conn, text }) => {
  if (!text) {
    return conn.reply(m.chat, `*${getMessage('invalid_format', m.lang)}*`, m); 
  }
  
  let user = m.mentionedJid[0]
  
  if (!user) {
    return conn.reply(m.chat, `*${getMessage('target_not_found', m.lang)}, ${getMessage('may_have_left_or_not_member', m.lang)}*`, m);
  }
  
  if (user === m.sender) {
    return conn.reply(m.chat, `*${getMessage('cannot_date_yourself', m.lang)}*`, m);
  }
  
  conn.reply(m.chat, 'Test completed successfully.', m);
}

handler.help = ['testlang']
handler.tags = ['test']
handler.command = /^testlang$/i
handler.group = true

module.exports = handler