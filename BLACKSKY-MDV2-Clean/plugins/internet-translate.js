/**
 * Translation Plugin
 * 
 * Translates text between languages using Google Translate.
 * Usage: .translate <target_lang> <text>
 * Example: .translate de Hello, how are you?
 */

const { translate } = require('@vitalets/google-translate-api');
const { getMessage } = require('../lib/languages');

let handler = async (m, { conn, text, usedPrefix, command }) => {
  // Get user's preferred language
  const user = global.db.data.users[m.sender];
  const lang = user?.language || global.language;
  
  if (!text) {
    return m.reply(`*${getMessage('translation_plugin', lang)}*\n\n${getMessage('usage', lang)}: ${usedPrefix}${command} <${getMessage('language_code', lang)}> <${getMessage('text', lang)}>\n\n${getMessage('Example', lang)}: ${usedPrefix}${command} en Hallo, wie geht es dir?`);
  }
  
  let args = text.split(' ');
  let targetLang = args[0].toLowerCase();
  let textToTranslate = args.slice(1).join(' ');
  
  if (!textToTranslate) {
    return m.reply(`${getMessage('usage', lang)}: ${usedPrefix}${command} <${getMessage('language_code', lang)}> <${getMessage('text', lang)}>\n\n${getMessage('Example', lang)}: ${usedPrefix}${command} en Hallo, wie geht es dir?`);
  }
  
  m.reply(getMessage('wait', lang));
  
  try {
    const result = await translate(textToTranslate, { to: targetLang });
    
    // Format the reply with both the original and translated text
    const reply = `*${getMessage('translation_result', lang)}:*\n\n` +
                  `*${getMessage('original', lang)}:* ${textToTranslate}\n` +
                  `*${getMessage('translated', lang)} (${result.from.language.iso} → ${targetLang}):* ${result.text}`;
    
    m.reply(reply);
  } catch (error) {
    console.error('Translation error:', error);
    m.reply(`${getMessage('translation_fail', lang)} ${error.message}`);
  }
};

handler.help = ['translate <lang> <text>'];
handler.tags = ['tools', 'internet'];
handler.command = /^(tr|translate|tl)$/i;

module.exports = handler;