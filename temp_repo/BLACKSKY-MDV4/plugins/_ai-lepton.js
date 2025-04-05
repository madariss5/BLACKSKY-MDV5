let fetch = require('node-fetch');
const { getMessage } = require('../lib/languages.js');
let handler = async (m, {
 text, 
 usedPrefix, 
 command
 }) => {
if (!text) throw `Masukkan pertanyaan!\n\n*Example:* Siapa presiden Indonesia? `
try {
  await m.reply(wait)
  let res = await (await fetch(`https://api.betabotz.eu.org/fire/search/lepton-ai?apikey=${lann}&text=${text}`)).json()
  await m.reply(res.result.result)
} catch (err) {
  console.error(err)
  throw eror
 }
}
handler.command = handler.help = ['lepton'];
handler.tags = ['ai'];
handler.premium = false
handler.limit = true;
module.exports = handler;
