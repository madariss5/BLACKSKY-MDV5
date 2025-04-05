/**
 * Enhanced GIF Sender Utility
 * Ensures GIFs are properly animated and clear when sent in WhatsApp
 */

const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const { promisify } = require('util');
const execAsync = promisify(exec);

// Store processed GIFs for faster reuse
const processedGifs = new Map();

/**
 * Optimizes a GIF for better display in WhatsApp
 * @param {string} gifPath - Path to the original GIF
 * @returns {Promise<Buffer>} - The optimized GIF buffer
 */
async function optimizeGif(gifPath) {
    try {
        // Check if this GIF has already been processed
        if (processedGifs.has(gifPath)) {
            return processedGifs.get(gifPath);
        }
        
        // Check if temporary directory exists
        const tmpDir = path.join(process.cwd(), 'tmp');
        if (!fs.existsSync(tmpDir)) {
            fs.mkdirSync(tmpDir, { recursive: true });
        }
        
        // Define output paths
        const gifName = path.basename(gifPath, '.gif');
        const outputMp4 = path.join(tmpDir, `${gifName}_optimized.mp4`);
        
        // Only process if not already done
        if (!fs.existsSync(outputMp4)) {
            console.log(`[ENHANCED-GIF] Processing ${gifName}.gif for better quality...`);
            
            // Use ffmpeg to convert the GIF to an MP4 with settings optimized for WhatsApp
            await execAsync(`ffmpeg -y -i "${gifPath}" -movflags faststart -pix_fmt yuv420p -vf "scale=trunc(iw/2)*2:trunc(ih/2)*2" "${outputMp4}"`);
            
            // Check if the file was created
            if (!fs.existsSync(outputMp4)) {
                throw new Error(`Failed to create optimized MP4 for ${gifName}`);
            }
        }
        
        // Read the output file and store in cache
        const buffer = fs.readFileSync(outputMp4);
        processedGifs.set(gifPath, buffer);
        
        return buffer;
    } catch (error) {
        console.error(`[ENHANCED-GIF] Error optimizing GIF: ${error.message}`);
        // If optimization fails, return the original GIF
        return fs.readFileSync(gifPath);
    }
}

/**
 * Sends an enhanced GIF that properly displays as animated in WhatsApp
 * @param {Object} conn - The WhatsApp connection object
 * @param {String} jid - Chat ID to send the GIF to
 * @param {String} gifPath - Path to the GIF file
 * @param {String|null} caption - Optional caption for the GIF
 * @param {Object|null} quoted - Message to quote
 * @param {Array|null} mentions - Array of JIDs to mention
 * @returns {Promise<boolean>} Success status
 */
async function sendEnhancedGif(conn, jid, gifPath, caption = null, quoted = null, mentions = []) {
    try {
        console.log(`[ENHANCED-GIF] Sending enhanced GIF: ${gifPath}`);
        
        // Step 1: Try to optimize the GIF for better display
        const buffer = await optimizeGif(gifPath);
        
        // Step 2: Send as video with gifPlayback enabled
        // This is the most reliable way to display animated GIFs in WhatsApp
        await conn.sendMessage(jid, {
            video: buffer,
            gifPlayback: true,
            caption: caption,
            mentions: mentions,
            mimetype: 'video/mp4',
            // These settings help ensure the GIF is clear and animated
            jpegThumbnail: null,     // Don't use a thumbnail which can cause blur
            viewOnce: false,         // Allow viewing multiple times
            mediaType: 2             // Video type
        }, { 
            quoted,
            ephemeralExpiration: 0   // Don't expire
        });
        
        console.log(`[ENHANCED-GIF] Successfully sent enhanced GIF`);
        return true;
    } catch (error) {
        console.error(`[ENHANCED-GIF] Primary method failed: ${error.message}`);
        
        try {
            // Fallback method: Try sending as a regular GIF
            console.log(`[ENHANCED-GIF] Trying fallback method...`);
            
            const originalBuffer = fs.readFileSync(gifPath);
            
            await conn.sendMessage(jid, {
                video: originalBuffer,
                gifPlayback: true,
                caption: caption,
                mentions: mentions,
                mimetype: 'video/mp4'
            }, { quoted });
            
            console.log(`[ENHANCED-GIF] Fallback succeeded`);
            return true;
        } catch (fallbackError) {
            console.error(`[ENHANCED-GIF] Fallback also failed: ${fallbackError.message}`);
            return false;
        }
    }
}

// Export functions
module.exports = {
    optimizeGif,
    sendEnhancedGif
};