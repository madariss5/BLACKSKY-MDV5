const { getMessage } = require('../lib/languages');

let fetch = require('node-fetch');

let timeout = 100000
let poin = 10000
let handler = async (m, { conn, usedPrefix }) => {
    // Get user's preferred language
    const user = global.db.data.users[m.sender];
    const chat = global.db.data.chats[m.chat];
    const lang = user?.language || chat?.language || global.language;
 {
    conn.tebakkode = conn.tebakkode ? conn.tebakkode : {}
    let id = m.chat
    if (id in conn.tebakkode) {
        conn.reply(m.chat, "There\'s still an unanswered question in this chat", conn.tebakkode[id][0])
        throw false
    }
    // di sini dia ngambil data dari fire
    let src = await (await fetch(`https://api.betabotz.eu.org/fire/game/tebakkode?apikey=${lann}`)).json()
    let json = src[Math.floor(Math.random() * src.length)]
    // buat caption buat di tampilin di wa
    let options = json.pilihan.map((opt, i) => `${String.fromCharCode(65 + i)}. ${opt}`).join('\n')
    let caption = `
${json.soal}

${options}

┌─⊷ *SOAL*
▢ Bahasa: *${json.bahasa}*
▢ Timeout *${(Timeout / 1000).toFixed(2)} seconds*
▢ Bonus: ${points} money
▢ Type ${usedPrefix}kdo untuk clue jawaban
▢ *Balas/ replay soal this untuk answer dengan a, b, c, atau d*
└──────────────
`.trim()
    conn.tebakkode[id] = [
        await conn.reply(m.chat, caption, m),
        json, points,
        setTimeout(() => {
            if (conn.tebakkode[id]) {
                conn.reply(m.chat, `Time's up!\nThe answer is *${json.jawaban}*`, conn.tebakkode[id][0])
                delete conn.tebakkode[id] // Autodeadcally delete the question
            }
        }, Timeout)
    ]
}
handler.help = ['tebakkode']
handler.tags = ['game']
handler.command = /^tebakkode/i
handler.register = false
handler.group = true

}

module.exports = handler

// tested di bileys versi 6.5.0 dan sharp versi 0.30.5
// danaputra133