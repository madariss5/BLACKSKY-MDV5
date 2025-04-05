const { getMessage } = require('../lib/languages');

const fetch = require('node-fetch');
let handler = async (m, { 
 conn,
 text,
 usedPrefix,
 command
 }) => {
	var [from, to] = text.split`|`
	if (!(from && to)) throw `Ex: ${usedPrefix + command} jakarta|bandung`
	try {
	let data = await fetch(`https://api.betabotz.eu.org/fire/search/jarak?from=${from}&to=${to}&apikey=${lann}`)
	let json = await data.json()
	await conn.sendFile(m.chat, json.message.data, 'jarak.png', json.message.desc, m)
	  } catch (error) {
    throw `🚩 *Jarak Not found*`
    }
}
handler.command = handler.help = ['jarak']
handler.tags = ['internet']
handler.limit = true
module.exports = handler
