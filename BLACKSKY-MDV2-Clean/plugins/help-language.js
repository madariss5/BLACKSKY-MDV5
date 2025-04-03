const { getMessage, getAvailableLanguages, isLanguageSupported } = require('../lib/languages');

let handler = async (m, { conn, text, command, args, isAdmin }) => {
  // Get user's preferred language
  const user = global.db.data.users[m.sender]
  const isGroup = m.isGroup
  let lang
  
  if (isGroup) {
    const chat = global.db.data.chats[m.chat]
    lang = user?.language || chat?.language || global.language || 'en'
  } else {
    lang = user?.language || global.language || 'en'
  }
  
  // Get available languages
  const availableLanguages = getAvailableLanguages().map(code => {
    const name = code === 'en' ? 'English' : code === 'de' ? 'German' : code
    return `*${code}* - ${name}`
  }).join('\n')
  
  // Get group infordeadon if in a group
  let groupInfo = ''
  if (isGroup) {
    const chat = global.db.data.chats[m.chat]
    const groupLang = chat?.language || global.language
    const groupLangName = groupLang === 'en' ? 'English' : groupLang === 'de' ? 'German' : groupLang
    groupInfo = `\n\n*${getMessage('group_language', lang)}*: ${groupLangName}`
  }
  
  // Get user language info
  const userLang = user?.language || global.language
  const userLangName = userLang === 'en' ? 'English' : userLang === 'de' ? 'German' : userLang
  
  // Format the help message
  let message = `*${getMessage('language_help', lang, { prefix: global.prefix })}*\n\n`
  
  message += `*${getMessage('current_language', lang, { language: userLangName })}*${groupInfo}\n\n`
  
  message += `*${getMessage('language_description', lang)}*\n\n`
  
  message += `*${getMessage('available_languages', lang, { 
    count: getAvailableLanguages().length 
  }) || 'Available Languages:'}*\n${availableLanguages}\n\n`
  
  message += `*${getMessage('user_command', lang) || 'User Command:'}*\n`
  message += `${global.prefix}language [code] - ${getMessage('user_language_desc', lang) || 'Change your personal language'}\n\n`
  
  if (isGroup) {
    message += `*${getMessage('group_command', lang) || 'Group Command (Admin Only):'}*\n`
    message += `${global.prefix}grouplang [code] - ${getMessage('group_language_desc', lang) || 'Change the language for the whole group'}\n\n`
  }
  
  message += `*${getMessage('language_priority', lang) || 'Language Priority:'}*\n`
  message += `1. ${getMessage('user_language_priority', lang) || 'Your personal language setting'}\n`
  message += `2. ${getMessage('group_language_priority', lang) || 'Group language setting (in groups)'}\n`
  message += `3. ${getMessage('global_language_priority', lang) || 'Bot default language'}\n\n`
  
  message += `*${getMessage('examples', lang) || 'Examples:'}*\n`
  message += `${global.prefix}language en - ${getMessage('set_english', lang) || 'Set to English'}\n`
  message += `${global.prefix}language de - ${getMessage('set_german', lang) || 'Set to German'}\n`
  
  return m.reply(message)
}

handler.help = ['languagehelp', 'langhelp', 'helplag']
handler.tags = ['info', 'settings']
handler.command = /^(languagehelp|langhelp|helplang)$/i

module.exports = handler