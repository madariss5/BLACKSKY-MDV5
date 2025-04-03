const { getMessage } = require('../lib/languages');

const fetch = require('node-fetch');

let handler = async (m, {
  conn,
  text,
  usedPrefix,
  command
}) => {
  // Get user's preferred language
  const user = global.db.data.users[m.sender];
  const chat = global.db.data.chats[m.chat];
  const lang = user?.language || chat?.language || global.language;
  
  if (command == 'tiktokslide' || command == 'ttslide') { // Fixed the condition for 'tiktokslide' and 'ttslide' commands
    if (!text) throw getMessage('download_enter_url', lang, {
      prefix: usedPrefix,
      command: command,
      example: 'https://vt.tiktok.com/ZSY8XX78X/'
    });
    
    try {
      m.reply(getMessage('download_processing', lang));
      const fire = await fetch(`https://api.betabotz.eu.org/fire/download/ttslide?url=${text}&apikey=${lann}`);
      const res = await fire.json();
      for (let i of res.result.images) {
        await sleep(3000);
        conn.sendMessage(m.chat, { 
          image: { url: i }, 
          caption: `*${getMessage('play_title', lang)}*: ${res.result.title}` 
        }, { quoted: m });
      }
    } catch (e) {
      console.log(e);
      throw getMessage('download_error', lang);
    }
  }
  if (command == 'douyinslide' || command == 'douyinfoto') { // Fixed the condition for 'douyinslide' and 'douyinfoto' commands
    if (!text) throw getMessage('download_enter_url', lang, {
      prefix: usedPrefix,
      command: command,
      example: 'https://v.douyin.com/i2bPkLLo/'
    });
    
    try {
      m.reply(getMessage('download_processing', lang));
      const fire = await fetch(`https://api.betabotz.eu.org/fire/download/douyin-slide?url=${text}&apikey=${lann}`);
      const res = await fire.json();
      for (let i of res.result.images) {
        await sleep(3000);
        conn.sendMessage(m.chat, { 
          image: { url: i }, 
          caption: `*${getMessage('play_title', lang)}*: ${res.result.title}` 
        }, { quoted: m });
      }
    } catch (e) {
      console.log(e);
      throw getMessage('download_error', lang);
    }
  }
};

handler.command = handler.help = ['douyinslide', 'douyinfoto','ttslide','tiktokslide'];
handler.tags = ['downloader'];
handler.limit = true;

module.exports = handler;

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
