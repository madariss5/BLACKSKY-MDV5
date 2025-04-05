var fetch = require("node-fetch");
const { getMessage } = require('../lib/languages.js');

var handler = async (m, { text, usedPrefix, command }) => {
  if (!text) {
    throw `Example:\n${usedPrefix + command} boobs`;
  }
  try {
  const search = await fetch(
    `https://api.betabotz.eu.org/fire/search/xnxx?query=${text}&apikey=${lann}`
  );
  const result = await search.json();
  
  let text = `*XNXX RESULTS* \n\n🔍 *KEYWORDS* *${text}*\n\n`;
  let no = 1;
  
  for (let i of result.result) {
    text += `📑 *No* : ${no++}\n📚 *Title* : ${i.title}\n⏱️ *Duration* : ${i.duration}\n🔗 *URL* ${i.link}\n\n─────────────────\n\n`;
  }
  
  await conn.sendMessage(m.chat, { react: { text: `⏱️`, key: m.key }});
  await conn.sendMessage(m.chat, { image: { url: result.result[0].thumb }, caption: text }, { quoted: m });
} catch (e) {
throw `Can't find data!`
}
 };

handler.command = ['xnxxsearch'];
handler.tags = ['nsfw'];

module.exports = handler;
