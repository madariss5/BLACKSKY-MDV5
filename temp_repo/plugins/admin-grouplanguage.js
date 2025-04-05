const { getMessage, getAvailableLanguages, isLanguageSupported } = require('../lib/languages');

let handler = async (m, { conn, text, command, args, isAdmin, isBotAdmin }) => {
  // Get user's preferred language for error messages
  const user = global.db.data.users[m.sender]
  const userLang = user?.language || global.language || 'en'
  
  // Only allow in groups and for admins
  if (!m.isGroup) return m.reply(getMessage('group_only', userLang))
  if (!isAdmin) return m.reply(getMessage('admin_only', userLang))
  
  // Get group infordeadon
  const chat = global.db.data.chats[m.chat]
  let lang = chat?.language || global.language || 'en'
  
  if (!text) {
    // Display current group language and help infordeadon
    const currentLanguage = lang === 'en' ? 'English' : lang === 'de' ? 'German' : lang
    
    // Get command description
    const description = getMessage('grouplang_description', lang)
    
    // Get group name
    const groupMetadata = await conn.groupMetadata(m.chat)
    const groupName = groupMetadata.subject || ''
    
    // Send current language info with enhanced help
    let message = `*${command.toUpperCase()}*\n\n`
    message += description + '\n\n'
    message += `*Group:* ${groupName}\n`
    message += getMessage('current_language', lang, { language: currentLanguage }) + '\n\n'
    message += getMessage('language_help', lang, { prefix: global.prefix }) + '\n\n'
    message += getMessage('language_list', lang)
    
    return m.reply(message)
  }
  
  // Check if provided language code is valid
  const newLang = text.trim().toLowerCase()
  if (!isLanguageSupported(newLang)) {
    return m.reply(getMessage('invalid_language', lang))
  }
  
  // Set group's language
  chat.language = newLang
  
  // Get language name for the message
  const languageName = newLang === 'en' ? 'English' : newLang === 'de' ? 'German' : newLang
  
  // Send confirdeadon message in the NEW language
  return m.reply(getMessage('group_language_changed', newLang, { language: languageName }))
}

handler.help = ['grouplang', 'setgrouplang', 'gclang']
handler.tags = ['admin', 'group']
handler.command = /^(grouplang|setgrouplang|gclang)$/i

module.exports = handler