const { getMessage } = require('../lib/languages');

let yts = require('yt-search');
let handler = async (m, { text }) => {
  // Get user's preferred language
  const user = global.db.data.users[m.sender];
  const chat = global.db.data.chats[m.chat];
  const lang = user?.language || chat?.language || global.language;
  
  if (!text) throw getMessage('youtube_search_query', lang);
  
  let results = await yts(text)
  let resultText = results.all.map(v => {
    switch (v.Type) {
      case 'video': return getMessage('youtube_video_info', lang, {
        title: v.title,
        url: v.url,
        duration: v.timestamp,
        uploaded: v.ago,
        views: v.views
      }).trim();
      
      case 'channel': return getMessage('youtube_channel_info', lang, {
        name: v.name,
        url: v.url,
        subscribers: `${v.subCountLabel} (${v.subCount})`,
        videos: v.videoCount
      }).trim();
    }
  }).filter(v => v).join(`\n${getMessage('youtube_separator', lang)}\n`);
  
  m.reply(resultText);
}
handler.help = ['', 'earch'].map(v => 'yts' + v + ' <search>')
handler.tags = ['tools', 'internet', 'downloader']
handler.command = /^yts(earch)?$/i

module.exports = handler
