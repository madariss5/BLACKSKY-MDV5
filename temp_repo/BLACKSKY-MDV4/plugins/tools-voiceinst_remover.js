const { getMessage } = require('../lib/languages');

const fetch = require('node-fetch');
const uploader = require('../lib/uploadFile');

let handler = async (m, { conn, usedPrefix, command }) => {
    // Get user's preferred language
    const user = global.db.data.users[m.sender];
    const chat = global.db.data.chats[m.chat];
    const lang = user?.language || chat?.language || global.language;
 {
    let q = m.quoted ? m.quoted : m;
    let mime = (q.msg || q).mimetype || q.mediaType || '';
    if (/audio/.test(mime)) {
        let buffer = await q.download();
        await m.reply(wait);
        try {
            let fileSizeLimit = 5 * 1024 * 1024;
            if (buffer.length > fileSizeLimit) {
                throw 'Ukuran media not may melebihi 5MB';
            }
            let media = await uploader(buffer);
            let response = await fetch(`https://api.betabotz.eu.org/fire/tools/voiceremover?url=${media}&apikey=${lann}`);
            let res = await response.json();
            if (!res.status) {
                throw null
            }
            if (command === 'vocalremover') {
                await conn.sendMessage(m.chat, { audio: { url: res.result.instrumental_path }, mimetype: 'audio/mpeg' }, { quoted: m });
            } else if (command === 'instrumenremover') {
                await conn.sendMessage(m.chat, { audio: { url: res.result.vocal_path }, mimetype: 'audio/mpeg' }, { quoted: m });
            }
        } catch (e) {
            throw '*[INTERNAL SERVER ERROR!]*'
        }
    } else {
        await m.reply(`Reply *audio* with command ${usedPrefix + command}`);
    }
}

handler.command = handler.help = ['vocalremover', 'instrumenremover'];
handler.tags = ['tools'];
handler.limit = true;

}

module.exports = handler;
