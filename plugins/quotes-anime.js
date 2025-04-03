const { getMessage } = require('../lib/languages');

let fetch = require('node-fetch');
let handler = async (m, { conn }) => {
    // Get user's preferred language
    const user = global.db.data.users[m.sender];
    const chat = global.db.data.chats[m.chat];
    const lang = user?.language || chat?.language || global.language;
 {
  try {
    let res = await fetch(`https://api.betabotz.eu.org/fire/random/quotesanime?apikey=${lann}`);
    let json = await res.json();

    if (json.status && json.result && json.result.length > 0) {
      let randomIndex = Math.floor(Math.random() * json.result.length);
      let animeQuote = json.result[randomIndex];
      let cleanQuotes = animeQuote.quotes.replace(/[\n\r\t]/g, ' ');

      let replyMessage = `${cleanQuotes}\n\nCharacter: ${animeQuote.character}\nAnime: ${animeQuote.anime}\nEpisode: ${animeQuote.episode}`;

      conn.sendFile(m.chat, animeQuote.image, 'image.jpg', replyMessage, m, false, { contextInfo: { mentionedJid: [m.sender] } });
    } else {
      throw 'Invalid fire response';
    }
  } catch (e) {
    throw `Error: ${e.message || 'Internal server error!'}`;
  }
};

handler.help = ['anime'];
handler.tags = ['quotes'];
handler.command = /^(anime)$/i;

}

module.exports = handler;
