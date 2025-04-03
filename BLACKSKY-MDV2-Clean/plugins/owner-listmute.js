const { getMessage } = require('../lib/languages');

let handler = async (m, { conn, args }) => {
    // Get user's preferred language
    const user = global.db.data.users[m.sender];
    const chat = global.db.data.chats[m.chat];
    const lang = user?.language || chat?.language || global.language;
 {
    let chats = global.db.data.chats;
    let mutedChats = Object.entries(chats).filter(([_, chat]) => chat.isBanned);
  
    if (mutedChats.length === 0) {
      return m.reply(getMessage('success_generic', lang, { message: 'Tidak ada group which currently di-mute.' }));
    }
    if (args[0]) {
      let index = parseInt(args[0]) - 1;
      if (isNaN(index) || index < 0 || index >= mutedChats.length) {
        return m.reply(getMessage('error_generic', lang, { error: 'Nomor which you masukkan not valid.' }));
      }
  
      let [chatId] = mutedChats[index];
      chats[chatId].isBanned = false;
      m.reply(`✅ Success meng-unmute group dengan ID: ${chatId}\n\nPlease check List Mute Ternew Dengan Data Ternew`);
    } else {
      let message = '*🔒 List group which Di-Mute:*\n\n';
  
      for (let i = 0; i < mutedChats.length; i++) {
        let [chatId] = mutedChats[i];
        try {
          let metadata = await conn.groupMetadata(chatId);
          let groupName = metadata.subject;
          message += `*${i + 1}. ${groupName}*\n`;
          message += `- *ID group:* ${chatId}\n\n`;
        } catch (e) {
          message += `*${i + 1}. [Name group not ditemukan]*\n`;
          message += `- *ID group:* ${chatId}\n\n`;
        }
      }
  
      message += `Type *listmute [nomor]* untuk meng-unmute group tercertainly.`;
      m.reply(message);
    }
  };
  
  handler.help = ['listmute'];
  handler.tags = ['owner'];
  handler.command = ['listmute'];
  handler.owner = true;
  
  }

module.exports = handler;
  