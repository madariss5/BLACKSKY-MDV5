const { getMessage } = require('../lib/languages');

let handler = async (m, { conn }) => {
    // Get user's preferred language
    const user = global.db.data.users[m.sender];
    const chat = global.db.data.chats[m.chat];
    const lang = user?.language || chat?.language || global.language;
 {
    let __timers = (new Date() - (global.db.data.users[m.sender].lastngewe || 0))
    let _timers = (7200000 - __timers) // 2 hours dalam miliseconds
    let timers = _timers >= 0 ? clockString(_timers) : "waktu already habis"
    let name = conn.getName(m.sender)
    let user = global.db.data.users[m.sender]
    let id = m.sender
    let kerja = 'ewe-force'
    conn.missions = conn.missions ? conn.missions : {}
    if (id in conn.missions) {
        conn.reply(m.chat, `Completedkan missions ${conn.missions[id][0]} Terlebih Dahulu`, m)
        throw false
    }
    if (new Date() - user.lastngewe > 7200000 || !user.lastngewe) { // Ubah kondisi cooldown
        let randomaku1 = Math.floor(Math.random() * 1000000)
        let randomaku2 = Math.floor(Math.random() * 10000)
        
        var dimas = `
👙 you force
     dia buka clothes🤭
`.trim()

        var dimas2 = `
🥵💦 sszz Ahhhh.....
`.trim()

        var dimas3 = `
🥵Ahhhh, Sakitttt!! >////<
 💦Crotttt.....
  💦Crottt again
`.trim()

        var dimas4 = `
🥵💦💦Ahhhhhh😫
`.trim()

        var hsl = `
*—[ Results Ewe force ${name} ]—*
➤ 💰 money = [ ${randomaku1} ]
➤ ✨ Exp = [ ${randomaku2} ]
➤ 😍 Order Completed = +1
`.trim()

        user.money += randomaku1
        user.exp += randomaku2
        
        conn.missions[id] = [
            kerja,
        setTimeout(() => {
            delete conn.missions[id]
        }, 27000)
        ]
        
        setTimeout(() => {
            m.reply(hsl)
        }, 27000)

        setTimeout(() => {
            m.reply(dimas4)
        }, 25000)

        setTimeout(() => {
            m.reply(dimas3)
        }, 20000)

        setTimeout(() => {
            m.reply(dimas2)
        }, 15000)

        setTimeout(() => {
            m.reply(dimas)
        }, 10000)

        setTimeout(() => {
            m.reply('🤭mulai ewe force..')
        }, 0)
        
        setTimeout(() => {
            m.reply(`⏳ Waktu untuk *Ewe-force* seContinuenya already tiba! Use *ewe-force* now untuk get lebih many reward!`)
        }, _timers)
        
        user.lastngewe = new Date() * 1
    } else m.reply(`Please Menunggu Seold ${timers} again untuk melakukan *Ewe-force* again`)
}

handler.help = ['ewe-force @tag']
handler.tags = ['rpg']
handler.command = /^(ewe-force)$/i
handler.register = true
handler.group = true
handler.rpg = true
}

module.exports = handler 

function clockString(ms) {
    let h = Math.floor(ms / 3600000)
    let m = Math.floor(ms / 60000) % 60
    let s = Math.floor(ms / 1000) % 60
    let result = []
    if (h > 0) result.push(`${h} hours`)
    if (m > 0) result.push(`${m} minutes`)
    if (s > 0) result.push(`${s} seconds`)
    if (result.length === 0) result.push('lacking dari 1 seconds')
    return result.join(' ')
}