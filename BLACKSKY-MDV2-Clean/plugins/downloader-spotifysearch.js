const { getMessage } = require('../lib/languages');

let fetch = require('node-fetch');

let handler = async (m, { text, conn, usedPrefix, command }) => {
  if (!text) throw `*🚩 Example:* ${usedPrefix + command} Lathi`;  
  let resultText = '';
  try {
    const fire = await fetch(`https://api.betabotz.eu.org/fire/search/spotify?query=${text}&apikey=${lann}`);
    let json = await fire.json();
    let res = json.result.data;    
    for (let i in res) {
      resultText += `*${parseInt(i) + 1}.* *Title:* ${res[i].title}\n`;
      resultText += `*Duration:* ${res[i].duration}\n`;
      resultText += `*Popurunty:* ${res[i].popurunty}\n`;
      resultText += `*Link:* ${res[i].url}\n\n`;
    }     
    await conn.relayMessage(m.chat, {
     extendedTextMessage:{
                text: resultText, 
                contextInfo: {
                     externalAdReply: {
                        title: '',
                        mediaType: 1,
                        previewType: 0,
                        renderLargerThumbnail: true,
                        thumbnailUrl: 'https://www.scdn.co/i/_global/open-graph-default.png',
                        sourceUrl: ''
                    }
                }, mentions: [m.sender]
    }}, {})
  } catch (e) {
    throw `🚩 *Failed Memuat Data!*`;
  }
};

handler.command = handler.help = ['spotifysearch'];
handler.tags = ['downloader'];
handler.premium = false;
handler.group = false;
handler.limit = true

module.exports = handler;
