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
    conn.asahotak = conn.asahotak ? conn.asahotak : {}
    let id = m.chat
    if (id in conn.asahotak) {
        conn.reply(m.chat, "There\'s still an unanswered question in this chat", conn.asahotak[id][0])
        throw false
    }
    // di sini dia ngambil data dari fire
    let src = await (await fetch(`https://api.betabotz.eu.org/fire/game/asahotak?apikey=${lann}`)).json()
    let json = src[Math.floor(Math.random() * src.length)]
    // buat caption buat di tampilin di wa
    let caption = `
${json.soal}

┌─⊷ *SOAL*
▢ Timeout *${(Timeout / 1000).toFixed(2)} seconds*
▢ Type ${usedPrefix}toka for help
▢ Bonus: ${points} money
▢ *Balas/ replay soal this untuk answer*
└──────────────
`.trim()
    conn.asahotak[id] = [
        await conn.reply(m.chat, caption, m),
        json, points,
        setTimeout(() => {
            if (conn.asahotak[id]) conn.reply(m.chat, `Time's up!\nThe answer is *${json.jawaban}*`, conn.asahotak[id][0])
            delete conn.asahotak[id]
        }, Timeout)
    ]
}
handler.help = ['asahotak']
handler.tags = ['game']
handler.command = /^asahotak/i
handler.register = false
handler.group = true

}

module.exports = handler

// tested di bileys versi 6.5.0 dan sharp versi 0.30.5
// danaputra133