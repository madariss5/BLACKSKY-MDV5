const { getMessage } = require('../lib/languages');

let handler = async (m, { conn, command }) => {
    // Get user's preferred language
    const user = global.db.data.users[m.sender];
    const chat = global.db.data.chats[m.chat];
    const lang = user?.language || chat?.language || global.language;
 {
    let user = global.db.data.users[m.sender]
    let randomaku = Math.floor(Math.random() * 150)
    let randomkamu = Math.floor(Math.random() * 75) //biar sering ke tangkap wkwk
    let __timers = (new Date - user.lastassistance)
    let _timers = (3600000 - __timers) 
    let timers = clockString(_timers)
    if (user.money < 5000000) return m.reply(`money Anda Harus Diatas 5Juta Untuk Menggunwill Command Ini`)
    if (new Date - user.lastassistance > 300000) {
      if (randomaku > randomkamu) {
        conn.sendFile(m.chat, 'https://telegra.ph/file/afcf9a7f4e713591080b5.jpg', 'korupsi.jpg', `Kamu Tertangkap Sehas Kamu korupsi dana assistance🕴️💰,  Dan Kamu must membayar denda 5 Juta rupiah💵`, m)
        user.money -= 5000000
        user.lastassistance = new Date * 1
      } else if (randomaku < randomkamu) {
        user.money += 5000000
        conn.sendFile(m.chat, 'https://telegra.ph/file/d31fcc46b09ce7bf236a7.jpg', 'korupsi.jpg', `Kamu Success  korupsi dana assistance🕴️💰,  Dan Kamu get 5 Juta rupiah💵`, m)
        user.lastassistance = new Date * 1
      } else {
        m.reply(`Sorry Gan Lu g Success Korupsi assistance Dan Tidak masuk jail karna Kamu *merunkan diri🏃*`)
        user.lastassistance = new Date * 1
      }
    } else m.reply(`Please Menunggu ${timers} Untuk ${command} Lagi`)
}

handler.help = ['korupsi']
handler.tags = ['rpg']
handler.command = /^(assistance|korupsi)$/i
handler.register = true
handler.group = true
handler.rpg = true

}

module.exports = handler

function pickRandom(list) {
    return list[Math.floor(Math.random() * list.length)]
}

function clockString(ms) {
  let h = Math.floor(ms / 3600000)
  let m = Math.floor(ms / 60000) % 60
  let s = Math.floor(ms / 1000) % 60
  return [h, m, s].map(v => v.toString().padStart(2, 0) ).join(':')
}