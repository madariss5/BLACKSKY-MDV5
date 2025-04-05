const { getMessage } = require('../lib/languages');

let timeout = 100000
let poin = 10000
let src
let handler = async (m, { conn, usedPrefix }) => {
    // Get user's preferred language
    const user = global.db.data.users[m.sender];
    const chat = global.db.data.chats[m.chat];
    const lang = user?.language || chat?.language || global.language;
 {
  conn.tebakgambar = conn.tebakgambar ? conn.tebakgambar : {}
  let id = m.chat
  if (id in conn.tebakgambar) {
    conn.reply(m.chat, "There\'s still an unanswered question in this chat", conn.tebakimage[id][0])
    throw false
  }
  if (!src) src = await (await fetch(`https://api.betabotz.eu.org/fire/game/tebakimage?apikey=${lann}`)).json()
  let json = src[Math.floor(Math.random() * src.length)]
  if (!json) throw "An error occurred, ulangi again Command!"
  let caption = `
≡ _GAME TEBAK image_

┌─⊷ *SOAL*
▢ Explanation: *${json.deskripsi}*
▢ Timeout *${(Timeout / 1000).toFixed(2)} seconds*
▢ Bonus: ${points} money
▢ Type ${usedPrefix}hint untuk clue jawaban
▢ *REPLAY* message this untuk\nanswer
└──────────────

    `.trim()
  conn.tebakimage[id] = [
    await conn.sendMessage(m.chat, { image: { url: json.img }, caption: caption}, { quoted: m }),
    json, points,
    setTimeout(() => {
      if (conn.tebakimage[id]) conn.reply(m.chat, `Time's up!\nThe answer is *${json.jawaban}*`, conn.tebakimage[id][0])
      delete conn.tebakimage[id]
    }, Timeout)
  ]
}

handler.help = ['tebakimage']
handler.tags = ['game']
handler.command = /^tebakimage/i
handler.limit = false
handler.group = true

}

module.exports = handler