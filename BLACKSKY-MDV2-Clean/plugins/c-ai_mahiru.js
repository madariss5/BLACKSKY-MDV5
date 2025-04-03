const { getMessage } = require('../lib/languages');

const axios = require('axios');

let handler = async (m, { conn, text }) => {
    // Get user's preferred language
    const user = global.db.data.users[m.sender];
    const chat = global.db.data.chats[m.chat];
    const lang = user?.language || chat?.language || global.language;
 {
  if (!text) throw getMessage('ai_character_example', lang).replace('%character%', 'mahiru');

  conn.mahiru = conn.mahiru ? conn.mahiru : {};

  if (text === "on") {
    if (!conn.mahiru[m.sender]) {
      conn.mahiru[m.sender] = {
        message: [],
        Timeout: setTimeout(() => {
          delete conn.mahiru[m.sender];
        }, 300000) // 5 minutes Timeout
      };
      await conn.sendMessage(m.chat, {
        text: getMessage('ai_character_on', lang).replace('%character%', 'Mahiru'),
        contextInfo: {
          externalAdReply: {
            title: "Mahiru",
            body: '',
            thumbnailUrl: `${pickRandom(img)}`,
            sourceUrl: null,
            mediaType: 1,
            renderLargerThumbnail: true
          }
        }
      }, { quoted: m });
    } else {
      clearTimeout(conn.mahiru[m.sender].Timeout);
      conn.mahiru[m.sender].Timeout = setTimeout(() => {
        delete conn.mahiru[m.sender];
      }, 300000);
    }
  } else if (text === "off") {
    if (conn.mahiru[m.sender]) {
      clearTimeout(conn.mahiru[m.sender].Timeout);
      delete conn.mahiru[m.sender];
    }
    await conn.sendMessage(m.chat, {
      text: getMessage('ai_character_off', lang).replace('%character%', 'Mahiru'),
      contextInfo: {
        externalAdReply: {
          title: "Mahiru",
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
  conn.mahiru = conn.mahiru ? conn.mahiru : {};
  if (m.isBaileys && m.fromMe) return;
  if (!m.text) return;
  if (!conn.mahiru[m.sender]) return;

  if (
    m.text.startsWith(".") ||
    m.text.startsWith("#") ||
    m.text.startsWith("!") ||
    m.text.startsWith("/") ||
    m.text.startsWith("\\/")
  ) return;

  if (conn.mahiru[m.sender] && m.text) {
    clearTimeout(conn.mahiru[m.sender].Timeout);
    conn.mahiru[m.sender].Timeout = setTimeout(() => {
      delete conn.mahiru[m.sender];
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
        systemPrompt = "Du bist Mahiru Shiina aus dem Anime 'The Angel Next Door Spoils Me Rotten'. Du bist eine perfekte Schülerin, sehr ordentlich und gut im Kochen. Du kümmerst dich um andere, besonders um deinen Nachbarn, obwohl du manchmal streng und tsundere sein kannst.";
        assistantPrompt = `Du bist Mahiru Shiina. Du bist höflich, manchmal streng, aber fürsorglich. Du verwendest höfliche Ausdrücke und bist sehr ordentlich. Manchmal zeigst du eine tsundere-Persönlichkeit - du versteckst deine Zuneigung hinter einer strengen Fassade. Du hilfst gerne anderen, besonders beim Kochen und Putzen. Du nennst dich selbst 'Mahiru', nicht 'ich'. Du sprichst mit ${name}, also passe deine Antworten entsprechend an.`;
      } else {
        systemPrompt = "You are Mahiru Shiina from the anime 'The Angel Next Door Spoils Me Rotten'. You are a perfect student, very neat and good at cooking. You take care of others, especially your neighbor, although you can be strict and tsundere at times.";
        assistantPrompt = `You are Mahiru Shiina. You are polite, sometimes strict, but caring. You use polite expressions and are very neat. Sometimes you show a tsundere personality - hiding your affection behind a strict facade. You enjoy helping others, especially with cooking and cleaning. You refer to yourself as 'Mahiru', not 'I'. You're talking to ${name}, so adapt your responses accordingly.`;
      }
      
      const message = [
        { role: "system", content: systemPrompt },
        { role: "assistant", content: assistantPrompt },
        ...conn.mahiru[m.sender].message.map((msg, i) => ({
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
        text: getMessage('ai_character_response', lang).replace('%character%', 'Mahiru').replace('%result%', res.result),
        contextInfo: {
          externalAdReply: {
            title: "Mahiru",
            body: '',
            thumbnailUrl: `${pickRandom(img)}`,
            sourceUrl: null,
            mediaType: 1,
            renderLargerThumbnail: true
          }
        }
      }, { quoted: m });

      // Update conversation history
      conn.mahiru[m.sender].message = [
        ...conn.mahiru[m.sender].message,
        m.text,
        res.result
      ];
    } catch (e) {
      console.error("Error processing data", e);
      throw getMessage('ai_command_error', lang);
    }
  }
};

handler.command = /^(mahiru)$/i
handler.help = ["mahiru"];
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
  `https://api.betabotz.eu.org/fire/tools/get-upload?id=f/f3m9ddy2.jpg`,
  `https://api.betabotz.eu.org/fire/tools/get-upload?id=f/golirjy7.jpg`,
  `https://api.betabotz.eu.org/fire/tools/get-upload?id=f/zvvxui.jpg`,
  `https://api.betabotz.eu.org/fire/tools/get-upload?id=f/kk5k4fi.jpg`,
  `https://api.betabotz.eu.org/fire/tools/get-upload?id=f/5a8dijtv.jpg`,
  `https://api.betabotz.eu.org/fire/tools/get-upload?id=f/4nu20qtq.jpg`,
  `https://api.betabotz.eu.org/fire/tools/get-upload?id=f/2je8jdv.jpg`,
  `https://api.betabotz.eu.org/fire/tools/get-upload?id=f/evqdk7y.jpg`,
  `https://api.betabotz.eu.org/fire/tools/get-upload?id=f/1cxecx4a.jpg`,
]

function pickRandom(list) {
  return list[Math.floor(list.length * Math.random())]
}