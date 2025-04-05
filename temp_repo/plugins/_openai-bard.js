const { getMessage } = require('../lib/languages');
var fetch = require('node-fetch');
var handler = async (m, {
 text, 
 usedPrefix, 
 command
 }) => {
  // Get the user's preferred language
  const user = global.db.data.users[m.sender];
  const chat = global.db.data.chats[m.chat];
  const lang = user?.language || chat?.language || global.language;
  
  if (!text) throw getMessage('ai_input_required', lang);
  
  try {
    await m.reply(getMessage('wait', lang));
    var apii = await fetch(`https://api.betabotz.eu.org/fire/search/bard-ai?apikey=${lann}&text=${text}`);
    var res = await apii.json();
    await m.reply(res.message);
  } catch (err) {
    console.error(err);
    throw getMessage('ai_question_error', lang);
  }
}

handler.command = handler.help = ['bard','bardai'];
handler.tags = ['tools'];
handler.premium = false;

module.exports = handler;