const { getMessage } = require('../lib/languages');

let handler = async (m, { conn, text }) => {
    // Get user's preferred language
    const user = global.db.data.users[m.sender];
    const chat = global.db.data.chats[m.chat];
    const lang = user?.language || chat?.language || global.language;
    
    // Define time units based on user's language
    let timeUnits;
    let prefix;
    
    if (lang === 'de') {
        timeUnits = ['Sekunden', 'Minuten', 'Stunden', 'Tage', 'Wochen', 'Monate', 'Jahre', 'Jahrhunderte'];
        prefix = 'Wahrscheinlich in';
    } else {
        timeUnits = ['seconds', 'minutes', 'hours', 'days', 'weeks', 'months', 'years', 'centuries'];
        prefix = 'Probably in';
    }
    
    const randomNumber = Math.floor(Math.random() * 100);
    const randomUnit = pickRandom(timeUnits);
    
    conn.reply(m.chat, `${prefix} ${randomNumber} ${randomUnit} ...`.trim(), m, m.mentionedJid ? {
        contextInfo: {
            mentionedJid: m.mentionedJid
        }
    } : {})
}
// Help text for different languages
const helpText = {
    'en': 'when <question>? - Magic 8-ball style prediction for "when\\\" questions',
    'de': 'wann <frage>? - Magische Vorhersage für \\\"wann" Fragen'
};

handler.help = ['when <question>?', 'kapan <text>?'] // Both English and Indonesian commands
handler.tags = ['kerang'] // Magic Shell category
handler.customPrefix = /(\?$)/
handler.command = /^(kapan(kah)?|when|wann)$/i
handler.owner = false
handler.mods = false
handler.premium = false
handler.group = false
handler.private = false

handler.admin = false
handler.botAdmin = false

handler.fail = null

module.exports = handler

function pickRandom(list) {
  return list[Math.floor(Math.random() * list.length)]
}

