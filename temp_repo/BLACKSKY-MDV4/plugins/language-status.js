/**
 * Language Status Plugin
 * 
 * This plugin provides information about the available languages
 * and their current status in the bot.
 */

const fs = require('fs');
const path = require('path');
const chalk = require('chalk');

// Define available languages
const LANGUAGES = ['en', 'de'];

/**
 * Get count of translations available for each language
 * @returns {Object} Translation counts by language
 */
async function getTranslationCounts() {
  try {
    // Try to load language module
    let languagesPath = path.join(__dirname, '..', 'lib', 'languages.js');
    if (!fs.existsSync(languagesPath)) {
      return { en: 'Unknown', de: 'Unknown' };
    }
    
    // Delete from cache to make sure we get the latest version
    delete require.cache[require.resolve(languagesPath)];
    const languages = require(languagesPath);
const { getMessage } = require('../lib/languages.js');
    
    // Count translations for each language
    const counts = {};
    
    for (const lang of LANGUAGES) {
      if (languages[lang]) {
        counts[lang] = Object.keys(languages[lang]).length;
      } else {
        counts[lang] = 0;
      }
    }
    
    return counts;
  } catch (error) {
    console.error('Error getting translation counts:', error);
    return { en: 'Error', de: 'Error' };
  }
}

/**
 * Get active language for a user or group
 * @param {string} id - User or group ID
 * @returns {string} Active language code
 */
function getActiveLanguage(id) {
  if (!id) return global.defaultLanguage || 'en';
  
  try {
    // Check personal settings first
    const userData = global.getUserData ? global.getUserData(id) : 
                   (global.db?.data?.users?.[id] || {});
                   
    if (userData.language && LANGUAGES.includes(userData.language)) {
      return userData.language;
    }
    
    // Check group settings if it's a group
    if (id.endsWith('@g.us')) {
      const chatData = global.getChatData ? global.getChatData(id) : 
                     (global.db?.data?.chats?.[id] || {});
                     
      if (chatData.language && LANGUAGES.includes(chatData.language)) {
        return chatData.language;
      }
    }
    
    // Fall back to default
    return global.defaultLanguage || 'en';
  } catch (error) {
    console.error('Error getting active language:', error);
    return global.defaultLanguage || 'en';
  }
}

// Main handler
let handler = async (m, { conn, args }) => {
  // Get translation counts
  const counts = await getTranslationCounts();
  
  // Get current user's active language
  const userLang = getActiveLanguage(m.sender);
  
  // Get current chat's active language if in a group
  const chatLang = m.isGroup ? getActiveLanguage(m.chat) : null;
  
  // Format language names
  const langNames = {
    'en': 'English',
    'de': 'German (Deutsch)'
  };
  
  // Create status message
  let message = `*🌐 WhatsApp Bot Language Status*\n\n`;
  
  // Available languages and translation counts
  message += `*Available Languages:*\n`;
  for (const lang of LANGUAGES) {
    const count = counts[lang];
    message += `${lang === userLang ? '✅' : '➖'} ${langNames[lang] || lang}: ${count} translations\n`;
  }
  
  message += `\n*Active Languages:*\n`;
  message += `👤 Your personal language: ${langNames[userLang] || userLang}\n`;
  
  if (chatLang) {
    message += `👥 This group's language: ${langNames[chatLang] || chatLang}\n`;
  }
  
  message += `\n*Language Priority:*\n`;
  message += `1️⃣ Personal language setting\n`;
  message += `2️⃣ Group language setting (in groups)\n`;
  message += `3️⃣ Global default (${langNames[global.defaultLanguage || 'en'] || global.defaultLanguage || 'en'})\n`;
  
  message += `\n*Change Your Language:*\n`;
  message += `.setlang [language code]\n`;
  message += `Example: .setlang de\n`;
  
  // Check if user is admin using standard group participant methods
  if (m.isGroup) {
    try {
      // Get participant data to check admin status
      const groupMetadata = await conn.groupMetadata(m.chat);
      const participants = groupMetadata.participants || [];
      const participant = participants.find(p => p.id === m.sender);
      const isAdmin = participant && (participant.admin === 'admin' || participant.admin === 'superadmin');
      
      if (isAdmin) {
        message += `\n*Change Group Language:*\n`;
        message += `.setgrouplang [language code]\n`;
        message += `Example: .setgrouplang en\n`;
      }
    } catch (error) {
      console.error('Error checking admin status:', error);
    }
  }
  
  m.reply(message);
};

handler.help = ['languagestatus', 'langstatus'];
handler.tags = ['info'];
handler.command = /^(language(status)?|lang(status)?)$/i;

module.exports = handler;