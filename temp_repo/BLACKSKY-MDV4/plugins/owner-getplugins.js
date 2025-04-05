const { getMessage } = require('../lib/languages');

const fs = require('fs');
const path = require('path');
let handler = async (m, { usedPrefix, command, text }) => {
    // Get user's preferred language
    const user = global.db.data.users[m.sender];
    const chat = global.db.data.chats[m.chat];
    const lang = user?.language || chat?.language || global.language;
    
    if (!text) throw getMessage('getplugin_no_text', lang, {
        prefix: usedPrefix,
        command: command
    });
    
    const filename = path.join(__dirname, `./${text}${!/\.js$/i.test(text) ? '.js' : ''}`)
    const listPlugins = fs.readdirSync(path.join(__dirname)).map(v => v.replace(/\.js/, ''))
    
    if (!fs.existsSync(filename)) return m.reply(getMessage('getplugin_not_found', lang, {
        filename: filename,
        plugin_list: listPlugins.map(v => v).join('\n').trim()
    }));
    
    m.reply(fs.readFileSync(filename, 'utf8'))
}
handler.help = ['getplugin'].map(v => v + ' [filename]')
handler.tags = ['owner']
handler.command = /^(getplugin|get ?plugin|gp)$/i

handler.rowner = true

module.exports = handler
