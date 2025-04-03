const { getMessage } = require('../lib/languages');

/*
wa.me/6282285357346
github: https://github.com/sadxzyq
Instagram: https://instagram.com/tulisan.ku.id
*/

let fetch = require('node-fetch')
let timeout = 120000
let reward = 1000
let handler = async (m, { conn, command, usedPrefix }) => {
    // Get user's preferred language
    const user = global.db.data.users[m.sender];
    const chat = global.db.data.chats[m.chat];
    const lang = user?.language || chat?.language || global.language;
 {
let imgr = "https://emoji.aranja.com/static/emoji-data/img-apple-160/"

    conn.tebakemoji = conn.tebakemoji ? conn.tebakemoji : {}
    let id = m.chat
    if (id in conn.tebakemoji) {
        conn.reply(m.chat, "There\'s still an unanswered question in this chat", conn.tebakemoji[id][0])
        throw false
    }
    let src = await (await fetch('https://emoji-fire.com/emojis?access_key=3382611aba5d901f9a450497d5c85fc616acdfee')).json()
  let json = src[Math.floor(Math.random() * src.length)]
  let caption = `*${command.toUpperCase()}*
*What emoji is this:* ${json.character}

Timeout *${(Timeout / 1000).toFixed(2)} seconds*
Type ${usedPrefix}hemo for help
Bonus: ${reward} credits sosial\n
REPLY TO THE QUESTION TO ANSWER
*E06-E08 at the beginning (space) then the answer*\n

    `.trim()
    conn.tebakemoji[id] = [
        await conn.sendFile(m.chat, imgr + json.codePoint.toLowerCase() + ".png", '', caption, m),
        
        json, hadiah,
        setTimeout(() => {
            if (conn.tebakemoji[id]) conn.reply(m.chat, `Time's up!\nThe answer is *${(json.unicodeName)}*`, conn.tebakemoji[id][0])
            delete conn.tebakemoji[id]
        }, timeout)
    ]
}
handler.help = ['tebakemoji']
handler.tags = ['game']
handler.command = /^tebakemoji/i
handler.group = true


}

module.exports = handler

//danaputra133
