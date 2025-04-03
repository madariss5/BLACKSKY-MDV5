const { toggleNsfw } = require('../../lib/nsfwHelper');

let handler = async (m, { conn, args, isAdmin, isOwner }) => {
    // Check if user has permission (admin or owner)
    if (!isAdmin && !isOwner) {
        return m.reply('❌ Only admins can toggle NSFW settings for this chat.');
    }

    // Check if this is a group
    if (!m.isGroup) {
        return m.reply('❌ This command can only be used in groups.');
    }

    if (!args[0]) {
        return m.reply('⚠️ Please specify on/off. Example: .nsfw on');
    }

    const option = args[0].toLowerCase();
    
    // Determine the desired state
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
    m.reply(result);
};

handler.help = ['nsfw <on/off>'];
handler.tags = ['group', 'admin'];
handler.command = /^(nsfw|togglensfw)$/i;

module.exports = handler;