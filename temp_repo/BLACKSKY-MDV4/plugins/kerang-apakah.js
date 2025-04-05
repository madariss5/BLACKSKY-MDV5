const { getMessage } = require('../lib/languages');

let handler = async (m, { conn, text }) => {
    // Get user's preferred language
    const user = global.db.data.users[m.sender];
    const chat = global.db.data.chats[m.chat];
    const lang = user?.language || chat?.language || global.language;
    
    // Get responses based on user language
    let responses;
    if (lang === 'de') {
        responses = ['Ja', 'Scheint so', 'Vielleicht', 'Wahrscheinlich nicht', 'Nein', 'Unmöglich'];
    } else {
        responses = ['Yes', 'It seems so', 'Maybe', 'Probably not', 'No', 'Impossible'];
    }
    
    conn.reply(m.chat, `${pickRandom(responses)}`.trim(), m, m.mentionedJid ? {
        contextInfo: {
            mentionedJid: m.mentionedJid
        }
    } : {})
}
// Help text for different languages
const helpText = {
    'en': 'isit/willit <question>? - Magic 8-ball style yes/no questions',
    'de': 'istdas/wirddas <frage>? - Magische Ja/Nein Fragen'
};

handler.help = ['apakah <question>?', 'isit <question>?'] // Both Indonesian and English commands
handler.tags = ['kerang'] // Magic Shell category for asking questions
handler.customPrefix = /(\?$)/
handler.command = /^(apakah|isit|willit|istdas|wirddas)$/i
handler.owner = false

handler.fail = null

module.exports = handler

function pickRandom(list) {
  return list[Math.floor(Math.random() * list.length)]
}
