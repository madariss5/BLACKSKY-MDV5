const { getMessage } = require('../lib/languages');

let handler = async (m, { args }) => {
  if (args.length !== 1) {
    return conn.reply(m.chat, '• *Example :* .points to money 1000', m)
  }
  let points = parseInt(args[0])
  if (isNaN(points) || points < 1) {
    throw 'Jumlah points which want dikonversi must lebih dari atau sama dengan 1!'
  }
  let user = global.db.data.users[m.sender]
  if (points > user.points) {
    throw 'Sorry, you not memiliki enough points untuk dikonversi.'
  }

  let fee = Math.round(points * 0.05)
  let moneyp = points - fee

  let message = `Following adalah detail konversi points ke money:\n\n`
  message += `• Jumlah points: ${points}\n`
  message += `• Fee (5%): ${fee}\n`
  message += `• Jumlah money: ${moneyp}`

  user.points -= points
  user.money += moneyp
  global.db.data.users[m.sender] = user
  global.db.write()

  m.reply(message)
}

handler.help = ['points to money']
handler.tags = ['rpg']
handler.command = /^points to money$/i
handler.register = true
handler.limit = true
handler.rpg = true
module.exports = handler