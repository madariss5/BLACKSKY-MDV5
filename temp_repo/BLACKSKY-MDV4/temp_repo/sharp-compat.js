/**
 * Sharp compatibility layer using Jimp
 * This module provides a compatibility layer for the Sharp module
 * when running in environments where Sharp is difficult to install, like Termux.
 */
console.log('Loading Sharp compatibility layer...');

// Try to use native Sharp first
try {
  const sharp = require('sharp');
  console.log('✅ Native Sharp module loaded successfully');
  module.exports = sharp;
} catch (err) {
  console.log('Native Sharp not available, using Jimp compatibility layer');
  
  // Fall back to compatibility implementation
  try {
    const compatSharp = require('./sharp-simple-compat.js');
    console.log('✅ Jimp-based Sharp compatibility layer loaded');
    module.exports = compatSharp;
  } catch (compatErr) {
    console.error('Failed to load compatibility layer:', compatErr);
    
    // Create a minimal dummy implementation for basic functionality
    const fs = require('fs');
    const path = require('path');
    
    console.warn('⚠️ Using minimal dummy Sharp implementation');
    
    class MinimalSharp {
      constructor(input) {
        this.input = input;
        this.outputOptions = { format: 'png' };
      }
      
      resize() { return this; }
      extend() { return this; }
      extract() { return this; }
      trim() { return this; }
      flip() { return this; }
      flop() { return this; }
      rotate() { return this; }
      greyscale() { return this; }
      grayscale() { return this; }
      negate() { return this; }
      blur() { return this; }
      sharpen() { return this; }
      tint() { return this; }
      jpeg() { this.outputOptions.format = 'jpeg'; return this; }
      png() { this.outputOptions.format = 'png'; return this; }
      webp() { this.outputOptions.format = 'webp'; return this; }
      
      async toBuffer() {
        if (Buffer.isBuffer(this.input)) return this.input;
        if (typeof this.input === 'string' && fs.existsSync(this.input)) {
          return fs.promises.readFile(this.input);
        }
        return Buffer.from([]);
      }
      
      async toFile(outputPath) {
        try {
          const buffer = await this.toBuffer();
          await fs.promises.writeFile(outputPath, buffer);
          return { 
            format: path.extname(outputPath).substring(1) || this.outputOptions.format,
            width: 0, 
            height: 0, 
            channels: 4,
            size: buffer.length 
          };
        } catch (err) {
          console.error('Error in dummy Sharp toFile:', err);
          throw err;
        }
      }
      
      async metadata() {
        return { width: 0, height: 0, format: 'unknown', channels: 4 };
      }
    }
    
    const dummySharp = (input) => new MinimalSharp(input);
    dummySharp.cache = false;
    dummySharp.simd = false;
    
    module.exports = dummySharp;
  }
}