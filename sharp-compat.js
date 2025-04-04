/**
 * Sharp compatibility layer using Jimp
 * For Termux environments where Sharp is difficult to install
 */
const Jimp = require('jimp');
const fs = require('fs');
const path = require('path');
const { promisify } = require('util');
const writeFileAsync = promisify(fs.writeFile);
const readFileAsync = promisify(fs.readFile);

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
      console.error('Error loading image:', err);
      throw err;
    }
  }

  async _ensureImage() {
    if (!this._image && this._loadPromise) {
      await this._loadPromise;
    }
    if (!this._image) {
      throw new Error('No image loaded');
    }
    return this._image;
  }

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

  flip() {
    this._options.flip = true;
    return this;
  }

  flop() {
    this._options.flop = true;
    return this;
  }

  rotate(angle) {
    this._options.rotate = angle;
    return this;
  }

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

  async toBuffer() {
    const image = await this._ensureImage();
    let processedImage = image.clone();

    if (this._options.resize) {
      const { width, height, fit } = this._options.resize;
      if (fit === 'contain') {
        processedImage.contain(width || Jimp.AUTO, height || Jimp.AUTO);
      } else if (fit === 'cover') {
        processedImage.cover(width || Jimp.AUTO, height || Jimp.AUTO);
      } else {
        processedImage.resize(width || Jimp.AUTO, height || Jimp.AUTO);
      }
    }

    if (this._options.greyscale || this._options.grayscale) {
      processedImage.greyscale();
    }

    if (this._options.flip) {
      processedImage.flip(true, false);
    }

    if (this._options.flop) {
      processedImage.flip(false, true);
    }

    if (this._options.rotate) {
      processedImage.rotate(this._options.rotate);
    }

    if (this._options.blur > 0) {
      processedImage.blur(this._options.blur);
    }

    if (this._options.negate) {
      processedImage.invert();
    }

    if (this._options.extract) {
      const { left, top, width, height } = this._options.extract;
      processedImage.crop(left, top, width, height);
    }

    processedImage.quality(this._quality);

    return new Promise((resolve, reject) => {
      processedImage.getBuffer(
        this._format === 'jpeg' ? Jimp.MIME_JPEG :
        this._format === 'png' ? Jimp.MIME_PNG :
        this._format === 'webp' ? Jimp.MIME_WEBP :
        Jimp.MIME_PNG,
        (err, buffer) => {
          if (err) reject(err);
          else resolve(buffer);
        }
      );
    });
  }

  async toFile(outputPath) {
    const image = await this._ensureImage();
    await image.writeAsync(outputPath);
    const stats = fs.statSync(outputPath);

    return {
      format: this._format,
      width: image.getWidth(),
      height: image.getHeight(),
      channels: 4,
      premultiplied: false,
      size: stats.size
    };
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

module.exports = (input) => new SharpCompat(input);
module.exports.cache = false;
module.exports.simd = false;
module.exports.format = {
  jpeg: { id: 'jpeg', input: { file: true } },
  png: { id: 'png', input: { file: true } },
  webp: { id: 'webp', input: { file: true } }
};