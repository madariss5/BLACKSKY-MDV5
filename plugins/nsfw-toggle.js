/**
 * NSFW Toggle Command
 * Enable or disable NSFW content in a group chat
 */

const { toggleNsfw } = require('../lib/nsfwHelper');

let handler = async (m, { conn, args, isAdmin, isOwner }) => {
  // Only group admins and bot owner can toggle NSFW
  if (m.isGroup && !(isAdmin || isOwner)) {
    return global.dfail('admin', m, conn)
  }
  
  // Check if we're enabling or disabling
  const isEnable = /true|enable|(turn)?on|1/i.test(args[0])
  const isDisable = /false|disable|(turn)?off|0/i.test(args[0])
  
  // If neither enable nor disable is specified, show usage
  if (!isEnable && !isDisable) {
    // Language could be 'de' or 'en'
    const user = global.db.data.users?.[m.sender]
    const chat = global.db.data.chats?.[m.chat]
    const lang = user?.language || chat?.language || global.language || 'en'
    
    if (lang === 'de') {
      return conn.reply(m.chat, `
*NSFW-Befehle Ein/Ausschalten*
Verwendung: .nsfw [on/off]

- Schaltet NSFW-Befehle für diesen Chat ein oder aus
- Kann nur von Gruppenadmins verwendet werden
- In Privatnachrichten immer aktiv

Beispiel: 
.nsfw on - Aktiviert NSFW-Befehle
.nsfw off - Deaktiviert NSFW-Befehle
`, m)
    } else {
      return conn.reply(m.chat, `
*NSFW Command Toggle*
Usage: .nsfw [on/off]

- Toggles NSFW commands for this chat
- Can only be used by group admins
- Always active in private messages

Example: 
.nsfw on - Enables NSFW commands
.nsfw off - Disables NSFW commands
`, m)
    }
  }
  
  // Set the state based on the argument
  const state = isEnable ? true : false
  
  // Toggle NSFW and get result message
  const result = await toggleNsfw(m, conn, state)
  
  // Send the result message
  return conn.reply(m.chat, result, m)
}

handler.help = ['nsfw [on/off]']
handler.tags = ['admin', 'group']
handler.command = /^(nsfw)$/i

module.exports = handler