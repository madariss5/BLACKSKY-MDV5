const { getMessage } = require('../lib/languages');

let handler = async (m, { text, conn, isOwner, isAdmin, args, command }) => {
    // Get user's preferred language
    const user = global.db.data.users[m.sender];
    const chat = global.db.data.chats[m.chat];
    const lang = user?.language || chat?.language || global.language;
    
    if (m.isBaileys) return;
    if (!(isAdmin || isOwner)) {
      global.dfail('admin', m, conn);
      throw false;
  }

  let ownerGroup = m.chat.split`-`[0] + "@s.whatsapp.net";

  if (m.quoted) {
      if (m.quoted.sender === ownerGroup || m.quoted.sender === conn.user.jid) return;
      let usr = m.quoted.sender;
      await conn.groupParticipantsUpdate(m.chat, [usr], "demote");
      
      const successMessage = getMessage('demote_success', lang, { 
        user: usr.split('@')[0] 
      });
      
      m.reply(successMessage, null, { mentions: [usr] });
      return;
  }

  if (!m.mentionedJid[0]) throw getMessage('demote_mention_required', lang);

  let users = m.mentionedJid.filter(
      (u) => !(u == ownerGroup || u.includes(conn.user.jid))
  );

  for (let user of users) {
      if (user.endsWith("@s.whatsapp.net")) {
          await conn.groupParticipantsUpdate(m.chat, [user], "demote");
          
          const successMessage = getMessage('demote_success', lang, { 
            user: user.split('@')[0]
          });
          
          m.reply(successMessage, null, { mentions: [user] });
      }
  }
};

handler.help = ['demote @user'];
handler.tags = ['group', 'owner'];
handler.command = /^(demo?te|\↓)$/i;

handler.group = true;
handler.botAdmin = true;
handler.admin = true;
handler.fail = null;

module.exports = handler;


//fix bagian ketika comamnd berroad mreplay not mau terkirim
//m.reply('Sukses demote @${usr.split('@')[0]}!', null, {{{{