const { getMessage } = require('../lib/languages');

const { MessageType } = require('@adiwajshing/baileys').default;

let handler = async (m, { conn, text, usedPrefix }) => {
    // Get user's preferred language
    const user = global.db.data.users[m.sender];
    const chat = global.db.data.chats[m.chat];
    const lang = user?.language || chat?.language || global.language;
 {
  function no(number){
    return number.replace(/\s/g, '').replace(/([@+-])/g, '');
  }

  var hl = [];
  hl[0] = text.split('|')[0];
  hl[0] = no(hl[0]) + "@s.whatsapp.net";
  hl[1] = text.split('|')[1];
  
  if (!text) {
    return conn.reply(m.chat, getMessage('addprem_usage', lang, { prefix: usedPrefix }), m);
  }
  
  if (typeof db.data.users[hl[0]] === 'undefined') throw getMessage('addprem_not_in_db', lang);
  
  var amountHari = 86400000 * hl[1];
  var now = new Date() * 1;
  
  db.data.users[hl[0]].premium = true;
  
  if (now < db.data.users[hl[0]].premiumTime) {
    db.data.users[hl[0]].premiumTime += amountHari;
  } else {
    db.data.users[hl[0]].premiumTime = now + amountHari;
  }
  
  conn.reply(m.chat, getMessage('addprem_success', lang, { user: hl[0].split('@')[0], days: hl[1] }), m, { contextInfo: { mentionedJid: [hl[0]] } });
  conn.reply(hl[0], getMessage('addprem_user_notification', lang, { days: hl[1] }), m, { contextInfo: { mentionedJid: [hl[0]] } });
};

handler.help = ['addprem *@tag|days*'];
handler.tags = ['owner'];
handler.command = /^(addprem|prem)$/i;
handler.owner = true;
handler.fail = null;

}

module.exports = handler;


// hapis skibidiiii