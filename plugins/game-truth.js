const { getMessage } = require('../lib/languages');

let fetch = require('node-fetch');

let handler = async (m, { conn }) => {
    // Get user's preferred language
    const user = global.db.data.users[m.sender];
    const chat = global.db.data.chats[m.chat];
    const lang = user?.language || chat?.language || global.language;
 {
	let img = 'https://i.ibb.co/305yt26/bf84f20635dedd5dde31e7e5b6983ae9.jpg'
        let truth = await fetch(`https://api.betabotz.eu.org/api/random/truth?apikey=${lann}`).then(result => result.json()) 
	conn.sendFile(m.chat, img, 'truth.png', `*TRUTH*\n\n“${truth.result}”`, m)
}
handler.help = ['truth']
handler.tags = ['fun']
handler.command = /^(truth|kebenaran|kejujuran)$/i
handler.limit = true

}

module.exports = handler
