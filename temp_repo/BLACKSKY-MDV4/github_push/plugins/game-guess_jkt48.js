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
  conn.tebakjkt = conn.tebakjkt ? conn.tebakjkt : {}
  let id = m.chat
  if (id in conn.tebakjkt) {
    conn.reply(m.chat, 'There is still an unanswered question in this chat', conn.tebakjkt[id][0])
    throw false
  }
  if (!src) src = await (await fetch(`https://api.betabotz.eu.org/api/game/tebakjkt48?apikey=${lann}`)).json()
  let json = src[Math.floor(Math.random() * src.length)]
  if (!json) throw "An error occurred, please try the command again!"
  let caption = `
≡ _GUESS THE PICTURE GAME_

┌─⊷ *QUESTION*
▢ Timeout *${(timeout / 1000).toFixed(2)} seconds*
▢ Bonus: ${points} money
▢ Type ${usedPrefix}jkcu for answer clue
▢ *REPLY* to this message to\nanswer
└──────────────

    `.trim()
  conn.tebakjkt[id] = [
    await conn.sendMessage(m.chat, { image: { url: json.img }, caption: caption}, { quoted: m }),
    json, poin,
    setTimeout(() => {
      if (conn.tebakjkt[id]) conn.reply(m.chat, `Time's up!\nThe answer is *${json.answer}*`, conn.tebakjkt[id][0])
      delete conn.tebakjkt[id]
    }, timeout)
  ]
}

handler.help = ['tebakjkt']
handler.tags = ['game']
handler.command = /^tebakjkt/i
handler.limit = false
handler.group = true

}

module.exports = handler