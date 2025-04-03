const fetch = require('node-fetch');
const { getMessage } = require('../lib/languages');

let handler = async (m, {
  conn,
  text,
  usedPrefix,
  command
}) => {
  // Get user's preferred language
  const user = global.db.data.users[m.sender];
  const chat = global.db.data.chats[m.chat];
  const lang = user?.language || chat?.language || global.language;
  
  if (command == 'bing') {
    if (!text) throw getMessage('ai_input_required', lang);
    try {
      m.reply(getMessage('wait', lang))
      let response = await fetch('https://api.betabotz.eu.org/fire/search/bing-chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            text: text,
            apikey: lann
          })
        })
        .then(res => res.json());

      await conn.reply(m.chat, response.message, m);
    } catch (e) {
      console.log(e);
      throw getMessage('ai_question_error', lang);
    }
  }
  if (command == 'bingimg') {
    if (!text) throw getMessage('ai_input_required', lang);
    try {
      m.reply(getMessage('wait', lang))
      let response = await fetch('https://api.betabotz.eu.org/fire/search/bing-img', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            text: text,
            apikey: lann
          })
        })
        .then(res => res.json());

      for (let i = 0; i < 4; i++) {
        let img = response.result[i]
        await sleep(3000)
        await conn.sendFile(m.chat, img, 'bing_img.png', `*PROMPT:* ${text}`, m)
      }
    } catch (error) {
      throw getMessage('ai_question_error', lang);
    }
  }
}

handler.command = handler.help = ['bing', 'bingimg']
handler.tags = ['tools']
handler.limit = true

module.exports = handler

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
