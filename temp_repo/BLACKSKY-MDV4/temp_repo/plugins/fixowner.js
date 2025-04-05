const { getMessage } = require('../lib/languages');

/**
 * Fix Owner Command
 * 
 * This command fixes permission issues by adding the bot's own number
 * to the owner list in the config file.
 */

const fs = require('fs');
const path = require('path');

let handler = async (m, { conn, args, isOwner }) => {
    // Get user's preferred language
    const user = global.db.data.users[m.sender];
    const chat = global.db.data.chats[m.chat];
    const lang = user?.language || chat?.language || global.language;
 {
  // Check if the message is sent by the bot itself or a current owner
  const isSelfMessage = m.fromMe;
  
  if (!isOwner && !isSelfMessage) {
    return m.reply('This command can only be used by the bot owner or the bot itself');
  }
  
  const configPath = './config.js';
  
  try {
    await m.reply('🔒 Checking owner configuration...');
    
    // Get the bot's own number
    if (!conn.user) {
      return m.reply(getMessage('error_generic', lang, { error: 'Cannot get bot number - not connected to WhatsApp' }));
    }
    
    const botNumber = conn.user.jid.split('@')[0];
    
    // Read the config file
    let configContent = fs.readFileSync(configPath, 'utf8');
    
    // Check if bot number is already in the owner list
    const isAlreadyOwner = configContent.includes(botNumber);
    
    if (isAlreadyOwner) {
      return m.reply(`✅ Bot number (${botNumber}) is already in the owner list.`);
    }
    
    // Find the owner array in the config
    const ownerRegex = /(global\.owner\s*=\s*\[)(.*?)(\])/s;
    const match = configContent.match(ownerRegex);
    
    if (!match) {
      return m.reply(getMessage('error_generic', lang, { error: 'Could not find owner configuration in config.js' }));
    }
    
    // Structure of the owner entry to add
    const ownerToAdd = `\n  ['${botNumber}', 'Bot', true],`;
    
    // Add the bot to the owner list
    const updatedOwnerSection = match[1] + match[2] + ownerToAdd + match[3];
    const updatedConfig = configContent.replace(ownerRegex, updatedOwnerSection);
    
    // Backup the original config
    const timestamp = new Date().getTime();
    fs.writeFileSync(`${configPath}.bak-${timestamp}`, configContent);
    
    // Write the updated config
    fs.writeFileSync(configPath, updatedConfig);
    
    await m.reply(`✅ Successfully added bot number (${botNumber}) to owner list.

Restart the bot for changes to take effect.`);
    
    // Try to reload the config without restart
    try {
      delete require.cache[require.resolve('../config')];
      require('../config');
      await m.reply(getMessage('success_generic', lang, { message: 'Configuration reloaded successfully.' }));
    } catch (e) {
      await m.reply(`⚠️ Config file updated, but could not reload: ${e.message}\nPlease restart the bot.`);
    }
    
  } catch (error) {
    console.error('[FIXOWNER]', error);
    await m.reply(`❌ Error fixing owner configuration: ${error.message}`);
  }
};

handler.help = ['fixowner', 'addowner']
handler.tags = ['owner', 'debug']
handler.command = /^(fixowner|addowner)$/i

}

module.exports = handler