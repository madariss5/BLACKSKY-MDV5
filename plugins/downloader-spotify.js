const { getMessage } = require('../lib/languages');

const fetch = require("node-fetch");

let handler = async (m, { conn, args, usedPrefix, command }) => {
    // Get user's preferred language
    const user = global.db.data.users[m.sender];
    const chat = global.db.data.chats[m.chat];
    const lang = user?.language || chat?.language || global.language;
 {
  if (!args[0]) throw `Masukkan URL!\n\nExample:\n${usedPrefix + command} https://open.spotify.com/track/3zakx7RAwdkUQlOoQ7SJRt`;
  if (!args[0].match(/spotify/gi)) throw `URL Not found!`;
  m.reply("Wait sebentar...");
		const urll = args[0];
		try {  
		const res = await fetch(`https://api.betabotz.eu.org/fire/download/spotify?url=${args[0]}&apikey=${lann}`)		
let jsons = await res.json()
const { 
thumbnail, 
title,
name,
duration,
url
} = jsons.result.data
const { 
id,
Type
} = jsons.result.data.artist
    let captionvid = ` ∘ Title: ${title}\n∘ Id: ${id}\n∘ Duration: ${duration}\n∘ Type: ${Type}`
    let message = await conn.sendMessage(m.chat, {
    text: captionvid,
    contextInfo: {
    externalAdReply: {
    title: "",
    body: "Powered by",
    thumbnailUrl: thumbnail ,
    sourceUrl: thumbnail,
    mediaType: 1,
    showAdAttribution: true,
    renderLargerThumbnail: true
    }}})
    await conn.sendMessage(m.chat, { audio: { url: url }, mimetype: 'audio/mpeg', contextInfo: {
    externalAdReply: {
    title: title,
    body: "",
    thumbnailUrl: thumbnail,
    sourceUrl: url,
    mediaType: 1,
    showAdAttribution: true,
    renderLargerThumbnail: true
    }}} , { quoted: m })
    } catch (e) {
    throw `*Server down!*`
   }
};
handler.help = ['spotify']
handler.command = /^(spotify)$/i
handler.tags = ['downloader'];
handler.limit = true;
handler.group = false;
handler.premium = false;
handler.owner = false;
handler.admin = false;
handler.botAdmin = false;
handler.fail = null;
handler.private = false;
}

module.exports = handler;
