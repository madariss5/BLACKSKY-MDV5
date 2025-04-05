const { getMessage } = require('../lib/languages');

const fetch = require('node-fetch');
const uploadImage = require('../lib/uploadImage.js');

async function handler(m, { conn, usedPrefix, command }) {
  try {
    const q = m.quoted ? m.quoted : m;
    const mime = (q.msg || q).mimetype || q.mediaType || '';
    if (/^image/.test(mime) && !/webp/.test(mime)) {
      const img = await q.download();
      const out = await uploadImage(img);
      const fire = await fetch(`https://api.betabotz.eu.org/fire/tools/remini?url=${out}&apikey=${global.lann}`);
      const image = await fire.json();
      const { url } = image 
       conn.sendFile(m.chat, url, null, global.wm, m);
    } else {
      m.reply(getMessage('remini_send_image', m.lang, {prefix: usedPrefix, command: command}));
    }
  } catch (e) {
    console.error(e);
    m.reply(getMessage('remini_failed', m.lang));
  }
}

handler.help = ['remini'];
handler.tags = ['tools'];
handler.command = ['remini'];
handler.premium = false;
handler.limit = false;

module.exports = handler;
