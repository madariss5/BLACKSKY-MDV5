const { getMessage } = require('../lib/languages');
const { applyReplacements } = require('../lib/message-utils');
const ojekTranslations = require('../ojek-translations');

let handler = async (m, { conn }) => {
  let __timers = (new Date - global.db.data.users[m.sender].lastngojek)
  let _timers = (300000 - __timers)
  let order = global.db.data.users[m.sender].ojek
  let timers = clockString(_timers) 
  let name = conn.getName(m.sender)
  let user = global.db.data.users[m.sender]
  
  // Get user language preference or default to English
  const userLang = (user?.language || conn.language || 'en').toLowerCase();
  
  if (new Date - global.db.data.users[m.sender].lastngojek > 300000) {
      user.lastngojek = new Date * 1

      let randomaku1 = `${Math.floor(Math.random() * 10)}`
      let randomaku2 = `${Math.floor(Math.random() * 10)}`
      let randomaku4 = `${Math.floor(Math.random() * 5)}`
      let randomaku3 = `${Math.floor(Math.random() * 10)}`
      let randomaku5 = `${Math.floor(Math.random() * 10)}`

      .trim()

      let rbrb1 = (randomaku1 * 2)
      let rbrb2 = (randomaku2 * 10) 
      let rbrb3 = (randomaku3 * 1)
      let rbrb4 = (randomaku4 * 15729)
      let rbrb5 = (randomaku5 * 200)

      var zero1 = `${rbrb1}`
      var zero2 = `${rbrb2}`
      var zero3 = `${rbrb3}`
      var zero4 = `${rbrb4}`
      var zero5 = `${rbrb5}`

      // Use our translations for each message
      let arr = [
          getMessage(ojekTranslations, userLang, 'ojek_finding_customer'), 
          getMessage(ojekTranslations, userLang, 'ojek_driving'), 
          getMessage(ojekTranslations, userLang, 'ojek_arrived'), 
          getMessage(ojekTranslations, userLang, 'ojek_receiving_payment'), 
          applyReplacements(getMessage(ojekTranslations, userLang, 'ojek_results'), {
            name: name,
            money: zero4,
            exp: zero5,
            orders: order,
            wm: wm || ''
          })
      ]

      // Initial message with translation
      let { key } = await conn.sendMessage(m.chat, {
        text: getMessage(ojekTranslations, userLang, 'ojek_searching')
      })
      
      // Show each message with delay
      for (let i = 0; i < arr.length; i++) {
          await new Promise(resolve => setTimeout(resolve, 10000));
          await conn.sendMessage(m.chat, { text: arr[i], edit: key });
      }

      // Update user stats
      global.db.data.users[m.sender].money += rbrb4
      global.db.data.users[m.sender].exp += rbrb5
      global.db.data.users[m.sender].ojek += 1

  } else {
    // Show cooldown message with translation
    m.reply(applyReplacements(
      getMessage(ojekTranslations, userLang, 'ojek_tired'),
      { time: timers }
    ))
  }
}
handler.help = ['ojek']
handler.tags = ['rpg']
handler.command = /^(ojek|ngojek|gojek)$/i
handler.register = true
handler.rpg = true
module.exports = handler

function clockString(ms) {
  let h = Math.floor(ms / 3600000)
  let m = Math.floor(ms / 60000) % 60
  let s = Math.floor(ms / 1000) % 60
  console.log({ms,h,m,s})
  return [h, m, s].map(v => v.toString().padStart(2, 0) ).join(':')
}