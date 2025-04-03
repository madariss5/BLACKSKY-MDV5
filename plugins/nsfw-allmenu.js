/**
 * NSFW All Menu Command
 * Shows all available NSFW commands and management options
 */

let handler = async (m, { conn }) => {
  // Get user language
  const user = global.db.data.users?.[m.sender];
  const chat = global.db.data.chats?.[m.chat];
  const lang = user?.language || chat?.language || global.language || 'en';
  
  // Check if NSFW is enabled in this chat (always enabled in private chats)
  const isNsfwEnabled = !m.isGroup || chat?.nsfw || false;
  
  // Prepare headers based on language
  const headers = {
    en: {
      title: '🔞 *NSFW COMMANDS MENU* 🔞',
      status: isNsfwEnabled ? '✅ NSFW is currently *ENABLED* in this chat' : '❌ NSFW is currently *DISABLED* in this chat',
      adminNote: 'ℹ️ Group admins can enable/disable with: *.nsfw on/off*',
      managementTitle: '📋 *Management Commands*',
      contentTitle: '📸 *Content Commands*',
      warning: '⚠️ *WARNING: Adult content (18+)*'
    },
    de: {
      title: '🔞 *NSFW BEFEHLE MENÜ* 🔞',
      status: isNsfwEnabled ? '✅ NSFW ist in diesem Chat derzeit *AKTIVIERT*' : '❌ NSFW ist in diesem Chat derzeit *DEAKTIVIERT*',
      adminNote: 'ℹ️ Gruppenadmins können dies umschalten mit: *.nsfw on/off*',
      managementTitle: '📋 *Verwaltungsbefehle*',
      contentTitle: '📸 *Inhaltsbefehle*',
      warning: '⚠️ *WARNUNG: Inhalte für Erwachsene (18+)*'
    }
  };
  
  // Use the correct headers based on language
  const h = headers[lang] || headers.en;
  
  // Construct the menu text
  let menuText = `${h.title}\n\n`;
  menuText += `${h.status}\n`;
  
  if (m.isGroup) {
    menuText += `${h.adminNote}\n`;
  }
  
  // Add management commands section
  menuText += `\n${h.managementTitle}\n`;
  menuText += `┌─────────────────\n`;
  menuText += `├ .nsfw on/off\n`;
  menuText += `├ .nsfwstatus\n`;
  menuText += `├ .nsfwforce on/off (owner only)\n`;
  menuText += `└─────────────────\n`;
  
  // Add content commands section
  menuText += `\n${h.contentTitle}\n`;
  menuText += `┌─────────────────\n`;
  
  // Original commands
  menuText += `├ .ass, .bdsm, .blowjob, .cum\n`;
  menuText += `├ .ero, .femdom, .foot, .gangbang\n`;
  menuText += `├ .glasses, .hentai, .jahy, .manga\n`;
  menuText += `├ .masturbation, .neko, .orgy\n`;
  menuText += `├ .panties, .pussy, .tentacles\n`;
  menuText += `├ .thighs, .yuri, .zettai\n`;
  
  // New commands
  menuText += `├ *NEW* .lingerie, .underwear\n`;
  menuText += `├ *NEW* .cosplay, .lewd-cosplay\n`;
  menuText += `├ *NEW* .uniform, .schooluniform\n`;
  menuText += `├ *NEW* .swimsuit, .bikini\n`;
  menuText += `└─────────────────\n`;
  
  // Add warning at the bottom
  menuText += `\n${h.warning}`;
  
  // Send the menu
  conn.reply(m.chat, menuText, m);
};

handler.help = ['nsfwmenu', 'nsfwhelp'];
handler.tags = ['nsfw', 'info'];
handler.command = /^(nsfwmenu|nsfwhelp|nsfwcmds|nsfwcommands)$/i;

module.exports = handler;