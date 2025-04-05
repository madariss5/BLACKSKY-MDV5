const { getMessage } = require('../lib/languages.js');
let handler = async(m, {conn, command, usedPrefix, text}) => {
  let fail = 'format wrong, example: ' +usedPrefix+command+ ' Bot|1. cook'
  global.db.data.users[m.sender].note = global.db.data.users[m.sender].note || []
  let note = global.db.data.users[m.sender].note
  let split = text.split('|')
  let title = split[0]
  let isi = split[1]
  if (note.includes(title)) return m.reply('Judul not tersedia!\n\nAlasan: Sudah digunwill')
  if (!title || !isi) return m.reply(fail)
  let cttn = {
    'title': title,
    'isi': isi
  }
  global.db.data.users[m.sender].note.push(cttn)
  conn.reply(m.chat, `note Success created!\nUntuk mesee note. Type: ${usedPrefix}seecatatan`, m, false, {
    contextInfo: {
      mentionedJid: conn.parseMention(text)
    }
  })
}

handler.help = ['buatcatatan <title|isi>']
handler.tags = ['internet']
handler.command = /^buatcatatan$/i

module.exports = handler
