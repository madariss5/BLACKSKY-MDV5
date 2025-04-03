/**
 * Direct GIF Sender Utility Command
 * Tests sending GIFs using multiple methods
 */

const fs = require('fs');
const path = require('path');
const { sendGif } = require('../utils/gifSender');

let handler = async (m, { conn, args, usedPrefix, command }) => {
  try {
    if (!args[0]) {
      return m.reply(`Usage: ${usedPrefix}${command} <reaction>\nExample: ${usedPrefix}${command} hug`);
    }
    
    const reaction = args[0];
    const gifPath = path.join(process.cwd(), 'gifs', `${reaction}.gif`);
    
    // Check if GIF exists
    if (!fs.existsSync(gifPath)) {
      return m.reply(`GIF not found: ${reaction}.gif\n\nMake sure the file exists in the gifs directory.`);
    }
    
    m.reply(`Attempting to send ${reaction}.gif using the enhanced GIF sender...`);
    
    // Use our utility to try sending the GIF with multiple methods
    const success = await sendGif(conn, m.chat, gifPath, m);
    
    if (success) {
      m.reply(`✅ Successfully sent ${reaction}.gif`);
    } else {
      m.reply(`❌ Failed to send ${reaction}.gif after trying multiple methods.`);
    }
    
  } catch (error) {
    console.error('Error in gifsend command:', error);
    m.reply(`Error: ${error.message}`);
  }
};

handler.help = ['gifsend <reaction>'];
handler.tags = ['tools', 'test'];
handler.command = /^(gifsend|giftest)$/i;

module.exports = handler;