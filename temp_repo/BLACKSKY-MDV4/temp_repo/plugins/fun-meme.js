const { getMessage } = require('../lib/languages');

let fetch = require('node-fetch');
let handler = async (m, { conn, text }) => {
    // Get user's preferred language
    const user = global.db.data.users[m.sender];
    const chat = global.db.data.chats[m.chat];
    const lang = user?.language || chat?.language || global.language;
 {
try { 
let img = await fetch(`https://api.betabotz.eu.org/fire/wallpaper/meme?apikey=${lann}`).then(result => result.buffer())
await conn.sendFile(m.chat, img, 'file.jpg', wm, m)
} catch (e) {
throw `Error ${eror}`
 }
}
handler.command = /^(meme)$/i
handler.tags = ['fun']
handler.help = ['meme']
handler.limit = true
}

module.exports = handler
