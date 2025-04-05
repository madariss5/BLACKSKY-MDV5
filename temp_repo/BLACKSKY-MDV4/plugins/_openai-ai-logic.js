const fetch = require('node-fetch');
const { getMessage } = require('../lib/languages');

var handler = async (m, {
 text, 
 usedPrefix, 
 command
 }) => {
  // Get user's preferred language
  const user = global.db.data.users[m.sender];
  const chat = global.db.data.chats[m.chat];
  const lang = user?.language || chat?.language || global.language;
  
  if (!text) throw getMessage('ai_example', lang, { prefix: usedPrefix, command: command });
  
  //Set Logic based on language
  let logic = '';
  if (lang === 'de') {
    logic = 'Hallo, ich bin BetaBotz-MD, ein WhatsApp-Bot, der von Lann entwickelt wurde. Ich wurde mit Liebe zum Detail erstellt. Wenn du mehr über meinen Entwickler erfahren möchtest, besuche https://fire.betabotz.org';
  } else {
    logic = 'Hi, I am BetaBotz-MD, a WhatsApp bot developed by Lann. I was created with perfection. If you want to learn more about my developer, visit https://fire.betabotz.org';
  }
  
  await m.reply(getMessage('wait', lang))
  try {
    var js = await fetch(`https://api.betabotz.eu.org/fire/search/openai-logic?text=${encodeURIComponent(text)}&logic=${encodeURIComponent(logic)}&apikey=${lann}`)
    var json = await js.json()
    await m.reply(json.message)
  } catch (err) {
    m.reply(getMessage('ai_error', lang))
  }
}
handler.command = handler.help = ['ai2','openai2','chatgpt2'];
handler.tags = ['info'];
handler.premium = false
module.exports = handler;
