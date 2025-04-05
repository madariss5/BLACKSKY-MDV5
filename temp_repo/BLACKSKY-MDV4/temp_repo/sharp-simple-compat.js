/**
 * BLACKSKY-MD Premium - Simple Sharp Compatibility Layer
 * 
 * This is a simplified compatibility layer for the Sharp image processing library.
 * It provides a minimal subset of Sharp's API using Jimp as a replacement.
 * Use this in environments where the full Sharp library cannot be installed.
 */

let Jimp;
try {
  Jimp = require('jimp');
} catch (err) {
  console.error('Failed to load Jimp as Sharp replacement:', err.message);
  // Provide a dummy module if Jimp is not available
  module.exports = function() {
    return {
      resize: () => module.exports(),
      jpeg: () => module.exports(),
      png: () => module.exports(),
      webp: () => module.exports(),
      toBuffer: async () => Buffer.from([]),
      toFile: async () => {}
    };
  };
  return;
}

// Main Sharp-like function
function sharp(input) {
  let jimpInstance = null;
  let format = 'jpeg';
  let quality = 80;
  let resizeOptions = null;
  
  const api = {
    /**
     * Resize an image
     * @param {number} width - Width in pixels
     * @param {number} height - Height in pixels
     * @param {Object} options - Resize options
     * @returns {Object} - Sharp-like interface for chaining
     */
    resize(width, height, options = {}) {
      resizeOptions = { width, height, options };
      return api;
    },
    
    /**
     * Convert to JPEG format
     * @param {Object} options - JPEG options
     * @returns {Object} - Sharp-like interface for chaining
     */
    jpeg(options = {}) {
      format = 'jpeg';
      quality = options.quality || 80;
      return api;
    },
    
    /**
     * Convert to PNG format
     * @param {Object} options - PNG options
     * @returns {Object} - Sharp-like interface for chaining
     */
    png(options = {}) {
      format = 'png';
      return api;
    },
    
    /**
     * Convert to WebP format
     * @param {Object} options - WebP options
     * @returns {Object} - Sharp-like interface for chaining
     */
    webp(options = {}) {
      format = 'webp';
      quality = options.quality || 80;
      return api;
    },
    
    /**
     * Get image as buffer
     * @returns {Promise<Buffer>} - Image buffer
     */
    async toBuffer() {
      try {
        if (!jimpInstance) {
          if (typeof input === 'string') {
            jimpInstance = await Jimp.read(input);
          } else if (Buffer.isBuffer(input)) {
            jimpInstance = await Jimp.read(input);
          } else {
            throw new Error('Unsupported input type');
          }
        }
        
        // Apply resize if needed
        if (resizeOptions) {
          jimpInstance.resize(
            resizeOptions.width || Jimp.AUTO,
            resizeOptions.height || Jimp.AUTO
          );
        }
        
        // Convert to the proper format
        switch (format) {
          case 'jpeg':
            return await jimpInstance.quality(quality).getBufferAsync(Jimp.MIME_JPEG);
          case 'png':
            return await jimpInstance.getBufferAsync(Jimp.MIME_PNG);
          case 'webp':
            return await jimpInstance.quality(quality).getBufferAsync(Jimp.MIME_WEBP);
          default:
            return await jimpInstance.quality(quality).getBufferAsync(Jimp.MIME_JPEG);
        }
      } catch (err) {
        console.error('Error processing image:', err);
        return Buffer.from([]);
      }
    },
    
    /**
     * Save image to file
     * @param {string} outputPath - Output file path
     * @returns {Promise<Object>} - Result object
     */
    async toFile(outputPath) {
      try {
        if (!jimpInstance) {
          if (typeof input === 'string') {
            jimpInstance = await Jimp.read(input);
          } else if (Buffer.isBuffer(input)) {
            jimpInstance = await Jimp.read(input);
          } else {
            throw new Error('Unsupported input type');
          }
        }
        
        // Apply resize if needed
        if (resizeOptions) {
          jimpInstance.resize(
            resizeOptions.width || Jimp.AUTO,
            resizeOptions.height || Jimp.AUTO
          );
        }
        
        // Set quality if applicable
        if (format === 'jpeg' || format === 'webp') {
          jimpInstance.quality(quality);
        }
        
        // Save to file
        await jimpInstance.writeAsync(outputPath);
        return { path: outputPath };
      } catch (err) {
        console.error('Error saving image:', err);
        throw err;
      }
    }
  };
  
  return api;
}

// Set up module exports to match Sharp's structure
sharp.cache = function() {
  return sharp;
};

sharp.concurrency = function() {
  return sharp;
};

module.exports = sharp;