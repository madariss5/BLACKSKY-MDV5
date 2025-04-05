const { getMessage } = require('../lib/languages');
var fetch = require('node-fetch');
var handler = async (m, {
 text, 
 usedPrefix, 
 command
 }) => {
  // Get user's preferred language
  const user = global.db.data.users[m.sender];
  const chat = global.db.data.chats[m.chat];
  const lang = user?.language || chat?.language || global.language;
  
if (!text) throw `Please enter a question!\n\n*Example:* create express.js code for me`
try {
  await m.reply(getMessage('please_wait', lang))
  var apii = await fetch(`https://api.betabotz.eu.org/fire/search/blackbox-chat?text=${text}&apikey=${lann}`)
  var res = await apii.json()
  await m.reply(res.message)
} catch (err) {
  console.error(err)
  throw "An error occurred while answering the question"
}
}
handler.command = handler.help = ['blackbox','blackboxai','aicoding'];
handler.tags = ['tools'];
handler.premium = false
module.exports = handler;
