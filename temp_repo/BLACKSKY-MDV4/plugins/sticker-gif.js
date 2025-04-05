const { getMessage } = require('../lib/languages');

const fetch = require('node-fetch');
const uploader = require('../lib/uploadFile');

let handler = async (m, { conn, usedPrefix, command }) => {
    // Get user's preferred language
    const user = global.db.data.users[m.sender];
    const chat = global.db.data.chats[m.chat];
    const lang = user?.language || chat?.language || global.language;
 {
	let q = m.quoted ? m.quoted : m
	let mime = (q.msg || q).mimetype || q.mediaType || ''
	if (/webp/.test(mime)) {
		let buffer = await q.download()
		await m.reply(wait)
		try {
			let media = await uploader(buffer)
			let json;
			if (command === 'togif') {		
				json = await (await fetch(`https://api.betabotz.eu.org/fire/tools/webp2mp4?url=${media}&apikey=${lann}`)).json();
			} else if (command === 'toimg') {
				json = await (await fetch(`https://api.betabotz.eu.org/fire/tools/webp2png?url=${media}&apikey=${lann}`)).json();
			}
			await conn.sendFile(m.chat, json.result, null, "*DONE*", m)
		} catch (err) {
			throw err
		}
	} else {
		throw `Reply sticker with command ${usedPrefix + command}`
	}
}

handler.help = ['toimg', 'togif']
handler.tags = ['tools']
handler.command = /^(toimg|togif)$/i
handler.limit = true;

}

module.exports = handler;
