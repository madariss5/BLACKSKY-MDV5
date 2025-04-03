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
    conn.kimia = conn.kimia ? conn.kimia : {}
    let id = m.chat
    if (id in conn.kimia) {
        conn.reply(m.chat, "There\'s still an unanswered question in this chat", conn.kimia[id][0])
        throw false
    }
    // di sini dia ngambil data dari fire
    let src = await (await fetch(`https://api.betabotz.eu.org/fire/game/tebakkimia?apikey=${lann}`)).json()
    let json = src[Math.floor(Math.random() * src.length)]
    // buat caption buat di tampilin di wa
    let caption = `
*${json.nama}*

┌─⊷ *SOAL*
▢ Apa rumus kimia dari zat kimia/ sehealth di atas?
▢ Timeout *${(Timeout / 1000).toFixed(2)} seconds*
▢ Type ${usedPrefix}kmi for help
▢ Bonus: ${points} money
▢ *Balas/ replay soal this untuk answer*
└──────────────
`.trim()
    conn.kimia[id] = [
        await conn.reply(m.chat, caption, m),
        json, points,
        setTimeout(() => {
            if (conn.kimia[id]) conn.reply(m.chat, `Time's up!\nThe answer is *${json.lambang}*`, conn.kimia[id][0])
            delete conn.kimia[id]
        }, Timeout)
    ]
}
handler.help = ['tebakkimia']
handler.tags = ['game']
handler.command = /^tebakkimia/i
handler.register = false
handler.group = false

}

module.exports = handler

// tested di bileys versi 6.5.0 dan sharp versi 0.30.5
// danaputra133