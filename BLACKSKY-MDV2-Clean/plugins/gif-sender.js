const { getMessage } = require('../lib/languages');

/**
 * Simple GIF Sender - Basic command to test sending GIFs in different formats
 * Useful for testing compatibility with various WhatsApp clients
 */

const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const { promisify } = require('util');
const execAsync = promisify(exec);

let handler = async (m, { conn, usedPrefix, command, args }) => {
    // Get user's preferred language
    const user = global.db.data.users[m.sender];
    const chat = global.db.data.chats[m.chat];
    const lang = user?.language || chat?.language || global.language;
 {
  // Owner only command
  if (!m.isOwner) {
    conn.reply(m.chat, 'This command is only for bot owners.', m);
    return;
  }
  
  // Show help text if no arguments
  if (!args[0]) {
    conn.reply(m.chat, `*GIF Sender Test Tool*\n\nUsage:\n${usedPrefix}sendgif <reaction> <method>\n\nMethods:\n- image: Send as image\n- doc: Send as document\n- video: Send as video\n- sticker: Send as sticker\n- all: Try all methods\n\nExample: ${usedPrefix}sendgif hug all`, m);
    return;
  }
  
  const reactionName = args[0];
  const method = args[1] || 'all';
  
  // Check if GIF file exists
  const gifPath = path.join(process.cwd(), 'gifs', `${reactionName}.gif`);
  if (!fs.existsSync(gifPath)) {
    conn.reply(m.chat, `GIF Not found: ${reactionName}.gif`, m);
    return;
  }
  
  // Create tmp directory if it doesn't exist
  const tmpDir = path.join(process.cwd(), 'tmp');
  if (!fs.existsSync(tmpDir)) {
    fs.mkdirSync(tmpDir, { recursive: true });
  }
  
  // Read the GIF file
  const buffer = fs.readFileSync(gifPath);
  
  // Calculate file size
  const stats = fs.statSync(gifPath);
  const fileSizeMB = (stats.size / (1024 * 1024)).toFixed(2);
  
  // Prepare for testing
  conn.reply(m.chat, `Testing sending ${reactionName}.gif (${fileSizeMB} MB) with method: ${method}`, m);
  
  // Convert to MP4 for video method
  const mp4Path = path.join(tmpDir, `${reactionName}.mp4`);
  if ((method === 'video' || method === 'all') && !fs.existsSync(mp4Path)) {
    try {
      conn.reply(m.chat, `Converting ${reactionName}.gif to MP4...`, m);
      await execAsync(`ffmpeg -i "${gifPath}\\\" -movflags faststart -pix_fmt yuv420p -vf \\\"scale=trunc(iw/2)*2:trunc(ih/2)*2" "${mp4Path}"`);
    } catch (error) {
      conn.reply(m.chat, `Error converting to MP4: ${error.message}. Will attempt direct sending.`, m);
    }
  }
  
  // Try different methods based on user selection
  let results = [];
  
  // Helper function to add result
  const addResult = (method, success, error = null) => {
    results.push({
      method,
      success,
      error: error ? error.message : null
    });
  };
  
  // 1. Send as image
  if (method === 'image' || method === 'all') {
    try {
      await conn.sendMessage(m.chat, {
        image: buffer,
        caption: `${reactionName} - sent as image`
      });
      addResult('image', true);
    } catch (error) {
      console.error(`Error sending as image: ${error.message}`);
      addResult('image', false, error);
    }
  }
  
  // 2. Send as document
  if (method === 'doc' || method === 'all') {
    try {
      await conn.sendMessage(m.chat, {
        document: buffer,
        mimetype: 'image/gif',
        fileName: `${reactionName}.gif`,
        caption: `${reactionName} - sent as document`
      });
      addResult('document', true);
    } catch (error) {
      console.error(`Error sending as document: ${error.message}`);
      addResult('document', false, error);
    }
  }
  
  // 3. Send as video
  if (method === 'video' || method === 'all') {
    try {
      if (fs.existsSync(mp4Path)) {
        const videoBuffer = fs.readFileSync(mp4Path);
        await conn.sendMessage(m.chat, {
          video: videoBuffer,
          gifPlayback: true,
          caption: `${reactionName} - sent as video`,
          fileName: `${reactionName}.mp4`
        });
        addResult('video', true);
      } else {
        // Try sending the GIF directly as video
        await conn.sendMessage(m.chat, {
          video: buffer,
          gifPlayback: true,
          caption: `${reactionName} - sent as video (direct)`,
          fileName: `${reactionName}.gif`
        });
        addResult('video (direct)', true);
      }
    } catch (error) {
      console.error(`Error sending as video: ${error.message}`);
      addResult('video', false, error);
    }
  }
  
  // 4. Send as sticker
  if (method === 'sticker' || method === 'all') {
    try {
      await conn.sendVideoAsSticker(m.chat, buffer, m, {
        packname: 'Reactions',
        author: 'WhatsApp Bot'
      });
      addResult('sticker', true);
    } catch (error) {
      console.error(`Error sending as sticker: ${error.message}`);
      addResult('sticker', false, error);
      
      // Try as static sticker
      try {
        await conn.sendImageAsSticker(m.chat, buffer, m, {
          packname: 'Reactions',
          author: 'WhatsApp Bot'
        });
        addResult('static sticker', true);
      } catch (staticError) {
        console.error(`Error sending as static sticker: ${staticError.message}`);
        addResult('static sticker', false, staticError);
      }
    }
  }
  
  // Send results
  let resultText = `*Testing Results for ${reactionName}.gif*\n`;
  for (const result of results) {
    resultText += `- ${result.method}: ${result.Success ? '✅ Success' : '❌ Failed'}`;
    if (!result.success && result.error) {
      resultText += ` (${result.error})`;
    }
    resultText += '\n';
  }
  
  conn.reply(m.chat, resultText, m);
};

handler.help = ['sendgif'];
handler.tags = ['owner', 'tools'];
handler.command = /^(sendgif|gifsend|testgif)$/i;

handler.owner = true;

console.log(`[STARTUP] Test GIF sender registered`);

}

module.exports = handler;