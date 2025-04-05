const { getMessage } = require('../lib/languages.js');
let handler  = async (m, { conn }) => {
  conn.reply(m.chat,`${pickRandom(global.iq)}`, m)
}
handler.help = ['iqtest']
handler.tags = ['game']
handler.command = /^(iqtest)$/i
handler.owner = false
handler.mods = false
handler.premium = false
handler.group = false
handler.private = false

handler.admin = false
handler.botAdmin = false

handler.fail = null

module.exports = handler

function pickRandom(list) {
  return list[Math.floor(list.length * Math.random())]
}

global.iq = [
'IQ Anda Sebig : 1',
'IQ Anda Sebig : 14',
'IQ Anda Sebig : 23',
'IQ Anda Sebig : 35',
'IQ Anda Sebig : 41',
'IQ Anda Sebig : 50',
'IQ Anda Sebig : 67',
'IQ Anda Sebig : 72',
'IQ Anda Sebig : 86',
'IQ Anda Sebig : 99',
'IQ Anda Sebig : 150',
'IQ Anda Sebig : 340',
'IQ Anda Sebig : 423',
'IQ Anda Sebig : 500',
'IQ Anda Sebig : 676',
'IQ Anda Sebig : 780',
'IQ Anda Sebig : 812',
'IQ Anda Sebig : 945',
'IQ Anda Sebig : 1000',
'IQ Anda Sebig : Tidak Terbatas!',
'IQ Anda Sebig : 5000',
'IQ Anda Sebig : 7500',
'IQ Anda Sebig : 10000',
]
