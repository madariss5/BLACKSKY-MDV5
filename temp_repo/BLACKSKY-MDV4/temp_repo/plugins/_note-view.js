const { getMessage } = require('../lib/languages');

let handler = async(m, {conn, command, usedPrefix, text}) => {
  global.db.data.users[m.sender].note = global.db.data.users[m.sender].note || []
  let i = 0
  if (global.db.data.users[m.sender].note.length == 0) return m.reply(getMessage('kamu_not_yet_punya_note_', lang))
  let txt = '🗒️List note🗒️\n\n'
  for (let ct in global.db.data.users[m.sender].note) {
    i += 1
    txt += '[' + i + ']. ' + global.db.data.users[m.sender].note[ct].title + '\n'
  }
  txt += `\nUseran: ${usedPrefix}seecatatan 1\nHapus note: ${usedPrefix}hapuscatatan 1`
  if (text.length == 0) return m.reply(txt)
  let note = global.db.data.users[m.sender].note
  let split = text.split('|')
  if (note.length == 0) return m.reply(getMessage('kamu_not_yet_memiliki_note_', lang))
  let n = Number(split[0]) - 1

  let isi = global.db.data.users[m.sender].note[n] != undefined ? global.db.data.users[m.sender].note[n].isi : 'note not ditemukan!'
conn.reply(m.chat, `${isi}`, m, false, {
    contextInfo: {
      mentionedJid: conn.parseMention(text)
    }
  })
}

handler.help = ['seecatatan <title>']
handler.tags = ['internet']
handler.command = /^lihatcatatan$/i

module.exports = handler
