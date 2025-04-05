/**
 * Owner-only command to set bot prefix to dot only
 */
 
let handler = async (m, { conn, args, usedPrefix, command }) => {
  // Set prefix to dot
  global.prefix = new RegExp('^[.]')
  
  // Update opts.prefix as well if it exists
  if (global.opts) {
    global.opts.prefix = '.'
  }
  
  // Update conn.prefix if applicable
  if (conn) {
    conn.prefix = '.'
  }
  
  // Provide feedback
  await m.reply('✅ Prefix has been set to "." (dot) only.\n\nOnly commands starting with "." will work now.\nExample: .menu, .help, etc.')
  
  // Optional: Announce to groups (uncomment if needed)
  // const groups = Object.keys(await conn.groupFetchAllParticipating())
  // for (const group of groups) {
  //   await conn.sendMessage(group, { text: '📢 *NOTICE*: The bot prefix has been changed to "." (dot) only.\n\nPlease use commands with the dot prefix (e.g., .menu, .help).' })
  // }
}

handler.help = ['setdotprefix']
handler.tags = ['owner']
handler.command = /^(setdotprefix|dotprefix|fixprefix)$/i
handler.rowner = true

module.exports = handler