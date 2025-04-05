/**
 * Test GIFs Command
 * 
 * This command shows all available GIFs in the gifs folder
 * and allows testing of individual GIFs
 */

const fs = require('fs');
const path = require('path');

let handler = async (m, { conn, text, usedPrefix, command }) => {
  try {
    const gifsDir = path.join(process.cwd(), 'gifs');
    
    // Ensure the directory exists
    if (!fs.existsSync(gifsDir)) {
      return m.reply('❌ GIFs directory not found!');
    }
    
    // Get all gif files
    const gifFiles = fs.readdirSync(gifsDir)
      .filter(file => file.toLowerCase().endsWith('.gif'))
      .map(file => file.replace('.gif', ''));
    
    // If no specific gif requested, list all available gifs
    if (!text) {
      const reactionsList = gifFiles.map(name => `• ${name}`).join('\n');
      return m.reply(`📋 *Available Reaction GIFs:*\n\n${reactionsList}\n\nUse ${usedPrefix}${command} [name] to test a specific GIF`);
    }
    
    // Find the requested gif
    const requestedGif = text.toLowerCase();
    const matchingGif = gifFiles.find(name => name.toLowerCase() === requestedGif);
    
    if (!matchingGif) {
      return m.reply(`❌ GIF "${requestedGif}" not found!\n\nAvailable GIFs:\n${gifFiles.join(', ')}`);
    }
    
    // Load and send the gif
    const gifPath = path.join(gifsDir, `${matchingGif}.gif`);
    const gifBuffer = fs.readFileSync(gifPath);
    
    m.reply(`🎬 Sending ${matchingGif}.gif...`);
    
    await conn.sendFile(m.chat, gifBuffer, `${matchingGif}.mp4`, `✅ GIF: ${matchingGif}`, m, false, {
      mimetype: 'video/mp4',
      gifPlayback: true
    });
    
  } catch (error) {
    console.error('Error in test-gifs command:', error);
    m.reply(`Error: ${error.message}`);
  }
};

handler.help = ['testgif [name]'];
handler.tags = ['tools', 'dev'];
handler.command = /^(testgif|giftest|test-gif)$/i;

module.exports = handler;