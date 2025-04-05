const { getMessage } = require('../lib/languages');

const items = [ 'money', 'diamond', 'gold', 'diamond' ]
let handler = async (m, { conn, args, usedPrefix, command }) => {
    // Get user's preferred language
    const user = global.db.data.users[m.sender];
    const chat = global.db.data.chats[m.chat];
    const lang = user?.language || chat?.language || global.language;
 {
    conn.judipvp = conn.judipvp ? conn.judipvp : {}
    if (Object.values(conn.judipvp).find(room => room.id.startsWith('judipvp') && [room.p, room.p2].includes(m.sender))) throw 'Completedkan gamble mu which senot yetnya'
    if (Object.values(conn.judipvp).find(room => room.id.startsWith('judipvp') && [room.p, room.p2].includes(m.mentionedJid[0]))) throw `Orang which you tantang currently play judipvp bersama orang lain :(`
    let musuh = m.mentionedJid[0] ? m.mentionedJid[0] : m.quoted ? m.quoted.sender.replace(/[^0-9]/g, '') + '@s.whatsapp.net' : false
    let user = global.db.data.users
    let item = items.filter(v => v in user[m.sender] && typeof user[m.sender][v] == 'number')
    let Type = (args[0] || '').toLowerCase()
    let count = (args[1] && number(parseInt(args[1])) ? Math.max(parseInt(args[1]), 1): /all/i.test(args[1]) ? Math.floor(parseInt(user[Type])): 1) * 1
    let id = 'judipvp_' + new Date() * 1
    if (user[m.sender][Type] < count) return m.reply(`${Type} you not enough!`)
    if (!item.includes(Type)) return m.reply('Item which tersedia\n• Money\n• diamond\n• gold\n• diamond')
    if (!count || !musuh) return m.reply(`Masukan format dengan right\n\nExample :\n${usedPrefix + command} money 10000 ${m.sender.split('@')[0]}`)
    conn.judipvp[id] = {
        chat: await conn.reply(m.chat, `@${m.sender.split('@')[0]} Mengajak @${enemy.split('@')[0]} Berjudi Apakah Kamu Mau Menerimanya? (Y/N)`, m, {
            contextInfo: { mentionedJid: [m.sender, musuh] } 
        }),
        id: id,
        p: m.sender,
        p2: musuh,
        Type: Type,
        status: 'wait',
        taruhan: count,
        time: setTimeout(() => {
            if (conn.judipvp[id]) conn.reply(m.chat, `_Waktu gamble habis_`, m)
            delete conn.judipvp[id]
        }, 60000)
    }
}
handler.help = ['judipvp <Type> <count> <tag>']
handler.tags = ['rpg']
handler.command = /^(judipvp)$/i
handler.register = true
handler.group = true
handler.rpg = true
}

module.exports = handler

function number(x = 0) {
    x = parseInt(x)
    return !isNaN(x) && typeof x == 'number'
}