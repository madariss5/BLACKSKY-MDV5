const { getMessage } = require('../lib/languages');

let poin = 10000

const threshold = 0.72
let handler = m => m
handler.before = async function (m) {
  let id = m.chat
  let users = global.db.data.users[m.sender]
  if (!m.quoted || !m.quoted.fromMe || !m.quoted.isBaileys || !/Type.*hint/i.test(m.quoted.text)) return !0
  this.tebakgambar = this.tebakgambar ? this.tebakgambar : {}
  if (!(id in this.tebakgambar)) return m.reply('Soal that has berakhir')
  if (m.quoted.id == this.tebakgambar[id][0].id) {
    let json = JSON.parse(JSON.stringify(this.tebakgambar[id][1]))
    // m.reply(JSON.stringify(json, null, '\t'))
    if (m.text.toLowerCase() == json.jawaban.toLowerCase().trim()) {
      global.db.data.users[m.sender].exp += this.tebakgambar[id][2]
      global.db.data.users[m.sender].ticketcoin += 1
      users.money += poin
      m.reply(`*Benar!*\n+${this.tebakgambar[id][2]} money`)
      clearTimeout(this.tebakgambar[id][3])
      delete this.tebakgambar[id]
    } else if ((m.text.toLowerCase(), json.jawaban.toLowerCase().trim()) >= threshold) m.reply(`*Dikit Lagi!*`)
    else m.reply(`*Salah!*`)
  }
  return !0
}
handler.exp = 0

module.exports = handler