const { getMessage } = require('../lib/languages');

let syntaxerror = require('syntax-error');
let util = require('util');

let handler = async (m, _2) => {
  let { conn, usedPrefix, noPrefix, args, groupMetadata, isROwner } = _2
  
  // Get user's preferred language
  const user = global.db.data.users[m.sender];
  const chat = global.db.data.chats[m.chat];
  const lang = user?.language || chat?.language || global.language;
  
  // ENHANCED SECURITY: Double-check that the user is a real owner before running dangerous code
  if (!isROwner) {
    console.log(`[CRITICAL SECURITY WARNING] Non-owner attempted to use exec: ${m.sender}`)
    return conn.reply(m.chat, getMessage('owner_only', lang), m)
  }
  
  // Log this execution attempt for security auditing
  console.log(`[SECURITY] Owner ${m.sender} executing command: ${noPrefix}`)
  
  // Inform user that command is executing
  conn.reply(m.chat, getMessage('exec_command', lang), m)
  
  let _return
  let _syntax = ''
  let _text = (/^=/.test(usedPrefix) ? 'return ' : '') + noPrefix
  let old = m.exp * 1 
  try {
    let i = 15
    let f = {
      exports: {}
    }
    let exec = new (async () => {}).constructor('print', 'm', 'handler', 'require', 'conn', 'Array', 'process', 'args', 'groupMetadata', 'module', 'exports', 'argument', _text)
    _return = await exec.call(conn, (...args) => {
      if (--i < 1) return
      console.log(...args)
      return conn.reply(m.chat, util.format(...args), m)
    }, m, handler, require, conn, CustomArray, process, args, groupMetadata, f, f.exports, [conn, _2])
  } catch (e) {
    let err = await syntaxerror(_text, 'Execution Function', {
      allowReturnOutsideFunction: true,
      allowAwaitOutsideFunction: true
    })
    if (err) _syntax = '```' + err + '```\n\n'
    _return = e
  } finally {
    // Display results with proper message header based on success/failure
    if (_return instanceof Error) {
      conn.reply(m.chat, `${getMessage('exec_error', lang)}:\n${_syntax}${util.format(_return)}`, m)
    } else {
      conn.reply(m.chat, `${getMessage('exec_result', lang)}:\n${_syntax}${util.format(_return)}`, m)
    }
    m.exp = old
  }
}
handler.help = ['> ', '=> ']
handler.tags = ['advanced']
handler.customPrefix = /^=?> /
handler.command = /(?:)/i
handler.owner = true
handler.rowner = true // Add this to require real owner permission
handler.mods = false
handler.premium = false
handler.group = false
handler.private = false

handler.admin = false
handler.botAdmin = false

handler.fail = null

module.exports = handler

class CustomArray extends Array {
  constructor(...args) {
    if (typeof args[0] == 'number') return super(Math.min(args[0], 10000))
    else return super(...args)
  }
}