const { getMessage } = require('../lib/languages');

const axios = require('axios');

let handler = async (m, { conn, text }) => {
    // Get user's preferred language
    const user = global.db.data.users[m.sender];
    const chat = global.db.data.chats[m.chat];
    const lang = user?.language || chat?.language || global.language;
 {
  if (!text) throw getMessage('ai_character_example', lang).replace('%character%', 'elaina');

  conn.elaina = conn.elaina ? conn.elaina : {};

  if (text === "on") {
    if (!conn.elaina[m.sender]) {
      conn.elaina[m.sender] = {
        message: [],
        Timeout: setTimeout(() => {
          delete conn.elaina[m.sender];
        }, 300000) // 5 minutes Timeout
      };
      await conn.sendMessage(m.chat, {
        text: getMessage('ai_character_on', lang).replace('%character%', 'Elaina'),
        contextInfo: {
          externalAdReply: {
            title: "Elaina",
            body: '',
            thumbnailUrl: `${pickRandom(img)}`,
            sourceUrl: null,
            mediaType: 1,
            renderLargerThumbnail: true
          }
        }
      }, { quoted: m });
    } else {
      clearTimeout(conn.elaina[m.sender].Timeout);
      conn.elaina[m.sender].Timeout = setTimeout(() => {
        delete conn.elaina[m.sender];
      }, 300000);
    }
  } else if (text === "off") {
    if (conn.elaina[m.sender]) {
      clearTimeout(conn.elaina[m.sender].Timeout);
      delete conn.elaina[m.sender];
    }
    await conn.sendMessage(m.chat, {
      text: getMessage('ai_character_off', lang).replace('%character%', 'Elaina'),
      contextInfo: {
        externalAdReply: {
          title: "Elaina",
          body: '',
          thumbnailUrl: `${pickRandom(img)}`,
          sourceUrl: null,
          mediaType: 1,
          renderLargerThumbnail: true
        }
      }
    }, { quoted: m });
  }
};

handler.before = async (m, { conn }) => {
  conn.elaina = conn.elaina ? conn.elaina : {};
  if (m.isBaileys && m.fromMe) return;
  if (!m.text) return;
  if (!conn.elaina[m.sender]) return;

  if (
    m.text.startsWith(".") ||
    m.text.startsWith("#") ||
    m.text.startsWith("!") ||
    m.text.startsWith("/") ||
    m.text.startsWith("\\/")
  ) return;

  if (conn.elaina[m.sender] && m.text) {
    clearTimeout(conn.elaina[m.sender].Timeout);
    conn.elaina[m.sender].Timeout = setTimeout(() => {
      delete conn.elaina[m.sender];
    }, 300000);

    let name = conn.getName(m.sender);
    try {
      // Get user's preferred language
      const user = global.db.data.users[m.sender];
      const chat = global.db.data.chats[m.chat];
      const lang = user?.language || chat?.language || global.language;
      
      // Get system and assistant prompts for the character based on the user's language
      const systemPrompt = getMessage('ai_elaina_system_prompt', lang);
      const assistantPrompt = getMessage('ai_elaina_assistant_prompt', lang).replace('%name%', name);
      
      const message = [
        { role: "system", content: systemPrompt },
        { role: "assistant", content: assistantPrompt },
        ...conn.elaina[m.sender].message.map((msg, i) => ({
          role: i % 2 === 0 ? 'user' : 'assistant',
          content: msg
        })),
        { role: "user", content: m.text },
      ];
      
      await conn.sendMessage(m.chat, {
        text: getMessage('ai_please_wait', lang),
      }, { quoted: m });
      
      let res = await aiBeta(message);
      await conn.sendMessage(m.chat, {
        text: getMessage('ai_character_response', lang).replace('%character%', 'Elaina').replace('%result%', res.result),
        contextInfo: {
          externalAdReply: {
            title: "Elaina",
            body: '',
            thumbnailUrl: `${pickRandom(img)}`,
            sourceUrl: null,
            mediaType: 1,
            renderLargerThumbnail: true
          }
        }
      }, { quoted: m });

      // Update conversation history
      conn.elaina[m.sender].message = [
        ...conn.elaina[m.sender].message,
        m.text,
        res.result
      ];
    } catch (e) {
      console.error("Error processing data", e);
      throw getMessage('ai_command_error', lang);
    }
  }
};

handler.command = /^(elaina)$/i
handler.help = ["elaina"];
handler.tags = ["ai"];
handler.limit = true;
handler.owner = false;
handler.group = true

}

module.exports = handler;

async function aiBeta(message) {
  return new Promise(async (resolve, reject) => {
    try {
      const params = {
        message: message,
        apikey: `${lann}` 
      };
      const { data } = await axios.post('https://api.betabotz.eu.org/fire/search/openai-custom', params);
      resolve(data);
    } catch (error) {
      reject(error);
    };
  });
};

const img = [
  `https://api.betabotz.eu.org/fire/tools/get-upload?id=f/2tfpe5e.jpg`,
  `https://api.betabotz.eu.org/fire/tools/get-upload?id=f/ym208ch9.jpg`,
  `https://api.betabotz.eu.org/fire/tools/get-upload?id=f/ne42bh8e.jpg`,
  `https://api.betabotz.eu.org/fire/tools/get-upload?id=f/ulcs8k8.jpg`,
  `https://api.betabotz.eu.org/fire/tools/get-upload?id=f/hwqox5hw.jpg`,
  `https://api.betabotz.eu.org/fire/tools/get-upload?id=f/thyutdpc.jpg`,
  `https://api.betabotz.eu.org/fire/tools/get-upload?id=f/4p40uhn4.jpg`,
  `https://api.betabotz.eu.org/fire/tools/get-upload?id=f/2tfpe5e.jpg`,
  `https://api.betabotz.eu.org/fire/tools/get-upload?id=f/46ksjryr.jpg`,
  `https://api.betabotz.eu.org/fire/tools/get-upload?id=f/a1c10wqy.jpg`,
  `https://api.betabotz.eu.org/fire/tools/get-upload?id=f/aax59tu.jpg`,
  `https://api.betabotz.eu.org/fire/tools/get-upload?id=f/e9lties0.jpg`,
  `https://api.betabotz.eu.org/fire/tools/get-upload?id=f/1rurejp9.jpg`,
]

function pickRandom(list) {
  return list[Math.floor(list.length * Math.random())]
}