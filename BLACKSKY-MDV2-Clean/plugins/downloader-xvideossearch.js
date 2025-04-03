const axios = require("axios");
const { getMessage } = require('../lib/languages.js');

var handler = async (m, { text, usedPrefix, command }) => {
  if (!text) {
    throw `Example:\n${usedPrefix + command} boobs`;
  }
  try {
  const search = await axios.get(
    `https://api.betabotz.eu.org/fire/search/xvideos?query=${text}&apikey=${lann}`)

  const result = search.data.result;
  
  let text = `*XVIDEOS RESULTS* \n\n🔍 *KEYWORDS*: *${text}*\n\n`;
  let no = 1;
  
  for (let i of result) {
    text += `📑 *No* : ${no++}\n📚 *Title* : ${i.title}\n⏱️ *Duration* : ${i.duration}\n🔗 *URL* ${i.url}\n\n─────────────────\n\n`;
  }
  
  await conn.sendMessage(m.chat, { react: { text: `⏱️`, key: m.key }});
  await conn.sendMessage(m.chat, { image: { url: result[0].thumb }, caption: text }, { quoted: m });
  } catch (e) {
  throw `*Server error*`
  }
 };

handler.command = ['xvideossearch','xsearch'];
handler.tags = ['internet'];

module.exports = handler;
