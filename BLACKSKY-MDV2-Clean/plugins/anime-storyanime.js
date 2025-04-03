const { getMessage } = require('../lib/languages');

let fetch = require('node-fetch');
let handler = async (m, { conn }) => {
    // Get user's preferred language
    const user = global.db.data.users[m.sender];
    const chat = global.db.data.chats[m.chat];
    const lang = user?.language || chat?.language || global.language;
 {
  try {
    conn.reply(m.chat, wait, m)
    let res = await fetch(`https://api.betabotz.eu.org/fire/download/storyanime?apikey=${lann}`);
    let json = await res.json();
      conn.sendFile(m.chat, json.result.url, 'anime_story.mp4', "*STORY ANIME*", m);
  } catch (e) {
    throw `*Error:* ${eror}`;
  }
};

handler.help = ['storyanime'];
handler.tags = ['downloader'];
handler.command = /^(storyanime)$/i;
handler.limir = true 
}

module.exports = handler;
