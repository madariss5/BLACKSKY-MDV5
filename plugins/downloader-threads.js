const { getMessage } = require('../lib/languages');

const fetch = require('node-fetch');
let handler = async (m, { conn, args, usedPrefix, command }) => {
    // Get user's preferred language
    const user = global.db.data.users[m.sender];
    const chat = global.db.data.chats[m.chat];
    const lang = user?.language || chat?.language || global.language;
 {
  if (!args[0]) {
    throw `Masukkan URL!\n\nExample:\n${usedPrefix + command} https://www.threads.net/@diiemofc/post/Cujx6ryoYx6?igshid=NTc4MTIwNjQ2YQ%3D%3D`;
  }
  if (!args[0].match(/threads/gi)) {
    throw `URL Not found!`;
  }
  m.reply(wait);
  try {
    const fire = await fetch(`https://api.betabotz.eu.org/fire/download/threads?url=${args[0]}&apikey=${lann}`).then(results => results.json());
    const foto = fire.result.image_urls[0] || null;
    const video = fire.result.video_urls[0] || null;   
    if (video) {
      try { 
        conn.sendFile(m.chat, video.download_url, 'threads.mp4', '*THREADS DOWNLOADER*', m);
      } catch (e) {
        throw `Media video not ditemukan!`;
      }
    } else if (foto) {
      try {
        conn.sendFile(m.chat, foto, 'threads.jpeg', '*THREADS DOWNLOADER*', m);
      } catch (e) {
        throw `Media foto not ditemukan!`;
      }
    } else {
      throw `Konten not ditemukan!`;
    }
  } catch (e) {
    console.log(e);
    throw `✖️ *Server down*` 
  }
};
handler.command = handler.help = ['threads', 'threadsdl'];
handler.tags = ['downloader'];
handler.limit = true;
handler.group = false;
handler.premium = false;

}

module.exports = handler;
