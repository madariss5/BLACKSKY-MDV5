const { getMessage } = require('../lib/languages');

let fetch = require('node-fetch');

let handler = async (m, { conn, args, usedPrefix, command }) => {
  // Get user's preferred language
  const user = global.db.data.users[m.sender];
  const chat = global.db.data.chats[m.chat];
  const lang = user?.language || chat?.language || global.language;
  
  if (!args[0]) {
    throw getMessage('download_enter_url', lang, {
      prefix: usedPrefix,
      command: command,
      example: 'https://www.instagram.com/p/ByxKbUSnubS/?utm_source=ig_web_copy_link'
    });
  }
   
  if (!args[0].match(/instagram/gi)) {
    throw getMessage('download_invalid_url', lang, { service: 'Instagram' });
  }
  
  await m.reply(getMessage('wait', lang));
  
  try {
    const fire = await fetch(`https://api.betabotz.eu.org/fire/download/igdowloader?url=${args[0]}&apikey=${lann}`);
    const res = await fire.json();
       
    const limitnya = 3;
       
    for (let i = 0; i < Math.min(limitnya, res.message.length); i++) {
      await sleep(3000);
      conn.sendFile(m.chat, res.message[i]._url, null, `*Instagram ${getMessage('download_completed', lang)}*`, m);
    }
  } catch (e) {
    throw getMessage('error', lang);
  }
}

handler.help = ['instagram'].map(v => v + ' <url>')
handler.tags = ['downloader']
handler.command = /^(ig|instagram|igdl|instagramdl|igstory)$/i
handler.limit = true

module.exports = handler

function sleep(ms) {
   return new Promise(resolve => setTimeout(resolve, ms));
}