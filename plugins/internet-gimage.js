const { getMessage } = require('../lib/languages');

let fetch = require('node-fetch');

let handler = async (m, { conn, text, usedPrefix, command }) => {
    // Get user's preferred language
    const user = global.db.data.users[m.sender];
    const chat = global.db.data.chats[m.chat];
    const lang = user?.language || chat?.language || global.language;
 {
    if (!text) throw `Use Example ${usedPrefix}${command} Minecraft`;  
    try {
    const res = await (await fetch(`https://api.betabotz.eu.org/fire/search/googleimage?text1=${encodeURIComponent(text)}&apikey=${lann}`)).json();
    if (!res.status) throw eror
    let image = pickRandom(res.result).url;
    conn.sendFile(m.chat, image, 'google.jpg', `*G O O G L E*\n*Result:* ${text}\n*Source:* https://google.com`, m);
   } catch (e) {
   throw eror
  }
};

handler.help = ['gimage <query>', 'image <query>'];
handler.tags = ['internet'];
handler.command = /^(gimage|image)$/i;

}

module.exports = handler;

function pickRandom(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}
