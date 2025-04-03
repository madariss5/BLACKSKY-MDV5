const { getMessage } = require('../lib/languages');

let handler = async (m, { conn, groupMetadata }) => {
    // Get user's preferred language
    const user = global.db.data.users[m.sender];
    const chat = global.db.data.chats[m.chat];
    const lang = user?.language || chat?.language || global.language;
 {
const participants = await conn.groupMetadata(m.chat).then(metadata => metadata.participants);
  let countIndonesia = 0;
  let countMalaysia = 0;
  let countUSA = 0;
  let countOther = 0;
  let member = groupMetadata.participants.length;
  
  participants.forEach(participant => {
    const phoneNumber = participant.id.split('@')[0];
    if (phoneNumber.startsWith("62")) {
      countIndonesia++;
    } else if (phoneNumber.startsWith("60")) {
      countMalaysia++;
    } else if (phoneNumber.startsWith("1")) {
      countUSA++;
    } else if (phoneNumber.startsWith("+1")) {
      countOther++;
    } else {
      countOther++;
    }
  });
  
  const replyMessage = 
  `
┌─⊷ *ASAL NEGARA*
Jumlah Anggota group Berdasarkan Negara:
🇮🇩 • Indonesia: ${countIndonesia}
🇲🇾 • Malaysia: ${countMalaysia}
🇺🇲 • USA + OTHER : ${countUSA}
🏳️ • Negara Lain: ${countOther}
👥 • amount semua mmeber: ${member}
└──────────────
`;

  m.reply(replyMessage);
}
handler.tags = ['group']
handler.help = ['check member origin']
handler.command = ['check member origin', 'asalmember']
handler.group = true
}

module.exports = handler