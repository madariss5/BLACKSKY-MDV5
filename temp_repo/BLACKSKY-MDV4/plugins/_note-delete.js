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
  txt += `\nUseran: ${usedPrefix}hapuscatatan 1`
  if (text.length == 0) return m.reply(txt)
  let note = global.db.data.users[m.sender].note
  let split = text.split('|')
  if (note.length == 0) return m.reply(getMessage('kamu_not_yet_memiliki_note_', lang))
  let n = Number(split[0]) - 1
  if (note[n] == undefined) return m.reply(getMessage('note_not_ditemukan_', lang))
  let tmp = []

  for (let ct in note) {
    if(ct != n) {
      tmp.push(note[ct])
    } else {
      continue
    }
  }

  cdang = global.db.data.users[m.sender].note
  global.db.data.users[m.sender].note = tmp

conn.reply(m.chat, `Success menghapus note!`, m, false, {
    contextInfo: {
      mentionedJid: conn.parseMention(text)
    }
  })
}

handler.help = ['hapuscatatan title']
handler.tags = ['internet']
handler.command = /^hapuscatatan$/i

module.exports = handler
