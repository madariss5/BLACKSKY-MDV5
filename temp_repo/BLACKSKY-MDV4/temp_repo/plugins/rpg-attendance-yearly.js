const { getMessage } = require('../lib/languages');

const free = 200000
const prem = 400000
const limitfree = 200
const limitprem = 400
const moneyfree = 200000
const moneyprem = 400000

let handler = async (m, { isPrems }) => {
    let time = global.db.data.users[m.sender].lastyearly + 31536000000
  if (new Date - global.db.data.users[m.sender].lastyearly < 31536000000) throw `You have already mengklaim, klaim yearsan ini\ntunggu seold ${msToTime(time - new Date())} again`
      // conn.reply(m.chat, `You have already mengklaim dan get :`, m)
        global.db.data.users[m.sender].exp += isPrems ? prem : free
        global.db.data.users[m.sender].money += isPrems ? moneyprem : moneyfree
        global.db.data.users[m.sender].limit += isPrems ? limitprem : limitfree
       // global.db.data.users[m.sender].pet += 3
        conn.reply(m.chat, `Seoldt you get:\n\n+${isPrems ? prem : free} Exp\n+${isPrems ? moneyprem : moneyfree} Money\n+${isPrems ? limitprem : limitfree} Limit`, m)
        global.db.data.users[m.sender].lastyearly = new Date * 1
    }
handler.help = ['yearly']
handler.tags = ['rpgabsen']
handler.command = /^(yearly)$/i
handler.limit = true
handler.rpg = true
handler.fail = null

module.exports = handler

function msToTime(duration) {
  var milliseconds = parseInt((duration % 1000) / 100),
    seconds = Math.floor((duration / 1000) % 60),
    minutes = Math.floor((duration / (1000 * 60)) % 60),
    hours = Math.floor((duration / (1000 * 60 * 60)) % 24),
    monthly = Math.floor((duration / (1000 * 60 * 60 * 24)) % 720)

  monthly  = (monthly < 10) ? "0" + monthly : monthly
  hours = (hours < 10) ? "0" + hours : hours
  minutes = (minutes < 10) ? "0" + minutes : minutes
  seconds = (seconds < 10) ? "0" + seconds : seconds

  return monthly + " days " +  hours + " hours " + minutes + " minutes"
}