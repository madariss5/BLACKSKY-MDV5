const { getMessage } = require('../lib/languages');
const axios = require('axios');

let handler = async (m, { conn, text }) => {
    // Get user's preferred language
    const user = global.db.data.users[m.sender];
    const chat = global.db.data.chats[m.chat];
    const lang = user?.language || chat?.language || global.language;
  if (!text) throw getMessage('ai_character_example', lang, { prefix: '.', character: 'arona' });

  conn.arona = conn.arona ? conn.arona : {};

  if (text === "on") {
    if (!conn.arona[m.sender]) {
      conn.arona[m.sender] = {
        message: [],
        Timeout: setTimeout(() => {
          delete conn.arona[m.sender];
        }, 300000) // 5 minutes Timeout
      };
      await conn.sendMessage(m.chat, {
        text: getMessage('ai_character_on', lang, { character: 'Arona' }),
        contextInfo: {
          externalAdReply: {
            title: "arona",
            body: '',
            thumbnailUrl: `${pickRandom(img)}`,
            sourceUrl: null,
            mediaType: 1,
            renderLargerThumbnail: true
          }
        }
      }, { quoted: m });
    } else {
      clearTimeout(conn.arona[m.sender].Timeout);
      conn.arona[m.sender].Timeout = setTimeout(() => {
        delete conn.arona[m.sender];
      }, 300000);
    }
  } else if (text === "off") {
    if (conn.arona[m.sender]) {
      clearTimeout(conn.arona[m.sender].Timeout);
      delete conn.arona[m.sender];
    }
    await conn.sendMessage(m.chat, {
      text: getMessage('ai_character_off', lang, { character: 'Arona' }),
      contextInfo: {
        externalAdReply: {
          title: "arona",
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
  conn.arona = conn.arona ? conn.arona : {};
  if (m.isBaileys && m.fromMe) return;
  if (!m.text) return;
  if (!conn.arona[m.sender]) return;

  if (
    m.text.startsWith(".") ||
    m.text.startsWith("#") ||
    m.text.startsWith("!") ||
    m.text.startsWith("/") ||
    m.text.startsWith("\\/")
  ) return;

  if (conn.arona[m.sender] && m.text) {
    clearTimeout(conn.arona[m.sender].Timeout);
    conn.arona[m.sender].Timeout = setTimeout(() => {
      delete conn.arona[m.sender];
    }, 300000);

    let name = conn.getName(m.sender);
    try {
      // Get user's preferred language
      const user = global.db.data.users[m.sender];
      const chat = global.db.data.chats[m.chat];
      const lang = user?.language || chat?.language || global.language;
      
      // Get system and assistant prompts for the character based on the user's language
      const systemPrompt = getMessage('ai_arona_system_prompt', lang);
      const assistantPrompt = getMessage('ai_arona_assistant_prompt', lang).replace('%name%', name);
      
      const message = [
        { role: "system", content: systemPrompt },
        { role: "assistant", content: assistantPrompt },
        ...conn.arona[m.sender].message.map((msg, i) => ({
          role: i % 2 === 0 ? 'user' : 'assistant',
          content: msg
        })),
        { role: "user", content: m.text },
      ];
      let res = await aiBeta(message);
      await conn.sendMessage(m.chat, {
        text: getMessage('ai_character_response', lang, { character: 'Arona', result: res.result }),
        contextInfo: {
          externalAdReply: {
            title: "arona",
            body: '',
            thumbnailUrl: `${pickRandom(img)}`,
            sourceUrl: null,
            mediaType: 1,
            renderLargerThumbnail: true
          }
        }
      }, { quoted: m });

      // Ubah cara save message
      conn.arona[m.sender].message = [
        ...conn.arona[m.sender].message,
        m.text,
        res.result
      ];
    } catch (e) {
      console.error("Error retrieving data:", e);
      throw getMessage('ai_error', lang);
    }
  }
};

handler.command = /^(arona)$/i
handler.help = ["arona"];
handler.tags = ["ai"];
handler.limit = true;
handler.owner = false;
handler.group = true;

module.exports = handler;

async function aiBeta(message) {
  return new Promise(async (resolve, reject) => {
    try {
      const params = {
        message: message,
        apikey: global.betabotz
      };
      const { data } = await axios.post('https://api.betabotz.eu.org/fire/search/openai-custom', params);
      resolve(data);
    } catch (error) {
      reject(error);
    };
  });
};

const img = [
  `https://telegra.ph/file/0aeedea70591cad410713.jpg`,
]

function pickRandom(list) {
  return list[Math.floor(list.length * Math.random())]
}