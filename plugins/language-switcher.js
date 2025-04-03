/**
 * Language Switcher Plugin
 * 
 * This plugin allows users to switch between available languages.
 * Currently supported: English (en) and German (de)
 */

const { getMessage, getAvailableLanguages } = require('../lib/languages');

let handler = async (m, { conn, text, usedPrefix, command }) => {
  // Get current user language
  const currentLang = global.db.data.users[m.sender].language || 'en';
  
  // Get supported languages
  const supportedLanguages = getAvailableLanguages();
  
  // If no language specified, show current language and available options
  if (!text) {
    let langList = supportedLanguages.map(code => {
      const isActive = code === currentLang ? '✓ ' : '';
      // Get language name based on code
      const langName = {
        'en': 'English',
        'de': 'Deutsch (German)'
        // Add more languages here in the future
      }[code] || code;
      
      return `${isActive}${langName} (${code})`;
    }).join('\n');
    
    return m.reply(`*Your current language:* ${currentLang}\n\n*Available languages:*\n${langList}\n\nTo change your language, use: ${usedPrefix}${command} <code>\nExample: ${usedPrefix}${command} de`);
  }
  
  // Get the language code from the command
  const langCode = text.trim().toLowerCase();
  
  // Validate the language code
  if (!supportedLanguages.includes(langCode)) {
    return m.reply(`Invalid language code. Available language codes: ${supportedLanguages.join(', ')}`);
  }
  
  // If it's already the current language
  if (langCode === currentLang) {
    return m.reply(`Your language is already set to ${langCode}.`);
  }
  
  // Update the user's language preference
  global.db.data.users[m.sender].language = langCode;
  
  // Set the language for the current message
  m.lang = langCode;
  
  // Confirm the language change
  let confirmMessage;
  if (langCode === 'en') {
    confirmMessage = 'Language changed to English successfully!';
  } else if (langCode === 'de') {
    confirmMessage = 'Sprache erfolgreich auf Deutsch geändert!';
  } else {
    confirmMessage = `Language changed to ${langCode} successfully!`;
  }
  
  return m.reply(confirmMessage);
};

handler.help = ['language <code>', 'lang <code>', 'sprache <code>'];
handler.tags = ['main', 'settings'];
handler.command = /^(language|lang|sprache)$/i;

module.exports = handler;