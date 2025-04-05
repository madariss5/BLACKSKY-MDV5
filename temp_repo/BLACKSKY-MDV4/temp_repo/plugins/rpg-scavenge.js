const { getMessage } = require('../lib/languages');

const Timeout = 28800000

let handler = async (m, { conn, usedPrefix, text }) => {
    // Get user's preferred language
    const user = global.db.data.users[m.sender];
    const chat = global.db.data.chats[m.chat];
    const lang = user?.language || chat?.language || global.language;
 {
            let time = global.db.data.users[m.sender].lastturu + 28800000
  if (new Date - global.db.data.users[m.sender].lastturu< 28800000) throw `You have already scavenged\nPlease wait ${msToTime(time - new Date())} to scavenge again`
    let botolnye = `${Math.floor(Math.random() * 1000)}`.trim()
        let kalengnye = `${Math.floor(Math.random() * 1000)}`.trim()
        let kardusnye = `${Math.floor(Math.random() * 1000)}`.trim()
        global.db.data.users[m.sender].botol += botolnye * 1
        global.db.data.users[m.sender].kaleng += kalengnye * 1
        global.db.data.users[m.sender].kardus += kardusnye * 1
        global.db.data.users[m.sender].lastturu = new Date * 1
  conn.reply(m.chat, `Congratulations, you obtained: \n+${botolnye} Bottles\n+${kardusnye} Cardboard boxes\n+${kalengnye} Cans`, m)
}
handler.help = ['scavenge']
handler.tags = ['rpg']
handler.command = /^(scavenge)/i
handler.group = true

handler.fail = null
handler.limit = true
handler.exp = 0
handler.money = 0
handler.rpg = true
}

module.exports = handler

function msToTime(duration) {
  var milliseconds = parseInt((duration % 1000) / 100),
    seconds = Math.floor((duration / 1000) % 60),
    minutes = Math.floor((duration / (1000 * 60)) % 60),
    hours = Math.floor((duration / (1000 * 60 * 60)) % 24)
    
  
  hours = (hours < 10) ? "0" + hours : hours
  minutes = (minutes < 10) ? "0" + minutes : minutes
  seconds = (seconds < 10) ? "0" + seconds : seconds

  return hours + " hours " + minutes + " minutes " + seconds + " seconds"
}