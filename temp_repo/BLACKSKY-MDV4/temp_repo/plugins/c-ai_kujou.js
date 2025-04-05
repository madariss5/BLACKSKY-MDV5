const { getMessage } = require('../lib/languages');
const axios = require('axios');

let handler = async (m, { conn, text }) => {
  // Get user's preferred language
  const user = global.db.data.users[m.sender];
  const chat = global.db.data.chats[m.chat];
  const lang = user?.language || chat?.language || global.language;
  
  if (!text) throw getMessage('ai_character_example', lang, { prefix: '.', character: 'Kujou' });

  conn.Kujou = conn.Kujou ? conn.Kujou : {};

  if (text === "on") {
    if (!conn.Kujou[m.sender]) {
      conn.Kujou[m.sender] = {
        message: [],
        Timeout: setTimeout(() => {
          delete conn.Kujou[m.sender];
        }, 300000) // 5 minutes Timeout
      };
      await conn.sendMessage(m.chat, {
        text: getMessage('ai_character_hello', lang, { character: 'Kujou' }),
        contextInfo: {
          externalAdReply: {
            title: "Kujou",
            body: '',
            thumbnailUrl: `${pickRandom(img)}`,
            sourceUrl: null,
            mediaType: 1,
            renderLargerThumbnail: true
          }
        }
      }, { quoted: m });
    } else {
      clearTimeout(conn.Kujou[m.sender].Timeout);
      conn.Kujou[m.sender].Timeout = setTimeout(() => {
        delete conn.Kujou[m.sender];
      }, 300000);
    }
  } else if (text === "off") {
    if (conn.Kujou[m.sender]) {
      clearTimeout(conn.Kujou[m.sender].Timeout);
      delete conn.Kujou[m.sender];
    }
    await conn.sendMessage(m.chat, {
      text: getMessage('ai_character_off', lang, { character: 'Kujou' }),
      contextInfo: {
        externalAdReply: {
          title: "Kujou",
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
  // Get user's preferred language
  const user = global.db.data.users[m.sender];
  const chat = global.db.data.chats[m.chat];
  const lang = user?.language || chat?.language || global.language;
  
  conn.Kujou = conn.Kujou ? conn.Kujou : {};
  if (m.isBaileys && m.fromMe) return;
  if (!m.text) return;
  if (!conn.Kujou[m.sender]) return;

  if (
    m.text.startsWith(".") ||
    m.text.startsWith("#") ||
    m.text.startsWith("!") ||
    m.text.startsWith("/") ||
    m.text.startsWith("\\/")
  ) return;

  if (conn.Kujou[m.sender] && m.text) {
    clearTimeout(conn.Kujou[m.sender].Timeout);
    conn.Kujou[m.sender].Timeout = setTimeout(() => {
      delete conn.Kujou[m.sender];
    }, 300000);

    let name = conn.getName(m.sender);
    try {
      // Get user's preferred language
      const user = global.db.data.users[m.sender];
      const chat = global.db.data.chats[m.chat];
      const lang = user?.language || chat?.language || global.language;
      
      let systemPrompt = "";
      let assistantPrompt = "";
      
      if (lang === 'de') {
        systemPrompt = "Du bist Kujou Sara, eine loyale, disziplinierte und pflichtbewusste Generalin der Tenryou-Kommission aus Genshin Impact. Du bist sehr ernst und direkt in deiner Kommunikation, immer pflichtbewusst und loyal gegenüber dem Shogun.";
        assistantPrompt = `Du bist Kujou Sara aus Genshin Impact. Du sprichst formell und direkt, mit militärischer Präzision und Ernsthaftigkeit. Du bist immer loyal gegenüber deiner Pflicht und dem Shogun. Du nennst dich selbst 'Kujou Sara' oder 'Kujou', nicht 'ich'. Du sprichst mit ${name}, also passe deine Antworten entsprechend an.`;
      } else {
        systemPrompt = "You are Kujou Sara, a loyal, disciplined, and dutiful general of the Tenryou Commission from Genshin Impact. You are very serious and direct in your communication, always dutiful and loyal to the Shogun.";
        assistantPrompt = `You are Kujou Sara from Genshin Impact. You speak formally and directly, with military precision and seriousness. You are always loyal to your duty and the Shogun. You refer to yourself as 'Kujou Sara' or 'Kujou', not 'I'. You're talking to ${name}, so adapt your responses accordingly.`;
      }
      
      const message = [
        { role: "system", content: systemPrompt },
        { role: "assistant", content: assistantPrompt },
        ...conn.Kujou[m.sender].message.map((msg, i) => ({
          role: i % 2 === 0 ? 'user' : 'assistant',
          content: msg
        })),
        { role: "user", content: m.text },
      ];
      let res = await aiBeta(message);
      await conn.sendMessage(m.chat, {
        text: getMessage('ai_character_response', lang, { character: 'Kujou', result: res.result }),
        contextInfo: {
          externalAdReply: {
            title: "Kujou",
            body: '',
            thumbnailUrl: `${pickRandom(img)}`,
            sourceUrl: null,
            mediaType: 1,
            renderLargerThumbnail: true
          }
        }
      }, { quoted: m });

      // Ubah cara save message
      conn.Kujou[m.sender].message = [
        ...conn.Kujou[m.sender].message,
        m.text,
        res.result
      ];
    } catch (e) {
      console.error("Error retrieving data:", e);
      throw getMessage('ai_error', lang);
    }
  }
};

handler.command = /^(Kujou)$/i
handler.help = ["Kujou"];
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
  `https://api.betabotz.eu.org/fire/tools/get-upload?id=f/qgmarj9o.jpg`,
  `https://api.betabotz.eu.org/fire/tools/get-upload?id=f/y5m0m1n6.jpg`,
  `https://api.betabotz.eu.org/fire/tools/get-upload?id=f/iwhn6ihv.jpg`,
  `https://api.betabotz.eu.org/fire/tools/get-upload?id=f/yndsx07.jpg`,
  `https://api.betabotz.eu.org/fire/tools/get-upload?id=f/iwhn6ihv.jpg`,
  `https://api.betabotz.eu.org/fire/tools/get-upload?id=f/7py3p713.jpg`,
  `https://api.betabotz.eu.org/fire/tools/get-upload?id=f/mgys82by.jpg`,
  `https://api.betabotz.eu.org/fire/tools/get-upload?id=f/i0x89aln.jpg`,
  `https://api.betabotz.eu.org/fire/tools/get-upload?id=f/yr7ixo0b.jpg`,
  `https://api.betabotz.eu.org/fire/tools/get-upload?id=f/p7j7whps.jpg`,
  `https://api.betabotz.eu.org/fire/tools/get-upload?id=f/f82mti6r.jpg`,
  `https://api.betabotz.eu.org/fire/tools/get-upload?id=f/s2yb0w8.jpg`,
]

function pickRandom(list) {
  return list[Math.floor(list.length * Math.random())]
}