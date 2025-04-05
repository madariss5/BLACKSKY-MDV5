let { WAMessageStubType } = require('@adiwajshing/baileys')
let urlRegex = require('url-regex-safe')({ strict: false })
let PhoneNumber = require('awesome-phonenumber')
let terminalImage = global.opts['img'] ? require('terminal-image') : ''
let chalk = require('chalk')
let fs = require('fs')

// Original console.log is causing issues, so we're restoring it
// and implementing our fix directly in specific locations
const originalConsoleLog = console.log;

module.exports = async function (m, conn = { user: {} }) {
  let _name = await conn.getName(m.sender)
  let sender = PhoneNumber('+' + m.sender.replace('@s.whatsapp.net', '')).getNumber('international') + (_name ? ' ~' + _name : '')
  let chat = await conn.getName(m.chat)
  // let ansi = '\x1b['
  let img
  try {
    if (global.opts['img'])
      img = /sticker|image/gi.test(m.mtype) ? await terminalImage.buffer(await m.download()) : false
  } catch (e) {
    console.error(e)
  }
  let filesize = (m.msg ?
    m.msg.vcard ?
      m.msg.vcard.length :
      m.msg.fileLength ?
        m.msg.fileLength.low || m.msg.fileLength :
        m.msg.axolotlSenderKeyDistributionMessage ?
          m.msg.axolotlSenderKeyDistributionMessage.length :
          m.text ?
            m.text.length :
            0
    : m.text ? m.text.length : 0) || 0
  let user = global.DATABASE.data.users[m.sender]
  let me = PhoneNumber('+' + (conn.user && conn.user.jid).replace('@s.whatsapp.net', '')).getNumber('international')
  console.log(`▣────────────···
│ ${chalk.redBright('%s')}\n│⏰ㅤ${chalk.black(chalk.bgYellow('%s'))}\n│📑ㅤ${chalk.black(chalk.bgGreen('%s'))}\n│📊ㅤ${chalk.magenta('%s [%s %sB]')}
│📤ㅤ${chalk.green('%s')}\n│📃ㅤ${chalk.yellow('%s%s')}\n│📥ㅤ${chalk.green('%s')}\n│💬ㅤ${chalk.black(chalk.bgYellow('%s'))}
▣────────────···
`.trim(),
    me + ' ~' + conn.user.name,
    (m.messageTimestamp ? new Date(1000 * (m.messageTimestamp.low || m.messageTimestamp)) : new Date).toTimeString(),
    m.messageStubType ? WAMessageStubType[m.messageStubType] : '',
    filesize,
    filesize === 0 ? 0 : (filesize / 1009 ** Math.floor(Math.log(filesize) / Math.log(1000))).toFixed(1),
    ['', ...'KMGTP'][Math.floor(Math.log(filesize) / Math.log(1000))] || '',
    sender,
    m ? m.exp : '?',
    user ? '|' + user.exp + '|' + user.limit : '' + ('|' + user.level),
    m.chat + (chat ? ' ~' + chat : ''),
    m.mtype ? m.mtype.replace(/message$/i, '').replace('audio', m.msg.ptt ? 'PTT' : 'audio').replace(/^./, v => v.toUpperCase()) : ''
  )
  if (img) console.log(img.trimEnd())
  if (typeof m.text === 'string' && m.text) {
    let log = m.text.replace(/\u200e+/g, '')
    let mdRegex = /(?<=(?:^|[\s\n])\S?)(?:([*_~])(.+?)\1|```((?:.||[\n\r])+?)```)(?=\S?(?:[\s\n]|$))/g
    let mdFormat = (depth = 4) => (_, Type, text, monospace) => {
      let types = {
        _: 'italic',
        '*': 'bold',
        '~': 'strikethrough'
      }
      text = text || monospace
      let formatted = !types[Type] || depth < 1 ? text : chalk[types[Type]](text.replace(mdRegex, mdFormat(depth - 1)))
      // console.log({ depth, Type, formatted, text, monospace }, formatted)
      return formatted
    }
    if (log.length < 4096)
      log = log.replace(urlRegex, (url, i, text) => {
        let end = url.length + i
        return i === 0 || end === text.length || (/^\s$/.test(text[end]) && /^\s$/.test(text[i - 1])) ? chalk.blueBright(url) : url
      })
    log = log.replace(mdRegex, mdFormat(4))
    if (m.mentionedJid) for (let user of m.mentionedJid) log = log.replace('@' + user.split`@`[0], chalk.blueBright('@' + await conn.getName(user)))
    // Only log the message text if it exists and isn't empty
    if (log && log.trim() !== '') {
      console.log(m.error != null ? chalk.red(log) : m.isCommand ? chalk.yellow(log) : log)
    }
  } else {
    // When m.text is not a string or is empty, don't try to log it directly
    console.log("") // Add an empty line to maintain formatting
  }
  if (m.messageStubParameters) console.log(m.messageStubParameters.map(jid => {
    jid = conn.decodeJid(jid)
    let name = conn.getName(jid)
    return chalk.gray(PhoneNumber('+' + jid.replace('@s.whatsapp.net', '')).getNumber('international') + (name ? ' ~' + name : ''))
  }).join(', '))
  if (/document/i.test(m.mtype)) console.log(`📄 ${m.msg.filename || m.msg.displayName || 'Document'}`)
  else if (/ContactsArray/i.test(m.mtype)) console.log(`👨‍👩‍👧‍👦 ${' ' || ''}`)
  else if (/contact/i.test(m.mtype)) console.log(`👨 ${m.msg.displayName || ''}`)
  else if (/audio/i.test(m.mtype)) (s = m.msg.seconds, console.log(`${m.msg.ptt ? '🎤 (PTT ' : '🎵 ('}AUDIO) ${Math.floor(s / 60).toString().padStart(2, 0)}:${(s % 60).toString().padStart(2, 0)}`))

  // Don't try to log text for message types that don't have text
  // This prevents undefined from appearing in the console logs
  if (m.mtype === 'protocolMessage' || m.mtype === 'senderKeyDistributionMessage' || 
      m.mtype === 'ciphertext' || !m.text) {
    // For CIPHERTEXT messages, we return immediately to prevent any further 
    // processing that might cause 'undefined' to be logged
    return;
  }
  
  // Exiting early wasn't enough, we need to explicitly check and handle undefined
  // at the bottom of the print function to prevent the direct console.log that might
  // be happening after the function returns
  
  // Don't log m.quoted directly either
  // if (m.quoted) console.log(m.msg.contextInfo)
}

let file = require.resolve(__filename)
fs.watchFile(file, () => {
  fs.unwatchFile(file)
  console.log(chalk.redBright("Update 'lib/print.js'"))
  delete require.cache[file]
})
