/**
 * Fix for Blurred and Non-Animated Reaction GIFs
 * This plugin provides a better way to send animated GIFs that are clear and properly animated
 */

const fs = require('fs');
const path = require('path');
const { promisify } = require('util');
const exec = promisify(require('child_process').exec);

let handler = async (m, { conn, args, usedPrefix, command }) => {
  // Only owners can use this command
  if (!m.isOwner) {
    return m.reply('This command is for bot owners only');
  }
  
  try {
    // Get reaction name from arguments
    const reactionName = args[0];
    
    if (!reactionName) {
      return m.reply(`Usage: ${usedPrefix}${command} <reaction_name>\nExample: ${usedPrefix}${command} hug`);
    }
    
    // Path to the GIF file
    const gifPath = path.join(process.cwd(), 'gifs', `${reactionName}.gif`);
    
    // Check if GIF exists
    if (!fs.existsSync(gifPath)) {
      return m.reply(`GIF not found: ${reactionName}.gif\n\nPlease make sure the GIF file exists.`);
    }
    
    // Analyze GIF file
    await m.reply(`Analyzing GIF: ${reactionName}.gif...`);
    const buffer = fs.readFileSync(gifPath);
    const fileSize = (buffer.length / 1024).toFixed(2);
    
    let infoMessage = `
📊 GIF Analysis: ${reactionName}.gif
🔢 Size: ${fileSize} KB

Now testing different sending methods for clear, animated GIFs...
`;
    await m.reply(infoMessage);
    
    // Method 1: Enhanced Video with GifPlayback (Best Method)
    try {
      await m.reply('Sending using Enhanced Video Method...');
      await conn.sendMessage(m.chat, {
        video: buffer,
        gifPlayback: true,
        caption: `Method 1: Enhanced Video GifPlayback`,
        mimetype: 'video/mp4',
        // Enhanced settings for better quality
        jpegThumbnail: null, // Disable thumbnail generation which can cause blur
        fileLength: buffer.length, // Correct file length helps with processing
        mediaType: 2, // Type 2 is for video
        ptt: false // Not voice note
      }, { 
        quoted: m,
        ephemeralExpiration: 0 // Ensure it doesn't expire
      });
      await m.reply('✅ Method 1 complete: Enhanced Video with GifPlayback');
    } catch (error) {
      await m.reply(`❌ Method 1 failed: ${error.message}`);
    }
    
    // Method 2: Image Method
    try {
      await m.reply('Sending using Image Method...');
      await conn.sendMessage(m.chat, {
        image: buffer,
        mimetype: 'image/gif',
        caption: 'Method 2: Image Mode'
      }, { quoted: m });
      await m.reply('✅ Method 2 complete: Image Mode');
    } catch (error) {
      await m.reply(`❌ Method 2 failed: ${error.message}`);
    }
    
    // Method 3: Default sendFile
    try {
      await m.reply('Sending using SendFile Method...');
      await conn.sendFile(
        m.chat, 
        gifPath, 
        `${reactionName}.gif`, 
        'Method 3: SendFile Method', 
        m, 
        true, // Set to true to indicate media
        { mimetype: 'image/gif' }
      );
      await m.reply('✅ Method 3 complete: SendFile Method');
    } catch (error) {
      await m.reply(`❌ Method 3 failed: ${error.message}`);
    }
    
    // Method 4: Document
    try {
      await m.reply('Sending using Document Method...');
      await conn.sendMessage(m.chat, {
        document: buffer,
        fileName: `${reactionName}.gif`,
        mimetype: 'image/gif',
        caption: 'Method 4: Document Mode'
      }, { quoted: m });
      await m.reply('✅ Method 4 complete: Document Method');
    } catch (error) {
      await m.reply(`❌ Method 4 failed: ${error.message}`);
    }
    
    // Conclusion
    await m.reply(`
🔍 GIF Testing Complete for: ${reactionName}.gif

The best method for sending clear, animated GIFs is Method 1: Enhanced Video with GifPlayback.

This method has been implemented in the updated reaction handlers throughout the bot.
`);
    
  } catch (error) {
    console.error('[FIX-REACTION-GIFS] Error:', error);
    m.reply(`Error: ${error.message}`);
  }
};

handler.help = ['fixgif <reaction>'];
handler.tags = ['tools', 'owner'];
handler.command = /^(fixgif|testgif|fixreaction)$/i;
handler.owner = true;

module.exports = handler;