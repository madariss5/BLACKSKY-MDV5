/**
 * Test GIF Sending - Comprehensive Test
 * This plugin tests multiple GIF sending methods and reports results
 */

const fs = require('fs');
const path = require('path');
const axios = require('axios');
const { promisify } = require('util');
const exec = promisify(require('child_process').exec);

let handler = async (m, { conn, args, usedPrefix, command }) => {
    try {
        // Default to 'hug' if no argument is given
        const reaction = args[0] || 'hug';
        const gifPath = path.join(process.cwd(), 'gifs', `${reaction}.gif`);
        
        // Check if GIF exists
        if (!fs.existsSync(gifPath)) {
            return m.reply(`GIF not found: ${reaction}.gif\n\nMake sure the file exists in the gifs directory.`);
        }
        
        m.reply(`Testing GIF sending methods for ${reaction}.gif\nPlease wait while I try all methods...`);
        
        // Get the buffer
        const buffer = fs.readFileSync(gifPath);
        const results = [];
        
        // METHOD 1: Send as document with GIF mimetype
        try {
            await conn.sendMessage(m.chat, {
                document: buffer,
                mimetype: 'image/gif',
                fileName: `${reaction}.gif`
            }, { quoted: m });
            results.push('✅ Method 1: Document with GIF mimetype');
        } catch (error) {
            results.push(`❌ Method 1: ${error.message}`);
        }
        
        // METHOD 2: Send as video with gifPlayback
        try {
            await conn.sendMessage(m.chat, {
                video: buffer,
                gifPlayback: true,
                caption: 'Method 2: Video with gifPlayback',
                mimetype: 'video/mp4'
            }, { quoted: m });
            results.push('✅ Method 2: Video with gifPlayback');
        } catch (error) {
            results.push(`❌ Method 2: ${error.message}`);
        }
        
        // METHOD 3: Convert to MP4 and send
        try {
            const tmpFile = path.join(process.cwd(), 'tmp', `${reaction}_${Date.now()}.mp4`);
            await exec(`ffmpeg -f gif -i "${gifPath}" -movflags faststart -pix_fmt yuv420p -vf "scale=trunc(iw/2)*2:trunc(ih/2)*2" "${tmpFile}"`);
            
            if (fs.existsSync(tmpFile)) {
                const videoBuffer = fs.readFileSync(tmpFile);
                await conn.sendMessage(m.chat, {
                    video: videoBuffer,
                    caption: 'Method 3: Converted to MP4',
                    gifPlayback: true,
                    mimetype: 'video/mp4'
                }, { quoted: m });
                
                // Clean up temp file
                fs.unlinkSync(tmpFile);
                results.push('✅ Method 3: Converted to MP4');
            } else {
                results.push('❌ Method 3: Conversion failed');
            }
        } catch (error) {
            results.push(`❌ Method 3: ${error.message}`);
        }
        
        // METHOD 4: Send as a sticker
        try {
            const tmpFile = path.join(process.cwd(), 'tmp', `${reaction}_${Date.now()}.webp`);
            await exec(`ffmpeg -i "${gifPath}" -vf "scale=512:512:force_original_aspect_ratio=decrease" "${tmpFile}"`);
            
            if (fs.existsSync(tmpFile)) {
                const stickerBuffer = fs.readFileSync(tmpFile);
                await conn.sendMessage(m.chat, { 
                    sticker: stickerBuffer 
                }, { quoted: m });
                fs.unlinkSync(tmpFile);
                results.push('✅ Method 4: Converted to sticker');
            } else {
                results.push('❌ Method 4: Sticker conversion failed');
            }
        } catch (error) {
            results.push(`❌ Method 4: ${error.message}`);
        }
        
        // METHOD 5: Send using built-in sendFile method
        try {
            await conn.sendFile(m.chat, buffer, `${reaction}.gif`, 'Method 5: Using sendFile', m, false, { mimetype: 'image/gif' });
            results.push('✅ Method 5: Using sendFile');
        } catch (error) {
            results.push(`❌ Method 5: ${error.message}`);
        }
        
        // Send results
        await m.reply('GIF Sending Test Results:\n\n' + results.join('\n'));
        
    } catch (error) {
        console.error('Error in test-gifsend command:', error);
        m.reply(`Error: ${error.message}`);
    }
};

handler.help = ['testgif [reaction]'];
handler.tags = ['tools', 'dev'];
handler.command = /^(testgif|gifsendtest)$/i;

// Create tmp directory if it doesn't exist
if (!fs.existsSync(path.join(process.cwd(), 'tmp'))) {
    fs.mkdirSync(path.join(process.cwd(), 'tmp'), { recursive: true });
}

module.exports = handler;