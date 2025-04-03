/**
 * GIF Sender Utility
 * Provides reliable methods for sending GIFs in WhatsApp
 */

const fs = require('fs');
const path = require('path');
const { promisify } = require('util');
const exec = promisify(require('child_process').exec);

const logger = {
    info: console.log,
    error: console.error,
    warn: console.warn
};

/**
 * Ensure the necessary directories exist
 */
function ensureDirectories() {
    const dirs = ['tmp', 'gifs'];
    dirs.forEach(dir => {
        const dirPath = path.join(process.cwd(), dir);
        if (!fs.existsSync(dirPath)) {
            fs.mkdirSync(dirPath, { recursive: true });
            logger.info(`Created directory: ${dirPath}`);
        }
    });
}

/**
 * Try multiple methods to send a GIF
 * @param {Object} conn - The connection object
 * @param {String} jid - The JID to send the GIF to
 * @param {String} gifPath - Path to the GIF file
 * @param {Object} quoted - The message to quote
 * @returns {Promise<boolean>} - Whether the GIF was sent successfully
 */
async function sendGif(conn, jid, gifPath, quoted = null) {
    // Check if file exists
    if (!fs.existsSync(gifPath)) {
        logger.error(`GIF not found: ${gifPath}`);
        return false;
    }
    
    // Read the file into a buffer
    const buffer = fs.readFileSync(gifPath);
    const fileName = path.basename(gifPath);
    let success = false;
    
    // STRATEGY 1: Send as document
    if (!success) {
        try {
            await conn.sendMessage(jid, {
                document: buffer,
                mimetype: 'image/gif',
                fileName: fileName
            }, { quoted });
            logger.info(`Successfully sent ${fileName} as document`);
            success = true;
        } catch (error) {
            logger.error(`Failed to send as document: ${error.message}`);
        }
    }
    
    // STRATEGY 2: Send as video with enhanced gifPlayback settings
    if (!success) {
        try {
            await conn.sendMessage(jid, {
                video: buffer,
                gifPlayback: true,
                mimetype: 'video/mp4',
                // Enhanced settings for better quality
                jpegThumbnail: null, // Disable thumbnail which can cause blur
                fileLength: buffer.length, // Correct file size
                mediaType: 2, // Video type
                ptt: false // Not voice note
            }, { 
                quoted,
                ephemeralExpiration: 0 // Don't expire
            });
            logger.info(`Successfully sent ${fileName} as enhanced video with gifPlayback`);
            success = true;
        } catch (error) {
            logger.error(`Failed to send as enhanced video: ${error.message}`);
        }
    }
    
    // STRATEGY 3: Convert to WebP and send as sticker
    if (!success) {
        try {
            const tmpFile = path.join(process.cwd(), 'tmp', `${path.parse(fileName).name}_${Date.now()}.webp`);
            await exec(`ffmpeg -i "${gifPath}" -vf "scale=512:512:force_original_aspect_ratio=decrease" "${tmpFile}"`);
            
            if (fs.existsSync(tmpFile)) {
                const stickerBuffer = fs.readFileSync(tmpFile);
                await conn.sendMessage(jid, { 
                    sticker: stickerBuffer 
                }, { quoted });
                fs.unlinkSync(tmpFile);
                logger.info(`Successfully sent ${fileName} as sticker`);
                success = true;
            }
        } catch (error) {
            logger.error(`Failed to send as sticker: ${error.message}`);
        }
    }
    
    // STRATEGY 4: Direct sendFile method
    if (!success) {
        try {
            await conn.sendFile(jid, buffer, fileName, '', quoted, false, { mimetype: 'image/gif' });
            logger.info(`Successfully sent ${fileName} using sendFile`);
            success = true;
        } catch (error) {
            logger.error(`Failed to use sendFile: ${error.message}`);
        }
    }
    
    return success;
}

/**
 * Get a list of available reaction GIFs
 * @returns {Array<String>} - List of available reaction GIFs without extension
 */
function getAvailableReactions() {
    const gifsDir = path.join(process.cwd(), 'gifs');
    if (!fs.existsSync(gifsDir)) return [];
    
    return fs.readdirSync(gifsDir)
        .filter(file => file.endsWith('.gif'))
        .map(file => path.parse(file).name);
}

// Ensure directories when module is loaded
ensureDirectories();

module.exports = {
    sendGif,
    getAvailableReactions,
    ensureDirectories
};