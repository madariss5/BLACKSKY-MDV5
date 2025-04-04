/**
 * Enhanced Sharp compatibility layer using Jimp
 * For Termux environments where Sharp is difficult to install
 *
 * This polyfill implements the most commonly used Sharp functions
 * to ensure compatibility with Termux environments
 * 
 * Optimized for fast performance and reduced memory usage
 */
const fs = require('fs');
const path = require('path');
const { promisify } = require('util');
const writeFileAsync = promisify(fs.writeFile);
const readFileAsync = promisify(fs.readFile);

// Ensure Jimp is installed with proper error handling
let Jimp;
try {
  Jimp = require('jimp');
} catch (e) {
  console.log('⚠️ Jimp not found, installing Jimp for Sharp compatibility...');
  try {
    require('child_process').execSync('npm install jimp --no-save', { stdio: 'inherit' });
    Jimp = require('jimp');
    console.log('✅ Jimp successfully installed');
  } catch (installError) {
    console.error('❌ Failed to install Jimp automatically:', installError.message);
    console.log('📋 Manual fix: Run "npm install jimp" in your terminal');
    // Fallback to a minimal implementation
    Jimp = {
      read: () => Promise.reject(new Error('Jimp not available')),
      AUTO: 'auto'
    };
  }
}

// Cache for recently processed images to speed up repeated operations
const imageCache = new Map();
const MAX_CACHE_SIZE = 10; // Limit cache size to prevent memory issues

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
      // Generate a cache key if input is a string (file path)
      const cacheKey = typeof input === 'string' ? input : null;
      
      // Check cache for this image path
      if (cacheKey && imageCache.has(cacheKey)) {
        // Clone the cached image to avoid modifying the original
        this._image = imageCache.get(cacheKey).clone();
        return this;
      }
      
      // Load the image
      if (Buffer.isBuffer(input)) {
        this._image = await Jimp.read(input);
      } else if (typeof input === 'string') {
        this._image = await Jimp.read(input);
        
        // Store in cache if it's a file path
        if (cacheKey) {
          // Manage cache size
          if (imageCache.size >= MAX_CACHE_SIZE) {
            // Remove oldest entry (first item in the Map)
            const firstKey = imageCache.keys().next().value;
            imageCache.delete(firstKey);
          }
          
          // Add to cache
          imageCache.set(cacheKey, this._image.clone());
        }
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
  
  // Output methods with optimized performance
  async toBuffer() {
    try {
      const image = await this._applyOperations();
      
      // Optimize memory usage during buffer creation
      const mimeType = this._format === 'jpeg' ? Jimp.MIME_JPEG : 
                      this._format === 'png' ? Jimp.MIME_PNG :
                      this._format === 'webp' ? Jimp.MIME_WEBP : Jimp.AUTO;
      
      return new Promise((resolve, reject) => {
        image.quality(this._quality).getBuffer(mimeType, (err, buffer) => {
          if (err) return reject(err);
          resolve(buffer);
        });
      });
    } catch (err) {
      console.error('Error in toBuffer:', err);
      throw err;
    }
  }
  
  async toFile(outputPath) {
    try {
      // Create directory if it doesn't exist
      const dir = path.dirname(outputPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      
      const image = await this._applyOperations();
      
      // Determine format from file extension
      const ext = path.extname(outputPath).toLowerCase().substring(1);
      const format = ext || this._format;
      
      // Set quality
      image.quality(this._quality);
      
      // Optimize file writing by directly using the appropriate mime type
      try {
        await image.writeAsync(outputPath);
      } catch (writeError) {
        console.error('Error writing image, retrying with alternative method:', writeError);
        // Fallback for older Jimp versions or problematic files
        const buffer = await this.toBuffer();
        await writeFileAsync(outputPath, buffer);
      }
      
      // Get file stats
      const stats = fs.statSync(outputPath);
      
      // Return metadata object similar to Sharp
      return {
        format: format,
        width: image.getWidth(),
        height: image.getHeight(),
        channels: 4,
        premultiplied: false,
        size: stats.size
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

// Export a function that mimics Sharp's API with enhanced error handling
function sharpCompat(input) {
  // Handle common errors with input validation
  if (!input) {
    console.error('⚠️ Sharp compatibility warning: No input provided');
    throw new Error('Input file is missing or invalid');
  }
  
  if (typeof input === 'string' && !fs.existsSync(input)) {
    // Log helpful error for missing files
    console.error(`⚠️ Input file not found: ${input}`);
    
    // Try to help with common path issues
    const altPath = path.isAbsolute(input) 
      ? path.relative(process.cwd(), input) 
      : path.resolve(process.cwd(), input);
      
    if (fs.existsSync(altPath)) {
      console.log(`💡 Did you mean to use this path instead? ${altPath}`);
      return new SharpCompat(altPath);
    }
    
    throw new Error(`Input file not found: ${input}`);
  }
  
  return new SharpCompat(input);
}

// Performance optimization - cache image instances
const instanceCache = new Map();
const MAX_INSTANCES = 50;

// Clear cache periodically to prevent memory leaks
setInterval(() => {
  if (imageCache.size > 0) {
    console.log(`[Sharp compat] Clearing image cache (${imageCache.size} items)`);
    imageCache.clear();
  }
  if (instanceCache.size > 0) {
    instanceCache.clear();
  }
}, 60000); // Clear caches every minute

// Provide compatibility for some common Sharp functions
sharpCompat.cache = function(options) {
  // Actually honor cache settings to some extent
  if (options && typeof options.files === 'number') {
    MAX_CACHE_SIZE = Math.min(Math.max(options.files, 5), 100); // Between 5-100
  }
  return sharpCompat;
};

// Enhanced error reporting system
sharpCompat.setVerbose = function(verbose = true) {
  if (verbose) {
    console.log('📝 Sharp compatibility layer: Verbose mode enabled');
  }
  return sharpCompat;
};

// Clear memory when system is under pressure
sharpCompat.clearCache = function() {
  const oldSize = imageCache.size;
  imageCache.clear();
  instanceCache.clear();
  console.log(`🧹 Sharp compatibility layer: Cleared ${oldSize} cached images`);
  return sharpCompat;
};

sharpCompat.format = {
  jpeg: 'jpeg',
  png: 'png',
  webp: 'webp',
  raw: 'raw',
  svg: 'svg'
};

sharpCompat.versions = {
  vips: '0.0.0 (compatibility mode)',
  sharpCompat: '1.1.0' // Version of our compatibility layer
};

sharpCompat.simd = false;

// Print a message to console indicating the compatibility layer is being used
console.log('🖼️ Using Jimp-based Sharp compatibility layer for Termux compatibility');

module.exports = sharpCompat;