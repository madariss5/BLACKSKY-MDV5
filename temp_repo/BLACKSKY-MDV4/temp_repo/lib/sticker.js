const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const fetch = require('node-fetch');
const { ffmpeg } = require('./converter');
const { spawn } = require('child_process');
const uploadFile = require('./uploadFile');
const { fromBuffer } = require('file-type');
const uploadImage = require('./uploadImage');

const tmp = path.join(__dirname, '../tmp')
/**
 * Image to Sticker
 * @param {Buffer} img Image Buffer
 * @param {String} url Image URL
 */
function sticker2(img, url) {
  return new Promise(async (resolve, reject) => {
    try {
      if (url) {
        let res = await fetch(url)
        if (res.status !== 200) throw await res.text()
        img = await res.buffer()
      }
      let inp = path.join(tmp, +new Date + '.jpeg')
      await fs.promises.writeFile(inp, img)
      let ff = spawn('ffmpeg', [
        '-y',
        '-i', inp,
        '-vf', 'scale=512:512:flags=lanczos:force_original_aspect_ratio=decrease,format=rgba,pad=512:512:(ow-iw)/2:(oh-ih)/2:color=#00000000,setsar=1',
        '-f', 'png',
        '-'
      ])
      ff.on('error', reject)
      ff.on('close', async () => {
        await fs.promises.unlink(inp)
      })
      let bufs = []
      const [_spawnprocess, ..._spawnargs] = [...(module.exports.support.gm ? ['gm'] : module.exports.magick ? ['magick'] : []), 'convert', 'png:-', 'webp:-']
      let im = spawn(_spawnprocess, _spawnargs)
      im.on('error', e => conn.reply(m.chat, util.format(e), m))
      im.stdout.on('data', chunk => bufs.push(chunk))
      ff.stdout.pipe(im.stdin)
      im.on('exit', () => {
        resolve(Buffer.concat(bufs))
      })
    } catch (e) {
      reject(e)
    }
  })
}

async function canvas(code, Type = 'png', quality = 0.92) {
  let res = await fetch('https://nurutomo.herokuapp.com/fire/canvas?' + queryURL({
    Type,
    quality
  }), {
    method: 'POST',
    headers: {
      'Content-Type': 'text/plain',
      'Content-Length': code.length
    },
    body: code
  })
  let image = await res.buffer()
  return image
}

function queryURL(queries) {
  return new URLSearchParams(Object.entries(queries))
}

/**
 * Image to Sticker
 * @param {Buffer} img Image Buffer
 * @param {String} url Image URL
 */
async function sticker1(img, url) {
  url = url ? url : await uploadImage(img)
  let {
    mime
  } = url ? { mime: 'image/jpeg' } : await fromBuffer(img)
  let sc = `let im = await loadImg('data:${mime};base64,'+(await window.loadToDataURI('${url}')))
c.width = c.height = 512
let max = Math.max(im.width, im.height)
let w = 512 * im.width / max
let h = 512 * im.height / max
ctx.drawImage(im, 256 - w / 2, 256 - h / 2, w, h)
`
  return await canvas(sc, 'webp')
}

/**
 * Image/video to Sticker
 * @param {Buffer} img Image/video Buffer
 * @param {String} url Image/video URL
 * @param {String} packname EXIF Packname
 * @param {String} author EXIF Author
 */
async function sticker3(img, url, packname, author) {
  url = url ? url : await uploadFile(img)
  let res = await fetch('https://fire.xteam.xyz/sticker/wm?' + new URLSearchParams(Object.entries({
    url,
    packname,
    author
  })))
  return await res.buffer()
}

/**
 * Image to Sticker
 * @param {Buffer} img Image/video Buffer
 * @param {String} url Image/video URL
 */
async function sticker4(img, url) {
  if (url) {
    let res = await fetch(url)
    if (res.status !== 200) throw await res.text()
    img = await res.buffer()
  }
  return await ffmpeg(img, [
    '-vf', 'scale=512:512:flags=lanczos:force_original_aspect_ratio=decrease,format=rgba,pad=512:512:(ow-iw)/2:(oh-ih)/2:color=#00000000,setsar=1'
  ], 'jpeg', 'webp')
}


async function sticker5(img, url, packname, author, categories = ['🎮', '🌟']) {
  try {
    const WSF = require('wa-sticker-formatter');
    
    // Set default packname and author if not provided
    packname = packname || 'BLACKSKY-MD';
    author = author || 'Premium Bot';
    
    // Create proper sticker metadata
    const stickerMetadata = {
      pack: packname,
      author: author,
      type: WSF.StickerTypes.FULL, // FULL preserves the aspect ratio
      categories: categories,
      id: 'blacksky-premium', // optional but recommended
      quality: 70, // high quality
    };
    
    console.log('Creating sticker with metadata:', JSON.stringify(stickerMetadata));
    
    // Create the sticker with the proper source
    let source = img;
    if (!img && url) {
      source = url;
    }
    
    // Validate source
    if (!source) {
      throw new Error('No image source provided');
    }
    
    // Create and build the sticker
    const sticker = new WSF.Sticker(source, stickerMetadata);
    return await sticker.build();
  } catch (error) {
    console.error('sticker5 error:', error);
    throw error;
  }
}


/**
 * Add WhatsApp JSON Exif Metadata
 * Taken from https://github.com/pedroslopez/whatsapp-web.js/pull/527/files
 * @param {Buffer} webpSticker 
 * @param {String} packname 
 * @param {String} author 
 * @param {String} categories 
 * @param {Object} extra 
 * @returns 
 */
async function addExif(webpSticker, packname, author, categories = [''], extra = {}) {
  const webp = require('node-webpmux'); // Optional Feature
  const img = new webp.Image();
  const stickerPackId = crypto.randomBytes(32).toString('hex');
  const json = { 'sticker-pack-id': stickerPackId, 'sticker-pack-name': packname, 'sticker-pack-publisher': author, 'emojis': categories, ...extra };
  let exifAttr = Buffer.from([0x49, 0x49, 0x2A, 0x00, 0x08, 0x00, 0x00, 0x00, 0x01, 0x00, 0x41, 0x57, 0x07, 0x00, 0x00, 0x00, 0x00, 0x00, 0x16, 0x00, 0x00, 0x00]);
  let jsonBuffer = Buffer.from(JSON.stringify(json), 'utf8');
  let exif = Buffer.concat([exifAttr, jsonBuffer]);
  exif.writeUIntLE(jsonBuffer.length, 14, 4);
  await img.loadBuffer(webpSticker)
  img.exif = exif
  return await img.saveBuffer()
}

module.exports = {
  /**
   * Image/video to Sticker
   * @param {Buffer} img Image/video Buffer
   * @param {String} url Image/video URL
   * @param {...String} 
   */
  async sticker(img, url, ...args) {
    let lastError
    for (let func of [
      sticker5, // Try wa-sticker-formatter first (local processing)
      this.support.ffmpeg && this.support.ffmpegWebp && sticker4, // Then try ffmpeg (local processing)
      this.support.ffmpeg && (this.support.convert || this.support.magick || this.support.gm) && sticker2, // Then try convert (local processing)
      sticker1, // Then try canvas (semi-local processing)
      sticker3 // Last resort: external API (often fails)
    ].filter(f => f)) {
      try {
        console.log('Trying sticker method:', func.name);
        let sticker = await func(img, url, ...args)
        
        // Check if the sticker contains the WEBP RIFF header
        if (sticker && sticker.includes && sticker.includes('RIFF')) {
          try {
            return await addExif(sticker, ...args)
          } catch (e) {
            console.log('Error adding exif, returning plain sticker:', e.message);
            return sticker
          }
        } else if (sticker && Buffer.isBuffer(sticker)) {
          // If it's a buffer but doesn't have RIFF header, try to add exif anyway
          try {
            return await addExif(sticker, ...args)
          } catch (e) {
            console.log('Error adding exif to buffer, returning plain buffer');
            return sticker
          }
        }
        
        throw new Error('Invalid sticker format: ' + (typeof sticker === 'string' ? sticker : 'buffer without RIFF header'))
      } catch (err) {
        console.log('Sticker method failed:', func.name, err.message);
        lastError = err
      }
    }
    return lastError
  },
  sticker1,
  sticker2,
  sticker3,
  sticker4,
  sticker5,
  addExif,
  support: {
    ffmpeg: true,
    ffprobe: true,
    ffmpegWebp: true,
    convert: true,
    magick: false,
    gm: false,
    find: false
  }
}