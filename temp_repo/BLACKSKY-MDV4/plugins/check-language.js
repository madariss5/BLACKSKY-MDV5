/**
 * Debug command to check language settings
 * This allows users to see what language settings are active
 */

let handler = async (m, { conn, args, usedPrefix, command }) => {
  // Get all language settings
  const user = global.db.data.users[m.sender] || {};
  const chat = global.db.data.chats[m.chat] || {};
  const isGroup = m.isGroup;
  
  // Get the user and group language settings
  const userLang = user.language || null;
  const groupLang = chat.language || null;
  const globalLang = global.language || 'en';
  
  // Calculate the effective language
  const effectiveLang = userLang || (isGroup ? groupLang : null) || globalLang;
  
  // Format language names
  const getLangName = (code) => {
    if (code === 'en') return 'English 🇬🇧';
    if (code === 'de') return 'German/Deutsch 🇩🇪';
    return code || 'Not set';
  };
  
  // Build message
  let message = `🌐 *Language Settings Debugger* 🌐\n\n`;
  message += `👤 Your personal language: ${userLang ? getLangName(userLang) : 'Not set'}\n`;
  
  if (isGroup) {
    message += `👥 Group language: ${groupLang ? getLangName(groupLang) : 'Not set'}\n`;
  }
  
  message += `🌍 Global default: ${getLangName(globalLang)}\n\n`;
  message += `✅ *Effective language being used: ${getLangName(effectiveLang)}*\n\n`;
  message += `To change your language, use:\n${usedPrefix}setlang en - for English\n${usedPrefix}setlang de - for German`;
  
  return conn.reply(m.chat, message, m);
};

handler.help = ['checklang', 'debuglang'];
handler.tags = ['debug', 'main'];
handler.command = /^(check|debug)(lang(uage)?)$/i;

module.exports = handler;