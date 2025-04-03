/**
 * BLACKSKY-MD Sticker Maker
 * Convert images, videos, and GIFs to stickers
 * With multilingual support (English and German)
 */

const { sticker } = require('../lib/sticker');
const { getMessage } = require('../lib/languages');
const uploadImage = require('../lib/uploadImage');
const fs = require('fs');
const { exec } = require('child_process');
const util = require('util');
const ffmpeg = require('fluent-ffmpeg');
const path = require('path');
const { fileTypeFromBuffer } = require('file-type');

// Add translations to languages.js if not already present
if (!global.translations) {
    global.translations = {
        en: {},
        de: {}
    };
}

// English translations
global.translations.en.sticker_please_reply = "Please reply to or caption an image/video/gif to convert it to a sticker!";
global.translations.en.sticker_processing = "Creating sticker... This may take a moment";
global.translations.en.sticker_error = "Error creating sticker. Please try again later.";
global.translations.en.sticker_file_too_large = "File is too large! Maximum size is 10MB.";
global.translations.en.sticker_invalid_format = "Unsupported media format. Please use an image, video, or GIF.";
global.translations.en.sticker_options = "Options:\n- crop: Crop to square\n- nobg: Remove background (images only)\n- circle: Make a circular sticker (images only)";
global.translations.en.sticker_created = "Sticker created successfully! ✅";

// German translations
global.translations.de.sticker_please_reply = "Bitte antworte auf ein Bild/Video/GIF oder füge eine Beschriftung hinzu, um es in einen Sticker umzuwandeln!";
global.translations.de.sticker_processing = "Erstelle Sticker... Dies kann einen Moment dauern";
global.translations.de.sticker_error = "Fehler beim Erstellen des Stickers. Bitte versuche es später erneut.";
global.translations.de.sticker_file_too_large = "Datei ist zu groß! Maximale Größe ist 10MB.";
global.translations.de.sticker_invalid_format = "Nicht unterstütztes Medienformat. Bitte verwende ein Bild, Video oder GIF.";
global.translations.de.sticker_options = "Optionen:\n- crop: Auf Quadrat zuschneiden\n- nobg: Hintergrund entfernen (nur bei Bildern)\n- circle: Einen runden Sticker erstellen (nur bei Bildern)";
global.translations.de.sticker_created = "Sticker erfolgreich erstellt! ✅";

let handler = async (m, { conn, args, usedPrefix, command }) => {
    // Get user's language preference
    const user = global.db.data.users[m.sender];
    const chat = global.db.data.chats[m.chat];
    const lang = user?.language || chat?.language || global.language || 'en';
    
    // Set sticker options from args
    let packname = global.packname;
    let author = global.author;
    
    // Extract options from arguments
    let crop = true; // Default to cropping
    let removeBg = false;
    let circle = false;
    
    if (args.includes('nocrop') || args.includes('full')) {
        crop = false;
        args = args.filter(arg => arg !== 'nocrop' && arg !== 'full');
    }
    
    if (args.includes('nobg')) {
        removeBg = true;
        args = args.filter(arg => arg !== 'nobg');
    }
    
    if (args.includes('circle')) {
        circle = true;
        args = args.filter(arg => arg !== 'circle');
    }
    
    // Custom packname and author from args
    const packIndex = args.findIndex(arg => arg.startsWith('pack='));
    if (packIndex !== -1) {
        packname = args[packIndex].substring(5);
        args.splice(packIndex, 1);
    }
    
    const authorIndex = args.findIndex(arg => arg.startsWith('author='));
    if (authorIndex !== -1) {
        author = args[authorIndex].substring(7);
        args.splice(authorIndex, 1);
    }
    
    // Create temporary directory if it doesn't exist
    const tmpDir = './tmp';
    if (!fs.existsSync(tmpDir)) {
        fs.mkdirSync(tmpDir, { recursive: true });
    }
    
    try {
        let quoted = m.quoted ? m.quoted : m;
        let mime = (quoted.msg || quoted).mimetype || '';
        
        // Check if media exists
        if (!mime) {
            let helpText = `${getMessage(lang, 'sticker_please_reply')}\n\n${getMessage(lang, 'sticker_options')}`;
            return m.reply(helpText);
        }
        
        // Check if media type is supported
        if (!mime.match(/image\/(jpe?g|png|webp)|video\/mp4|audio\/mp4|application\/octet-stream/)) {
            return m.reply(getMessage(lang, 'sticker_invalid_format'));
        }
        
        // Check file size (limit to 10MB)
        let media;
        try {
            // Send processing message
            m.reply(getMessage(lang, 'sticker_processing'));
            
            media = await quoted.download();
            if (!media) {
                throw new Error('Failed to download media');
            }
            if (media.length > 10 * 1024 * 1024) { // 10MB limit
                return m.reply(getMessage(lang, 'sticker_file_too_large'));
            }
        } catch (e) {
            console.error('Error downloading media:', e);
            return m.reply(getMessage(lang, 'sticker_error'));
        }
        
        // Create sticker based on media type
        let stickBuffer;
        
        if (mime.startsWith('image/')) {
            // Process image
            stickBuffer = await processImage(media, {
                packname,
                author,
                crop,
                removeBg, 
                circle
            });
        } else if (mime.startsWith('video/') || mime.endsWith('gif')) {
            // Process video or GIF
            stickBuffer = await processVideoOrGif(media, {
                packname,
                author,
                crop
            });
        } else {
            // Unsupported format
            return m.reply(getMessage(lang, 'sticker_invalid_format'));
        }
        
        // Send the sticker
        if (stickBuffer) {
            // Send the sticker file
            await conn.sendFile(m.chat, stickBuffer, 'sticker.webp', '', m);
            
            // Send success message using the language-specific translation
            await m.reply(getMessage(lang, 'sticker_created'));
        } else {
            throw new Error('Failed to create sticker');
        }
    } catch (e) {
        console.error('Error in sticker command:', e);
        m.reply(`${getMessage(lang, 'sticker_error')}\nDetails: ${e.message}`);
    }
};

// Function to process images
async function processImage(imageBuffer, options) {
    try {
        console.log('[STICKER-MAKER] Processing image with options:', JSON.stringify(options));
        
        // Create temporary directory if it doesn't exist
        const tmpDir = './tmp';
        if (!fs.existsSync(tmpDir)) {
            fs.mkdirSync(tmpDir, { recursive: true });
        }
        
        // Try direct method first
        try {
            const { sticker } = require('../lib/sticker');
            return await sticker(imageBuffer, null, options.packname, options.author, ['🎮', '🌟']);
        } catch (directError) {
            console.error('[STICKER-MAKER] Direct sticker method failed:', directError.message);
            
            // Fall back to WSF via temporary file
            const WSF = require('wa-sticker-formatter');
            
            // Get file type and save temp file
            const { fileTypeFromBuffer } = require('file-type');
            const fileType = await fileTypeFromBuffer(imageBuffer);
            const extension = fileType ? fileType.ext : 'jpg';
            const tempFilePath = `./tmp/temp_${Date.now()}.${extension}`;
            
            console.log(`[STICKER-MAKER] Saving temp file with extension: ${extension}`);
            fs.writeFileSync(tempFilePath, imageBuffer);
            
            try {
                // Create metadata
                const stickerMetadata = {
                    pack: options.packname || "BLACKSKY-MD",
                    author: options.author || "Premium Bot",
                    type: options.crop ? WSF.StickerTypes.CROP : WSF.StickerTypes.FULL,
                    categories: ['🎮', '🌟'],
                    id: 'blacksky-premium',
                    quality: 70,
                };
                
                console.log('[STICKER-MAKER] Creating sticker with metadata:', JSON.stringify(stickerMetadata));
                
                // Create sticker from temp file
                const sticker = new WSF.Sticker(tempFilePath, stickerMetadata);
                
                // Apply circle option if needed
                if (options.circle) {
                    sticker.setRoundedCorners(true);
                }
                
                // Build the sticker
                const result = await sticker.build();
                
                // Clean up temp file
                if (fs.existsSync(tempFilePath)) {
                    fs.unlinkSync(tempFilePath);
                }
                
                return result;
            } catch (wsfError) {
                console.error('[STICKER-MAKER] WSF method failed:', wsfError.message);
                
                // Clean up temp file
                if (fs.existsSync(tempFilePath)) {
                    fs.unlinkSync(tempFilePath);
                }
                
                // Last resort: use ffmpeg directly
                try {
                    console.log('[STICKER-MAKER] Using ffmpeg as last resort');
                    const ffmpegPath = './tmp/temp_ffmpeg_output.webp';
                    
                    return new Promise((resolve, reject) => {
                        ffmpeg(tempFilePath)
                            .outputOptions([
                                '-vf', 'scale=512:512:force_original_aspect_ratio=decrease,format=rgba,pad=512:512:(ow-iw)/2:(oh-ih)/2:color=#00000000,setsar=1',
                                '-f', 'webp'
                            ])
                            .toFormat('webp')
                            .save(ffmpegPath)
                            .on('end', async () => {
                                const buffer = fs.readFileSync(ffmpegPath);
                                
                                // Add EXIF
                                try {
                                    const { addExif } = require('../lib/sticker');
                                    const result = await addExif(buffer, options.packname, options.author, ['🎮', '🌟']);
                                    resolve(result);
                                } catch (exifError) {
                                    console.error('[STICKER-MAKER] Failed to add EXIF:', exifError.message);
                                    resolve(buffer);
                                }
                                
                                // Clean up
                                if (fs.existsSync(ffmpegPath)) {
                                    fs.unlinkSync(ffmpegPath);
                                }
                            })
                            .on('error', (err) => {
                                console.error('[STICKER-MAKER] FFmpeg error:', err.message);
                                reject(err);
                            });
                    });
                } catch (ffmpegError) {
                    console.error('[STICKER-MAKER] All methods failed:', ffmpegError.message);
                    throw ffmpegError;
                }
            }
        }
    } catch (e) {
        console.error('[STICKER-MAKER] Error creating image sticker:', e.message);
        throw e;
    }
}

// Function to process videos and GIFs
async function processVideoOrGif(videoBuffer, options) {
    try {
        console.log('[STICKER-MAKER] Processing video/gif with options:', JSON.stringify(options));
        
        // Create temporary directory if it doesn't exist
        const tmpDir = './tmp';
        if (!fs.existsSync(tmpDir)) {
            fs.mkdirSync(tmpDir, { recursive: true });
        }
        
        // First try direct method with sticker.js
        try {
            console.log('[STICKER-MAKER] Trying direct sticker method for video/gif');
            const { sticker } = require('../lib/sticker');
            return await sticker(videoBuffer, null, options.packname, options.author, ['🎮', '🌟']);
        } catch (directError) {
            console.error('[STICKER-MAKER] Direct video sticker method failed:', directError.message);
            
            // Determine file extension
            const { fileTypeFromBuffer } = require('file-type');
            const fileType = await fileTypeFromBuffer(videoBuffer) || { ext: 'mp4' };
            const tempFile = `./tmp/temp_${Date.now()}.${fileType.ext}`;
            
            console.log(`[STICKER-MAKER] Saving temp video file as ${fileType.ext}`);
            fs.writeFileSync(tempFile, videoBuffer);
            
            // Try WSF with temp file
            try {
                const WSF = require('wa-sticker-formatter');
                
                // Create metadata
                const stickerMetadata = {
                    pack: options.packname || "BLACKSKY-MD",
                    author: options.author || "Premium Bot",
                    type: options.crop ? WSF.StickerTypes.CROP : WSF.StickerTypes.FULL,
                    categories: ['🎮', '🌟'],
                    id: 'blacksky-premium',
                    quality: 30, // Lower quality for videos to keep file size down
                };
                
                console.log('[STICKER-MAKER] Creating video sticker with WSF');
                const sticker = new WSF.Sticker(tempFile, stickerMetadata);
                const processed = await sticker.build();
                
                // Clean up
                if (fs.existsSync(tempFile)) {
                    fs.unlinkSync(tempFile);
                }
                
                return processed;
            } catch (wsfError) {
                console.error('[STICKER-MAKER] WSF video method failed:', wsfError.message);
                
                // Last resort: use ffmpeg directly
                try {
                    console.log('[STICKER-MAKER] Using ffmpeg as last resort for video');
                    const ffmpegPath = './tmp/temp_ffmpeg_video_output.webp';
                    
                    // Make sure temp file still exists
                    if (!fs.existsSync(tempFile)) {
                        fs.writeFileSync(tempFile, videoBuffer);
                    }
                    
                    return new Promise((resolve, reject) => {
                        const ffmpeg = require('fluent-ffmpeg');
                        
                        ffmpeg(tempFile)
                            .inputOptions(['-t', '10']) // Limit to 10 seconds
                            .outputOptions([
                                '-vf', 'scale=512:512:force_original_aspect_ratio=decrease,format=rgba,pad=512:512:(ow-iw)/2:(oh-ih)/2:color=#00000000,setsar=1',
                                '-loop', '0',
                                '-ss', '00:00:00.0',
                                '-t', '10',
                                '-preset', 'default',
                                '-an',
                                '-vsync', '0',
                                '-s', '512x512',
                                '-f', 'webp'
                            ])
                            .toFormat('webp')
                            .save(ffmpegPath)
                            .on('end', async () => {
                                console.log('[STICKER-MAKER] FFmpeg processing completed');
                                const buffer = fs.readFileSync(ffmpegPath);
                                
                                // Add EXIF
                                try {
                                    const { addExif } = require('../lib/sticker');
                                    const result = await addExif(buffer, options.packname, options.author, ['🎮', '🌟']);
                                    resolve(result);
                                } catch (exifError) {
                                    console.error('[STICKER-MAKER] Failed to add EXIF to video:', exifError.message);
                                    resolve(buffer);
                                }
                                
                                // Clean up
                                if (fs.existsSync(ffmpegPath)) {
                                    fs.unlinkSync(ffmpegPath);
                                }
                                if (fs.existsSync(tempFile)) {
                                    fs.unlinkSync(tempFile);
                                }
                            })
                            .on('error', (err) => {
                                console.error('[STICKER-MAKER] FFmpeg video error:', err.message);
                                
                                // Clean up
                                if (fs.existsSync(tempFile)) {
                                    fs.unlinkSync(tempFile);
                                }
                                if (fs.existsSync(ffmpegPath)) {
                                    try { fs.unlinkSync(ffmpegPath); } catch (e) {}
                                }
                                
                                reject(err);
                            });
                    });
                } catch (ffmpegError) {
                    console.error('[STICKER-MAKER] All video methods failed:', ffmpegError.message);
                    
                    // Clean up
                    if (fs.existsSync(tempFile)) {
                        try { fs.unlinkSync(tempFile); } catch (e) {}
                    }
                    
                    throw ffmpegError;
                }
            }
        }
    } catch (e) {
        console.error('[STICKER-MAKER] Error creating video/gif sticker:', e.message);
        throw e;
    }
}

handler.help = ['sticker', 'stiker'].map(v => v + ' [options]');
handler.tags = ['sticker'];
handler.command = /^(s|sticker|stiker)$/i;

module.exports = handler;