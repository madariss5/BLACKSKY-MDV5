const axios = require('axios');
const fs = require('fs');
const path = require('path');
const utils = require('../../lib/nsfwHelper');

let handler = async (m, { conn, isAdmin, isOwner }) => {
  // Only proceed if NSFW is enabled for this chat or user has override permissions
  if (!utils.isNSFWEnabled(m.chat) && !isAdmin && !isOwner) {
    return conn.reply(m.chat, '❌ NSFW commands are not enabled in this chat.\n\nAdmins can enable them with *.nsfw on*', m);
  }

  m.reply('🔍 *Searching for uniform content...*');
  
  try {
    // Try to get images from API
    const response = await axios.get('https://api.waifu.pics/nsfw/uniform', { 
      timeout: 10000,
      headers: { 'User-Agent': 'WhatsApp Bot' }
    });
    
    if (response.data && response.data.url) {
      const imageUrl = response.data.url;
      const buffer = await utils.downloadImage(imageUrl);
      
      // Save recent images for better performance
      const cacheDir = path.join(__dirname, '../../temp/nsfw');
      if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir, { recursive: true });
      
      // Send the image with caption
      await conn.sendFile(
        m.chat, 
        buffer, 
        'uniform.jpg', 
        '🔞 *NSFW - Uniform*\n\n_Command processed successfully._', 
        m
      );
      
    } else {
      throw new Error('Invalid API response');
    }
  } catch (error) {
    console.error('Uniform command error:', error);
    m.reply('❌ Failed to fetch content. Please try again later.');
  }
};

handler.help = ['uniform'];
handler.tags = ['nsfw'];
handler.command = /^(uniform|schooluniform)$/i;

module.exports = handler;