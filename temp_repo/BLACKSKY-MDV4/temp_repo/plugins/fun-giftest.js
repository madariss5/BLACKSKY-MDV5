const { getMessage } = require('../lib/languages');

/**
 * GIF Tester - Test various methods of sending GIFs
 */

const fs = require('fs');
const path = require('path');

const handler = async (m, { conn, args, usedPrefix, command }) => {
  // List of all GIFs for testing
  const gifPath = path.join(process.cwd(), 'gifs', 'hug.gif');
  console.log(`[GIFTEST] Using GIF: ${gifPath}`);
  
  if (!fs.existsSync(gifPath)) {
    conn.reply(m.chat, `GIF file Not found at ${gifPath}`, m);
    return;
  }
  
  // Read the buffer
  const buffer = fs.readFileSync(gifPath);
  
  // Explain the test
  conn.reply(m.chat, `GIF sending test beginning. I will now try to send the same GIF in 4 different formats...`, m);
  
  // METHOD 1: Document format
  try {
    await conn.reply(m.chat, `TEST 1/4: Document format`, m);
    await conn.sendMessage(m.chat, {
      document: buffer,
      mimetype: 'image/gif',
      fileName: `test.gif`,
      caption: `Test GIF (Document)`
    }, { quoted: m });
    console.log(`[GIFTEST] Method 1 (Document) succeeded`);
  } catch (e) {
    console.error(`[GIFTEST] Method 1 Failed: ${e.message}`);
    conn.reply(m.chat, `Method 1 Failed: ${e.message}`, m);
  }
  
  // METHOD 2: video format with gifPlayback
  try {
    await conn.reply(m.chat, `TEST 2/4: video format with gifPlayback`, m);
    await conn.sendMessage(m.chat, { 
      video: buffer, 
      caption: `Test GIF (video)`,
      gifPlayback: true
    }, { quoted: m });
    console.log(`[GIFTEST] Method 2 (video) succeeded`);
  } catch (e) {
    console.error(`[GIFTEST] Method 2 Failed: ${e.message}`);
    conn.reply(m.chat, `Method 2 Failed: ${e.message}`, m);
  }
  
  // METHOD 3: Image format (first frame only)
  try {
    await conn.reply(m.chat, `TEST 3/4: Image format (first frame only)`, m);
    await conn.sendMessage(m.chat, { 
      image: buffer, 
      caption: `Test GIF (Image - first frame only)`
    }, { quoted: m });
    console.log(`[GIFTEST] Method 3 (Image) succeeded`);
  } catch (e) {
    console.error(`[GIFTEST] Method 3 Failed: ${e.message}`);
    conn.reply(m.chat, `Method 3 Failed: ${e.message}`, m);
  }
  
  // METHOD 4: Sticker
  try {
    await conn.reply(m.chat, `TEST 4/4: Sticker format`, m);
    await conn.sendVideoAsSticker(m.chat, buffer, m, { 
      packname: 'Test', 
      author: 'Bot'
    });
    console.log(`[GIFTEST] Method 4 (Sticker) succeeded`);
  } catch (e) {
    console.error(`[GIFTEST] Method 4 Failed: ${e.message}`);
    conn.reply(m.chat, `Method 4 Failed: ${e.message}`, m);
  }
  
  // Final message
  conn.reply(m.chat, `Test complete. Check which methods work best in your chat.`, m);
};

handler.help = ['giftest'];
handler.tags = ['tools'];
handler.command = /^(giftest)$/i;

console.log(`[STARTUP] GIF Tester registered`);

module.exports = handler;