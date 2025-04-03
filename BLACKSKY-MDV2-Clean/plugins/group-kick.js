const { getMessage } = require('../lib/languages');

let handler = async (m, { text, conn, isOwner, isAdmin, args }) => {
  if (m.isBaileys) return;
  
  // Get user's preferred language
  const user = global.db.data.users[m.sender];
  const chat = global.db.data.chats[m.chat];
  const lang = user?.language || chat?.language || global.language;
  
  if (!(isAdmin || isOwner)) {
    conn.reply(m.chat, getMessage('group_user_not_admin', lang), m);
    throw false
  }
  
  let ownerGroup = m.chat.split`-`[0] + "@s.whatsapp.net";
  
  if (m.quoted) {
    if (m.quoted.sender === ownerGroup || m.quoted.sender === conn.user.jid) return;
    let usr = m.quoted.sender;
    try {
      await conn.groupParticipantsUpdate(m.chat, [usr], "remove");
      conn.reply(m.chat, getMessage('kick_success', lang, { user: '@' + usr.split('@')[0] }), m, {
        mentions: [usr]
      });
    } catch (e) {
      conn.reply(m.chat, getMessage('kick_failed', lang), m);
    }
    return;
  }
  
  if (!m.mentionedJid[0]) throw getMessage('kick_mention_required', lang);
  
  let users = m.mentionedJid.filter(
    (u) => !(u == ownerGroup || u.includes(conn.user.jid))
  );
  
  for (let user of users)
    if (user.endsWith("@s.whatsapp.net")) {
      try {
        await conn.groupParticipantsUpdate(m.chat, [user], "remove");
        conn.reply(m.chat, getMessage('kick_success', lang, { user: '@' + user.split('@')[0] }), m, {
          mentions: [user]
        });
      } catch (e) {
        conn.reply(m.chat, getMessage('kick_failed', lang), m);
      }
    }
};

handler.help = ['kick @user']
handler.tags = ['group']
handler.command = /^(kic?k|remove|tendang|\-)$/i

handler.group = true
handler.botAdmin = true

module.exports = handler
