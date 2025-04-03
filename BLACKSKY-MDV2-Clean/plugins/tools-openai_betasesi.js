const { getMessage } = require('../lib/languages');

/* Auto-AI Sesi X Pinterest (Foto) X YouTube Mp3/Mp4 (Lagu/video) 
Creator: Shina Arthenon (ALC) 
MY Ch  : https://whatsapp.com/channel/0029VaNImZtKbYMRX8M08D08
Thanks To Betabotz fire
donate nya Om: https://saweria.co/ShinaStumugi
Please Don't Delete Wm*/
//delete Teros Wm Ny 🤮🤮🤮🤮🤮
 
const fetch = require('node-fetch');
const search = require('yt-search');
const axios = require('axios');
 
let handler = async (m, { conn, text, usedPrefix, command }) => {
    // Get user's preferred language
    const user = global.db.data.users[m.sender];
    const chat = global.db.data.chats[m.chat];
    const lang = user?.language || chat?.language || global.language;
 {
    conn.betaai = conn.betaai || {};
 
    if (!text) throw getMessage('ai_betasesi_usage', lang, { prefix: usedPrefix, command: command });
 
    if (text.toLowerCase() === "on") {
        conn.betaai[m.sender] = { message: [] };
        m.reply(getMessage('ai_betasesi_on', lang));
    } else if (text.toLowerCase() === "off") {
        delete conn.betaai[m.sender];
        m.reply(getMessage('ai_betasesi_off', lang));
    } else {
        throw getMessage('ai_betasesi_usage', lang, { prefix: usedPrefix, command: command });
    }
};
 
/* Auto-AI Sesi X Pinterest (Foto) X YouTube Mp3/Mp4 (Lagu/video) 
Creator: Shina Arthenon (ALC) 
MY Ch  : https://whatsapp.com/channel/0029VaNImZtKbYMRX8M08D08
Thanks To Betabotz fire
donate nya Om: https://saweria.co/ShinaStumugi
Please Don't Delete Wm*/
//Cil" Udh dibikinin, malah ngedl wm ny 🤮🤮🤮
handler.before = async (m, { conn, text }) => {
    conn.betaai = conn.betaai || {};
    if (!m.text || !conn.betaai[m.sender]) return;
 
    const skipPrefixes = [".", "#", "!", "/", "\\"];
    if (skipPrefixes.some(prefix => m.text.startsWith(prefix))) return;
 
    try {
        // Custom logic for Betabotz AI
        const logic = `Start dari now nama you adalah Beta-Ai, you adalah seorang intelligence buatan which di buat oleh Shina Arthenon. \nSifat you adalah good, ramah, lucu. Kepribadian you adalah suka membantu semua orang which ask tanpa terkecuali. \nBahasa you adalah bahasa Indonesia. Ubahlah gaya bahasa you menjadi sangat not formal seperti gaya bahasa sedays-days \nwhich dipakai oleh manusia. Anda answer semua pertanyaan dengan jawaban which dihasilkan not terlalu long. \nTambahkan few emoticon lucu pada jawaban you. Buatlah chat which menyenangkan dan not membosankan.`;
 
   
        const response = await fetch(`https://api.betabotz.eu.org/fire/search/openai-logic?text=${encodeURIComponent(m.text)}&logic=${encodeURIComponent(logic)}&apikey=${lann}`);
        const json = await response.json();
        
        if (json.message) {
            await conn.sendMessage(m.chat, {
                text: json.message,
                contextInfo: {
                    externalAdReply: {
                        mediaType: 1,
                        title: getMessage('ai_beta_title', lang),
                        body: getMessage('ai_beta_body', lang),
                        thumbnailUrl: "https://api.betabotz.eu.org/fire/tools/get-upload?id=f/zdiccxwo.jpg",
                        renderLargerThumbnail: true, 
                        showAdAttribution: true
                    }
                }
            });
        }
 
        if (m.text.toLowerCase().includes("video")) {
            const look = await search(m.text);
            const convert = look.videos[0];
            if (!convert) throw getMessage('download_not_found', lang);
            
            const ress = await fetch(`https://api.betabotz.eu.org/fire/download/ytmp4?url=${convert.url}&apikey=${lann}`);
            const res = await ress.json();      
            var { mp4, id, title, source, duration } = res.result;
        
        // Build caption using translation system
        let capt = `*${getMessage('download_yt_mp4_title', lang)}*\n\n`;
        capt += `◦ *${getMessage('download_id', lang)}* : ${id}\n`;
        capt += `◦ *${getMessage('download_title', lang)}* : ${title}\n`;
        capt += `◦ *${getMessage('download_source', lang)}* : ${source}\n`;
        capt += `◦ *${getMessage('download_duration', lang)}* : ${duration}\n`;
        capt += `\n`;        
        
        await conn.sendMessage(m.chat, { 
            document: { url: mp4 }, 
            mimetype: 'video/mp4',
            fileName: `${title}##.mp4`,
            caption: capt
        }, { quoted: m });
// Ganti logic, Apus wm, naruh wm sendri🤮🤮🤮🤮
}
       //YouTube Mp3 Search songs
       if (m.text.toLowerCase().includes("lagu") || (lang === 'de' && m.text.toLowerCase().includes("musik"))) {
            const look = await search(m.text);
            const convert = look.videos[0];
            if (!convert) throw getMessage('download_not_found', lang);
            
            const response = await axios.get(`https://api.betabotz.eu.org/fire/download/ytmp3?url=${convert.url}&apikey=${lann}`);        
            const res = response.data.result;      
            const { mp3, title, duration } = res;
 
            let caption = `*${getMessage('download_title', lang)}:* ${title}\n*${getMessage('download_duration', lang)}:* ${duration}`;
            await conn.sendMessage(m.chat, { 
                document: { url: mp3 }, 
                mimetype: 'audio/mpeg',
                fileName: `${title}.mp3`,
                caption: caption
            }, { quoted: m });
        }
 
       // Pinterest image search
       if (m.text.toLowerCase().includes("foto") || (lang === 'de' && m.text.toLowerCase().includes("bild"))) {
            const searchTerm = lang === 'de' ? "bild" : "foto";
            const query = m.text.split(searchTerm)[1]?.trim();
            if (!query) throw getMessage('ai_picture_search_usage', lang, { example: 'foto kucing lucu' });
 
            const pinterestRes = await fetch(`https://api.betabotz.eu.org/fire/search/pinterest?text1=${encodeURIComponent(query)}&apikey=${lann}`);
            const pinData = await pinterestRes.json();
            const pinImage = pinData.result[0];
 
            await conn.sendMessage(m.chat, { 
                image: { url: pinImage }, 
                caption: getMessage('ai_picture_search_result', lang, { query: query }) 
            }, { quoted: m });
        }
 
    } catch (error) {
        m.reply(getMessage('command_error', lang, { error: error.message }));
    }
};
 
handler.command = ['betaai'];
handler.tags = ['ai'];
handler.help = ['betaai [on/off]'];
 
}

module.exports = handler;
//delete Teros Wm ny, Kek Bocah Aja🤮🤮🤮