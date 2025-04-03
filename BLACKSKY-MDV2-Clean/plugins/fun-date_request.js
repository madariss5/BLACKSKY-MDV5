const { getMessage } = require('../lib/languages');

let handler = async (m, { conn, text, usedPrefix }) => {
    // Get user's preferred language
    const user = global.db.data.users[m.sender];
    const chat = global.db.data.chats[m.chat];
    const lang = user?.language || chat?.language || global.language;
  if (isNaN(text)) {
    var number = text.split`@`[1];
  } else if (!isNaN(text)) {
    var number = text;
  }

  const format = (num) => {
    const n = String(num),
      p = n.indexOf(".");
    return n.replace(/\d(?=(?:\d{3})+(?:\.|$))/g, (m, i) =>
      p < 0 || i < p ? `${m},` : m
    );
  };

  if (!text && !m.quoted)
    return conn.reply(m.chat, getMessage('tembak_provide_number', lang), m);
  // let exists = await conn.isOnWhatsApp(number)
  // if (exists) return conn.reply(m.chat, `*Nomor target not terList di WhatsApp*`, m)
  if (isNaN(number)) return conn.reply(m.chat, getMessage('tembak_invalid_number', lang), m);
  if (number.length > 15) return conn.reply(m.chat, getMessage('tembak_invalid_format', lang), m);
  try {
    if (text) {
      var targetUser = number + "@s.whatsapp.net";
    } else if (m.quoted.sender) {
      var targetUser = m.quoted.sender;
    } else if (m.mentionedJid) {
      var targetUser = number + "@s.whatsapp.net";
    }
  } catch (e) {
  } finally {
    let groupMetadata = m.isGroup ? await conn.groupMetadata(m.chat) : {};
    let participants = m.isGroup ? groupMetadata.participants : [];
    let users = m.isGroup ? participants.find((u) => u.jid == targetUser) : {};
    
    // Update user reference to use targetUser
    const user = targetUser;
    
    if (!user)
      return conn.reply(
        m.chat,
        getMessage('tembak_target_not_found', lang),
        m
      );
    if (user === m.sender)
      return conn.reply(m.chat, getMessage('tembak_self_dating', lang), m);
    //if (user === conn.user.jid)
    //return conn.reply(m.chat, `Tidak can berpacaran dengan bot`, m);

    if (typeof global.db.data.users[user] == "undefined")
      return m.reply(getMessage('tembak_not_registered', lang));

    if (
      global.db.data.users[m.sender].partner != "" &&
      global.db.data.users[global.db.data.users[m.sender].partner].partner ==
        m.sender &&
      global.db.data.users[m.sender].partner != user
    ) {
      var denda = Math.ceil((global.db.data.users[m.sender].exp / 1000) * 20);
      global.db.data.users[m.sender].exp -= denda;
      const partner = global.db.data.users[m.sender].partner.split("@")[0];
      const target = user.split("@")[0];
      
      conn.reply(
        m.chat,
        getMessage('tembak_already_dating', lang, {
          partner: partner,
          target: target,
          prefix: usedPrefix,
          denda: format(denda)
        }),
        m,
        {
          contextInfo: {
            mentionedJid: [user, global.db.data.users[m.sender].partner],
          },
        }
      );
    } else if (global.db.data.users[user].partner != "") {
      var pacar = global.db.data.users[user].partner;
      if (global.db.data.users[pacar].partner == user) {
        var denda = Math.ceil((global.db.data.users[m.sender].exp / 1000) * 20);
        global.db.data.users[m.sender].exp -= denda;
        if (
          m.sender == pacar &&
          global.db.data.users[m.sender].partner == user
        ) {
          const partner = user.split("@")[0];
          
          return conn.reply(
            m.chat,
            getMessage('tembak_self_already_dating', lang, {
              partner: partner,
              denda: format(denda)
            }),
            m,
            {
              contextInfo: {
                mentionedJid: [user],
              },
            }
          );
        }
        const target = user.split("@")[0];
        const partner = pacar.split("@")[0];
        
        conn.reply(
          m.chat,
          getMessage('tembak_target_dating', lang, {
            target: target,
            partner: partner,
            denda: format(denda)
          }),
          m,
          {
            contextInfo: {
              mentionedJid: [user, pacar],
            },
          }
        );
      } else {
        global.db.data.users[m.sender].partner = user;
        const target = user.split("@")[0];
        
        conn.reply(
          m.chat,
          getMessage('tembak_proposal', lang, {
            target: target,
            prefix: usedPrefix
          }),
          m,
          {
            contextInfo: {
              mentionedJid: [user],
            },
          }
        );
      }
    } else if (global.db.data.users[user].partner == m.sender) {
      global.db.data.users[m.sender].partner = user;
      const target = user.split("@")[0];
      
      conn.reply(
        m.chat,
        getMessage('tembak_success', lang, {
          target: target
        }),
        m,
        {
          contextInfo: {
            mentionedJid: [user],
          },
        }
      );
    } else {
      global.db.data.users[m.sender].partner = user;
      const target = user.split("@")[0];
      
      conn.reply(
        m.chat,
        getMessage('tembak_proposal', lang, {
          target: target,
          prefix: usedPrefix
        }),
        m,
        {
          contextInfo: {
            mentionedJid: [user],
          },
        }
      );
    }
  }
};
handler.help = ["date request"].map((v) => v + " *@tag*");
handler.tags = ["fun"];
handler.command = /^(date request)$/i;
handler.group = true;
handler.limit = false;
handler.fail = null;

module.exports = handler;