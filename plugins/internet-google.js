const { getMessage } = require('../lib/languages');

let fetch = require('node-fetch');

let handler = async (m, { conn, command, args }) => {
    // Get user's preferred language
    const user = global.db.data.users[m.sender];
    const chat = global.db.data.chats[m.chat];
    const lang = user?.language || chat?.language || global.language;
 {
  let text = args[0];
  if (!text) return conn.reply(m.chat, 'Tidak ada teks untuk dicari', m);

  try {
    let response = await fetch(`https://api.betabotz.eu.org/fire/search/google?text1=${encodeURIComponent(text)}&apikey=${lann}`);
    let data = await response.json();

    if (!data.status) throw eror

    let msg = data.result.map(({ title, url, description }) => {
      return `*${title}*\n_${url}_\n_${description}_`;
    }).join('\n\n');
    conn.relayMessage(m.chat, {
     extendedTextMessage:{
                text: msg, 
                contextInfo: {
                     externalAdReply: {
                        title: wm,
                        mediaType: 1,
                        previewType: 0,
                        renderLargerThumbnail: true,
                        thumbnailUrl: 'https://telegra.ph/file/d7b761ea856b5ba7b0713.jpg',
                        sourceUrl: ''
                    }
                }, mentions: [m.sender]
}}, {})
  } catch (e) {
    throw eror
  }
};

handler.help = ['google'].map(v => v + ' <pencarian>');
handler.tags = ['internet'];
handler.command = /^google$/i;
handler.limit = true;

}

module.exports = handler;
