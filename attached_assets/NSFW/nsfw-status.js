const { isNSFWEnabled } = require('../../lib/nsfwHelper');

let handler = async (m, { conn }) => {
    // Check if this is a group
    if (!m.isGroup) {
        return m.reply('⚠️ This command can only be used in groups.');
    }

    try {
        // Check NSFW status
        const isEnabled = isNSFWEnabled(m.chat);
        
        // Prepare response based on status
        if (isEnabled) {
            m.reply('✅ *NSFW STATUS*\n\nNSFW commands are currently *ENABLED* in this group.\n\nAdmins can disable them with: *.nsfw off*');
        } else {
            m.reply('❌ *NSFW STATUS*\n\nNSFW commands are currently *DISABLED* in this group.\n\nAdmins can enable them with: *.nsfw on*');
        }
    } catch (error) {
        console.error('NSFW status error:', error);
        m.reply('❌ An error occurred while checking NSFW status.');
    }
};

handler.help = ['nsfwstatus'];
handler.tags = ['group'];
handler.command = /^(nsfwstatus|statusnsfw)$/i;

module.exports = handler;