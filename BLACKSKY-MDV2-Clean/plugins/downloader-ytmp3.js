const { getMessage } = require('../lib/languages');

const axios = require('axios');

let handler = async (m, { conn, text, usedPrefix, command }) => {
    // Get user's preferred language
    const user = global.db.data.users[m.sender];
    const chat = global.db.data.chats[m.chat];
    const lang = user?.language || chat?.language || global.language;
    
    if (!text) throw getMessage('download_enter_url', lang, {
        prefix: usedPrefix,
        command: command,
        example: 'https://youtu.be/4rDOsvzTicY?si=3Ps-SJyRGzMa83QT'
    });
    
    m.reply(getMessage('wait', lang));
    
    try {
        const response = await axios.get(`https://api.betabotz.eu.org/api/download/ytmp3?url=${text}&apikey=${lann}`);        
        const res = response.data.result;      
        var { mp3, id, title, source, duration } = res;
        
        let caption = `${getMessage('youtube_mp3_title', lang, { title })}\n${getMessage('youtube_mp3_duration', lang, { duration })}`;
        
        await conn.sendMessage(m.chat, { 
            document: { url: mp3 }, 
            mimetype: 'audio/mpeg',
            fileName: `${title}.mp3`,
            caption: caption
        }, { quoted: m });
    } catch (error) {
        m.reply(getMessage('download_error', lang));
    }
};

handler.help = ['ytmp3'];
handler.command = /^(ytmp3)$/i
handler.tags = ['downloader'];
handler.limit = true;
handler.group = false;
handler.premium = false;
handler.owner = false;
handler.admin = false;
handler.botAdmin = false;
handler.fail = null;
handler.private = false;

module.exports = handler;

