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
    conn.susun = conn.susun ? conn.susun : {}
    let id = m.chat
    if (id in conn.susun) {
        conn.reply(m.chat, "There\'s still an unanswered question in this chat", conn.susun[id][0])
        throw false
    }
    // di sini dia ngambil data dari fire
    let src = await (await fetch(`https://api.betabotz.eu.org/fire/game/susunkata?apikey=${lann}`)).json()
    let json = src[Math.floor(Math.random() * src.length)]
    // buat caption buat di tampilin di wa
    let caption = `
${json.soal}

┌─⊷ *SOAL*
▢ Tipe: ${json.tipe}
▢ Timeout *${(Timeout / 1000).toFixed(2)} seconds*
▢ Type ${usedPrefix}susn for help
▢ Bonus: ${points} money
▢ *Balas/ replay soal this untuk answer*
└──────────────
`.trim()
    conn.susun[id] = [
        await conn.reply(m.chat, caption, m),
        json, points,
        setTimeout(() => {
            if (conn.susun[id]) conn.reply(m.chat, `Time's up!\nThe answer is *${json.jawaban}*`, conn.susun[id][0])
            delete conn.susun[id]
        }, Timeout)
    ]
}
handler.help = ['susunkata']
handler.tags = ['game']
handler.command = /^susunkata/i
handler.register = false
handler.group = false

}

module.exports = handler

// tested di bileys versi 6.5.0 dan sharp versi 0.30.5
// danaputra133