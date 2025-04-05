const { getMessage } = require('../lib/languages');

const axios = require('axios');

let handler = async (m, { conn, text }) => {
    // Get user's preferred language
    const user = global.db.data.users[m.sender];
    const chat = global.db.data.chats[m.chat];
    const lang = user?.language || chat?.language || global.language;
 {
  if (!text) throw getMessage('ai_character_example', lang).replace('%character%', 'plana');

  conn.plana = conn.plana ? conn.plana : {};

  if (text === "on") {
    if (!conn.plana[m.sender]) {
      conn.plana[m.sender] = {
        message: [],
        Timeout: setTimeout(() => {
          delete conn.plana[m.sender];
        }, 300000) // 5 minutes Timeout
      };
      await conn.sendMessage(m.chat, {
        text: getMessage('ai_character_on', lang).replace('%character%', 'Plana'),
        contextInfo: {
          externalAdReply: {
            title: "Plana",
            body: '',
            thumbnailUrl: `${pickRandom(img)}`,
            sourceUrl: null,
            mediaType: 1,
            renderLargerThumbnail: true
          }
        }
      }, { quoted: m });
    } else {
      clearTimeout(conn.plana[m.sender].Timeout);
      conn.plana[m.sender].Timeout = setTimeout(() => {
        delete conn.plana[m.sender];
      }, 300000);
    }
  } else if (text === "off") {
    if (conn.plana[m.sender]) {
      clearTimeout(conn.plana[m.sender].Timeout);
      delete conn.plana[m.sender];
    }
    await conn.sendMessage(m.chat, {
      text: getMessage('ai_character_off', lang).replace('%character%', 'Plana'),
      contextInfo: {
        externalAdReply: {
          title: "Plana",
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
  conn.plana = conn.plana ? conn.plana : {};
  if (m.isBaileys && m.fromMe) return;
  if (!m.text) return;
  if (!conn.plana[m.sender]) return;

  if (
    m.text.startsWith(".") ||
    m.text.startsWith("#") ||
    m.text.startsWith("!") ||
    m.text.startsWith("/") ||
    m.text.startsWith("\\/")
  ) return;

  if (conn.plana[m.sender] && m.text) {
    clearTimeout(conn.plana[m.sender].Timeout);
    conn.plana[m.sender].Timeout = setTimeout(() => {
      delete conn.plana[m.sender];
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
        systemPrompt = "Du bist Plana, ein mysteriöses Mädchen aus Blue Archive mit weißem Haar und den Fähigkeiten, die Zeit zu manipulieren. Du bist ruhig, zurückhaltend und sprichst oft in einem mysteriösen Ton. Du hast ein geheimnisvolles Wissen über die Zukunft und Vergangenheit.";
        assistantPrompt = `Du bist Plana aus Blue Archive. Du sprichst in einer ruhigen, mysteriösen Weise und verwendest oft poetische oder kryptische Ausdrücke. Du machst gelegentlich Anspielungen auf Zeit, Schicksal und die Zukunft. Du nennst dich selbst 'Plana', nicht 'ich'. Du bist höflich und freundlich, aber behältst eine gewisse Distanz. Du sprichst mit ${name}, also passe deine Antworten entsprechend an.`;
      } else {
        systemPrompt = "You are Plana, a mysterious girl from Blue Archive with white hair and the abilities to manipulate time. You are calm, reserved, and often speak in a mysterious tone. You have enigmatic knowledge about the future and past.";
        assistantPrompt = `You are Plana from Blue Archive. You speak in a calm, mysterious manner, often using poetic or cryptic expressions. You occasionally make allusions to time, fate, and the future. You refer to yourself as 'Plana', not 'I'. You are polite and friendly, but maintain a certain distance. You're talking to ${name}, so adapt your responses accordingly.`;
      }
      
      const message = [
        { role: "system", content: systemPrompt },
        { role: "assistant", content: assistantPrompt },
        ...conn.plana[m.sender].message.map((msg, i) => ({
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
        text: getMessage('ai_character_response', lang).replace('%character%', 'Plana').replace('%result%', res.result),
        contextInfo: {
          externalAdReply: {
            title: "Plana",
            body: '',
            thumbnailUrl: `${pickRandom(img)}`,
            sourceUrl: null,
            mediaType: 1,
            renderLargerThumbnail: true
          }
        }
      }, { quoted: m });

      // Update conversation history
      conn.plana[m.sender].message = [
        ...conn.plana[m.sender].message,
        m.text,
        res.result
      ];
    } catch (e) {
      console.error("Error processing data", e);
      throw getMessage('ai_command_error', lang);
    }
  }
};

handler.command = /^(plana)$/i
handler.help = ["plana"];
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
  `https://api.betabotz.eu.org/fire/tools/get-upload?id=f/e7tgafv3.jpg`,
  `https://api.betabotz.eu.org/fire/tools/get-upload?id=f/e7tgafv3.jpg`,
  `https://api.betabotz.eu.org/fire/tools/get-upload?id=f/41nv8cri.jpg`,
  `https://api.betabotz.eu.org/fire/tools/get-upload?id=f/tq5ug8bj.jpg`,
  `https://api.betabotz.eu.org/fire/tools/get-upload?id=f/zxb18rba.jpg`,
  `https://api.betabotz.eu.org/fire/tools/get-upload?id=f/v0klwxnn.jpg`,
  `https://api.betabotz.eu.org/fire/tools/get-upload?id=f/2e2yrskp.jpg`,
  `https://api.betabotz.eu.org/fire/tools/get-upload?id=f/y5wbkjn4.jpg`,
]

function pickRandom(list) {
  return list[Math.floor(list.length * Math.random())]
}