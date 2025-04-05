/**
 * Force NSFW Enable/Disable Command
 * Allows the bot owner to forcibly enable or disable NSFW
 * in a chat, overriding existing permissions.
 */

const { toggleNsfw } = require('../lib/nsfwHelper');

let handler = async (m, { conn, args, isOwner }) => {
  // Only bot owner can force toggle NSFW
  if (!isOwner) {
    return global.dfail('owner', m, conn)
  }
  
  // Check if we're enabling or disabling
  const isEnable = /true|enable|(turn)?on|1/i.test(args[0])
  const isDisable = /false|disable|(turn)?off|0/i.test(args[0])
  
  // If neither enable nor disable is specified, show usage
  if (!isEnable && !isDisable) {
    // Language could be 'de' or 'en'
    const user = global.db.data.users?.[m.sender]
    const lang = user?.language || global.language || 'en'
    
    if (lang === 'de') {
      return conn.reply(m.chat, `
*NSFW-Zwangsaktvierung/Deaktivierung*
Verwendung: .nsfwforce [on/off]

- Erlaubt dem Bot-Eigentümer, NSFW-Befehle für einen Chat zu erzwingen oder zu deaktivieren
- Überschreibt Gruppeneinstellungen im Problemfall

Beispiel: 
.nsfwforce on - Erzwingt NSFW-Befehle
.nsfwforce off - Erzwingt die Deaktivierung von NSFW-Befehlen
`, m)
    } else {
      return conn.reply(m.chat, `
*NSFW Force Toggle*
Usage: .nsfwforce [on/off]

- Allows the bot owner to force enable or disable NSFW commands for a chat
- Overrides group settings when there are issues

Example: 
.nsfwforce on - Forces NSFW commands on
.nsfwforce off - Forces NSFW commands off
`, m)
    }
  }
  
  // Set the state based on the argument
  const state = isEnable ? true : false
  
  // Toggle NSFW and get result message (with force flag)
  const result = await toggleNsfw(m, conn, state)
  
  // Add owner message to result
  const ownerNote = state 
    ? '⚠️ NSFW has been forcibly enabled by the owner' 
    : '⚠️ NSFW has been forcibly disabled by the owner'
  
  // Send the result message with owner note
  return conn.reply(m.chat, `${result}\n\n${ownerNote}`, m)
}

handler.help = ['nsfwforce [on/off]']
handler.tags = ['owner']
handler.command = /^(nsfwforce|forcenadmin|nsfwforcenable|forcensfw)/i

module.exports = handler