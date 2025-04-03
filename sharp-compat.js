/**
 * Sharp compatibility layer using Jimp
 * For Termux environments where Sharp is difficult to install
 */
const Jimp = require('jimp');
const fs = require('fs');
const path = require('path');

// Simple Sharp API compatible wrapper for Jimp
class SharpCompat {
  constructor(input) {
    this.input = input;
    this.jimpInstance = null;
    this.options = {
      width: null,
      height: null,
      format: 'png',
      quality: 80
    };
  }

  // Load the image
  async _load() {
    if (this.jimpInstance) return this.jimpInstance;
    
    if (Buffer.isBuffer(this.input)) {
      this.jimpInstance = await Jimp.read(this.input);
    } else if (typeof this.input === 'string') {
      this.jimpInstance = await Jimp.read(this.input);
    } else {
      throw new Error('Unsupported input type');
    }
    
    return this.jimpInstance;
  }

  // Resize the image
  resize(width, height = null) {
    this.options.width = width;
    this.options.height = height;
    return this;
  }

  // Set output format
  png() {
    this.options.format = 'png';
    return this;
  }
  
  jpeg() {
    this.options.format = 'jpeg';
    return this;
  }
  
  webp() {
    this.options.format = 'png'; // Fallback to PNG as Jimp doesn't support WebP
    console.warn('WebP not supported in SharpCompat, falling back to PNG');
    return this;
  }

  // Set quality
  quality(value) {
    this.options.quality = value;
    return this;
  }

  // Get output buffer
  async toBuffer() {
    const image = await this._load();
    
    // Apply resize if needed
    if (this.options.width) {
      if (this.options.height) {
        image.resize(this.options.width, this.options.height);
      } else {
        image.resize(this.options.width, Jimp.AUTO);
      }
    }
    
    // Convert to requested format
    let mimeType;
    switch(this.options.format) {
      case 'png':
        mimeType = Jimp.MIME_PNG;
        break;
      case 'jpeg':
      case 'jpg':
        mimeType = Jimp.MIME_JPEG;
        break;
      default:
        mimeType = Jimp.MIME_PNG;
    }
    
    // Return buffer
    return new Promise((resolve, reject) => {
      image.quality(this.options.quality);
      image.getBuffer(mimeType, (err, buffer) => {
        if (err) reject(err);
        else resolve(buffer);
      });
    });
  }

  // Save to file
  async toFile(outputPath) {
    const image = await this._load();
    
    // Apply resize if needed
    if (this.options.width) {
      if (this.options.height) {
        image.resize(this.options.width, this.options.height);
      } else {
        image.resize(this.options.width, Jimp.AUTO);
      }
    }
    
    // Save with requested quality
    image.quality(this.options.quality);
    return new Promise((resolve, reject) => {
      image.writeAsync(outputPath)
        .then(() => resolve(outputPath))
        .catch(reject);
    });
  }
}

// Export a function that mimics Sharp's API
module.exports = function(input) {
  return new SharpCompat(input);
};

// Also provide compatibility for some common Sharp functions
module.exports.cache = function(options) {
  console.log('Sharp cache settings ignored in compatibility layer');
  return module.exports;
};

module.exports.format = {
  jpeg: 'jpeg',
  png: 'png',
  webp: 'webp'
};
