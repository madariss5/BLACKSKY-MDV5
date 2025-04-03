const { getMessage } = require('../lib/languages');

let fetch = require('node-fetch');

let timeout = 100000
let poin = 500
let handler = async (m, { conn, usedPrefix }) => {
    // Get user's preferred language
    const user = global.db.data.users[m.sender];
    const chat = global.db.data.chats[m.chat];
    const lang = user?.language || chat?.language || global.language;
 {
    conn.tebakbendera2 = conn.tebakbendera2 ? conn.tebakbendera2 : {}
    let id = m.chat
    if (id in conn.tebakbendera2) {
        conn.reply(m.chat, getMessage('guess_flag_ongoing', lang), conn.tebakbendera2[id][0])
        throw false
    }
    // Get data from API
    let src = await (await fetch(`https://api.betabotz.eu.org/api/game/tebakbendera?apikey=${lann}`)).json()
    let json = src[Math.floor(Math.random() * src.length)]
    // Create caption for display
    let caption = getMessage('guess_flag_caption', lang, {
        flag: json.bendera,
        time: (timeout / 1000).toFixed(2),
        prefix: usedPrefix,
        points: poin
    }).trim()
    
    conn.tebakbendera2[id] = [
        await conn.reply(m.chat, caption, m),
        json, poin,
        setTimeout(() => {
            if (conn.tebakbendera2[id]) conn.reply(m.chat, getMessage('guess_flag_timeout', lang, {
                answer: json.nama
            }), conn.tebakbendera2[id][0])
            delete conn.tebakbendera2[id]
        }, timeout)
    ]
}
handler.help = ['tebakbendera']
handler.tags = ['game']
handler.command = /^tebakbendera/i
handler.register = false
handler.group = true

}

module.exports = handler

// tested di bileys versi 6.5.0 dan sharp versi 0.30.5
// danaputra133