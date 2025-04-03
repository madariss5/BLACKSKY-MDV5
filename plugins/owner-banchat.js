const { getMessage } = require('../lib/languages');

let handler = async (m, { conn, args }) => {
    // Get user's preferred language
    const user = global.db.data.users[m.sender];
    const chat = global.db.data.chats[m.chat];
    const lang = user?.language || chat?.language || global.language;
 {
  let chats = global.db.data.chats;

  // Filter group which currently di-mute
  let mutedChats = Object.entries(chats).filter(([_, chat]) => chat.isBanned);

  // If user wants to unmute a chat by providing a number
  if (args[0]) {
    let index = parseInt(args[0]) - 1;
    if (isNaN(index) || index < 0 || index >= mutedChats.length) {
      return m.reply(getMessage('invalid_number', lang));
    }

    let [chatId] = mutedChats[index];
    chats[chatId].isBanned = false;
    m.reply(getMessage('unbanchat_success', lang));
  } else {
    // Display list of muted groups
    if (mutedChats.length === 0) {
      m.reply(getMessage('listbanchat_empty', lang));
    } else {
      let list = mutedChats.map(([id], i) => 
        getMessage('listbanchat_entry', lang, { index: i + 1, id: id })
      ).join('\n');
      
      m.reply(getMessage('listbanchat_title', lang) + '\n\n' + list + '\n\n' + 
              getMessage('listbanchat_usage', lang, { prefix: usedPrefix }));
    }
  }
};

handler.help = ['listmute'];
handler.tags = ['owner'];
handler.command = ['listmute'];
handler.owner = true;

}

module.exports = handler;
