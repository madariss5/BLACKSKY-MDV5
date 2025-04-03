const { getMessage } = require('../lib/languages.js');
exports.before = async function(m, { isAdmin, isBotAdmin }) {
    if (m.isBaileys && m.fromMe) return true;
    
    let chat = global.db.data.chats[m.chat];
    let sender = global.db.data.chats[m.sender];
    let isVideo = m.mtype;
    let deleteParticipant = m.key.participant;
    let bang = m.key.id;
    
    if (chat.antivideo && isVideo) {
      if (isVideo === "videoMessage") {
        if (isAdmin || !isBotAdmin) {
          // Jika sender adalah admin atau bot not admin, not melakukan apa-apa
        } else {
          m.reply(`*video Terdeteksi*\n\nSorry Tapi Harus Saya delete, Karna Admin/Owner Mengaktifkan Anti video Untuk Chat Ini`);
          return this.sendMessage(m.chat, { delete: { remoteJid: m.chat, fromMe: false, id: bang, participant: deleteParticipant } });
        }
        return true;
      }
    }
    return true;
  };
  