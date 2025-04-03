const { getMessage } = require('../lib/languages');

let handler = async (m, { conn, command, text }) => {
    // Get user's preferred language
    const user = global.db.data.users[m.sender];
    const chat = global.db.data.chats[m.chat];
    const lang = user?.language || chat?.language || global.language;
    
    const trait = command.replace('how', '').toUpperCase();
    
    // Error message if no text is provided
    if (!text) {
        if (lang === 'de') {
            throw `Wer ist *${trait}*?`;
        } else {
            throw `Who is *${trait}*?`;
        }
    }
    
    const percentage = Math.floor(Math.random() * 101);
    
    conn.reply(m.chat, `
${command} *${text}*
*${text}* is *${percentage}*% ${trait}
`.trim(), m, m.mentionedJid ? {
        contextInfo: {
            mentionedJid: m.mentionedJid
        }
    } : {})
}
// Translation map for trait names
const traits = {
    'gay': 'gay',
    'clever': 'smart',
    'cantik': 'beautiful',
    'ganteng': 'handsome',
    'gabut': 'bored',
    'gila': 'crazy',
    'lesbi': 'lesbian',
    'stress': 'stressed',
    'bucin': 'lovesick',
    'jones': 'lonely',
    'sadboy': 'sadboy'
};

// Create help text with both Indonesian and English terms
handler.help = Object.entries(traits).map(([id, en]) => `how${id} - how ${en} is [name]?`)
handler.tags = ['kerang'] // Magic Shell category
handler.command = /^how(gay|pintar|cantik|ganteng|gabut|gila|lesbi|stress?|bucin|jones|sadboy)/i
handler.owner = false
handler.mods = false
handler.premium = false
handler.group = false
handler.private = false

handler.admin = false
handler.botAdmin = false

handler.fail = null

module.exports = handler
