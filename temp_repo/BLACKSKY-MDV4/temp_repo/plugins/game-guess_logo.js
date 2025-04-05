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
  conn.tebaklogo = conn.tebaklogo ? conn.tebaklogo : {}
  let id = m.chat
  if (id in conn.tebaklogo) {
    conn.reply(m.chat, "There\'s still an unanswered question in this chat", conn.tebaklogo[id][0])
    throw false
  }
  if (!src) src = await (await fetch(`https://api.betabotz.eu.org/fire/game/tebaklogo?apikey=${lann}`)).json()
  let json = src[Math.floor(Math.random() * src.length)]
  if (!json) throw "An error occurred, ulangi again Command!"
  let caption = `
≡ _GAME TEBAK LOGO_

┌─⊷ *SOAL*
▢ Explanation: *${json.deskripsi}*
▢ Timeout *${(Timeout / 1000).toFixed(2)} seconds*
▢ Bonus: ${points} money
▢ Type ${usedPrefix}lgo untuk clue jawaban
▢ *REPLAY* message this untuk\nanswer
└──────────────

    `.trim()
  conn.tebaklogo[id] = [
    await conn.sendMessage(m.chat, { image: { url: json.img }, caption: caption}, { quoted: m }),
    json, points,
    setTimeout(() => {
      if (conn.tebaklogo[id]) conn.reply(m.chat, `Time's up!\nThe answer is *${json.jawaban}*`, conn.tebaklogo
        
        
        [id][0])
      delete conn.tebaklogo[id]
    }, Timeout)
  ]
}

handler.help = ['tebaklogo']
handler.tags = ['game']
handler.command = /^tebaklogo/i
handler.limit = false
handler.group = true

}

module.exports = handler