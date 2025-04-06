const fs = require('fs');
const { getMessage } = require('../lib/languages');

let handler = async (m, { conn, args, isOwner }) => {
    const user = global.db.data.users[m.sender];
    const chat = global.db.data.chats[m.chat];
    const lang = user?.language || chat?.language || global.language;

    // Check if message is from bot itself
    const isSelfMessage = m.fromMe;

    const configPath = './config.js';

    try {
        await m.reply('🔒 Checking owner configuration...');

        // Get the bot's own number
        if (!conn.user) {
            return m.reply(getMessage('error_generic', lang, { error: 'Cannot get bot number - not connected to WhatsApp' }));
        }

        const botNumber = conn.user.jid.split('@')[0];

        // Read the config file
        let configContent = fs.readFileSync(configPath, 'utf8');

        // Find the owner array in the config
        const ownerRegex = /(global\.owner\s*=\s*\[)(.*?)(\])/s;
        const match = configContent.match(ownerRegex);

        if (!match) {
            return m.reply('Could not find owner configuration in config.js');
        }

        // Add bot number to owner list
        const ownerToAdd = `\n  ['${botNumber}', 'Bot', true],`;
        const updatedOwnerSection = match[1] + match[2] + ownerToAdd + match[3];
        const updatedConfig = configContent.replace(ownerRegex, updatedOwnerSection);

        // Backup original config
        const timestamp = new Date().getTime();
        fs.writeFileSync(`${configPath}.bak-${timestamp}`, configContent);

        // Write updated config
        fs.writeFileSync(configPath, updatedConfig);

        await m.reply(`✅ Successfully added bot number (${botNumber}) to owner list.\n\nPlease restart the bot for changes to take effect.`);

        // Try to reload config without restart
        try {
            delete require.cache[require.resolve('../config')];
            require('../config');
            await m.reply('Configuration reloaded successfully');
        } catch (e) {
            await m.reply('Config updated but requires restart to take effect');
        }

    } catch (error) {
        console.error('FIXOWNER ERROR:', error);
        await m.reply(`❌ Error fixing owner configuration: ${error.message}`);
    }
};

handler.help = ['fixowner'];
handler.tags = ['owner'];
handler.command = /^(fixowner|addowner)$/i;
handler.rowner = true;

module.exports = handler;