const { getMessage } = require('../lib/languages');

let handler = async (m, { conn }) => {
    // Get user's preferred language
    const user = global.db.data.users[m.sender];
    const chat = global.db.data.chats[m.chat];
    const lang = user?.language || chat?.language || global.language;
 {
  let __timers = (new Date - global.db.data.users[m.sender].lastnambang)
  let _timers = (300000 - __timers)
  let timers = clockString(_timers) 
  let name = conn.getName(m.sender)
  let user = global.db.data.users[m.sender]
  
  if (new Date - global.db.data.users[m.sender].lastnambang > 300000) {
      user.lastnambang = new Date * 1

      let randomaku1 = `${Math.floor(Math.random() * 10)}`
      let randomaku2 = `${Math.floor(Math.random() * 10)}`
      let randomaku4 = `${Math.floor(Math.random() * 5)}`
      let randomaku3 = `${Math.floor(Math.random() * 10)}`
      let randomaku5 = `${Math.floor(Math.random() * 10)}`

      .trim()

      let rbrb1 = (randomaku1 * 2)
      let rbrb2 = (randomaku2 * 1) 
      let rbrb3 = (randomaku3 * 1)
      let rbrb4 = (randomaku4 * 15768)
      let rbrb5 = (randomaku5 * 1)

      var zero1 = `${rbrb1}`
      var zero2 = `${rbrb2}`
      var zero3 = `${rbrb3}`
      var zero4 = `${rbrb4}`
      var zero5 = `${rbrb5}`

      let arr = [
          `Searching deeper...`, 
          `⛏️⛏️🪨💎🪨🪨🪨🪨🪨
          🪨⬜⬜⬜🪨⬜⬜⬜🪨🪨
          🪨🪨🪨🪨🪨🪨🪨🪨🪨🪨
          🪨🪨🪨⛏️⛏️🪙  🪙 🪨       \n\n\n➕ Starting to mine....`, 
          `🪨🪨🪨🪨🪨🪨🪨🪨🪨
          💎⛏️⛏️🪨🪨⬜⬜⬜🪨🪨
          🪨🪨🪨🪨🪨🪨🪨⛏️🪨🪨
          🪨🪨⛏️⛏️🪙  🪙 🪨       \n\n\n➕ You are mining...`, 
          `➕ 💹 Calculating mining results....`, 
          `*—[ Mining Results for ${name} ]—*
          ➕ 🪨 Coal = [ ${zero5} ]
          ➕ ✨ Gold = [ ${zero4} ] 
          ➕ ✨ Diamond = [ ${zero3} ]  
          ${wm}`
      ]

      let { key } = await conn.sendMessage(m.chat, {text: 'Searching for mining location...'})
      for (let i = 0; i < arr.length; i++) {
          await new Promise(resolve => setTimeout(resolve, 10000));
          await conn.sendMessage(m.chat, { text: arr[i], edit: key });
      }

      global.db.data.users[m.sender].coal += rbrb5
      global.db.data.users[m.sender].gold += rbrb4 
      global.db.data.users[m.sender].diamond += rbrb3
      global.db.data.users[m.sender].tiketcoin += 1

  } else m.reply(`It seems you're already tired from mining... Please rest for about\n*${timers}*`)
}
handler.help = ['mine']
handler.tags = ['rpg']
handler.command = /^(mine)$/i
handler.register = true
handler.rpg = true
}

module.exports = handler

function clockString(ms) {
  let h = Math.floor(ms / 3600000)
  let m = Math.floor(ms / 60000) % 60
  let s = Math.floor(ms / 1000) % 60
  console.log({ms,h,m,s})
  return [h, m, s].map(v => v.toString().padStart(2, 0) ).join(':')
}