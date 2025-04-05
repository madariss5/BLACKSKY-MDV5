const { getMessage } = require('../lib/languages');

let fs = require('fs');
let path = require('path');

let timeout = 100000
let poin = 10000
let handler = async (m, { conn, usedPrefix }) => {
    // Get user's preferred language
    const user = global.db.data.users[m.sender];
    const chat = global.db.data.chats[m.chat];
    const lang = user?.language || chat?.language || global.language;
 {
    conn.tebakislami = conn.tebakislami ? conn.tebakislami : {}
    let id = m.chat
    if (id in conn.tebakislami) {
        conn.reply(m.chat, "There\'s still an unanswered question in this chat", conn.tebakislami[id][0])
        throw false
    }
    // di sini dia ngambil data dari file JSON
    let data = await (await fetch(`https://api.betabotz.eu.org/fire/game/kuisislami?apikey=${lann}`)).json()
    let json = data[Math.floor(Math.random() * data.length)]
    // buat caption buat di tampilin di wa
    let options = json.pilihan.map((opt, i) => `${String.fromCharCode(65 + i)}. ${opt}`).join('\n')
    let caption = `
${json.soal}

${options}

┌─⊷ *SOAL*
▢ Timeout *${(Timeout / 1000).toFixed(2)} seconds*
▢ Bonus: ${points} money
▢ Type ${usedPrefix}tsa untuk clue jawaban
▢ *Balas/ replay soal this untuk answer dengan a, b, c, atau d*
└──────────────
`.trim()
    conn.tebakislami[id] = [
        await conn.reply(m.chat, caption, m),
        json, points,
        setTimeout(() => {
            if (conn.tebakislami[id]) {
                conn.reply(m.chat, `Time's up!\nThe answer is *${json.jawaban}*`, conn.tebakislami[id][0])
                delete conn.tebakislami[id] // Autodeadcally delete the question
            }
        }, Timeout)
    ]
}
handler.help = ['tebakislami']
handler.tags = ['game']
handler.command = /^tebakislami/i
handler.register = false
handler.group = true

}

module.exports = handler
