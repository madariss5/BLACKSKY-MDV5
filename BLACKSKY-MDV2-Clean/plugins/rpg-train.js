const { getMessage } = require('../lib/languages');

// Fungsi untuk mengubah waktu menjadi format hours:minutes:seconds
function clockString(ms) {
  let h = Math.floor(ms / 3600000);
  let m = Math.floor(ms / 60000) % 60;
  let s = Math.floor(ms / 1000) % 60;
  return [h, m, s].map(v => v.toString().padStart(2, '0')).join(':');
}

let handler = async (m, { conn, text }) => {
    // Get user's preferred language
    const user = global.db.data.users[m.sender];
    const chat = global.db.data.chats[m.chat];
    const lang = user?.language || chat?.language || global.language;
 {
  try {
    let user = global.db.data.users[m.sender];
    
    // List atribut which can dilatih
    const attributes = ['attack', 'speed', 'strength', 'health', 'defense'];

    // check apakah atribut which diminta valid
    let attribute = text.toLowerCase().trim();
    if (!attributes.includes(attribute)) {
      conn.reply(m.chat, `乂 *B E R L A T I H*\n\nPlease choose *Attribute* which you want latih :\n\n- Attack\n- Speed\n- Strenght\n- Health\n- Defense\n\n_Example_ :\n.train defense`, m, {
            contextInfo: {
                externalAdReply: {
                    mediaType: 1,
                    title: 'BETABOTZ RPG',
                    thumbnailUrl: 'https://telegra.ph/file/05daab7b42157c06636b3.jpg',
                    renderLargerThumbnail: true,
                    sourceUrl: ''
                }
            }
        })
      return;
    }

    // check apakah User memiliki enough stamina
    if (user.stamina < 10) {
      conn.reply(m.chat, '🌡️ Anda not memiliki enough stamina untuk train. stamina direquirekan: 10.', m);
      return;
    }

    // lackingi stamina User
    user.stamina -= 10;

    // Hitung peningkatan atribut
    let increase = 1; // Tetap menambahkan 1 ke atribut

    // Tambahkan peningkatan ke atribut which diminta
    user[attribute] += increase;

    // message Result training
    let message = `🏋️‍♂️ Anda currently train ${attribute} dan get peningkatan:\n\n`;
    message += `❤️ ${attribute} User now: ${user[attribute]}\n`;
    message += `✨ Peningkatan which dihasilkan: ${increase}\n`;
    message += `⚡ Sisa stamina: ${user.stamina}\n`;

    conn.reply(m.chat, message, m, {
            contextInfo: {
                externalAdReply: {
                    mediaType: 1,
                    title: 'BETABOTZ RPG',
                    thumbnailUrl: 'https://telegra.ph/file/05daab7b42157c06636b3.jpg',
                    renderLargerThumbnail: true,
                    sourceUrl: ''
                }
            }
        })
  } catch (e) {
    console.log(e);
    conn.reply(m.chat, 'Error', m);
  }
}

handler.help = ['train <atribut>'];
handler.tags = ['rpg'];
handler.command = /^train$/i;
handler.limit = true;
handler.group = true;
handler.rpg = true
handler.fail = null;

}

module.exports = handler;