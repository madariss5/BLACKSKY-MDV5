const { getMessage } = require('../lib/languages');

const fetch = require('node-fetch');
const uploadImage = require('../lib/uploadImage');

let handler = async (m, { conn, usedPrefix, command }) => {
    // Get user's preferred language
    const user = global.db.data.users[m.sender];
    const chat = global.db.data.chats[m.chat];
    const lang = user?.language || chat?.language || global.language;
 {
  try {
    const q = m.quoted ? m.quoted : m;
    const mime = (q.msg || q).mimetype || q.mediaType || '';
    if (/^image/.test(mime) && !/webp/.test(mime)) {
      const img = await q.download();
      const out = await uploadImage(img);
      m.reply(wait);
      if (command === 'hd') {
        const fire = await fetch(`https://api.betabotz.eu.org/fire/tools/remini?url=${out}&apikey=${lann}`);
        const image = await fire.json();
        const { url } = image;
        conn.sendFile(m.chat, url, null, wm, m);
      } else if (command === 'hd2') {       
        try {
          const fire = await fetch(`https://api.betabotz.eu.org/fire/tools/remini-v2?url=${out}&apikey=${lann}`);
          const response = await fire.text();
          let image;
          try {
            image = JSON.parse(response);
          } catch (error) {
            console.error(`parse: ${error}`);
            return;
          }
          const { url } = image;
          conn.sendFile(m.chat, url, null, wm, m);
        } catch (error) {
          throw error;
        }
      } else if (command === 'hd3') {
        const fire = await fetch(`https://api.betabotz.eu.org/fire/tools/remini-v3?url=${out}&resolusi=4&apikey=${lann}`);
        const image = await fire.json();
        const url = image.url;
        conn.sendFile(m.chat, url, null, wm, m);
       } else if (command === 'removebg' || command === 'nobg') {
        const fire = await fetch(`https://api.betabotz.eu.org/fire/tools/removebg?url=${out}&apikey=${lann}`);
        const image = await fire.json();
        const url = image.url;
        conn.sendFile(m.chat, url, null, wm, m);
      }
    } else {
      m.reply(`Kirim image dengan caption *${usedPrefix + command}* atau tag image which already dikirim.`);
    }
  } catch (e) {
    console.error(e);
    throw `🚩 *Server Error*`
  }
}

handler.command = handler.help = ['hd', 'hd2', 'hd3','removebg','nobg'];
handler.tags = ['tools'];
handler.premium = false;
handler.limit = false;

}

module.exports = handler;
