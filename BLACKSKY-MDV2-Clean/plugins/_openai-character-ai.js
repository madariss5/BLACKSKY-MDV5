const fetch = require('node-fetch');
const { getMessage } = require('../lib/languages');

let handler = async (m, { text, usedPrefix, command }) => {
  // Get user's preferred language
  const user = global.db.data.users[m.sender];
  const chat = global.db.data.chats[m.chat];
  const lang = user?.language || chat?.language || global.language;
  
  if (!text) throw getMessage('ai_character_input', lang, { prefix: usedPrefix, command: command });
  
  try {
    let [ prompt, logic ] = text.split('|')
    m.reply(getMessage('ai_please_wait', lang))
    let res = await fetch(`https://api.betabotz.eu.org/fire/search/c-ai?prompt=${prompt}?&char=${logic}&apikey=${lann}`)
    let json = await res.json()
    m.reply(json.message)
  } catch (error) {
    console.error(error)
    m.reply(getMessage('ai_command_error', lang))
  }
}

handler.command = handler.help = ['c-ai','character-ai']
handler.tags = ['tools']
handler.owner = false
handler.limit = false
handler.group = false
handler.private = false

module.exports = handler
