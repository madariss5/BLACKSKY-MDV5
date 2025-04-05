const { getMessage } = require('../lib/languages');

/**
 * Auto-Block Command
 * 
 * This plugin enables and disables auto-blocking for specific country codes.
 * It works in conjunction with _anti+212.js to manage the auto-ban settings.
 */

let handler = async (m, { conn, args, usedPrefix, command }) => {
    // Get user's preferred language
    const user = global.db.data.users[m.sender];
    const chat = global.db.data.chats[m.chat];
    const lang = user?.language || chat?.language || global.language;
 {
    // Initialize settings if they don't exist
    if (!global.db.data.settings) global.db.data.settings = {}
    if (typeof global.db.data.settings.autoBanCodes !== 'object') {
        global.db.data.settings.autoBanCodes = {
            '212': true, // Morocco
            '91': true,  // India
            '263': true, // Zimbabwe 
            '265': true, // Malawi
        }
    }
    
    // Helper function to format country code infordeadon
    const formatCountryInfo = (code) => {
        const countryNames = {
            '212': 'Morocco',
            '91': 'India',
            '263': 'Zimbabwe',
            '265': 'Malawi',
            // Add more as needed
        }
        return `${code} (${countryNames[code] || 'Unknown'})`;
    }
    
    // Command to toggle auto-ban for a country code
    if (args[0] && args[0].toLowerCase() === 'toggle' && args[1]) {
        const countryCode = args[1];
        
        // Check if this is a valid country code (must be numeric)
        if (!/^\d+$/.test(countryCode)) {
            return conn.reply(m.chat, 'Please provide a valid numeric country code.', m);
        }
        
        // Toggle the setting
        global.db.data.settings.autoBanCodes[countryCode] = 
            !global.db.data.settings.autoBanCodes[countryCode];
            
        // Update user if the setting is now enabled
        if (global.db.data.settings.autoBanCodes[countryCode]) {
            // Confirm to the user
            return conn.reply(m.chat, 
                `Auto-ban for country code ${formatCountryInfo(countryCode)} has been *enabled*.`, m);
        } else {
            // Confirm to the user
            return conn.reply(m.chat, 
                `Auto-ban for country code ${formatCountryInfo(countryCode)} has been *disabled*.`, m);
        }
    }
    
    // Command to list all auto-ban settings
    if (args[0] && args[0].toLowerCase() === 'list') {
        // Get the list of country codes with their statuses
        const codeList = Object.entries(global.db.data.settings.autoBanCodes)
            .map(([code, enabled]) => `• ${formatCountryInfo(code)}: ${enabled ? '✅ Enabled' : '❌ Disabled'}`)
            .join('\n');
            
        return conn.reply(m.chat, 
            `*Auto-Ban Country Codes*\n\n${codeList}\n\nUse *${usedPrefix}${command} toggle <code>* to change settings.`, m);
    }
    
    // If no valid command was recognized, show help
    return conn.reply(m.chat, 
        `*Auto-Ban Country Codes Commands*\n\n` +
        `• *${usedPrefix}${command} list* - Show all country codes and their statuses\n` +
        `• *${usedPrefix}${command} toggle <code>* - Enable/disable auto-ban for a country code\n\n` +
        `Example: ${usedPrefix}${command} toggle 212`, m);
};

// Previous functionality is now in _anti+212.js

handler.help = ['autoban', 'autoblock'];
handler.tags = ['owner', 'group', 'admin'];
handler.command = /^(autoban|autoblock)$/i;
handler.owner = true;

}

module.exports = handler;
