/**
 * Translation Test Command
 * This command tests translations for different features
 */

const { getMessage } = require('../lib/languages');
const messageUtils = require('../lib/message-utils');
const gunshopTranslations = require('../gunshop-translations');

const handler = async (m, { conn, args, usedPrefix, command }) => {
  // Get user language preference or default to English
  const user = global.db.users[m.sender];
  const userLang = (user?.language || conn.language || 'en').toLowerCase();
  
  // Display help message if no arguments provided
  if (!args[0]) {
    return m.reply(`
*Translation Tester*

Test different translation functionalities:
- ${usedPrefix}${command} gunshop - Test gunshop translations
- ${usedPrefix}${command} lang <en/de> - Switch test language

Current language: ${userLang}
    `.trim());
  }
  
  // Handle language switching
  if (args[0] === 'lang') {
    const newLang = args[1]?.toLowerCase();
    if (!newLang || !['en', 'de'].includes(newLang)) {
      return m.reply(`Please specify a valid language (en, de)`);
    }
    
    // Store language preference if user exists
    if (user) {
      user.language = newLang;
      return m.reply(`Language set to *${newLang}*`);
    }
    return m.reply(`Unable to set language preference. User data not found.`);
  }
  
  // Test gunshop translations
  if (args[0] === 'gunshop') {
    const testKey = args[1] || 'gunshop_title';
    
    // Test if the key exists
    const gunshopText = messageUtils.getMessage(gunshopTranslations, userLang, testKey);
    
    return m.reply(`
*Translation Test: Gunshop*

Language: ${userLang}
Key: ${testKey}
Translation: ${gunshopText}

Example usage for buying (with replacements):
${messageUtils.applyReplacements(
  messageUtils.getMessage(gunshopTranslations, userLang, 'gunshop_buy_success'), 
  {
    amount: '5',
    item: '🔫AK47',
    payment: '💵Money'
  }
)}
    `.trim());
  }
  
  return m.reply(`Unknown test type. Try \`${usedPrefix}${command}\` for help.`);
};

handler.help = ['testtranslation'];
handler.tags = ['developer'];
handler.command = /^(testtranslation|testtrans)$/i;

// Only owner can use this command
handler.owner = true;

module.exports = handler;