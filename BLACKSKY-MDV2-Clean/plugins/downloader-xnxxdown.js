var fetch = require("node-fetch");
const { getMessage } = require('../lib/languages.js');
var handler = async (m, {
 text, 
 usedPrefix, 
 command
 }) => {
if (!text) throw 'Masukkan Query Link!'
 try {
let anu = await fetch(`https://api.betabotz.eu.org/fire/download/xnxxdl?url=${text}&apikey=${lann}`)
let result = await anu.json() 

conn.sendMessage(m.chat, { video: { url: result.result.url }, fileName: 'xnxx.mp4', mimetype: 'video/mp4' }, { quoted: m })
 } catch (e) {
 throw `*Server error!*`
 }
}
handler.command = handler.help = ['xnxxdown'];
handler.tags = ['nsfw'];
module.exports = handler;
