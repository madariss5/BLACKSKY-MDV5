const { getMessage } = require('../lib/languages');

const axios = require('axios');

let handler = async (m, { conn, text, usedPrefix, command }) => {
    // Get user's preferred language
    const user = global.db.data.users[m.sender];
    const chat = global.db.data.chats[m.chat];
    const lang = user?.language || chat?.language || global.language;
 {
    let capt, urlApi;
    
    if (!text) {
        throw getMessage('download_enter_url', lang, { 
            prefix: usedPrefix, 
            command: command, 
            example: 'https://vt.tiktok.com/ZSY8XguF2/' 
        });
    }

    if (!text.match(/tiktok|douyin/gi)) {
        throw getMessage('download_invalid_url', lang, { service: 'TikTok/Douyin' });
    }

    if (command === 'tiktok' || command === 'tt' || command === 'ttdl' || command === 'ttnowm' || command === 'tiktokdl' || command === 'tiktoknowm') {
        capt = `乂 *T I K T O K*`;
        urlApi = `https://api.betabotz.eu.org/fire/download/tiktok?url=${text}&apikey=${lann}`;
    } else if (command === 'douyin' || command === 'douyindl') {
        capt = `乂 *D O U Y I N*`;
        urlApi = `https://api.betabotz.eu.org/fire/download/douyin?url=${text}&apikey=${lann}`;
    }

    try {
        m.reply(getMessage('download_processing', lang));  
        const response = await axios.get(urlApi);
        const res = response.data.result;
        var { video, title, title_audio, audio } = res;

        capt += `\n\n◦ *${getMessage('play_title', lang)}* : ${title}\n◦ *${getMessage('play_title', lang)} ${getMessage('play_audio', lang)}* : ${title_audio}\n`;

        if (Array.isArray(video)) {
            for (let v of video) {
                await conn.sendFile(m.chat, v, null, capt, m);
            }
        } else {
            await conn.sendFile(m.chat, video, null, capt, m);
        }

        await conn.sendMessage(m.chat, { audio: { url: audio[0] }, mimetype: 'audio/mpeg' }, { quoted: m });
        
    } catch (e) {
        console.error(e);
        throw getMessage('download_error', lang);
    }
};
handler.help = handler.command = ['tiktok', 'tt', 'ttdl', 'ttnowm', 'tiktokdl', 'tiktoknowm', 'douyin', 'douyindl'];
handler.tags = ['downloader'];
handler.limit = true;
handler.group = false;
handler.premium = false;
handler.owner = false;
handler.admin = false;
handler.botAdmin = false;
handler.fail = null;
handler.private = false;

}

module.exports = handler;
