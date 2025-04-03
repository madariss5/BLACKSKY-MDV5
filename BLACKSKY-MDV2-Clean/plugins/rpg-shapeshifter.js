const { getMessage } = require('../lib/languages');

let handler = async (m, { conn, args, usedPrefix }) => {
    // Get user's preferred language
    const user = global.db.data.users[m.sender];
    const chat = global.db.data.chats[m.chat];
    const lang = user?.language || chat?.language || global.language;
 {
  try {
    global.DATABASE.data.users[m.sender].lastshamanrite = global.db.data.users[m.sender].lastshamanrite || 0
    let randomaku = `${Math.floor(Math.random() * 150)}`.trim()
    let randomkamu = `${Math.floor(Math.random() * 20)}`.trim() // Increased chances of failure
    let Aku = (randomaku * 1)
    let Kamu = (randomkamu * 1)
    let temout = 'https://telegra.ph/file/d9fdd23790ab42280ca30.jpg'
    let kshamanrite = 'https://telegra.ph/file/eff11a638fed2a3260b8f.jpg'
    let mshamanrite = 'https://telegra.ph/file/a1410ce010b59486bc122.jpg'
    
    let botol = global.wm
    
    let __timers = (new Date - global.db.data.users[m.sender].lastshamanrite)
    let _timers = (18000000 - __timers) 
    let timers = clockString(_timers)
    let user = global.db.data.users[m.sender]
    if (new Date - global.db.data.users[m.sender].lastshamanrite > 18000000) { // Changed to 5 hours
      if (Aku > Kamu) {
        conn.sendMessage(m.chat, {
          text: `Kamu lengah Saat shapeshifter, Dan Kamu Mines -10 juta`,
          contextInfo: {
            externalAdReply: {
              title: 'Nooo, Kamu now memiliki forestg 10JT 😞',
              body: wm,
              thumbnailUrl: 'https://telegra.ph/file/c6c4a6946a354317fe970.jpg',
              mediaType: 1,
              showAdAttribution: true,
              renderLargerThumbnail: true
            }
          }
        })
        user.money -= 10000000 // Penalty for failed robbery is -20 million
        global.db.data.users[m.sender].lastshamanrite = new Date * 1
      } else if (Aku < Kamu) {
        user.money += 5000000 // Reward for successful robbery is 10 million
        conn.sendMessage(m.chat, {
          text: `Kamu Success shapeshifter, Dan you get 5 Juta rupiah`,
          contextInfo: {
            externalAdReply: {
              title: 'Seoldt Telah Menable tokan 5JT',
              body: wm,
              thumbnailUrl: 'https://telegra.ph/file/6a6a440d7f123bed78263.jpg',
              mediaType: 1,
              showAdAttribution: true,
              renderLargerThumbnail: true
            }
          }
        })
        global.db.data.users[m.sender].lastshamanrite = new Date * 1
      } else {
        conn.sendMessage(m.chat, `Sorry you not get *Duit* dan you not masuk Dunia Lain karna merunkan diri\n${botol}`, m)
        global.db.data.users[m.sender].lastshamanrite = new Date * 1
      }
    } else conn.sendMessage(m.chat, {
      text: `Kamu already melakukan *shapeshifter*\nDan you must wait seold agar can shapeshifter again ${timers}`,
      contextInfo: {
        externalAdReply: {
          title: 'C O O L D O W N',
          body: `${timers}`,
          thumbnailUrl: 'https://telegra.ph/file/295949ff5494f3038f48c.jpg',
          mediaType: 1,
          showAdAttribution: true,
          renderLargerThumbnail: true
        }
      }
    })
  } catch (e) {
    throw `${e}`
  }
}

handler.help = ['shapeshifter']
handler.tags = ['rpg']
handler.command = /^(shapeshifter|ngefet)$/i
handler.premium = true
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