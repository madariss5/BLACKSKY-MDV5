/**
 * NSFW Status Command
 * Check if NSFW commands are enabled in the current chat
 */

let handler = async (m, { conn }) => {
  // Get chat data and check if NSFW is enabled
  const chat = global.db.data.chats[m.chat] || {}
  const nsfwEnabled = chat.nsfw || false
  
  // Get user language
  const user = global.db.data.users?.[m.sender]
  const lang = user?.language || chat?.language || global.language || 'en'
  
  // Message templates
  const messages = {
    'en': {
      enabled: '✅ NSFW commands are currently *enabled* in this chat.',
      disabled: '❌ NSFW commands are currently *disabled* in this chat.',
      privateInfo: 'ℹ️ Note: NSFW commands are always enabled in private chats.',
      groupInfo: 'ℹ️ Group admins can toggle NSFW commands with:',
      toggleCommand: '.nsfw on/off'
    },
    'de': {
      enabled: '✅ NSFW-Befehle sind in diesem Chat derzeit *aktiviert*.',
      disabled: '❌ NSFW-Befehle sind in diesem Chat derzeit *deaktiviert*.',
      privateInfo: 'ℹ️ Hinweis: NSFW-Befehle sind in privaten Chats immer aktiviert.',
      groupInfo: 'ℹ️ Gruppenadmins können NSFW-Befehle umschalten mit:',
      toggleCommand: '.nsfw on/off'
    }
  }
  
  // Use the correct language or fall back to English
  const msg = messages[lang] || messages['en']
  
  // Build the status message
  let statusMsg = nsfwEnabled ? msg.enabled : msg.disabled
  
  // Add info depending on whether this is a group or private chat
  if (!m.isGroup) {
    statusMsg += `\n\n${msg.privateInfo}`
  } else {
    statusMsg += `\n\n${msg.groupInfo}\n${msg.toggleCommand}`
  }
  
  // Send the status message
  conn.reply(m.chat, statusMsg, m)
}

handler.help = ['nsfwstatus', 'nsfwcheck']
handler.tags = ['nsfw', 'info']
handler.command = /^(nsfwstatus|nsfwcheck)$/i

module.exports = handler