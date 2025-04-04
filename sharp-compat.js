/**
 * Sharp compatibility layer using Jimp
 * For Termux environments where Sharp is difficult to install
 *
 * This polyfill implements the most commonly used Sharp functions
 * to ensure compatibility with Termux environments
 */
const Jimp = require('jimp');
const fs = require('fs');
const path = require('path');
const { promisify } = require('util');
const writeFileAsync = promisify(fs.writeFile);
const readFileAsync = promisify(fs.readFile);

// Ensure Jimp is installed
try {
  require.resolve('jimp');
} catch (e) {
  console.log('Installing Jimp for Sharp compatibility...');
  require('child_process').execSync('npm install jimp');
}

class SharpCompat {
  constructor(input) {
    this._input = input;
    this._operations = [];
    this._image = null;
    this._format = 'png';
    this._quality = 80;
    this._options = {
      resize: null,
      flip: false,
      flop: false,
      rotate: 0,
      blur: 0,
      sharpen: 0,
      greyscale: false,
      grayscale: false,
      negate: false,
      extract: null,
      trim: false,
      tint: null
    };
    
    if (input) {
      this._loadPromise = this._loadImage(input);
    }
  }

  async _loadImage(input) {
    try {
      if (Buffer.isBuffer(input)) {
        this._image = await Jimp.read(input);
      } else if (typeof input === 'string') {
        this._image = await Jimp.read(input);
      } else {
        throw new Error('Unsupported input type');
      }
      
      return this;
    } catch (err) {
      console.error('Error loading image in Sharp compatibility layer:', err);
      throw err;
    }
  }

  // Ensure image is loaded
  async _ensureImage() {
    if (!this._image && this._loadPromise) {
      await this._loadPromise;
    }
    
    if (!this._image) {
      throw new Error('No image loaded');
    }
    
    return this._image;
  }

  // Apply all pending operations to the image
  async _applyOperations() {
    const image = await this._ensureImage();
    
    // Apply resize if needed
    if (this._options.resize) {
      const { width, height, fit } = this._options.resize;
      
      if (fit === 'contain') {
        // Contain: Scale the image to the maximum size that fits within the width/height
        image.contain(width || Jimp.AUTO, height || Jimp.AUTO);
      } else if (fit === 'cover') {
        // Cover: Scale the image to cover both width/height
        image.cover(width || Jimp.AUTO, height || Jimp.AUTO);
      } else {
        // Default: Scale the image to width/height maintaining aspect ratio
        image.resize(width || Jimp.AUTO, height || Jimp.AUTO);
      }
    }
    
    // Apply other operations
    if (this._options.greyscale || this._options.grayscale) {
      image.greyscale();
    }
    
    if (this._options.flip) {
      image.flip(true, false);
    }
    
    if (this._options.flop) {
      image.flip(false, true);
    }
    
    if (this._options.rotate) {
      image.rotate(this._options.rotate);
    }
    
    if (this._options.blur && this._options.blur > 0) {
      image.blur(this._options.blur);
    }
    
    if (this._options.sharpen && this._options.sharpen > 0) {
      image.convolute([
        [-1, -1, -1],
        [-1, this._options.sharpen + 8, -1],
        [-1, -1, -1]
      ]);
    }
    
    if (this._options.negate) {
      image.invert();
    }
    
    if (this._options.extract) {
      const { left, top, width, height } = this._options.extract;
      image.crop(left, top, width, height);
    }
    
    if (this._options.tint) {
      image.color([
        { apply: 'mix', params: [this._options.tint, 50] }
      ]);
    }
    
    return image;
  }
  
  // Resize methods
  resize(width, height, options = {}) {
    this._options.resize = { width, height, fit: options.fit || 'cover' };
    return this;
  }
  
  extend(options) {
    console.warn('extend() is not fully supported in Sharp compatibility layer');
    return this;
  }
  
  extract(options) {
    this._options.extract = options;
    return this;
  }
  
  trim(threshold) {
    console.warn('trim() is not fully supported in Sharp compatibility layer');
    this._options.trim = true;
    return this;
  }
  
  // Flip operations
  flip() {
    this._options.flip = true;
    return this;
  }
  
  flop() {
    this._options.flop = true;
    return this;
  }
  
  // Rotation
  rotate(angle) {
    this._options.rotate = angle;
    return this;
  }
  
  // Color manipulations
  greyscale(greyscale = true) {
    this._options.greyscale = greyscale;
    return this;
  }
  
  grayscale(grayscale = true) {
    this._options.grayscale = grayscale;
    return this;
  }
  
  negate(negate = true) {
    this._options.negate = negate;
    return this;
  }
  
  // Effects
  blur(sigma) {
    this._options.blur = sigma || 1;
    return this;
  }
  
  sharpen(sigma = 1) {
    this._options.sharpen = sigma;
    return this;
  }
  
  tint(rgb) {
    this._options.tint = rgb;
    return this;
  }
  
  // Format conversion methods
  toFormat(format, options = {}) {
    this._format = format;
    if (options.quality) {
      this._quality = options.quality;
    }
    return this;
  }
  
  jpeg(options = {}) {
    return this.toFormat('jpeg', options);
  }
  
  png(options = {}) {
    return this.toFormat('png', options);
  }
  
  webp(options = {}) {
    return this.toFormat('webp', options);
  }
  
  // Output methods
  async toBuffer() {
    const image = await this._applyOperations();
    return new Promise((resolve, reject) => {
      image.getBuffer(Jimp.AUTO, (err, buffer) => {
        if (err) return reject(err);
        resolve(buffer);
      });
    });
  }
  
  async toFile(outputPath) {
    try {
      const image = await this._applyOperations();
      
      let mime;
      const ext = path.extname(outputPath).toLowerCase().substring(1);
      
      // Set quality
      image.quality(this._quality);
      
      // Save the file
      await image.writeAsync(outputPath);
      
      // Return metadata object similar to Sharp
      return {
        format: ext || this._format,
        width: image.getWidth(),
        height: image.getHeight(),
        channels: 4,
        premultiplied: false,
        size: fs.statSync(outputPath).size
      };
    } catch (err) {
      console.error('Error in toFile:', err);
      throw err;
    }
  }
  
  // Metadata
  async metadata() {
    const image = await this._ensureImage();
    return {
      format: this._format,
      width: image.getWidth(),
      height: image.getHeight(),
      channels: 4,
      premultiplied: false
    };
  }
}

// Export a function that mimics Sharp's API
function sharpCompat(input) {
  return new SharpCompat(input);
}

// Provide compatibility for some common Sharp functions
sharpCompat.cache = function(options) {
  console.log('Sharp cache settings ignored in compatibility layer');
  return sharpCompat;
};

sharpCompat.format = {
  jpeg: 'jpeg',
  png: 'png',
  webp: 'webp',
  raw: 'raw'
};

sharpCompat.versions = {
  vips: '0.0.0 (compatibility mode)',
};

sharpCompat.simd = false;

module.exports = sharpCompat;