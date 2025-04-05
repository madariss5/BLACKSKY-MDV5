const { getMessage } = require('../lib/languages');

let cp = require('child_process');
let { promisify } = require('util');
let exec = promisify(cp.exec).bind(cp)
let handler = async (m, { conn, isROwner, command, text }) => {
    // Get user's preferred language
    const user = global.db.data.users[m.sender];
    const chat = global.db.data.chats[m.chat];
    const lang = user?.language || chat?.language || global.language;
 {
  // ENHANCED SECURITY: Triple check that the user is a real owner
  if (!isROwner) {
    console.log(`[CRITICAL SECURITY WARNING] Non-owner attempted to use shell exec: ${m.sender}`)
    return conn.reply(m.chat, getMessage('exec2_security', lang), m)
  }
  
  // Extra check that we're not running on a different instance
  if (global.conn.user.jid != conn.user.jid) return
  
  // Log this shell execution for security auditing
  console.log(`[SECURITY] Owner ${m.sender} executing shell command: ${text}`)
  
  m.reply(getMessage('exec2_executing', lang))
  let o
  try {
    o = await exec(command.trimStart()  + ' ' + text.trimEnd())
  } catch (e) {
    o = e
  } finally {
    let { stdout, stderr } = o
    if (stdout.trim()) m.reply(stdout)
    if (stderr.trim()) m.reply(stderr)
  }
}
handler.help = ['$']
handler.tags = ['advanced']
handler.customPrefix = /^[$] /
handler.command = new RegExp
handler.rowner = true
}

module.exports = handler