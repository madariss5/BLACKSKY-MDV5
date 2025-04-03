const { getMessage } = require('../lib/languages');

let buatall = 1
let handler = async (m, { conn, args, usedPrefix, isOwner }) => {
    // Get user's preferred language
    const user = global.db.data.users[m.sender];
    const chat = global.db.data.chats[m.chat];
    const lang = user?.language || chat?.language || global.language;
 {
    conn.gamble = conn.gamble ? conn.gamble : {}
    if (m.chat in conn.gamble) return conn.reply (m.chat, 'Someone is still gambling here, wait until they finish!!', m)
    else conn.gamble[m.chat] = true
    try {
        let __waktutionskh = (new Date - global.db.data.users[m.sender].judilast)
        let _waktutionskh = (5000 - __waktutionskh)
        let waktutionskh = clockString(_waktutionskh)
        if (new Date - global.db.data.users[m.sender].judilast > 5000) {
        global.db.data.users[m.sender].judilast = new Date * 1
        let randomaku = `${Math.floor(Math.random() * 350)}`.trim()
        let randomkamu = `${Math.floor(Math.random() * 50)}`.trim()                //hehe Biar Susah Menang :v
        let Aku = (randomaku * 1)
        let Kamu = (randomkamu * 1)
        let count = args[0]
        count = count ? /all/i.test(count) ? Math.floor(global.db.data.users[m.sender].money / buatall) : parseInt(count) : args[0] ? parseInt(args[0]) : 1
        count = Math.max(1, count)
        if (args.length < 1) return conn.reply(m.chat, '• *Example :* .gamble 1000', m)
        if (global.db.data.users[m.sender].money >= count * 1) {
            global.db.data.users[m.sender].money -= count * 1
            if (Aku > Kamu) {
                conn.reply(m.chat, `I roll:${Aku}\nYou roll: ${Kamu}\n\nYou *Lose*, you lost ${count} money`.trim(), m)
            } else if (Aku < Kamu) {
                global.db.data.users[m.sender].money += count * 2
                conn.reply(m.chat, `I roll:${Aku}\nYou roll: ${Kamu}\n\nYou *Win*, you got ${count * 2} money`.trim(), m)
            } else {
                global.db.data.users[m.sender].money += count * 1
                conn.reply(m.chat, `I roll:${Aku}\nYou roll: ${Kamu}\n\nIt's a *Tie*, you got ${count * 1} money`.trim(), m)
            }
        } else conn.reply(m.chat, `You don't have enough money to gamble ${count} money`.trim(), m)
      } else conn.reply(m.chat, `You've already gambled, you can't gamble again..\nPlease wait ${waktutionskh} more to gamble again `, m)
    } catch (e) {
        console.log(e)
        conn.reply(m.chat, 'Error!!', m)
   } finally {
        delete conn.gamble[m.chat]
    }
 }
handler.help = ['gamble']
handler.tags = ['rpg']
handler.command = /^(gamble)$/i
handler.group = true
handler.rpg = true

handler.fail = null

}

module.exports = handler

function pickRandom(list) {
    return list[Math.floor(Math.random() * list.length)]
}

function clockString(ms) {
  let h = Math.floor(ms / 3600000)
  let m = Math.floor(ms / 60000) % 60
  let s = Math.floor(ms / 1000) % 60
  console.log({ms,h,m,s})
  return [h, m, s].map(v => v.toString().padStart(2, 0) ).join(':')
}