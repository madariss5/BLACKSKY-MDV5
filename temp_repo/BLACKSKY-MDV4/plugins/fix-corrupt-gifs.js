/**
 * Fix Corrupt GIFs Tool
 * Identifies and provides information about potentially corrupt GIF files
 */

const fs = require('fs');
const path = require('path');

let handler = async (m, { conn, args, usedPrefix, command }) => {
  // Require owner permission to avoid abuse
  if (!m.isOwner) {
    return m.reply('This command is for bot owners only');
  }
  
  try {
    // Path to the GIFs directory
    const gifsDir = path.join(process.cwd(), 'gifs');
    
    // Check if directory exists
    if (!fs.existsSync(gifsDir)) {
      return m.reply('GIFs directory not found');
    }
    
    // Find all GIF files
    const gifFiles = fs.readdirSync(gifsDir)
      .filter(file => file.endsWith('.gif'));
    
    if (gifFiles.length === 0) {
      return m.reply('No GIF files found in the gifs directory');
    }
    
    // Identify potentially corrupt GIF files (too small or too large)
    const suspiciousGifs = [];
    const minSize = 10000; // 10 KB
    
    for (const file of gifFiles) {
      const filePath = path.join(gifsDir, file);
      const stats = fs.statSync(filePath);
      
      if (stats.size < minSize) {
        suspiciousGifs.push({
          name: file,
          size: stats.size,
          reason: 'Too small, likely corrupted'
        });
      }
    }
    
    // Report findings
    if (suspiciousGifs.length === 0) {
      return m.reply('✅ All GIF files appear to be valid (larger than 10KB)');
    }
    
    // Format message
    let message = `Found ${suspiciousGifs.length} suspicious GIF files:\n\n`;
    suspiciousGifs.forEach(gif => {
      message += `• ${gif.name}: ${(gif.size / 1024).toFixed(2)} KB - ${gif.reason}\n`;
    });
    
    message += `\nConsider replacing these files with valid GIFs.`;
    
    await m.reply(message);
    
  } catch (error) {
    console.error("Error in fix-corrupt-gifs:", error);
    m.reply(`Error checking GIFs: ${error.message}`);
  }
};

handler.help = ['fixcorruptgifs'];
handler.tags = ['tools', 'owner'];
handler.command = /^(fixcorruptgifs|corruptgifs|checkgifs)$/i;
handler.owner = true;

module.exports = handler;