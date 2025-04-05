/**
 * GIF Downloader Utility
 * Downloads reaction GIFs from reliable sources and stores them in the gifs directory
 */

const fs = require('fs');
const path = require('path');
const axios = require('axios');
const logger = require('./logger');

// List of reaction GIFs to download with their URLs
const reactionGifs = {
  angry: 'https://media.tenor.com/WBcY8E0jQZYAAAAi/angry-mad.gif',
  bite: 'https://media.tenor.com/Cpl5Gw6XP6QAAAAi/bunny-bites.gif',
  blush: 'https://media.tenor.com/W_0Ep0cVUcUAAAAi/blush-anime.gif',
  bonk: 'https://media.tenor.com/hcGGsUrZnEoAAAAi/bonk-doge.gif',
  bored: 'https://media.tenor.com/eBJIkoCowFwAAAAj/bored-sleepy.gif',
  confused: 'https://media.tenor.com/jIVrz-gOKwQAAAAi/confusedanime.gif',
  cool: 'https://media.tenor.com/d-F6cOK5jzIAAAAi/cool-cool-doge.gif',
  cry: 'https://media.tenor.com/OMf-WsKDBiQAAAAi/crying-cry.gif',
  cuddle: 'https://media.tenor.com/VBGMm4Ox0WcAAAAj/cuddle-anime.gif',
  dance: 'https://media.tenor.com/X9mzGGO9QaIAAAAi/cat-dancing.gif',
  disgusted: 'https://media.tenor.com/SRn4h5rI9eAAAAAi/disgusted-disgust.gif',
  excited: 'https://media.tenor.com/vUg_39FYUN4AAAAi/happy-dog.gif',
  facepalm: 'https://media.tenor.com/LynjJOlVU-MAAAAi/picard-facepalm.gif',
  fuck: 'https://media.tenor.com/GhLDdsL3rYIAAAAi/middle-finger-dog.gif',
  greedy: 'https://media.tenor.com/7xf4Ttq1KF8AAAAi/raccoon-greedy.gif',
  happy: 'https://media.tenor.com/PkjNRpR18CkAAAAi/happy-happydog.gif',
  highfive: 'https://media.tenor.com/i8jpNRdAEMgAAAAi/high-five-cute.gif',
  horny: 'https://media.tenor.com/UzXDYn7vJ-0AAAAi/horny.gif',
  hug: 'https://media.tenor.com/T_AQF7-hyBkAAAAi/cute-kawaii.gif',
  hungry: 'https://media.tenor.com/7YnhyC4RGTEAAAAC/hungry-cat.gif',
  jealous: 'https://media.tenor.com/ZRuSqhS1UWMAAAAC/jealous-dog.gif',
  kill: 'https://media.tenor.com/E8VrL8SWdTsAAAAi/gun-shoot.gif',
  kiss: 'https://media.tenor.com/sRQJDwN5DjAAAAAi/blow-kiss-grin.gif',
  laugh: 'https://media.tenor.com/jILAzX0Jz_wAAAAi/rofl-laughing.gif',
  nervous: 'https://media.tenor.com/BfC4lGbFc24AAAAi/nervous-shaking.gif',
  panic: 'https://media.tenor.com/Q4o_jqWqrxQAAAAi/aggretsuko-retsuko.gif',
  pat: 'https://media.tenor.com/tUPofCIW95oAAAAi/cat-cats.gif',
  poke: 'https://media.tenor.com/WQF8fZMgJJ8AAAAi/poke-peach.gif',
  proud: 'https://media.tenor.com/rvOKZeA0p0MAAAAi/thumbs-up-nice.gif',
  punch: 'https://media.tenor.com/E7NI2QiE9gUAAAAi/punch-angry.gif',
  sad: 'https://media.tenor.com/NLb4N5IIYgUAAAAi/sad-broken-heart.gif',
  scared: 'https://media.tenor.com/Ye5eMaHda_EAAAAi/nervous-anxious.gif',
  shock: 'https://media.tenor.com/GHzGlBZOpq0AAAAi/shock-face.gif',
  shy: 'https://media.tenor.com/CiRMjNcNRQIAAAAi/shy-blush.gif',
  slap: 'https://media.tenor.com/CvBTA0GyrogAAAAi/anime-slap.gif',
  sleepy: 'https://media.tenor.com/jRkhiiUWj3MAAAAi/sleep-sleeping.gif',
  smile: 'https://media.tenor.com/_QU9_f7vyCQAAAAi/smile-blush.gif',
  surprised: 'https://media.tenor.com/Gxnf-lrO2xAAAAAi/shock-surprised.gif',
  tired: 'https://media.tenor.com/VQWLwTFvUucAAAAi/tired-dog.gif',
  wave: 'https://media.tenor.com/HRbLH_A2JycAAAAi/cat-kitty.gif',
  wink: 'https://media.tenor.com/guvdoShdBEoAAAAi/wink-emoji.gif',
  yeet: 'https://media.tenor.com/Pz5_YhSYwBsAAAAi/yeet-lion-king.gif'
};

/**
 * Ensures the GIFs directory exists
 */
function ensureGifsDirectory() {
  const gifsDir = path.join(process.cwd(), 'gifs');
  if (!fs.existsSync(gifsDir)) {
    try {
      fs.mkdirSync(gifsDir, { recursive: true });
      logger.info(`Created gifs directory at ${gifsDir}`);
    } catch (err) {
      logger.error(`Failed to create gifs directory: ${err.message}`);
      return false;
    }
  }
  return true;
}

/**
 * Download a single GIF from URL
 * @param {string} name - The name of the reaction
 * @param {string} url - The URL to download from
 * @returns {Promise<boolean>} - Whether download was successful
 */
async function downloadGif(name, url) {
  const gifPath = path.join(process.cwd(), 'gifs', `${name}.gif`);
  
  try {
    const response = await axios({
      method: 'GET',
      url: url,
      responseType: 'arraybuffer'
    });
    
    fs.writeFileSync(gifPath, Buffer.from(response.data));
    logger.info(`Successfully downloaded ${name}.gif`);
    return true;
  } catch (error) {
    logger.error(`Failed to download ${name}.gif: ${error.message}`);
    return false;
  }
}

/**
 * Check if a GIF needs to be downloaded (missing or corrupt)
 * @param {string} name - The name of the reaction
 * @returns {boolean} - Whether GIF needs to be downloaded
 */
function needsDownload(name) {
  const gifPath = path.join(process.cwd(), 'gifs', `${name}.gif`);
  
  // If file doesn't exist, it needs to be downloaded
  if (!fs.existsSync(gifPath)) {
    return true;
  }
  
  try {
    // Check if file is a text file (error message) instead of a GIF
    const data = fs.readFileSync(gifPath, 'utf8');
    if (data.includes('404: Not Found') || data.length < 100) {
      logger.warn(`GIF ${name}.gif is corrupt or contains error message`);
      return true;
    }
  } catch (error) {
    // If we can't read as text, it's probably a valid binary file
    return false;
  }
  
  return false;
}

/**
 * Download all reaction GIFs
 * @returns {Promise<{total: number, success: number, failed: number, skipped: number}>} - Stats
 */
async function downloadAllGifs() {
  if (!ensureGifsDirectory()) {
    return { total: 0, success: 0, failed: 0, skipped: 0 };
  }
  
  const stats = {
    total: Object.keys(reactionGifs).length,
    success: 0,
    failed: 0,
    skipped: 0
  };
  
  for (const [name, url] of Object.entries(reactionGifs)) {
    if (needsDownload(name)) {
      const success = await downloadGif(name, url);
      if (success) {
        stats.success++;
      } else {
        stats.failed++;
      }
    } else {
      logger.info(`Skipped ${name}.gif (already exists and valid)`);
      stats.skipped++;
    }
  }
  
  return stats;
}

/**
 * Verify all GIFs are available and valid
 * @returns {Array<string>} - List of missing or invalid GIFs
 */
function verifyGifs() {
  const missingGifs = [];
  
  for (const name of Object.keys(reactionGifs)) {
    if (needsDownload(name)) {
      missingGifs.push(name);
    }
  }
  
  return missingGifs;
}

module.exports = {
  downloadAllGifs,
  downloadGif,
  verifyGifs,
  reactionGifs
};