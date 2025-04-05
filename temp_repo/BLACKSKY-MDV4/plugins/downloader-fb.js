const { getMessage } = require('../lib/languages');
var fetch = require("node-fetch");

var handler = async (m, { conn, args, usedPrefix, command }) => {
  // Get user's preferred language
  const user = global.db.data.users[m.sender];
  const chat = global.db.data.chats[m.chat];
  const lang = user?.language || chat?.language || global.language;

  if (!args[0]) {
    throw getMessage('download_enter_url', lang, {
      prefix: usedPrefix,
      command: command,
      example: 'https://www.facebook.com/100084756252836/videos/3391018171153874/'
    });
  }
  try {
    m.reply(getMessage('download_processing', lang));
    const url = args[0];
    const get = await fetch(`https://api.betabotz.eu.org/fire/download/fbdown?url=${url}&apikey=${lann}`);
    var js = await get.json();
    conn.sendFile(m.chat, js.result[1]._url, 'fb.mp4', getMessage('download_completed', lang), m);
  } catch (e) {
    console.log(e);
    if (m.sender) {
      conn.reply(m.chat, getMessage('download_error', lang), m);
    }
  }
};
handler.help = ['facebook'];
handler.command = /^(fb|facebook|facebookdl|fbdl|fbdown|dlfb)$/i;
handler.tags = ['downloader'];
handler.limit = true;
handler.group = true;
handler.premium = false;
handler.owner = false;
handler.admin = false;
handler.botAdmin = false;
handler.fail = null;
handler.private = false;
module.exports = handler;
