const { getMessage } = require('../lib/languages');

// Fix prefix command
let handler = async (m, { conn }) => {
    // Get user's preferred language
    const user = global.db.data.users[m.sender];
    const chat = global.db.data.chats[m.chat];
    const lang = user?.language || chat?.language || global.language;
 {
  // Set default prefix to '.'
  global.prefix = new RegExp('^[.]')
  
  // Update opts.prefix as well if it exists
  if (global.opts) {
    global.opts.prefix = '.'
  }
  
  // Update conn.prefix if applicable
  if (conn) {
    conn.prefix = '.'
  }
  
  await m.reply(`✅ Prefix has been reset to ".\\" (dot).\n\nCommands should now work with the \\"." prefix (e.g., .menu, .help).\n\nIf commands still don't work, please restart the bot.`);
}

handler.help = ['fixprefix']
handler.tags = ['owner']
handler.command = /^(fixprefix|resetprefix)$/i

}

module.exports = handler