module.exports = (m) => {
  const conn = m.conn;
  
  conn.reply(m.chat, `🔞 *NSFW COMMANDS MENU* 🔞

*Management Commands*
• .nsfw on/off - Enable/disable NSFW commands
• .nsfwstatus - Check NSFW status
• .nsfwmenu - Show this menu

*Content Categories*
• .lingerie, .underwear
• .cosplay, .lewd-cosplay  
• .uniform, .schooluniform
• .swimsuit, .bikini

*Original Categories*
• .ass, .bdsm, .blowjob, .cum
• .ero, .femdom, .foot, .gangbang
• .glasses, .hentai, .jahy, .manga
• .masturbation, .neko, .orgy
• .panties, .pussy, .tentacles
• .thighs, .yuri, .zettai

⚠️ *Note: NSFW commands only work in chats where NSFW is enabled*`, m);
};