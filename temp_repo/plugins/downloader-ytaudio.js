const { getMessage } = require('../lib/languages');

let handler = async (m, {conn, text, usedPrefix}) => {
  const user = global.db.data.users[m.sender];
  const chat = global.db.data.chats[m.chat];
  const lang = user?.language || chat?.language || global.language;
  
  if (!text) throw getMessage('ytaudio_no_url', lang);
  try {   
    var aud = `https://aemt.me/youtube?url=${text}&filter=audioonly&quality=highestaudio&contenttype=audio/mpeg` 
    await conn.sendMessage(m.chat, { audio: { url: aud }, mimetype: 'audio/mpeg' }, { quoted: m })    
  } catch (e) {
    throw getMessage('ytaudio_not_found', lang);
  }
}
handler.command = handler.help = ['ytaudio'];
handler.tags = ['downloader'];
handler.exp = 0;
handler.limit = true;
handler.premium = false;
module.exports = handler;
