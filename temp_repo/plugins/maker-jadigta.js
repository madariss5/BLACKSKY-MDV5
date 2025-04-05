const { getMessage } = require('../lib/languages');

const uploadImage = require('../lib/uploadImage');
const fetch = require("node-fetch");
let handler = async (m, { 
conn, 
usedPrefix, 
command
 }) => {
	var q = m.quoted ? m.quoted : m
	var mime = (q.msg || q).mimetype || q.mediaType || ''
	if (/image/g.test(mime) && !/webp/g.test(mime)) {
    await conn.reply(m.chat, wait, m)
		try {
			const img = await q.download?.()
			let out = await uploadImage(img)
			let old = new Date()
			let res = await fetch(`https://api.betabotz.eu.org/fire/maker/jadigta?url=${out}&apikey=${lann}`)
			let convert = await res.json()
			let buff = await fetch(convert.result)
  .then(result => result.buffer())
			await conn.sendMessage(m.chat, { image: buff, caption: `🍟 *Fetching* : ${((new Date - old) * 1)} ms` }, { quoted: m })
		} catch (e) {
			console.log(e)
			m.reply(`[ ! ] Identifikasi Failed.`)
		}
	} else {
		m.reply(`Kirim image dengan caption *${usedPrefix + command}* atau tag image which already dikirim`)
	}
};
handler.help = handler.command = ['jadigta','togta'];
handler.tags = ['maker'];
handler.premium = false;
handler.limit = true;
module.exports = handler;
