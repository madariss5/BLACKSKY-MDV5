const { getMessage } = require('../lib/languages');

let timeout = 100000
let poin = 10000
let fetch = require('node-fetch')
let handler = async (m, { conn, usedPrefix }) => {
    // Get user's preferred language
    const user = global.db.data.users[m.sender];
    const chat = global.db.data.chats[m.chat];
    const lang = user?.language || chat?.language || global.language;
 {
  conn.tebakgenshin = conn.tebakgenshin ? conn.tebakgenshin : {}
  let id = m.chat
  if (id in conn.tebakgenshin) {
    conn.reply(m.chat, "There\'s still an unanswered question in this chat", conn.tebakgenshin[id][0])
    throw false
  }
  let src = await (await fetch(`https://api.betabotz.eu.org/fire/game/tebak-genshin?apikey=${lann}`)).json()
  let json = src[Math.floor(Math.random() * src.length)]
  if (!json) throw "An error occurred, ulangi again Command!"
  let caption = `
≡ _GAME TEBAK GENSHIN_

┌─⊷ *SOAL*
▢ Explanation: *${json.deskripsi}*
▢ Timeout *${(Timeout / 1000).toFixed(2)} seconds*
▢ Bonus: ${points} money
▢ Type ${usedPrefix}gca untuk clue jawaban
▢ *REPLAY* message this untuk\nanswer
└──────────────

    `.trim()
  conn.tebakgenshin[id] = [
    await conn.sendMessage(m.chat, { image: { url: json.img }, caption: caption}, { quoted: m }),
    json, points,
    setTimeout(() => {
      if (conn.tebakgenshin[id]) conn.reply(m.chat, `Time's up!\nThe answer is *${json.jawaban}*`, conn.tebakgenshin[id][0])
      delete conn.tebakgenshin[id]
    }, Timeout)
  ]
}

handler.help = ['tebakgenshin']
handler.tags = ['game']
handler.command = /^tebakgenshin/i
handler.limit = false
handler.group = true

}

module.exports = handler
