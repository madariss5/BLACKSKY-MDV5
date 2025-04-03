/**
 * Auto-Translation Plugin
 * 
 * This plugin autodeadcally translates incoming messages to the group's
 * preferred language (if auto-translate is enabled for the group).
 */

const { translate } = require('@vitalets/google-translate-api');
const { getMessage } = require('../lib/languages');

module.exports = {
  before: async (m, { conn }) => {
    if (!m.text || m.fromMe) return;
    
    try {
      // Get chat data to check if auto-translate is enabled
      const chat = global.db.data.chats[m.chat];
      
      // If not in a group or auto-translate is disabled, skip
      if (!chat?.isGroup || !chat?.autoTranslate) return;
      
      // Get group's preferred language
      const targetLang = chat.language || global.language;
      
      // Don't translate if message is a command or doesn't have text
      if (m.text.startsWith(global.prefix) || !m.text) return;
      
      // Translate the text to the target language
      const result = await translate(m.text, { to: targetLang });
      
      // If translation is the same as original text, don't show translation
      if (result.text === m.text) return;
      
      // Get info about the detected source language
      const detectedLang = result.from.language.iso;
      
      // Only show translation if source language is different from target language
      if (detectedLang !== targetLang) {
        // Reply with the translated text
        const response = `*${getMessage('translation_detected', targetLang)}*\n` +
          `[${detectedLang} → ${targetLang}]\n\n` +
          `${result.text}`;
        
        // Add a small delay to make sure the original message arrives first
        setTimeout(() => {
          m.reply(response);
        }, 500);
      }
    } catch (error) {
      console.error('Auto-translation error:', error);
      // Don't notify users about translation errors to avoid spam
    }
    
    return true; // Continue processing the message
  }
};