const { getMessage } = require('../lib/languages');

/**
 * Restart Bot Command
 * Allows the real owner to restart the bot
 * Enhanced with strict security checks
 */

let handler = async (m, { conn, isROwner, text }) => {
  // Get user's preferred language
  const user = global.db.data.users[m.sender];
  const chat = global.db.data.chats[m.chat];
  const lang = user?.language || chat?.language || global.language;
  
  // CRITICAL SECURITY FIX: Verify caller is real owner
  if (!isROwner) {
    console.log(`[SECURITY ALERT] Non-ROwner attempted to restart bot: ${m.sender}`)
    return conn.reply(m.chat, getMessage('owner_only', lang), m)
  }

  let { spawn } = require('child_process');
  
  // Only work in indexed process mode
  if (!process.send) {
    return conn.reply(m.chat, getMessage('restart_failed', lang), m)
  }
  
  // Verify this is the main bot connection, not a sub-connection
  if (global.conn.user.jid == conn.user.jid) {
    // Log this sensitive operation
    console.log(`[SECURITY] ROwner ${m.sender} restarting bot`)
    
    await m.reply(getMessage('restart_success', lang))
    process.send('reset')
  } else {
    conn.reply(m.chat, getMessage('restart_failed', lang), m)
  }
}

handler.help = ['restart']
handler.tags = ['owner']
handler.command = /^(srvrestart|restart)$/i

handler.rowner = true

module.exports = handler