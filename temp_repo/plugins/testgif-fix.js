/**
 * GIF Reaction Test Command with Multiple Methods
 * This tool helps test and debug reaction GIF issues
 */

const fs = require('fs');
const path = require('path');
const { sendGif } = require('../utils/gifSender');

let handler = async (m, { conn, args, usedPrefix, command }) => {
  // Require owner permission to avoid abuse
  if (!m.isOwner) {
    return m.reply('This command is for bot owners only');
  }
  
  try {
    // Get reaction name from arguments or use "hug" as default
    const reactionName = args[0] || 'hug';
    
    // Path to the GIF file
    const gifPath = path.join(process.cwd(), 'gifs', `${reactionName}.gif`);
    
    // Check if GIF exists
    if (!fs.existsSync(gifPath)) {
      return m.reply(`GIF not found: ${reactionName}.gif\n\nAvailable in gifs directory: ${fs.existsSync(path.join(process.cwd(), 'gifs'))} 
Run .reactions to see available GIFs.`);
    }
    
    // Send test message
    await m.reply(`🔍 Testing GIF sending for "${reactionName}" with multiple methods...`);
    
    // Use the gifSender utility which has multiple strategies
    console.log(`[GIFTEST] Trying gifSender utility first`);
    const success = await sendGif(conn, m.chat, gifPath, m);
    
    if (success) {
      await m.reply(`✅ Success! GIF was sent using gifSender utility.`);
    } else {
      await m.reply(`❌ gifSender utility failed. Trying direct methods...`);
      
      // METHOD 1: Document method
      try {
        const buffer = fs.readFileSync(gifPath);
        await conn.sendMessage(m.chat, {
          document: buffer,
          mimetype: 'image/gif',
          fileName: `${reactionName}.gif`
        }, { quoted: m });
        console.log("[GIFTEST] Document method sent successfully");
        await m.reply('✅ Document method successful');
      } catch (error) {
        console.error("Document method error:", error);
        await m.reply(`❌ Document method failed: ${error.message}`);
      }
      
      // METHOD 2: Enhanced Video gifPlayback method
      try {
        const buffer = fs.readFileSync(gifPath);
        await conn.sendMessage(m.chat, {
          video: buffer,
          gifPlayback: true,
          caption: `GIF Test (enhanced video method): ${reactionName}`,
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
        console.log("[GIFTEST] Enhanced video method sent successfully");
        await m.reply('✅ Enhanced video method successful');
      } catch (error) {
        console.error("Enhanced video method error:", error);
        await m.reply(`❌ Enhanced video method failed: ${error.message}`);
      }
      
      // METHOD 3: sendFile method
      try {
        await conn.sendFile(
          m.chat, 
          gifPath, 
          `${reactionName}.gif`, 
          `GIF Test (sendFile method): ${reactionName}`, 
          m
        );
        console.log("[GIFTEST] sendFile method sent successfully");
        await m.reply('✅ sendFile method successful');
      } catch (error) {
        console.error("sendFile method error:", error);
        await m.reply(`❌ sendFile method failed: ${error.message}`);
      }
    }
    
  } catch (error) {
    console.error("[GIFTEST] Error:", error);
    m.reply(`Error testing reaction: ${error.message}`);
  }
};

handler.help = ['testgiffix [name]'];
handler.tags = ['tools', 'owner'];
handler.command = /^(testgiffix|fixgif|giffix)$/i;
handler.owner = true;

module.exports = handler;