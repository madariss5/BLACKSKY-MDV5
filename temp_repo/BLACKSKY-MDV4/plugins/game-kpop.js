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
  conn.tebakkpop = conn.tebakkpop ? conn.tebakkpop : {}
  let id = m.chat
  if (id in conn.tebakkpop) {
    conn.reply(m.chat, "There\'s still an unanswered question in this chat", conn.tebakkpop[id][0])
    throw false
  }
  if (!src) src = await (await fetch(`https://api.betabotz.eu.org/fire/game/tebakpop?apikey=${lann}`)).json()
  let json = src[Math.floor(Math.random() * src.length)]
  if (!json) throw "An error occurred, ulangi again Command!"
  let caption = `
≡ _GAME TEBAK KPOP_

┌─⊷ *SOAL*
▢ Explanation: *${json.deskripsi}*
▢ Timeout *${(Timeout / 1000).toFixed(2)} seconds*
▢ Bonus: ${points} money
▢ Type ${usedPrefix}kpp untuk clue jawaban
▢ *REPLAY* message this untuk\nanswer
└──────────────

    `.trim()
  conn.tebakkpop[id] = [
    await conn.sendMessage(m.chat, { image: { url: json.img }, caption: caption}, { quoted: m }),
    json, points,
    setTimeout(() => {
      if (conn.tebakkpop[id]) conn.reply(m.chat, `Time's up!\nThe answer is *${json.jawaban}*`, conn.tebakkpop
        
        
        [id][0])
      delete conn.tebakkpop[id]
    }, Timeout)
  ]
}

handler.help = ['tebakkpop']
handler.tags = ['game']
handler.command = /^tebakkpop/i
handler.limit = false
handler.group = true

}

module.exports = handler