const { getMessage } = require('../lib/languages');

const fetch = require('node-fetch');
let handler = async (m, { conn, args, usedPrefix, command }) => {
    // Get user's preferred language
    const user = global.db.data.users[m.sender];
    const chat = global.db.data.chats[m.chat];
    const lang = user?.language || chat?.language || global.language;
 {
 if (!args[0]) throw `🚩 *Example:* ${usedPrefix + command} anime`
  try {
    const res = await fetch(`https://api.betabotz.eu.org/fire/search/tiktoks?query=${args[0]}&apikey=${lann}`);
    const fire = await res.json();
    const randomIndex = Math.floor(Math.random() * fire.result.data.length);
    let video = fire.result.data[randomIndex];
    let capt = `乂 *T I K T O K  S E A R C H*\n\n`;
    capt += `  ◦ *video ${randomIndex + 1}*\n`;
    capt += `  ◦ *video ID*: ${video.video_id}\n`;
    capt += `  ◦ *Region*: ${video.region}\n`;
    capt += `  ◦ *Title*: ${video.title}\n`;
    capt += `  ◦ *Duration*: ${video.duration} seconds\n`;
    capt += `  ◦ *Music Info:*\n`;
    capt += `  ◦ *ID*: ${video.music_info.id}\n`;
    capt += `  ◦ *Title*: ${video.music_info.title}\n`;
    capt += `  ◦ *Author*: ${video.music_info.author}\n`;
    capt += `  ◦ *Original*: ${video.music_info.original ? "Yes" : "No"}\n`;
    capt += `  ◦ *Duration*: ${video.music_info.duration} seconds\n`;
    capt += `  ◦ *Album*: ${video.music_info.album}\n`;
    capt += `  ◦ *play Count*: ${video.play_count}\n`;
    capt += `  ◦ *Digg Count*: ${video.digg_count}\n`;
    capt += `  ◦ *Comment Count*: ${video.comment_count}\n`;
    capt += `  ◦ *Share Count*: ${video.share_count}\n`;
    capt += `  ◦ *Download Count*: ${video.download_count}\n`;
    capt += `  ◦ *Created Time*: ${new Date(video.create_time * 1000).toUTCString()}\n`;
    capt += `  ◦ *Is Ad*: ${video.is_ad ? "Yes" : "No"}\n`;
    capt += `  ◦ *Is Top*: ${video.is_top ? "Yes" : "No"}\n`;
    capt += `  ◦ *Author:*\n`;
    capt += `  ◦ *ID*: ${video.author.id}\n`;
    capt += `  ◦ *Unique ID*: ${video.author.unique_id}\n`;
    capt += `  ◦ *Nickname*: ${video.author.nickname}\n`;
    capt += `\n`;
    conn.sendFile(m.chat, video.play, null, capt, m);
  } catch (error) {
    throw `🚩 *video Not found!*`
  }
}
handler.help = ['ttsearch'].map(v => v + ' <username>');
handler.tags = ['internet'];
handler.command = /^(tiktoksearch|ttsearch)$/i;
handler.limit = true;

}

module.exports = handler;
