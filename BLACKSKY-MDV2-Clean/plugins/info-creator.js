var name = global.nameowner
var numberowner = global.numberowner
var gmail = global.mail
const { 
default: 
makeWASocket,
BufferJSON,
WA_DEFAULT_EPHEMERAL, 
generateWAMessageFromContent, 
downloadContentFromMessage, 
downloadHistory, 
proto,
getMessage: getMessageBaileys, 
generateWAMessageContent, 
prepareWAMessageMedia 
} = require("@adiwajshing/baileys");
const { getMessage } = require('../lib/languages.js');
var handler = async (m, {
conn
}) => {
  // Get user language preference
  let user = global.db.data.users[m.sender];
  const lang = user?.language || 'en';
  
const vcard = `BEGIN:VCARD
VERSION:3.0
N:Sy;Bot;;;
FN: ${name}
item.ORG: Creator Bot
item1.TEL;waid=${numberowner}:${numberowner}@s.whatsapp.net
item1.X-ABLabel:Nomor Creator Bot 
item2.EMAIL;Type=INTERNET:${gmail}
item2.X-ABLabel:Email Owner
item3.ADR:;;🇮🇩 Indonesia;;;;
item3.X-ABADR:ac
item4.EMAIL;Type=INTERNET:support@tioprm.eu.org
item4.X-ABLabel:Email Developer 
item3.ADR:;;🇮🇩 Indonesia;;;;
item3.X-ABADR:ac 
item5.URL:${instagram}
item5.X-ABLabel:Website
END:VCARD`
const sentMsg  = await conn.sendMessage(
    m.chat,
    { 
        contacts: { 
            displayName: 'CN', 
            contacts: [{ vcard }] 
        }
    }
)
await conn.reply(m.chat, getMessage('owner_contact', lang), sentMsg)}
handler.command = handler.help = ['owner', 'creator'];
handler.tags = ['info'];
handler.limit = true;
module.exports = handler;
