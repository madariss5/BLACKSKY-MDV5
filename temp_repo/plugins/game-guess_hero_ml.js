const { getMessage } = require('../lib/languages');

let timeout = 100000
let poin = 1000
let src
let fetch = require ('node-fetch');
let handler = async (m, { conn, usedPrefix }) => {
    // Get user's preferred language
    const user = global.db.data.users[m.sender];
    const chat = global.db.data.chats[m.chat];
    const lang = user?.language || chat?.language || global.language;
 {
  conn.tebakml = conn.tebakml ? conn.tebakml : {}
  let id = m.chat
  if (id in conn.tebakml) {
    conn.reply(m.chat, 'There is still an unanswered question in this chat', conn.tebakml[id][0])
    throw false
  }
  if (!src) src = await (await fetch(`https://api.betabotz.eu.org/api/game/tebakheroml?apikey=${lann}`)).json()
  let json = src[Math.floor(Math.random() * src.length)]
  if (!json) throw "An error occurred, please try the command again!"
  let caption = `
≡ _GUESS ML HERO_

┌─⊷ *QUESTION*
▢ Description: *${json.deskripsi}*
▢ Timeout *${(timeout / 1000).toFixed(2)} seconds*
▢ Bonus: ${points} money
▢ Type ${usedPrefix}tml for answer clue
▢ *REPLY* to this message to\nanswer
└──────────────

    `.trim()
  conn.tebakml[id] = [
    await conn.sendMessage(m.chat, { image: { url: json.fullimg }, caption: caption}, { quoted: m }),
    json, poin,
    setTimeout(() => {
      if (conn.tebakml[id]) conn.reply(m.chat, `Time's up!\nThe answer is *${json.jawaban}*`, conn.tebakml[id][0])
      delete conn.tebakml[id]
    }, timeout)
  ]
}

handler.help = ['tebakml']
handler.tags = ['game']
handler.command = /^tebakml/i
handler.limit = false
handler.group = true

}

module.exports = handler