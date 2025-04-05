const { getMessage } = require('../lib/languages');

let handler = async(m, {conn, command, usedPrefix, text}) => {
  let fail = getMessage('invalid_format', m.lang, { prefix: usedPrefix, command: command, example: 'Bot|1. Cook' })
  global.db.data.users[m.sender].catatan = global.db.data.users[m.sender].catatan || []
  let catatan = global.db.data.users[m.sender].catatan
  let split = text.split('|')
  let title = split[0]
  let isi = split[1]
  if (catatan.includes(title)) return m.reply(`${getMessage('title_not_available', m.lang)}\n\n${getMessage('reason', m.lang)}: ${getMessage('already_used', m.lang)}`)
  if (!title || !isi) return m.reply(fail)
  let cttn = {
    'title': title,
    'isi': isi
  }
  global.db.data.users[m.sender].catatan.push(cttn)
  conn.reply(m.chat, `${getMessage('note_created_successfully', m.lang)}!\n${getMessage('to_view_note', m.lang)}. ${getMessage('type', m.lang)}: ${usedPrefix}lihatcatatan`, m, false, {
    contextInfo: {
      mentionedJid: conn.parseMention(text)
    }
  })
}

handler.help = ['buatcatatan <title|isi>']
handler.tags = ['internet']
handler.command = /^buatcatatan$/i

module.exports = handler
