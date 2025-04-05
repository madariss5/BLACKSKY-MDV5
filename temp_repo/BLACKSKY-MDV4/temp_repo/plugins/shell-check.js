const { getMessage } = require('../lib/languages');

let handler = async (m, { conn, usedPrefix, command, text }) => {
    // Get user's preferred language
    const user = global.db.data.users[m.sender];
    const chat = global.db.data.chats[m.chat];
    const lang = user?.language || chat?.language || global.language;
    
    const levelValue = Math.floor(Math.random() * 101);
    const traitName = command.replace('check', '').toUpperCase();
    
    let message;
    if (lang === 'de') {
        message = `
────〔 *${command}* 〕────

${traitName} level *${levelValue}*% 

Unabhängig von deinem *${traitName}*-level
*SCHÄTZE* was du hast`;
    } else {
        message = `
────〔 *${command}* 〕────

${traitName} level *${levelValue}*% 

No matter what your *${traitName}* level is
Always *APPRECIATE* what you have`;
    }
    
    m.reply(message)
}
// Translation map for help text (Indonesian to English)
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
handler.help = Object.entries(traits).map(([id, en]) => `${id}check - ${en} check`)
handler.tags = ['kerang'] // Magic Shell category
handler.command = /^(gay|pintar|cantik|ganteng|gabut|gila|lesbi|stress?|bucin|jones|sadboy)check/i
handler.owner = false
handler.mods = false
handler.premium = false
handler.group = false
handler.private = false

handler.admin = false
handler.botAdmin = false

handler.fail = null

module.exports = handler
