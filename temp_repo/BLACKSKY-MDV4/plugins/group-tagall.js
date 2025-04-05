const { getMessage } = require('../lib/languages');

let handler = async(m, { conn, text, participants }) => {
  // Get user's preferred language
  const user = global.db.data.users[m.sender];
  const chat = global.db.data.chats[m.chat];
  const lang = user?.language || chat?.language || global.language;
  
  let messageTitle = getMessage('tagall_title', lang);
  let messageEmpty = getMessage('tagall_empty_message', lang);
  let divider = getMessage('tagall_divider', lang, { 
    count: participants.length 
  });
  
  let responseText = `⋙ ${messageTitle} ⋘\n\n*${text ? text : messageEmpty}*\n\n`;
  
  for (let mem of participants) {
    responseText += ` @${mem.id.split('@')[0]}\n`;
  }
  
  responseText += divider;
  conn.sendMessage(m.chat, { text: responseText, mentions: participants.map(a => a.id) }, );
}
handler.help = ['tagall <message>']
handler.tags = ['group']
handler.command = /^(tagall)$/i

handler.group = true
handler.admin = true

module.exports = handler
