/**
 * Fix-GIFs Command
 * Owner-only command to download and fix corrupted GIF files
 */

const fs = require('fs');
const path = require('path');
const { downloadAllGifs, verifyGifs } = require('../utils/gifDownloader');

let handler = async (m, { conn, args, usedPrefix, command }) => {
  // Only owner can use this command
  if (!m.isOwner) {
    return m.reply('This command is only available for the bot owner');
  }
  
  // Show progress message
  await m.reply('🔍 Checking reaction GIFs...');
  
  // Check for missing/invalid GIFs
  const missingGifs = verifyGifs();
  
  if (missingGifs.length === 0) {
    return m.reply('✅ All reaction GIFs are valid and ready to use!');
  }
  
  await m.reply(`Found ${missingGifs.length} missing or invalid GIFs:\n${missingGifs.join(', ')}\n\nStarting download process...`);
  
  // Download all missing GIFs
  const stats = await downloadAllGifs();
  
  // Report results
  await m.reply(`📥 GIF Download Complete:\n• Total: ${stats.total}\n• Downloaded: ${stats.success}\n• Failed: ${stats.failed}\n• Skipped: ${stats.skipped}\n\nUse ${usedPrefix}testgif [reaction] to test a specific GIF`);
};

handler.help = ['fixgifs'];
handler.tags = ['owner'];
handler.command = /^(fixgifs|dlgifs|downloadgifs)$/i;
handler.rowner = true;

module.exports = handler;