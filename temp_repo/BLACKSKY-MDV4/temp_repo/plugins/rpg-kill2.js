const { getMessage } = require('../lib/languages');

// let pajak = 0.02
let handler = async (m, { conn, text, usedPrefix, command }) => {
    // Get user's preferred language
    const user = global.db.data.users[m.sender];
    const chat = global.db.data.chats[m.chat];
    const lang = user?.language || chat?.language || global.language;
    
    let dapat = (Math.floor(Math.random() * 100000))
    let healtu = (Math.floor(Math.random() * 100))
    let nomors = m.sender
    let who
    
    if (m.isGroup) who = m.mentionedJid[0]
    else who = m.chat
    
    if (!who) return conn.reply(m.chat, 'Tag wrong one lah', m)
    if (typeof db.data.users[who] == 'undefined') throw 'User not ada didalam data base'
    
    let __timers = (new Date - global.db.data.users[m.sender].lastbunuhi)
    let _timers = (3600000 - __timers) 
    let timers = clockString(_timers)
    let users = global.db.data.users
    
    if (new Date - global.db.data.users[m.sender].lastbunuhi > 3600000) {
        if (10 > users[who].healt) throw 'Target already not memiliki healt'
        if (100 > users[who].money) throw 'Target not memiliki apapun :('
        
        users[who].healt -= healtu * 1
        users[who].money -= dapat * 1
        users[m.sender].money += dapat * 1
        global.db.data.users[m.sender].lastbunuhi = new Date * 1
        
        conn.reply(m.chat, `Target Success di bunuh dan you take money target sebig\n${dapat} Money\nDarah target berlacking -${healtu} Healt`, m)
    } else {
        conn.reply(m.chat, `You have already kill2 orang dan Success sembunyi , tunggu ${timers} untuk membunuhnya again`, m)
    }
}

handler.help = ['kill2 *@user*']
handler.tags = ['rpg']
handler.command = /^kill2$/
handler.limit = true
handler.group = true
handler.rpg = true

module.exports = handler

function pickRandom(list) {
    return list[Math.floor(Math.random() * list.length)]
}

function clockString(ms) {
    let h = Math.floor(ms / 3600000)
    let m = Math.floor(ms / 60000) % 60
    let s = Math.floor(ms / 1000) % 60
    console.log({ms, h, m, s})
    return [h, m, s].map(v => v.toString().padStart(2, 0)).join(':')
}