const { getMessage } = require('../lib/languages');

const youtube = require("yt-search");
let handler = async (m, { conn, text }) => {
    // Get user's preferred language
    const user = global.db.data.users[m.sender];
    const chat = global.db.data.chats[m.chat];
    const lang = user?.language || chat?.language || global.language;
 {
  if (!text) throw 'Url nya mana?'
  m.reply('_Proses..._')
  var search = await youtube(text);
  var convert = search.videos[0];
  let url = `https://aemt.me/youtube?url=${convert.url}&filter=audioandvideo&quality=highestvideo&contenttype=video/mp4`
  conn.sendMessage(m.chat, { video: { url: url }, mimetype: 'video/mp4' }, { quoted: m })
}
handler.command = handler.help = ['ytv2']
handler.tags = ['downloader']
}

module.exports = handler
