const { getMessage } = require('../lib/languages');

let fetch = require('node-fetch');

let handler = async (m, { conn, args, usedPrefix, command }) => {
    // Get user's preferred language
    const user = global.db.data.users[m.sender];
    const chat = global.db.data.chats[m.chat];
    const lang = user?.language || chat?.language || global.language;
 {
  if (!args[0]) {
    throw `Enter a URL!\n\nExample:\n${usedPrefix}${command} https://pin.it/4CVodSq`;
  }
  if (!args[0].startsWith('https://')) {
    throw `You must enter a valid URL with the format *https://*\n\nExample: https://pin.it/4CVodSq`;
  }

  try {
    m.reply('Please wait, processing...');

    const fire = await fetch(`https://api.betabotz.eu.org/fire/download/pinterest?url=${args[0]}&apikey=${lann}`);
    const res = await fire.json();

    if (!res.result || !res.result.success) throw `Failed to retrieve data from fire!`;

    let { media_type, image, title, pin_url, video } = res.result.data;

    if (media_type === 'video/mp4') {
      await conn.sendMessage(m.chat, {
        video: { url: video },
        caption: `*Title:* ${title || 'Not available'}\n*Mediatype:* ${media_type}\n*Source Url:* ${pin_url}`
      });
    } else {
      await conn.sendMessage(m.chat, {
        image: { url: image },
        caption: `*Title:* ${title || 'Not available'}\n*Mediatype:* ${media_type}\n*Source Url:* ${pin_url}`
      });
    }
  } catch (e) {
    console.error(e);
    throw `An error occurred! Please craft sure the URL is valid or try again later.`;
  }
};

handler.help = ['pindl'];
handler.command = /^(pindl|pindownload)$/i;
handler.tags = ['downloader'];
handler.limit = true;
handler.premium = false;

}

module.exports = handler;
