const { getMessage } = require('../lib/languages');

let handler = async (m, { conn }) => {
    // Get user's preferred language
    const user = global.db.data.users[m.sender];
    const chat = global.db.data.chats[m.chat];
    const lang = user?.language || chat?.language || global.language;
 {
    let __timers = (new Date - global.db.data.users[m.sender].lastngewe)
    let _timers = (300000 - __timers)
    let order = global.db.data.users[m.sender].intimate
    let timers = clockString(_timers) 
let name = conn.getName(m.sender)
    let user = global.db.data.users[m.sender]
    
     if (new Date - global.db.data.users[m.sender].lastngewe > 300000) {
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
let rbrb5 = (randomaku5 * 20000)

var zero1 = `${rbrb1}`
var zero2 = `${rbrb2}`
var zero3 = `${rbrb3}`
var zero4 = `${rbrb4}`
var zero5 = `${rbrb5}`

let arr = [
"✔️ Menable tokan pelanggan....",
"🥵 Start mengocok.....",
`🥵Ahhhh, Sakitttt!! >////<
 💦Crotttt.....`,
"🥵💦💦Ahhhhhh😫",
`*—[ Results intimate ${name} ]—*
➕ 💹 money = [ ${zero4} ]
➕ ✨ Exp = [ ${zero5} ] 
➕ 📛 Warn = +1		 
➕ 😍 Order Completed = +1
➕  📥Total Order Senot yetnya : ${order}
${wm}`,
]

let { key } = await conn.sendMessage(m.chat, {text: '🔍Mencari pelanggan.....'})
for (let i = 0; i < arr.length; i++) {
  await new Promise(resolve => setTimeout(resolve, 10000));
  await conn.sendMessage(m.chat, { text: arr[i], edit: key });
}

global.db.data.users[m.sender].warn += 1
global.db.data.users[m.sender].money += rbrb4
global.db.data.users[m.sender].exp += rbrb5
global.db.data.users[m.sender].intimate += 1


  user.lastngewe = new Date * 1
    } else m.reply(`Kamu already intimate dengan seseorang cewe\nHarap tunggu ${timers} untuk again intimate`)
}
handler.help = ['intimate']
handler.tags = ['rpg']
handler.command = /^(intimate|anu)$/i
handler.register = true
handler.premium = false
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