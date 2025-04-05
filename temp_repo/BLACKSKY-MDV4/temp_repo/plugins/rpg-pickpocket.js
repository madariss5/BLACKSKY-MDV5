const { getMessage } = require('../lib/languages');

let handler = async (m, { 
conn,
usedPrefix
}) => {
    // let user = global.db.data.users[m.sender]
    // let timers1 = (new Date - user.kerjatiga)
    // let _timers = (10 - timers1)
    // let timers = clockString(_timers) 
    
    // if (user.stamina < 20) return m.reply(`stamina you not enough untuk work\nharap isi stamina you dengan ${usedPrefix}eat`)
    // if (user.kerjatiga > 10800000) return m.reply(`Kamu still ketiredan untuk work\nHarap tunggu ${timers} again untuk mencopet`)

    let __timers = (new Date - global.db.data.users[m.sender].kerjatiga)
    let _timers = (9000000 - __timers)
    let order = global.db.data.users[m.sender].ojek
    let timers = clockString(_timers) 
    let user = global.db.data.users[m.sender]
    if (new Date - global.db.data.users[m.sender].kerjatiga > 300000) {
let rndm1 = `${Math.floor(Math.random() * 10)}`
let rndm2 = `${Math.floor(Math.random() * 10)}`
.trim()

let ran1 = (rndm1 * 1000)
let ran2 = (rndm2 * 10) 

let hmsil1 = `${ran1}`
let hmsil2 = `${ran2}`

let jln = `
🚶         🚕

✔️ Mengincar target....
`

let jln2 = `
🚶     🚶

➕ Memulai aksi....
`

let jln3 = `
🚶

➕ rob....
`

let jln4 = `
         🚕
         
         
         
🚶

➕ 💹Success kabur....
`

let hsl = `
*—[ Results rob ]—*

 ➕ 💹 money = [ ${hmsil1} ]
 ➕ ✨ Exp = [ ${hmsil2} ] 		 
 ➕ 📦 pickpocket Completed = +1

Dan stamina you berlacking -20
`
user.money += ran1
user.exp += ran2
user.stamina -= 20
user.warn += 1
	
setTimeout(() => {
                     m.reply(`${hsl}`)
                     }, 27000) 
               
                     setTimeout(() => {
                     m.reply(`${jln4}`)
                      }, 25000)
                
                     setTimeout(() => {
                     m.reply(`${jln3}`)
                     }, 20000) 
                        
                     setTimeout(() => {
                     m.reply(`${jln2}`)
                     }, 15000) 
                    
                     setTimeout(() => {
                     m.reply(`${jln}`)
                     }, 10000) 
                     
                     setTimeout(() => {
                     m.reply(`🔍Mencari orang.....`)
                     }, 0) 
  user.kerjatiga = new Date * 1
                    }
                    else m.reply(`Sepertinya you already kecapekan Please istirahat dulu sekitar\n*${timers}*`)
}
handler.help = ['pickpocket']
handler.tags = ['rpg']
handler.command = /^(pickpocket)$/i
handler.group = true
handler.rpg = true
module.exports = handler

function clockString(ms) {
  let d = isNaN(ms) ? '--' : Math.floor(ms / 86400000)
  let h = isNaN(ms) ? '--' : Math.floor(ms / 3600000) % 24
  let m = isNaN(ms) ? '--' : Math.floor(ms / 60000) % 60
  let s = isNaN(ms) ? '--' : Math.floor(ms / 1000) % 60
  return ['\n' + d, ' *Days ☀️*\n ', h, ' *Hours 🕐*\n ', m, ' *Minute ⏰*\n ', s, ' *Second ⏱️* '].map(v => v.toString().padStart(2, 0)).join('')
}