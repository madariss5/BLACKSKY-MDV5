/**
 * Test Command for Gunshop Translations
 * This plugin tests the gunshop translations specifically
 */

const { getMessage, applyReplacements } = require('../lib/message-utils');
const gunshopTranslations = require('../gunshop-translations');

let handler = async (m, { conn, args, isPrems }) => {
  // Get user language preference or default to English
  const user = global.db.users[m.sender];
  const userLang = (user?.language || conn.language || 'en').toLowerCase();
  
  // Display all available translations if no specific key is requested
  if (!args[0]) {
    let output = `*Gunshop Translations (${userLang.toUpperCase()})*\n\n`;
    
    // List all translation keys for the user's language
    for (const key of Object.keys(gunshopTranslations[userLang] || gunshopTranslations['en'])) {
      const translation = getMessage(gunshopTranslations, userLang, key);
      output += `• ${key}: "${translation}"\n`;
    }
    
    // Add examples
    output += '\n*Example with replacements:*\n';
    
    // Buy example
    const buyMessage = getMessage(gunshopTranslations, userLang, 'gunshop_buy_success');
    const buyReplacements = {
      amount: '5',
      item: '🔫AK47',
      payment: '💵Money'
    };
    
    output += `Buy message: "${applyReplacements(buyMessage, buyReplacements)}"\n`;
    
    // Sell example
    const sellMessage = getMessage(gunshopTranslations, userLang, 'gunshop_sell_success');
    const sellReplacements = {
      amount: '3',
      item: '🔫Glock',
      reward: '1,500',
      payment: '💵Money'
    };
    
    output += `Sell message: "${applyReplacements(sellMessage, sellReplacements)}"\n`;
    
    return m.reply(output);
  }
  
  // If a specific key is requested
  const key = args[0];
  if (gunshopTranslations[userLang]?.[key] || gunshopTranslations['en']?.[key]) {
    const translation = getMessage(gunshopTranslations, userLang, key);
    
    return m.reply(`*Translation (${userLang}):*\n${key}: "${translation}"`);
  }
  
  return m.reply(`Translation key "${key}" not found.`);
};

handler.help = ['testgunshop'];
handler.tags = ['developer'];
handler.command = /^(testgunshop)$/i;

// Only owner can use this command
handler.owner = true;

module.exports = handler;