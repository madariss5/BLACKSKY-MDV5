const { getMessage } = require('../lib/languages');

let handler = async (m) => {
  let points = global.db.data.users[m.sender].points || 0
  m.reply(`points you: ${points}`)
}

handler.help = ['cekpoin']
handler.tags = ['rpg']
handler.command = /^cekpoin$/i
handler.register = true
handler.rpg = true

module.exports = handler