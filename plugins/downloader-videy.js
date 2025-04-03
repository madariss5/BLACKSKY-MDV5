const { getMessage } = require('../lib/languages');

const axios = require('axios');

let handler = async (m, { conn, text, usedPrefix, command }) => {
    // Get user's preferred language
    const user = global.db.data.users[m.sender];
    const chat = global.db.data.chats[m.chat];
    const lang = user?.language || chat?.language || global.language;
 {
    if (!text) throw `Masukan URL!\n\nExample:\n${usedPrefix + command} https://videy.co/v?id=QtZ8jT1X1`;    
    try {
        if (!text.match(/videy/gi)) throw `URL Not found!`;        
        m.reply(wait);      
        let res = await axios.get(`https://api.betabotz.eu.org/fire/download/videy?url=${text}&apikey=${lann}`)
        let data = res.data.result
        await conn.sendFile(m.chat, data, 'videy.mp4', "*DONE*", m);      
    } catch (e) {
        console.log(e);
        throw eror
    }
};
handler.help = ['videy'];
handler.command = /^(videy|videydl)$/i
handler.tags = ['downloader'];
handler.limit = true;

}

module.exports = handler;
