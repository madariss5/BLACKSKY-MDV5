const { getMessage } = require('../lib/languages');

/**
 * GIF Preprocessor Tool
 * Pre-converts all GIFs to JPEGs for better compatibility
 */

const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

let handler = async (m, { conn, args, isOwner }) => {
    // Get user's preferred language
    const user = global.db.data.users[m.sender];
    const chat = global.db.data.chats[m.chat];
    const lang = user?.language || chat?.language || global.language;
 {
  // This tool is owner-only to prevent abuse
  if (!isOwner) {
    conn.reply(m.chat, '❌ This command is for bot owners only', m);
    return;
  }
  
  try {
    // Get list of all GIFs
    const gifsDir = path.join(process.cwd(), 'gifs');
    if (!fs.existsSync(gifsDir)) {
      conn.reply(m.chat, '❌ Gifs directory Not found', m);
      return;
    }
    
    // Create tmp directory if it doesn't exist
    const tmpDir = path.join(process.cwd(), 'tmp');
    if (!fs.existsSync(tmpDir)) {
      fs.mkdirSync(tmpDir, { recursive: true });
    }
    
    // Get all gif files
    const gifFiles = fs.readdirSync(gifsDir)
      .filter(file => file.endsWith('.gif'));
    
    if (gifFiles.length === 0) {
      conn.reply(m.chat, '❌ No GIF files found in the gifs directory', m);
      return;
    }
    
    // Initial status message
    conn.reply(m.chat, `🔄 Processing ${gifFiles.length} GIF files...`, m);
    let processedCount = 0;
    let errorCount = 0;
    
    // Process each gif file
    for (const gifFile of gifFiles) {
      try {
        const gifPath = path.join(gifsDir, gifFile);
        const outputName = gifFile.replace('.gif', '.jpg');
        const outputPath = path.join(tmpDir, outputName);
        
        // Check if already processed
        if (fs.existsSync(outputPath)) {
          console.log(`[PREPROCESS] ${outputName} already exists, skipping`);
          processedCount++;
          continue;
        }
        
        // Extract first frame and convert to JPEG
        await sharp(gifPath)
          .toFormat('jpeg')
          .jpeg({ quality: 90 })
          .toFile(outputPath);
        
        console.log(`[PREPROCESS] Converted ${gifFile} to ${outputName}`);
        processedCount++;
        
        // Send progress update every 5 files
        if (processedCount % 5 === 0) {
          conn.reply(m.chat, `🔄 Progress: ${processedCount}/${gifFiles.length} files processed...`, m);
        }
      } catch (error) {
        console.error(`[PREPROCESS] Error processing ${gifFile}: ${error.message}`);
        errorCount++;
      }
    }
    
    // Send final status
    conn.reply(m.chat, `✅ Conversion complete!
✓ Successfully processed: ${processedCount - errorCount}/${gifFiles.length} files
${errorCount > 0 ? `❌ Errors: ${errorCount} files` : ''}

Files saved to: ./tmp/
Now you can use the ultra[reaction] commands for better compatibility.`, m);
    
  } catch (error) {
    console.error(`[PREPROCESS] Error: ${error.message}`);
    conn.reply(m.chat, `❌ Error: ${error.message}`, m);
  }
};

handler.help = ['prepgifs'];
handler.tags = ['owner'];
handler.command = /^(prepgifs|preprocessgifs)$/i;
handler.owner = true;

}

module.exports = handler;