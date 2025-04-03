const { getMessage } = require('../lib/languages');

const Timeout = 604800000

let handler = async (m, { conn, usedPrefix, text }) => {
    // Get user's preferred language
    const user = global.db.data.users[m.sender];
    const chat = global.db.data.chats[m.chat];
    const lang = user?.language || chat?.language || global.language;
 {
            let time = global.db.data.users[m.sender].lastkill + 604800000
  if (new Date - global.db.data.users[m.sender].lastkill< 604800000) return conn.reply(m.chat, `You have already menggunwill kill\nWait for ${msToTime(time - new Date())} again`, m)
 let nabung = global.db.data.users[m.sender].nabung += 100000
let bank = global.db.data.users[m.sender].bank += 1000000
        let money = `${Math.floor(Math.random() * 30000)}`.trim()
        let exp = `${Math.floor(Math.random() * 999)}`.trim()
        let kardus = `${Math.floor(Math.random() * 1000)}`.trim()
        global.db.data.users[m.sender].money += money * 1
        global.db.data.users[m.sender].exp += exp * 1
        global.db.data.users[m.sender].kardus += kardus * 1
        global.db.data.users[m.sender].lastkill = new Date * 1
  conn.reply(m.chat, `Seoldt you get : \n+${money} Money\n+${kardus} Kardus\n+${exp} Exp\n+${bank} bank\n+${nabung} Nabung`, m)
}
handler.help = ['rpgkill']
handler.tags = ['rpg']
handler.command = /^(rpgkill)/i
handler.owner = false
handler.mods = false
handler.premium = false
handler.group = false
handler.private = false

handler.admin = false
handler.botAdmin = false
handler.rpg = true

handler.fail = null
handler.limit = false
handler.exp = 0
handler.money = 0

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