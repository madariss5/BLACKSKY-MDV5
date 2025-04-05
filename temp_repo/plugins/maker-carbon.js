const { getMessage } = require('../lib/languages');

const fetch = require('node-fetch');

let handler = async (m, { conn, args }) => {
    // Get user's preferred language
    const user = global.db.data.users[m.sender];
    const chat = global.db.data.chats[m.chat];
    const lang = user?.language || chat?.language || global.language;
 {
   let text
    if (args.length >= 1) {
        text = args.slice(0).join(" ")
    } else if (m.quoted && m.quoted.text) {
        text = m.quoted.text
    } else throw "Input teks atau reply teks which want di jadikan carbon!"
   if (!text) return m.reply('masukan text') 
   try {
   m.reply(wait)
   let img = await fetch(`https://api.betabotz.eu.org/fire/maker/carbon?text=${text}&apikey=${lann}`).then(res => res.json());
   await conn.sendFile(m.chat, img.result, 'img.jpeg', '', m)
   } catch (e) {
   throw `${eror}`
   }
}

handler.help = ['carbon']
handler.tags = ['maker']
handler.command = /^(carbon|carbonara)$/i
handler.limit = true
}

module.exports = handler
