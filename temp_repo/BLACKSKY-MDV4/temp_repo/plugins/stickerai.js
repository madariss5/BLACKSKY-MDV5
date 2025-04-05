const { getMessage } = require('../lib/languages');

const fs = require('fs');
const fetch = require('node-fetch');

let handler = async (m, { conn, command, usedPrefix, text }) => {
    // Get user's preferred language
    const user = global.db.data.users[m.sender];
    const chat = global.db.data.chats[m.chat];
    const lang = user?.language || chat?.language || global.language;
 {
    if (!text) throw `Kirim prompt dengan cara ${usedPrefix + command} <prompt>`;

    let apiUrl = `https://api.betabotz.eu.org/fire/search/openai-image?text=${text}&apikey=${lann}`;
    let res = await fetch(apiUrl);
    if (!res.ok) throw 'Failed take image dari fire';
    let buffer = await res.buffer();
    
    let filePath = './tmp/tmp-sticker.png';
    fs.writeFileSync(filePath, buffer);

    m.reply(sticker_wait);
    let encmedia = await conn.sendImageAsSticker(m.chat, buffer, m, { packname: global.packname, author: global.author });

    await fs.unlinkSync(encmedia);
    await fs.unlinkSync(filePath);
}

handler.help = ['aisticker <prompt>'];
handler.tags = ['sticker'];
handler.command = /^(aisticker|ai?s|aisticker|stickerai)$/i;
handler.limit = true;
}

module.exports = handler;

const isUrl = (text) => {
    return text.match(new RegExp(/https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&/=]*)(jpe?g|gif|png|mp4)/, 'gi'));
}