const { getMessage } = require('../lib/languages');

let fs = require('fs');
let fetch = require('node-fetch');

let timeout = 100000
let poin = 10000
let handler = async (m, { conn, usedPrefix }) => {
    // Get user's preferred language
    const user = global.db.data.users[m.sender];
    const chat = global.db.data.chats[m.chat];
    const lang = user?.language || chat?.language || global.language;
 {
    conn.tekateki = conn.tekateki ? conn.tekateki : {}
    let id = m.chat
    if (id in conn.tekateki) {
        if (conn.tekateki[id].length !== 0) return conn.reply(m.chat, "There\'s still an unanswered question in this chat", conn.tekateki[id][0])
        delete conn.tekateki[id]
        throw false
    }
    conn.tekateki[id] = []
    let src = await (await fetch(`https://api.betabotz.eu.org/fire/game/tekateki?apikey=${lann}`)).json()
    let json = src[Math.floor(Math.random() * src.length)]

    let caption = `
*TEKA TEKI*

${json.data.pertanyaan}
┌─⊷ *SOAL*
▢ Waktu jawab *${(Timeout / 1000).toFixed(2)} seconds*
▢ Bonus: ${points} money
▢ Help ${usedPrefix}tete
▢ *Balas/ replay soal this untuk answer*
└──────────────
`.trim()
conn.tekateki[id] = [
    await conn.reply(m.chat, caption, m),
    json, points,
    setTimeout(() => {
        if (conn.tekateki[id]) conn.reply(m.chat, `Time's up!\nThe answer is *${json.data.jawaban}*`, conn.tekateki[id][0])
        delete conn.tekateki[id]
    }, Timeout)
]
}
handler.help = ['tekateki']
handler.tags = ['game']
handler.command = /^tekateki/i
handler.group = true

}

module.exports = handler