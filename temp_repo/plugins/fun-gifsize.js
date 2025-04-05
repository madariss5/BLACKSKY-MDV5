const { getMessage } = require('../lib/languages');

/**
 * GIF Size Checker - Display sizes of reaction GIFs
 * Helps identify which GIFs may be too large for WhatsApp
 */

const fs = require('fs');
const path = require('path');

let handler = async (m, { conn, usedPrefix }) => {
    // Get user's preferred language
    const user = global.db.data.users[m.sender];
    const chat = global.db.data.chats[m.chat];
    const lang = user?.language || chat?.language || global.language;
 {
  if (!m.isOwner) {
    conn.reply(m.chat, 'This command is only for bot owners.', m);
    return;
  }
  
  try {
    // Get the GIFs directory
    const gifsDir = path.join(process.cwd(), 'gifs');
    if (!fs.existsSync(gifsDir)) {
      conn.reply(m.chat, 'GIFs directory not found!', m);
      return;
    }
    
    // Read all GIF files
    const files = fs.readdirSync(gifsDir)
      .filter(file => file.endsWith('.gif'));
    
    if (files.length === 0) {
      conn.reply(m.chat, 'No GIF files found in the directory!', m);
      return;
    }
    
    // Calculate sizes and sort by size (largest first)
    const sizes = files.map(file => {
      const filePath = path.join(gifsDir, file);
      const stats = fs.statSync(filePath);
      const sizeInMB = stats.size / (1024 * 1024);
      
      return {
        name: file,
        size: stats.size,
        sizeFormatted: formatBytes(stats.size),
        sizeInMB: sizeInMB
      };
    }).sort((a, b) => b.size - a.size);
    
    // Calculate total size
    const totalSize = sizes.reduce((acc, file) => acc + file.size, 0);
    
    // Create a report with size warnings
    let report = '*GIF Sizes Report*\n\n';
    report += '⚠️ Large GIFs (>1MB) may not display on some devices\n\n';
    
    // Add files with warning indicators
    sizes.forEach((file, index) => {
      const warning = file.sizeInMB > 8 ? '⛔ ' : 
                     file.sizeInMB > 4 ? '⚠️ ' : 
                     file.sizeInMB > 1 ? '⚡ ' : '✅ ';
      
      report += `${index + 1}. ${warning}${file.name}: ${file.sizeFormatted}\n`;
    });
    
    // Add summary
    report += `\n*Total:* ${files.length} GIFs, ${formatBytes(totalSize)}`;
    report += `\n\nLegend:\n✅ Good (<1MB)\n⚡ May have issues (1-4MB)\n⚠️ Probledeadc (4-8MB)\n⛔ Very likely to fail (>8MB)`;
    report += `\n\nUse ${usedPrefix}optimizegif to resize large GIFs.`;
    
    conn.reply(m.chat, report, m);
  } catch (e) {
    console.error(e);
    conn.reply(m.chat, `Error: ${e.message}`, m);
  }
};

// Format bytes to human-readable format
function formatBytes(bytes, decimals = 2) {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
  
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

handler.help = ['gifsize'];
handler.tags = ['owner', 'tools'];
handler.command = /^(gifsize|gifsizes)$/i;

handler.owner = true;

}

module.exports = handler;