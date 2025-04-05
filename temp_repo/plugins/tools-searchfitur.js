const { getMessage } = require('../lib/languages');

/*
 Jangan delete wm this,kalo mau recode Please tapi sertain juga credits I Lann
 Dibuat pada 22 February 2025
 © Betabotz
*/

let handler = async (m, { conn, args, command, usedPrefix }) => {
    // Get user's preferred language
    const user = global.db.data.users[m.sender];
    const chat = global.db.data.chats[m.chat];
    const lang = user?.language || chat?.language || global.language;
    
    if (!args.length) {
        const exampleMsg = getMessage('searchfitur_example', lang, {
            prefix: usedPrefix,
            command: command
        }) || `✨ *Example Usage:* \n🔍 ${usedPrefix}${command} fitur`;
        
        return conn.reply(m.chat, exampleMsg, m);
    }
    
    let plugins = Object.entries(global.plugins).filter(([name, v]) => v.help && Array.isArray(v.tags));
    let query = args.join(' ').toLowerCase();
    let filteredPlugins = plugins.filter(([name, v]) => v.help.some(h => h.toLowerCase().includes(query)));
    
    if (filteredPlugins.length === 0) {
        const noResultMsg = getMessage('searchfitur_no_result', lang, {
            query: query
        }) || `❌ *No features match your search:* \n🔍 '${query}'`;
        
        return conn.reply(m.chat, noResultMsg, m);
    }
    
    // Get translated header
    const headerMsg = getMessage('searchfitur_result_header', lang, {
        query: query
    }) || `🔎 *Search Results for:* '${query}' \n\n`;
    
    // For tag label translation
    const tagsLabel = getMessage('searchfitur_tags_label', lang) || 'Tags:';
    const pluginLabel = getMessage('searchfitur_plugin_label', lang) || 'Plugin:';
    const noTagsLabel = getMessage('searchfitur_no_tags', lang) || 'None';
    
    let message = headerMsg;
    message += filteredPlugins.map(([name, v]) => {
        // Get the tag names - they might need translation in the future too
        const tagNames = Array.isArray(v.tags) ? v.tags.join(', ') : noTagsLabel;
        
        return `✅ *${v.help.join(', ')}*\n📌 *${tagsLabel}* ${tagNames}\n📂 *${pluginLabel}* ${name}\n`;
    }).join('\n');
    
    conn.reply(m.chat, message, m);
}

handler.help = ['searchfitur']
handler.tags = ['tools']
handler.command = ['searchfitur']


module.exports = handler;
