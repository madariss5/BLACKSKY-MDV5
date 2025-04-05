/**
 * GIF Converter Utility
 * Handles conversion of GIF files to MP4 format suitable for WhatsApp
 */

const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');
const { ffmpeg } = require('../lib/converter');
const logger = require('./logger');

/**
 * Converts a GIF file to an MP4 video suitable for WhatsApp
 * @param {string} gifPath - Path to the GIF file
 * @returns {Promise<Buffer>} - Buffer containing the MP4 video data
 */
async function convertGifToMp4(gifPath) {
  try {
    // First check if the GIF exists
    if (!fs.existsSync(gifPath)) {
      throw new Error(`GIF file not found: ${gifPath}`);
    }
    
    // Read the GIF file
    const buffer = await fs.promises.readFile(gifPath);
    
    // Use the ffmpeg function from converter.js
    const result = await ffmpeg(buffer, [
      '-movflags', 'faststart',
      '-pix_fmt', 'yuv420p',
      '-vf', 'scale=trunc(iw/2)*2:trunc(ih/2)*2',
      '-c:v', 'libx264',
      '-preset', 'fast',
      '-crf', '30',
      '-t', '10', // Limit to 10 seconds for performance
      '-an' // No audio
    ], 'gif', 'mp4');
    
    logger.info(`Successfully converted GIF to MP4: ${path.basename(gifPath)}`);
    return result.data;
  } catch (error) {
    logger.error(`Error converting GIF to MP4: ${error.message}`);
    throw error;
  }
}

/**
 * Checks if ffmpeg is installed and available
 * @returns {Promise<boolean>} - True if ffmpeg is available
 */
async function checkFfmpegAvailability() {
  return new Promise((resolve) => {
    const process = spawn('ffmpeg', ['-version']);
    
    process.on('error', () => {
      logger.error('ffmpeg is not installed or not available in PATH');
      resolve(false);
    });
    
    process.on('close', (code) => {
      if (code === 0) {
        logger.info('ffmpeg is available');
        resolve(true);
      } else {
        logger.error(`ffmpeg check failed with code ${code}`);
        resolve(false);
      }
    });
  });
}

module.exports = {
  convertGifToMp4,
  checkFfmpegAvailability
};