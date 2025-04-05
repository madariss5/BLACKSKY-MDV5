const { getMessage } = require('../lib/languages');

const yts = require('yt-search')
let axios = require("axios");
let handler = async (m, { conn, text, usedPrefix, command}) => {
    // Get user's preferred language
    const user = global.db.data.users[m.sender];
    const chat = global.db.data.chats[m.chat];
    const lang = user?.language || chat?.language || global.language;
 {
    if (!text) throw `[❗] *Useran:* ${usedPrefix + command} <search>`;   
    conn.sendMessage(m.chat, { react: { text: '🎧', key: m.key }})
    let anu = (await yts(text)).all
    let video = anu.filter(v => v.Type === 'video') 
    let channel = anu.filter(v => v.Type === 'channel') 
    if (!anu) throw 'video/Audio Not found';
    let { title } = anu;
    let responseText = '[❗] Reply to this message dengan nomor untuk get lagunya.\n\n';
video.forEach(async(data, index) => {
        responseText += `*${index + 1}.* ${data.title} || ${data.timestamp}\n`;
    });
    const { key } = await conn.reply(m.chat, responseText, m);   
    conn.ytsvideo[m.sender] = { anu, key, title };
}
handler.before = async (m, { conn }) => {
    conn.ytsvideo = conn.ytsvideo ? conn.ytsvideo : {};
    if (m.isBaileys || !(m.sender in conn.ytsvideo)) return;
    const { anu, key, title } = conn.ytsvideo[m.sender];
    if (!m.quoted || m.quoted.id !== key.id || !m.text) return;
    const choice = m.text.trim();
    const inputNumber = Number(choice);
    if (inputNumber >= 1 && inputNumber <= anu.length) {
        conn.sendMessage(m.chat, { delete: key });
        delete conn.ytsvideo[m.sender];
        const selectedTrack = anu[inputNumber - 1];
        try {
            if (selectedTrack.seconds >= 3600) {
            return conn.reply(m.chat, 'video is longer than 1 hour!', m);
            } else {
            let videoUrl = await youtube(selectedTrack.url);
            let videoLink = videoUrl.result.mp4
            let captions = '';
            captions += `∘ Title : ${selectedTrack.title}\n`;
            captions += `∘ Duration : ${selectedTrack.timestamp}\n`;
            captions += `∘ Viewers : ${selectedTrack.views}\n`;
            captions += `∘ Upload At : ${selectedTrack.ago}\n`;
            captions += `∘ Url : ${selectedTrack.url}\n`;
            captions += `∘ Description : ${selectedTrack.description}\n`;

            conn.sendMessage(m.chat, { react: { text: '⏳', key: m.key }})
            await conn.sendMessage(m.chat, { video: { url: videoLink }, caption: captions }, { quoted: m });
          }
        } catch (error) {
            console.error('Error downloading and sending audio:', error);
            await conn.reply(m.chat, 'error saat menngambil data, coba again dengan nomor which lain tau hubungi owner!', m);
            conn.sendMessage(m.chat, { react: { text: '🚫', key: m.key }})
        }
    } else {
        await conn.reply(m.chat, "[❗] Nomor urut not valid. Silwill pilih nomor which sesuai dengan List di atas.", m);
        conn.sendMessage(m.chat, { react: { text: '🚫', key: m.key }})
     }
};
handler.help = ['yts4 <pencarian>'];
handler.tags = ['downloader'];
handler.command = /^(yts4)$/i;
handler.limit = true;
}

module.exports = handler;

async function youtube(url) {
   try {
   const { data } = await axios.get("https://api.betabotz.eu.org/fire/download/yt?url="+url+"&apikey="+lann)
   return data;
   } catch (e) {
   return e;
   }
}
