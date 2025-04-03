const { getMessage } = require('../lib/languages');

 /* 
Script By Reelly XD
  � YT: 
  � IG: 
Buy Script? 
  � WA: +62 857-0436-85323
  � TELE: t.me/rely_xd
  � Github: github.com/ReellyXD
*/


const { MessageType } = require('@adiwajshing/baileys');

let handler = async (m, { conn, text }) => {
    // Get user's preferred language
    const user = global.db.data.users[m.sender];
    const chat = global.db.data.chats[m.chat];
    const lang = user?.language || chat?.language || global.language;
 {
  if (!text) {
    throw 'Masukkan amount limit which want ditambahkan pada User. Example: .addlimit @user 10';
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
    throw 'Tag User which want ditambahkan limitnya. Example: .addlimit @user 10';
  }

  let pointsToAdd = parseInt(text.split(' ')[1]);
  if (isNaN(pointsToAdd)) {
    throw 'Jumlah limit which dimasukkan must berupa angka. Example: .addlimit @user 10';
  }

  let users = global.db.data.users;
  if (!users[mentionedJid]) {
    users[mentionedJid] = {
      limit: 0,
      exp: 0,
      lastclaim: 0
    };
  }

  users[mentionedJid].limit += pointsToAdd;

  conn.reply(m.chat, `Success menambahkan ${pointsToAdd} limit untuk @${mentionedJid.split('@')[0]}.`, m, {
    mentions: [mentionedJid]
  });
};

handler.help = ['addlimit @user <amount limit>'];
handler.tags = ['xp'];
handler.command = /^addlimit$/i;
handler.owner = true;

}

module.exports = handler;
