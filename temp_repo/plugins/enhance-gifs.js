/**
 * Enhanced GIF Processing Tool
 * This command helps fix blurry and non-animated GIFs
 */

const fs = require('fs');
const path = require('path');
const { preprocessGif, preprocessAllGifs, sendEnhancedGif } = require('../utils/enhancedGifSender');

let handler = async (m, { conn, args, usedPrefix, command }) => {
  // Only owners can use this command
  if (!m.isOwner) {
    return m.reply('This command is for bot owners only');
  }
  
  try {
    // If no args, show help
    if (!args[0] || args[0] === 'help') {
      return m.reply(`
📋 Enhanced GIF Tools

Usage:
${usedPrefix}${command} process <name> - Process a specific GIF
${usedPrefix}${command} processall - Process all GIFs in the gifs folder
${usedPrefix}${command} test <name> - Test sending a specific GIF
${usedPrefix}${command} status - Show processing status
      `.trim());
    }
    
    const action = args[0].toLowerCase();
    
    // Process a specific GIF
    if (action === 'process') {
      const reactionName = args[1];
      if (!reactionName) {
        return m.reply(`Please specify a GIF name, e.g. ${usedPrefix}${command} process hug`);
      }
      
      // Path to the GIF file
      const gifPath = path.join(process.cwd(), 'gifs', `${reactionName}.gif`);
      
      // Check if GIF exists
      if (!fs.existsSync(gifPath)) {
        return m.reply(`GIF not found: ${reactionName}.gif\n\nPlease make sure the GIF file exists.`);
      }
      
      // Process the GIF
      await m.reply(`Processing GIF: ${reactionName}.gif...`);
      
      try {
        const processedPath = await preprocessGif(gifPath);
        await m.reply(`✅ GIF processed successfully: ${path.basename(processedPath)}`);
        
        // Test sending the processed GIF
        await m.reply(`Now testing the processed GIF...`);
        await sendEnhancedGif(conn, m.chat, processedPath, `Processed GIF test: ${reactionName}`, m);
      } catch (error) {
        await m.reply(`❌ Error processing GIF: ${error.message}`);
      }
    }
    // Process all GIFs
    else if (action === 'processall') {
      await m.reply(`Starting batch processing of all GIFs in the gifs folder. This may take some time...`);
      
      try {
        const results = await preprocessAllGifs();
        
        let resultMessage = `
📊 GIF Processing Results:
✅ Successfully processed: ${results.success}/${results.total} GIFs
❌ Failed: ${results.failed}/${results.total} GIFs
        `.trim();
        
        if (results.details.failed.length > 0) {
          resultMessage += `\n\nFailed GIFs:\n${results.details.failed.map(f => `- ${typeof f === 'string' ? f : f.gif}: ${f.error || 'Unknown error'}`).join('\n')}`;
        }
        
        await m.reply(resultMessage);
      } catch (error) {
        await m.reply(`❌ Error during batch processing: ${error.message}`);
      }
    }
    // Test sending a GIF with the enhanced method
    else if (action === 'test') {
      const reactionName = args[1] || 'hug';
      
      // Path to the GIF file
      const gifPath = path.join(process.cwd(), 'gifs', `${reactionName}.gif`);
      const processedPath = path.join(process.cwd(), 'tmp', `${reactionName}_processed.gif`);
      
      // Check if GIF exists
      if (!fs.existsSync(gifPath)) {
        return m.reply(`GIF not found: ${reactionName}.gif\n\nPlease make sure the GIF file exists.`);
      }
      
      // Send test message
      await m.reply(`Testing enhanced GIF sending for "${reactionName}"...`);
      
      // First try the processed version if it exists
      if (fs.existsSync(processedPath)) {
        await m.reply(`Found processed version, sending it first...`);
        await sendEnhancedGif(conn, m.chat, processedPath, `Enhanced GIF test (processed): ${reactionName}`, m);
        await m.reply(`✅ Processed GIF sent. Now sending original for comparison...`);
      }
      
      // Send the original for comparison
      await sendEnhancedGif(conn, m.chat, gifPath, `Enhanced GIF test (original): ${reactionName}`, m);
      await m.reply(`✅ Test complete. Check if the GIFs are displayed clearly and animated properly.`);
    }
    // Show processing status
    else if (action === 'status') {
      const gifsDir = path.join(process.cwd(), 'gifs');
      const tmpDir = path.join(process.cwd(), 'tmp');
      
      if (!fs.existsSync(gifsDir)) {
        return m.reply(`❌ Gifs directory not found`);
      }
      
      const originalGifs = fs.readdirSync(gifsDir).filter(file => file.endsWith('.gif'));
      const processedGifs = fs.existsSync(tmpDir) 
        ? fs.readdirSync(tmpDir).filter(file => file.endsWith('_processed.gif'))
        : [];
      
      let statusMessage = `
📊 GIF Processing Status:
📁 Total original GIFs: ${originalGifs.length}
🔄 Processed GIFs: ${processedGifs.length}
📝 Processing ratio: ${Math.round((processedGifs.length / originalGifs.length) * 100)}%
      `.trim();
      
      await m.reply(statusMessage);
    }
    else {
      await m.reply(`Unknown action: ${action}\nUse ${usedPrefix}${command} help to see available options.`);
    }
    
  } catch (error) {
    console.error('[ENHANCE-GIFS]', error);
    m.reply(`Error: ${error.message}`);
  }
};

handler.help = ['enhancegifs'];
handler.tags = ['tools', 'owner'];
handler.command = /^(enhancegifs|gifenhance|fixallgifs)$/i;
handler.owner = true;

module.exports = handler;