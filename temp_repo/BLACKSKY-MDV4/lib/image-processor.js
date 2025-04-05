
const Jimp = require('jimp');

async function processImage(input, options = {}) {
  try {
    const image = await Jimp.read(input);
    
    if (options.width) {
      image.resize(options.width, options.height || Jimp.AUTO);
    }
    
    if (options.quality) {
      image.quality(options.quality);
    }
    
    return await image.getBufferAsync(Jimp.MIME_PNG);
  } catch (error) {
    console.error('Image processing error:', error);
    throw error;
  }
}

module.exports = { processImage };
