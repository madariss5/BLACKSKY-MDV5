/**
 * Media Uploader Utility
 * Direct server uploads for reliable GIF and media sending
 */

const fs = require('fs');
const path = require('path');
const axios = require('axios');
const FormData = require('form-data');
const { createHash } = require('crypto');

// Backup hosting service - use in case the main server is down
const BACKUP_HOSTS = [
    'https://telegra.ph',
    'https://0x0.st',
    'https://tmpfiles.org'
];

/**
 * Generates a file hash to use as a unique identifier
 * @param {Buffer} buffer - File buffer
 * @returns {string} - MD5 hash of the file
 */
function getFileHash(buffer) {
    return createHash('md5').update(buffer).digest('hex');
}

/**
 * Uploads a file to a hosting service and returns the direct URL
 * @param {string|Buffer} fileOrBuffer - File path or buffer to upload
 * @param {string} [fileName] - Optional filename to use
 * @returns {Promise<string|null>} - Direct URL to the uploaded file or null if failed
 */
async function uploadFile(fileOrBuffer, fileName = null) {
    // Get file buffer
    let buffer;
    if (Buffer.isBuffer(fileOrBuffer)) {
        buffer = fileOrBuffer;
    } else if (typeof fileOrBuffer === 'string' && fs.existsSync(fileOrBuffer)) {
        buffer = fs.readFileSync(fileOrBuffer);
        if (!fileName) {
            fileName = path.basename(fileOrBuffer);
        }
    } else {
        console.error('[MEDIA-UPLOADER] Invalid file or buffer provided');
        return null;
    }
    
    if (!fileName) {
        // Generate a filename if none provided
        fileName = `file_${getFileHash(buffer).substring(0, 8)}${getExtensionFromBuffer(buffer)}`;
    }
    
    // Try primary host - Telegraph
    try {
        const url = await uploadToTelegraph(buffer, fileName);
        if (url) {
            console.log(`[MEDIA-UPLOADER] Successfully uploaded to Telegraph: ${url}`);
            return url;
        }
    } catch (error) {
        console.error(`[MEDIA-UPLOADER] Telegraph upload failed: ${error.message}`);
    }
    
    // Try 0x0.st as backup
    try {
        const url = await uploadTo0x0(buffer, fileName);
        if (url) {
            console.log(`[MEDIA-UPLOADER] Successfully uploaded to 0x0.st: ${url}`);
            return url;
        }
    } catch (error) {
        console.error(`[MEDIA-UPLOADER] 0x0.st upload failed: ${error.message}`);
    }
    
    // Final fallback to tmpfiles.org
    try {
        const url = await uploadToTmpFiles(buffer, fileName);
        if (url) {
            console.log(`[MEDIA-UPLOADER] Successfully uploaded to tmpfiles.org: ${url}`);
            return url;
        }
    } catch (error) {
        console.error(`[MEDIA-UPLOADER] tmpfiles.org upload failed: ${error.message}`);
    }
    
    console.error('[MEDIA-UPLOADER] All upload attempts failed');
    return null;
}

/**
 * Upload file to Telegraph
 * @param {Buffer} buffer - File buffer
 * @param {string} fileName - File name
 * @returns {Promise<string|null>} - URL or null if failed
 */
async function uploadToTelegraph(buffer, fileName) {
    try {
        const form = new FormData();
        form.append('file', buffer, {
            filename: fileName,
            contentType: getMimeType(fileName)
        });
        
        const response = await axios.post('https://telegra.ph/upload', form, {
            headers: {
                ...form.getHeaders(),
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
        });
        
        if (response.data && Array.isArray(response.data) && response.data.length > 0) {
            return `https://telegra.ph${response.data[0].src}`;
        }
        
        return null;
    } catch (error) {
        console.error(`Telegraph upload error: ${error.message}`);
        return null;
    }
}

/**
 * Upload file to 0x0.st
 * @param {Buffer} buffer - File buffer
 * @param {string} fileName - File name
 * @returns {Promise<string|null>} - URL or null if failed
 */
async function uploadTo0x0(buffer, fileName) {
    try {
        const form = new FormData();
        form.append('file', buffer, {
            filename: fileName,
            contentType: getMimeType(fileName)
        });
        
        const response = await axios.post('https://0x0.st', form, {
            headers: form.getHeaders(),
            maxBodyLength: Infinity
        });
        
        if (response.data && typeof response.data === 'string') {
            return response.data.trim();
        }
        
        return null;
    } catch (error) {
        console.error(`0x0.st upload error: ${error.message}`);
        return null;
    }
}

/**
 * Upload file to tmpfiles.org
 * @param {Buffer} buffer - File buffer
 * @param {string} fileName - File name
 * @returns {Promise<string|null>} - URL or null if failed
 */
async function uploadToTmpFiles(buffer, fileName) {
    try {
        const form = new FormData();
        form.append('file', buffer, {
            filename: fileName,
            contentType: getMimeType(fileName)
        });
        
        const response = await axios.post('https://tmpfiles.org/api/v1/upload', form, {
            headers: form.getHeaders()
        });
        
        if (response.data && response.data.data && response.data.data.url) {
            return response.data.data.url;
        }
        
        return null;
    } catch (error) {
        console.error(`tmpfiles.org upload error: ${error.message}`);
        return null;
    }
}

/**
 * Get MIME type based on file extension
 * @param {string} fileName - File name
 * @returns {string} - MIME type
 */
function getMimeType(fileName) {
    const ext = path.extname(fileName).toLowerCase();
    
    switch (ext) {
        case '.gif':
            return 'image/gif';
        case '.jpg':
        case '.jpeg':
            return 'image/jpeg';
        case '.png':
            return 'image/png';
        case '.webp':
            return 'image/webp';
        case '.mp4':
            return 'video/mp4';
        case '.mp3':
            return 'audio/mpeg';
        case '.ogg':
            return 'audio/ogg';
        case '.pdf':
            return 'application/pdf';
        default:
            return 'application/octet-stream';
    }
}

/**
 * Guess file extension from buffer type
 * @param {Buffer} buffer - File buffer
 * @returns {string} - File extension with dot
 */
function getExtensionFromBuffer(buffer) {
    // Simple magic number detection for common file types
    if (buffer.length < 4) return '.bin';
    
    // Check for common file signatures
    if (buffer[0] === 0xFF && buffer[1] === 0xD8 && buffer[2] === 0xFF) {
        return '.jpg';
    } else if (buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4E && buffer[3] === 0x47) {
        return '.png';
    } else if (buffer[0] === 0x47 && buffer[1] === 0x49 && buffer[2] === 0x46) {
        return '.gif';
    } else if (buffer[0] === 0x52 && buffer[1] === 0x49 && buffer[2] === 0x46 && buffer[3] === 0x46) {
        return '.webp';
    } else if (buffer[0] === 0x25 && buffer[1] === 0x50 && buffer[2] === 0x44 && buffer[3] === 0x46) {
        return '.pdf';
    } else if (buffer[0] === 0x50 && buffer[1] === 0x4B && buffer[2] === 0x03 && buffer[3] === 0x04) {
        return '.zip';
    }
    
    return '.bin';
}

/**
 * Upload a GIF and returns direct URL for embedding
 * @param {string|Buffer} gifPathOrBuffer - Path to GIF file or buffer
 * @returns {Promise<string|null>} - Direct URL to the GIF
 */
async function uploadGif(gifPathOrBuffer) {
    return await uploadFile(gifPathOrBuffer);
}

/**
 * Send a GIF to WhatsApp chat using URL method if necessary
 * @param {Object} conn - Connection object
 * @param {string} jid - Chat ID to send to
 * @param {string|Buffer} gifPathOrBuffer - Path to GIF or buffer
 * @param {Object} quoted - Message to quote
 * @returns {Promise<boolean>} - Success status
 */
async function sendGifViaUrl(conn, jid, gifPathOrBuffer, quoted = null) {
    try {
        // Try to get a direct URL for the GIF
        const url = await uploadGif(gifPathOrBuffer);
        
        if (!url) {
            console.error('[MEDIA-UPLOADER] Failed to upload GIF');
            return false;
        }
        
        // Send via URL
        await conn.sendMessage(jid, {
            video: { url },
            gifPlayback: true,
            caption: '',
            mimetype: 'video/mp4'
        }, { quoted });
        
        console.log('[MEDIA-UPLOADER] Successfully sent GIF via URL');
        return true;
    } catch (error) {
        console.error(`[MEDIA-UPLOADER] Error sending GIF via URL: ${error.message}`);
        return false;
    }
}

module.exports = {
    uploadFile,
    uploadGif,
    sendGifViaUrl,
    getFileHash
};