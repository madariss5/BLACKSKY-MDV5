const { getMessage } = require('../lib/languages');

let fetch = require('node-fetch');
let timeout = 100000
let poin = 10000
let handler = async (m, { conn, command, usedPrefix }) => {
    // Get user's preferred language
    const user = global.db.data.users[m.sender];
    const chat = global.db.data.chats[m.chat];
    const lang = user?.language || chat?.language || global.language;
 {

    conn.tebaklagu = conn.tebaklagu ? conn.tebaklagu : {}
    let id = m.chat
    if (id in conn.tebaklagu) {
        conn.reply(m.chat, "There\'s still an unanswered question in this chat", conn.tebaklagu[id][0])
        throw false
    }
    let data = await (await fetch(`https://api.betabotz.eu.org/fire/game/tebaklagu?apikey=${lann}`)).json()
    let json = data[Math.floor(Math.random() * data.length)]
    let caption = `*${command.toUpperCase()}*
Penyanyi: ${json.artis}

┌─⊷ *SOAL*
▢Timeout *${(Timeout / 1000).toFixed(2)} seconds*
▢Type *${usedPrefix}lag* for help
▢Bonus: ${points} money
▢*Balas/ replay soal this untuk answer*
└──────────────
`.trim()
    conn.tebaklagu[id] = [
        await conn.reply(m.chat, caption, m),
        json, points,
        setTimeout(() => {
            if (conn.tebaklagu[id]) conn.reply(m.chat, `Time's up!\nThe answer is *${json.judul}*`, conn.tebaklagu[id][0])
            delete conn.tebaklagu[id]
        }, Timeout)
    ]
    await conn.sendFile(m.chat, json.lagu, 'tebaklagu.mp3', '', conn.tebaklagu[id][0])
   
}
handler.help = ['tebaklagu']
handler.tags = ['game']
handler.command = /^tebaklagu/i
handler.limit = true

}

module.exports = handler;