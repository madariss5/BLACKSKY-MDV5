const { getMessage } = require('../lib/languages');


const { MessageType } = require('@adiwajshing/baileys');

let handler = async (m, { conn, text }) => {
    // Get user's preferred language
    const user = global.db.data.users[m.sender];
    const chat = global.db.data.chats[m.chat];
    const lang = user?.language || chat?.language || global.language;
 {
  if (!text) {
    throw 'Masukkan amount money which want ditambahkan pada User. Example: .addmoney @user 10';
  }
    
 	conn.chatRead(m.chat)
	conn.sendMessage(m.chat, {
		react: {
			text: '🕒',
			key: m.key,
		}
	})

  let mentionedJid = m.mentionedJid[0];
  if (!mentionedJid) {
    throw 'Tag User which want ditambahkan moneynya Example: .addmoney @user 10';
  }

  let pointsToAdd = parseInt(text.split(' ')[1]);
  if (isNaN(pointsToAdd)) {
    throw 'Jumlah money which dimasukkan must berupa angka. Example: .addmoney @user 10';
  }

  let users = global.db.data.users;
  if (!users[mentionedJid]) {
    users[mentionedJid] = {
      money: 0,
      exp: 0,
      lastclaim: 0
    };
  }

  users[mentionedJid].money += pointsToAdd;

  conn.reply(m.chat, `Success menambahkan ${pointsToAdd} money untuk @${mentionedJid.split('@')[0]}.`, m, {
    mentions: [mentionedJid]
  });
};

handler.help = ['addmoney @user <amount money>'];
handler.tags = ['xp'];
handler.command = /^addmoney$/i;
handler.owner = true;

}

module.exports = handler;
