var fetch = require("node-fetch");
const { getMessage } = require('../lib/languages.js');
var handler = async (m, {
  conn,
  args,
  usedPrefix,
  command
}) => {
  await conn.sendMessage(m.chat, { react: { text: `❌`, key: m.key }});
  if (!args[0]) throw `uhm.. url nya mana?\n\nExample:\n${usedPrefix + command} https://t.me/addstickers/namapack`;
  if (!args[0].match(/(https:\/\/t.me\/addstickers\/)/gi)) throw `url wrong`;
  await conn.sendMessage(m.chat, { react: { text: `⏱️`, key: m.key }});
  var apis = await fetch(`https://api.betabotz.eu.org/fire/download/telesticker?url=${args[0]}&apikey=${lann}`);
  if (!apis.ok) throw await apis.text();
  var jsons = await apis.json();
  if (!jsons.status) throw jsons;
  var { result } = jsons;

  var totalStickers = result.length;
  var estimatedTime = totalStickers * 0.5;

  await conn.reply(m.chat, `Currently memproses ${totalStickers} sticker`, m);
  
  for (var i = 0; i < result.length; i++) {
    var url = result[i].url;
    await conn.sendImageAsSticker(m.chat, url, null, { packname: global.packname, author: global.author });
  }
  
  await conn.reply(m.chat, `Total ${totalStickers} sticker has Success dikirim`, m);
};
handler.help = ['telesticker'];
handler.command = /^(telestick|stele)$/i;
handler.tags = ['downloader'];
handler.limit = 100;
handler.fail = null;
module.exports = handler;
