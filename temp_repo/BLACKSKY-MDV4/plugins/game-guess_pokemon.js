const { getMessage } = require('../lib/languages');

let timeout = 100000
let poin = 10000

let handler = async (m, { conn, usedPrefix }) => {
    // Get user's preferred language
    const user = global.db.data.users[m.sender];
    const chat = global.db.data.chats[m.chat];
    const lang = user?.language || chat?.language || global.language;
 {
  conn.tebakpokemon = conn.tebakpokemon ? conn.tebakpokemon : {}
  let id = m.chat
  if (id in conn.tebakpokemon) {
    conn.reply(m.chat, "There\'s still an unanswered question in this chat", conn.tebakpokemon[id][0])
    throw false
  }
  let src = await (await fetch(`https://api.betabotz.eu.org/fire/game/tebakpokemon?apikey=${lann}`)).json()
  let json = src[Math.floor(Math.random() * src.length)]
  if (!json) throw "An error occurred, ulangi again Command!"
  let caption = `
≡ _GAME TEBAK POKEMON_

┌─⊷ *SOAL*
▢ Explanation: *${json.deskripsi}*
▢ Timeout *${(Timeout / 1000).toFixed(2)} seconds*
▢ Bonus: ${points} money
▢ Type ${usedPrefix}tebpo untuk clue jawaban
▢ *REPLAY* message this untuk\nanswer
└──────────────

    `.trim()
  conn.tebakpokemon[id] = [
    await conn.sendMessage(m.chat, { image: { url: json.img }, caption: caption}, { quoted: m }),
    json, points,
    setTimeout(() => {
      if (conn.tebakpokemon[id]) conn.reply(m.chat, `Time's up!\nThe answer is *${json.jawaban}*`, conn.tebakpokemon[id][0])
      delete conn.tebakpokemon[id]
    }, Timeout)
  ]
}

handler.help = ['tebakpokemon']
handler.tags = ['game']
handler.command = /^tebakpokemon/i
handler.limit = false
handler.group = true

}

module.exports = handler