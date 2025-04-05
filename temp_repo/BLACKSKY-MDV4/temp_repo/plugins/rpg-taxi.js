const { getMessage } = require('../lib/languages');

let handler = async (m, { conn }) => {
    // Get user's preferred language
    const user = global.db.data.users[m.sender];
    const chat = global.db.data.chats[m.chat];
    const lang = user?.language || chat?.language || global.language;
 {
    let __timers = (new Date - global.db.data.users[m.sender].lasttaxi)
    let _timers = (3600000 - __timers)
    let order = global.db.data.users[m.sender].taxi
    let timers = clockString(_timers)
    let name = conn.getName(m.sender)
    let user = global.db.data.users[m.sender]
    let id = m.sender
    let kerja = 'taxi'
    conn.missions = conn.missions ? conn.missions : {}
    if (id in conn.missions) {
        conn.reply(m.chat, `Completedkan orderan taxi you ${conn.missions[id][0]} Terlebih Dahulu`, m)
        throw false
    }
    if (new Date - user.lasttaxi > 3600000) {
        let randomaku1 = Math.floor(Math.random() * 1000000)
        let randomaku2 = Math.floor(Math.random() * 10000)
        
        var njir = `
🚶⬛⬛⬛⬛⬛⬛⬛⬛⬛
⬛⬜⬜⬜⬛⬜⬜⬜⬛⬛
⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛
🏘️🏘️🏘️🏘️🌳  🌳 🏘️       🚕


✔️ Menable tokan orderan....
`.trim()

        var njirr = `
🚶⬛⬛⬛⬛⬛🚐⬛⬛⬛🚓🚚
🚖⬜⬜⬜⬛⬜⬜⬜🚓⬛🚑
⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛🚙
🏘️🏘️🏢️🌳  🌳 🏘️  🏘️🏡


🚖 Mengantar Ke tujuan.....
`.trim()

        var njirrr = `
⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛🚓
⬛⬜🚗⬜⬜⬛⬜🚐⬜⬜⬛🚙🚚🚑
⬛⬛⬛⬛🚒⬛⬛⬛⬛⬛⬛🚚
🏘️🏘️🏘️🏘️🌳  🌳 🏘️


🚖 Completed Mengantar Pelanggan....
`.trim()

        var njirrrr = `
➕ 💹Menerima gaji....
`.trim()

        var result = `
*—[ Results taxi ${name} ]—*
➕ 💹 money = [ ${randomaku1} ]
➕ ✨ Exp = [ ${randomaku2} ]
➕ 😍 Order Completed = +1
➕ 📥Total Order Senot yetnya : ${order}
`.trim()

        user.money += randomaku1
        user.exp += randomaku2
        user.taxi += 1
        
        conn.missions[id] = [
            kerja,
        setTimeout(() => {
            delete conn.missions[id]
        }, 27000)
        ]
        
        setTimeout(() => {
            m.reply(result)
        }, 27000)

        setTimeout(() => {
            m.reply(njirrrr)
        }, 25000)

        setTimeout(() => {
            m.reply(njirrr)
        }, 20000)

        setTimeout(() => {
            m.reply(njirr)
        }, 15000)

        setTimeout(() => {
            m.reply(njir)
        }, 10000)

        setTimeout(() => {
            m.reply('🔍Mencari orderan buat you.....')
        }, 0)
        user.lasttaxi = new Date * 1
    } else m.reply(`you kecapean, istirahat dulu seold ${timers}, new gas ngorder again`)
}
handler.help = ['taxi']
handler.tags = ['rpg']
handler.command = /^(taxi)$/i
handler.register = true
handler.group = true
handler.rpg = true
}

module.exports = handler;


function clockString(ms) {
    let h = Math.floor(ms / 3600000)
    let m = Math.floor(ms / 60000) % 60
    let s = Math.floor(ms / 1000) % 60
    return [h, m, s].map(v => v.toString().padStart(2, 0)).join(':')
}