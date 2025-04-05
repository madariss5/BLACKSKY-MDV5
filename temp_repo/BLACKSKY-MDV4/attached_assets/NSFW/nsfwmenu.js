const { isNSFWEnabled } = require('../../lib/nsfwHelper');

let handler = async (m, { conn, isAdmin, isOwner }) => {
    // For DMs or if admin/owner, show the menu regardless of NSFW setting
    const isGroupChat = m.isGroup;
    const shouldShowMenu = !isGroupChat || isAdmin || isOwner || (isGroupChat && isNSFWEnabled(m.chat));
    
    if (!shouldShowMenu && isGroupChat) {
        return m.reply('❌ NSFW commands are not enabled in this chat.\n\nAn admin can enable them with *.nsfw on*');
    }
    
    // Show full NSFW menu
    const message = `🔞 *NSFW COMMANDS MENU* 🔞

*Management Commands*
• .nsfw on/off - Enable/disable NSFW commands
• .nsfwstatus - Check NSFW status
• .nsfwmenu - Show this menu
${isOwner ? '• .nsfwforce on/off - Owner override for NSFW settings\n' : ''}

*Content Categories*
• .lingerie, .underwear - Lingerie/underwear images
• .cosplay, .lewd-cosplay - NSFW cosplay content  
• .uniform, .schooluniform - Various uniform content
• .swimsuit, .bikini - Swimsuit/bikini content

*Original Categories*
• .ass, .bdsm, .blowjob, .cum
• .ero, .femdom, .foot, .gangbang
• .glasses, .hentai, .jahy, .manga
• .masturbation, .neko, .orgy
• .panties, .pussy, .tentacles
• .thighs, .yuri, .zettai

⚠️ *Note: NSFW commands only work in chats where NSFW is enabled by an admin*`;

    await m.reply(message);
};

handler.help = ['nsfwmenu'];
handler.tags = ['nsfw'];
handler.command = /^(nsfwmenu|nsfw-menu|nsfw_menu|menunsfw)$/i;

module.exports = handler;