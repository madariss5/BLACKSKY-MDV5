/**
 * Direct GIF Sender
 * Simple command to test sending GIFs directly to the chat
 */

const fs = require('fs');
const path = require('path');

let handler = async (m, { conn, args, usedPrefix, command }) => {
  try {
    // Get reaction name from arguments or use "hug" as default
    const reaction = args[0] || 'hug';
    
    // Path to the GIF file
    const gifPath = path.join(process.cwd(), 'gifs', `${reaction}.gif`);
    
    // Check if file exists
    if (!fs.existsSync(gifPath)) {
      return m.reply(`GIF not found: ${reaction}.gif\n\nAvailable GIFs: hug, kiss, pat, etc.`);
    }
    
    // Send a confirmation message
    await m.reply(`Sending ${reaction}.gif direct method...`);
    
    // Read the GIF file
    const gifBuffer = fs.readFileSync(gifPath);
    
    // Send directly as a document
    await conn.sendMessage(m.chat, { 
      document: gifBuffer,
      mimetype: 'image/gif',
      fileName: `${reaction}.gif` 
    }, { quoted: m });
    
  } catch (error) {
    console.error('Error in directgif command:', error);
    m.reply(`Error sending GIF: ${error.message}`);
  }
};

handler.help = ['directgif [reaction]'];
handler.tags = ['tools'];
handler.command = /^(directgif)$/i;

module.exports = handler;