/**
 * Language Switcher Command
 * This command allows users to change their language preference
 * between English and German.
 */

let handler = async (m, { conn, args, usedPrefix, command }) => {
  // Get current language setting
  const user = global.db.data.users[m.sender];
  const chat = global.db.data.chats[m.chat];
  const isGroup = m.isGroup;
  
  // Get the current language
  const currentLang = isGroup ? 
                      (chat?.language || 'en') : 
                      (user?.language || 'en');
  
  // Check if a language was specified
  if (!args[0]) {
    return conn.reply(m.chat, 
      `Current language: ${currentLang === 'en' ? 'English 🇬🇧' : 'German 🇩🇪'}\n\n` +
      `To change language, use:\n` +
      `${usedPrefix}${command} en - for English 🇬🇧\n` +
      `${usedPrefix}${command} de - for German/Deutsch 🇩🇪`, m);
  }
  
  // Get the requested language
  let language = args[0].toLowerCase();
  
  // Validate language
  if (language !== 'en' && language !== 'de') {
    return conn.reply(m.chat, 
      `Invalid language! Supported languages:\n` +
      `${usedPrefix}${command} en - for English 🇬🇧\n` +
      `${usedPrefix}${command} de - for German/Deutsch 🇩🇪`, m);
  }
  
  // Update language setting
  if (isGroup) {
    if (!global.db.data.chats[m.chat]) {
      global.db.data.chats[m.chat] = {};
    }
    global.db.data.chats[m.chat].language = language;
    
    // Confirm language change
    const confirmMsg = language === 'en' ? 
      `Group language changed to English 🇬🇧` : 
      `Gruppensprache wurde auf Deutsch geändert 🇩🇪`;
    
    return conn.reply(m.chat, confirmMsg, m);
  } else {
    if (!global.db.data.users[m.sender]) {
      global.db.data.users[m.sender] = {};
    }
    global.db.data.users[m.sender].language = language;
    
    // Confirm language change
    const confirmMsg = language === 'en' ? 
      `Your language changed to English 🇬🇧` : 
      `Deine Sprache wurde auf Deutsch geändert 🇩🇪`;
    
    return conn.reply(m.chat, confirmMsg, m);
  }
};

handler.help = ['setlang <en/de>'];
handler.tags = ['main'];
handler.command = /^((set|change)lang(uage)?)$/i;

module.exports = handler;