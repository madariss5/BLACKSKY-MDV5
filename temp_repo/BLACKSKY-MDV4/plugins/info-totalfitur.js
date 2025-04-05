const { getMessage } = require('../lib/languages');

let handler = async (m, { conn, args, command }) => {
    // Get user's preferred language
    const user = global.db.data.users[m.sender];
    const chat = global.db.data.chats[m.chat];
    const lang = user?.language || chat?.language || global.language;
    
    // Count total features
    let totalf = Object.values(global.plugins).filter(
        (v) => v.help && v.tags
    ).length;
    
    // Get translated message
    const message = getMessage('totalfitur_count', lang, {
        count: totalf
    }) || `Total features currently available: ${totalf}`;
    
    conn.reply(m.chat, message, m);
}

handler.help = ['totalfitur']
handler.tags = ['info']
handler.command = ['totalfitur']

module.exports = handler
