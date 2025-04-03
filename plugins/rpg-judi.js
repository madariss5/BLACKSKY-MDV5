const { getMessage } = require('../lib/languages');

let buatall = 1
let handler = async (m, { conn, args, usedPrefix, isOwner }) => {
    conn.gambling = conn.gambling ? conn.gambling : {}
    if (m.chat in conn.gambling) return conn.reply (m.chat, 'Masih ada yang melakukan gambling disini, tunggu sampai selesai!!', m)
    else conn.gambling[m.chat] = true
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
        if (args.length < 1) return conn.reply(m.chat, '• *Example :* .gambling 1000', m)
        if (global.db.data.users[m.sender].money >= count * 1) {
            global.db.data.users[m.sender].money -= count * 1
            if (Aku > Kamu) {
                conn.reply(m.chat, `aku roll:${Aku}\nKamu roll: ${Kamu}\n\nkamu *Kalah*, kamu kehilangan ${count} money`.trim(), m)
            } else if (Aku < Kamu) {
                global.db.data.users[m.sender].money += count * 2
                conn.reply(m.chat, `aku roll:${Aku}\nKamu roll: ${Kamu}\n\nkamu *Menang*, kamu Mendapatkan ${count * 2} money`.trim(), m)
            } else {
                global.db.data.users[m.sender].money += count * 1
                conn.reply(m.chat, `aku roll:${Aku}\nKamu roll: ${Kamu}\n\nkamu *Seri*, kamu Mendapatkan ${count * 1} money`.trim(), m)
            }
        } else conn.reply(m.chat, `Money kamu not enough untuk melakukan gambling sebesar ${count} money`.trim(), m)
      } else conn.reply(m.chat, `Kamu sudah gambling, cannot gambling kembali..\nMohon tunggu ${waktutionskh} lagi untuk gambling kembali `, m)
    } catch (e) {
        console.log(e)
        conn.reply(m.chat, 'Error!!', m)
   } finally {
        delete conn.gambling[m.chat]
    }
 }
handler.help = ['gambling']
handler.tags = ['rpg']
handler.command = /^(gambling)$/i
handler.group = true
handler.rpg = true

handler.fail = null

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