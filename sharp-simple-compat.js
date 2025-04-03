/**
 * Simplified Sharp compatibility layer for Termux
 * Doesn't rely on Jimp which has compatibility issues in Termux
 */

const fs = require('fs');
const { promisify } = require('util');
const readFileAsync = promisify(fs.readFile);
const writeFileAsync = promisify(fs.writeFile);
const childProcess = require('child_process');
const execAsync = promisify(childProcess.exec);
const path = require('path');

class SimpleSharpCompat {
  constructor(input) {
    this.input = input;
    this.options = {
      width: null,
      height: null,
      format: 'png',
      quality: 80
    };
  }

  // Simple resize function that just passes through
  resize(width, height = null) {
    this.options.width = width;
    this.options.height = height;
    return this;
  }

  // Format setters
  png() {
    this.options.format = 'png';
    return this;
  }
  
  jpeg() {
    this.options.format = 'jpeg';
    return this;
  }
  
  webp() {
    this.options.format = 'png'; // Fallback to PNG
    console.warn('WebP not supported in SimpleSharpCompat, falling back to PNG');
    return this;
  }

  // Set quality
  quality(value) {
    this.options.quality = value;
    return this;
  }

  // In this simplified version, toBuffer just returns the input
  async toBuffer() {
    if (Buffer.isBuffer(this.input)) {
      return this.input;
    } else if (typeof this.input === 'string') {
      try {
        return await readFileAsync(this.input);
      } catch (err) {
        console.error('Error reading file:', err);
        return Buffer.alloc(0);
      }
    } else {
      return Buffer.alloc(0);
    }
  }

  // For toFile, we simply copy the input file to the output path
  async toFile(outputPath) {
    try {
      if (Buffer.isBuffer(this.input)) {
        await writeFileAsync(outputPath, this.input);
        return outputPath;
      } else if (typeof this.input === 'string') {
        // Copy file
        if (fs.existsSync(this.input)) {
          const data = await readFileAsync(this.input);
          await writeFileAsync(outputPath, data);
          return outputPath;
        } else {
          throw new Error('Input file does not exist');
        }
      } else {
        throw new Error('Unsupported input type');
      }
    } catch (err) {
      console.error('Error in toFile:', err);
      throw err;
    }
  }
}

// Export a function that mimics Sharp's API
module.exports = function(input) {
  console.log('Using SimpleSharpCompat - no image processing will be performed');
  return new SimpleSharpCompat(input);
};

// Also provide compatibility for some common Sharp functions
module.exports.cache = function(options) {
  console.log('Sharp cache settings ignored in simplified compatibility layer');
  return module.exports;
};

module.exports.format = {
  jpeg: 'jpeg',
  png: 'png',
  webp: 'webp'
};