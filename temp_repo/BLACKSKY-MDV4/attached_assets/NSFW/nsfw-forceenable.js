const { toggleNsfw } = require('../../lib/nsfwHelper');

let handler = async (m, { conn, args, isOwner }) => {
    // Check if user has permission (must be owner)
    if (!isOwner) {
        return m.reply('❌ Only the bot owner can use this command.');
    }

    if (!args[0]) {
        return m.reply('⚠️ Please specify on/off. Example: .nsfwforce on');
    }

    // Determine the desired state
    const option = args[0].toLowerCase();
    let state;
    
    if (option === 'on' || option === 'enable' || option === '1' || option === 'true') {
        state = true;
    } else if (option === 'off' || option === 'disable' || option === '0' || option === 'false') {
        state = false;
    } else {
        return m.reply('⚠️ Invalid option. Use on/off, enable/disable, 1/0, or true/false.');
    }

    // Toggle NSFW state
    const result = await toggleNsfw(m, conn, state);
    m.reply(`🔒 *OWNER OVERRIDE*\n\n${result}`);
};

handler.help = ['nsfwforce <on/off>'];
handler.tags = ['owner'];
handler.command = /^(nsfwforce|forcensfw)$/i;
handler.owner = true;

module.exports = handler;