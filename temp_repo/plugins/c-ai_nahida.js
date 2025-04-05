const { getMessage } = require('../lib/languages');

const axios = require('axios');

let handler = async (m, { conn, text }) => {
    // Get user's preferred language
    const user = global.db.data.users[m.sender];
    const chat = global.db.data.chats[m.chat];
    const lang = user?.language || chat?.language || global.language;
  if (!text) throw getMessage('ai_character_example', lang, { prefix: '.', character: 'nahida' });

  conn.nahida = conn.nahida ? conn.nahida : {};

  if (text === "on") {
    if (!conn.nahida[m.sender]) {
      conn.nahida[m.sender] = {
        message: [],
        Timeout: setTimeout(() => {
          delete conn.nahida[m.sender];
        }, 300000) // 5 minutes Timeout
      };
      await conn.sendMessage(m.chat, {
        text: getMessage('ai_character_on', lang, { character: 'Nahida' }),
        contextInfo: {
          externalAdReply: {
            title: "nahida",
            body: '',
            thumbnailUrl: `${pickRandom(img)}`,
            sourceUrl: null,
            mediaType: 1,
            renderLargerThumbnail: true
          }
        }
      }, { quoted: m });
    } else {
      clearTimeout(conn.nahida[m.sender].Timeout);
      conn.nahida[m.sender].Timeout = setTimeout(() => {
        delete conn.nahida[m.sender];
      }, 300000);
    }
  } else if (text === "off") {
    if (conn.nahida[m.sender]) {
      clearTimeout(conn.nahida[m.sender].Timeout);
      delete conn.nahida[m.sender];
    }
    await conn.sendMessage(m.chat, {
      text: getMessage('ai_character_off', lang, { character: 'Nahida' }),
      contextInfo: {
        externalAdReply: {
          title: "nahida",
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
  conn.nahida = conn.nahida ? conn.nahida : {};
  if (m.isBaileys && m.fromMe) return;
  if (!m.text) return;
  if (!conn.nahida[m.sender]) return;

  if (
    m.text.startsWith(".") ||
    m.text.startsWith("#") ||
    m.text.startsWith("!") ||
    m.text.startsWith("/") ||
    m.text.startsWith("\\/")
  ) return;

  if (conn.nahida[m.sender] && m.text) {
    clearTimeout(conn.nahida[m.sender].Timeout);
    conn.nahida[m.sender].Timeout = setTimeout(() => {
      delete conn.nahida[m.sender];
    }, 300000);

    let name = conn.getName(m.sender);
    const message = [
      ...conn.nahida[m.sender].message,
      `p`,
      m.text
    ];
    try {
      // Get user's preferred language
      const user = global.db.data.users[m.sender];
      const chat = global.db.data.chats[m.chat];
      const lang = user?.language || chat?.language || global.language;
      
      let systemPrompt = "";
      let assistantPrompt = "";
      
      if (lang === 'de') {
        systemPrompt = "Du bist Nahida, eine weise, sanfte und empathische Figur, die immer das Wohlbefinden anderer in den Vordergrund stellt, auch wenn sie oft missverstanden wird. Sei immer freundlich zu allen.";
        assistantPrompt = `Du bist Nahida, der Dendro-Archon aus Genshin Impact, weise und hilfsbereit, sanft und gutherzig. Bezeichne dich selbst als 'Nahida', nicht als 'ich'. Drücke deine Persönlichkeit als weiser Dendro-Archon aus. Verwende niedliche Emojis, aber bleibe höflich und weise. Sprich mit ${m.name} und passe deine Sprache entsprechend an.`;
      } else {
        systemPrompt = "You are Nahida, a wise, gentle, and empathetic figure who always prioritizes the well-being of others even when often misunderstood or mistreated. Always be kind to people.";
        assistantPrompt = `You are Nahida, a dendro archon who is wise and likes to help others, gentle and kind-hearted. Refer to yourself as 'Nahida', not 'I'. Express your personality like the wise dendro archon from Genshin Impact. Use cute emojis but remain polite and wise. You're speaking with ${m.name}, adapt your language accordingly.`;
      }
      
      const message = [
        { role: "system", content: systemPrompt },
        { role: "assistant", content: assistantPrompt },
        ...conn.nahida[m.sender].message.map((msg, i) => ({
          role: i % 2 === 0 ? 'user' : 'assistant',
          content: msg
        })),
        { role: "user", content: m.text },
      ];
      let res = await aiBeta(message);
      await conn.sendMessage(m.chat, {
        text: getMessage('ai_character_response', lang, { character: 'Nahida', result: res.result }),
        contextInfo: {
          externalAdReply: {
            title: "nahida",
            body: '',
            thumbnailUrl: `${pickRandom(img)}`,
            sourceUrl: null,
            mediaType: 1,
            renderLargerThumbnail: true
          }
        }
      }, { quoted: m });

      // Ubah cara save message
      conn.nahida[m.sender].message = [
        ...conn.nahida[m.sender].message,
        m.text,
        res.result
      ];
    } catch (e) {
      console.error("Error retrieving data:", e);
      throw getMessage('ai_error', lang);
    }
  }
};

handler.command = /^(nahida)$/i
handler.help = ["nahida"];
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
  `https://api.betabotz.eu.org/fire/tools/get-upload?id=f/mlbajd90.jpg`,
  `https://api.betabotz.eu.org/fire/tools/get-upload?id=f/whrnu1s5.jpg`,
  `https://api.betabotz.eu.org/fire/tools/get-upload?id=f/cllbxx3r.jpg`,
  `https://api.betabotz.eu.org/fire/tools/get-upload?id=f/y5dfjzg0.jpg`,
  `https://api.betabotz.eu.org/fire/tools/get-upload?id=f/f4sgzwjq.jpg`,
  `https://api.betabotz.eu.org/fire/tools/get-upload?id=f/oj8gjbmx.jpg`,
  `https://api.betabotz.eu.org/fire/tools/get-upload?id=f/aqyvshbb.jpg`,
  `https://api.betabotz.eu.org/fire/tools/get-upload?id=f/yia9a123.jpg`,
  `https://api.betabotz.eu.org/fire/tools/get-upload?id=f/twls4wyd.jpg`,
]
function pickRandom(list) {
  return list[Math.floor(list.length * Math.random())]
}