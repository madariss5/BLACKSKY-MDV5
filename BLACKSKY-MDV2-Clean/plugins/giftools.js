/**
 * GIF Tools and Diagnostics
 * Utility commands for testing and fixing GIF functionality
 */

const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

let handler = async (m, { conn, args, usedPrefix, command }) => {
  if (command === 'listgifs') {
    try {
      // Path to GIFs directory
      const gifsDir = path.join(process.cwd(), 'gifs');
      
      // Check if directory exists
      if (!fs.existsSync(gifsDir)) {
        return m.reply(`❌ The gifs directory does not exist. Creating it now...`);
        fs.mkdirSync(gifsDir, { recursive: true });
      }
      
      // List all GIF files
      const files = fs.readdirSync(gifsDir).filter(file => file.endsWith('.gif'));
      
      if (files.length === 0) {
        return m.reply(`No GIF files found in the gifs directory.`);
      }
      
      // List the first 20 GIFs with their sizes
      const fileDetails = files.slice(0, 20).map(file => {
        const stats = fs.statSync(path.join(gifsDir, file));
        return `${file} (${Math.round(stats.size / 1024)} KB)`;
      });
      
      m.reply(`Found ${files.length} GIF files in the gifs directory.\n\nFirst 20 GIFs:\n${fileDetails.join('\n')}`);
    } catch (error) {
      console.error('Error in listgifs command:', error);
      m.reply(`Error listing GIFs: ${error.message}`);
    }
    return;
  }
  
  if (command === 'fixgifs') {
    try {
      // Create tmp directory if it doesn't exist
      const tmpDir = path.join(process.cwd(), 'tmp');
      if (!fs.existsSync(tmpDir)) {
        fs.mkdirSync(tmpDir, { recursive: true });
        m.reply(`✅ Created tmp directory for GIF processing`);
      }
      
      // Ensure gif directory exists
      const gifsDir = path.join(process.cwd(), 'gifs');
      if (!fs.existsSync(gifsDir)) {
        fs.mkdirSync(gifsDir, { recursive: true });
        m.reply(`✅ Created gifs directory`);
      }
      
      m.reply(`✅ GIF directories verified`);
    } catch (error) {
      console.error('Error in fixgifs command:', error);
      m.reply(`Error fixing GIF directories: ${error.message}`);
    }
    return;
  }
  
  if (command === 'testgif') {
    try {
      const gifName = args[0] || 'hug';
      const gifPath = path.join(process.cwd(), 'gifs', `${gifName}.gif`);
      
      // Check if GIF exists
      if (!fs.existsSync(gifPath)) {
        return m.reply(`❌ GIF not found: ${gifName}.gif`);
      }
      
      // Read the GIF file
      const buffer = fs.readFileSync(gifPath);
      
      m.reply(`Sending ${gifName}.gif (${Math.round(buffer.length / 1024)} KB) using multiple methods...`);
      
      // Method 1: Send as document
      try {
        await conn.sendMessage(m.chat, {
          document: buffer,
          mimetype: 'image/gif',
          fileName: `${gifName}.gif`
        });
        console.log(`Method 1 (document) successful for ${gifName}.gif`);
      } catch (err) {
        console.error(`Method 1 error:`, err);
      }
      
      // Method 2: Send as video with gifPlayback
      try {
        await conn.sendMessage(m.chat, {
          video: buffer,
          gifPlayback: true,
          caption: `GIF: ${gifName}`,
          mimetype: 'video/mp4'
        });
        console.log(`Method 2 (video with gifPlayback) successful for ${gifName}.gif`);
      } catch (err) {
        console.error(`Method 2 error:`, err);
      }
      
      // Method 3: Use conn.sendFile
      try {
        await conn.sendFile(m.chat, gifPath, `${gifName}.gif`, '', m, false, { mimetype: 'image/gif' });
        console.log(`Method 3 (sendFile) successful for ${gifName}.gif`);
      } catch (err) {
        console.error(`Method 3 error:`, err);
      }
      
    } catch (error) {
      console.error('Error in testgif command:', error);
      m.reply(`Error testing GIF: ${error.message}`);
    }
  }
};

handler.help = ['listgifs', 'fixgifs', 'testgif [name]'];
handler.tags = ['tools'];
handler.command = /^(listgifs|fixgifs|testgif)$/i;

module.exports = handler;