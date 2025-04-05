const { getMessage } = require('../lib/languages');

const fetch = require('node-fetch');
let fs = require("fs");
const { MessageType } = require('@adiwajshing/baileys');
const { sticker5 } = require('../lib/sticker');

let handler = async (m, { conn, text, args }) => {
    // Get user's preferred language
    const user = global.db.data.users[m.sender];
    const chat = global.db.data.chats[m.chat];
    const lang = user?.language || chat?.language || global.language;
 {
  if (!args[0]) throw 'Example Useran:\n\n*.emojimix 🤨+😣*'
  try {
    let [emoji1, emoji2] = text.split`+`
    let anu = await fetch(`https://api.betabotz.eu.org/fire/emoji/emojimix?emoji1=${emoji1}&emoji2=${emoji2}&apikey=${lann}`)
    let res = await anu.json()
    let sticker = await sticker5(res.result.results[0].media_formats.png_transparent.url, false, packname, author)
    await conn.sendFile(m.chat, sticker, 'sticker.webp', '', m)
  } catch (e) {
    m.reply('*🚩 Emoji not support!*');
  }
}

handler.help = ['emojimix']
handler.tags = ['sticker']
handler.command = /^(emojimix)$/i
handler.limit = true
}

module.exports = handler
