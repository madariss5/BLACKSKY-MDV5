/**
 * Direct GIF Testing Command
 * Has no dependencies on other files
 */

const fs = require('fs');
const path = require('path');
const { promisify } = require('util');
const exec = promisify(require('child_process').exec);

let handler = async (m, { conn, args, usedPrefix, command }) => {
    try {
        if (!args[0]) {
            return m.reply(`Usage: ${usedPrefix}${command} <reaction>\nExample: ${usedPrefix}${command} hug`);
        }
        
        const reaction = args[0];
        const gifPath = path.join(process.cwd(), 'gifs', `${reaction}.gif`);
        
        // Check if GIF exists
        if (!fs.existsSync(gifPath)) {
            return m.reply(`GIF not found: ${reaction}.gif\n\nMake sure the file exists in the gifs directory.`);
        }
        
        // Reply with testing message
        await m.reply(`Testing ${reaction}.gif directly...`);
        
        // Read the GIF into a buffer
        const buffer = fs.readFileSync(gifPath);
        
        // Try multiple methods to send the GIF
        
        // METHOD 1: Send as document
        try {
            await conn.sendMessage(m.chat, {
                document: buffer,
                mimetype: 'image/gif',
                fileName: `${reaction}.gif`
            }, { quoted: m });
            
            await m.reply('✅ Method 1: Sent as document');
        } catch (error) {
            await m.reply(`❌ Method 1 failed: ${error.message}`);
        }
        
        // METHOD 2: Send as video with gifPlayback
        try {
            await conn.sendMessage(m.chat, {
                video: buffer,
                gifPlayback: true,
                caption: 'Method 2: Video with gifPlayback',
                mimetype: 'video/mp4'
            }, { quoted: m });
            
            await m.reply('✅ Method 2: Sent as video with gifPlayback');
        } catch (error) {
            await m.reply(`❌ Method 2 failed: ${error.message}`);
        }
        
        // METHOD 3: Convert to sticker and send
        try {
            // Create tmp directory if it doesn't exist
            const tmpDir = path.join(process.cwd(), 'tmp');
            if (!fs.existsSync(tmpDir)) {
                fs.mkdirSync(tmpDir, { recursive: true });
            }
            
            const tmpFile = path.join(tmpDir, `${reaction}_${Date.now()}.webp`);
            await exec(`ffmpeg -i "${gifPath}" -vf "scale=512:512:force_original_aspect_ratio=decrease" "${tmpFile}"`);
            
            if (fs.existsSync(tmpFile)) {
                const stickerBuffer = fs.readFileSync(tmpFile);
                await conn.sendMessage(m.chat, { 
                    sticker: stickerBuffer 
                }, { quoted: m });
                
                fs.unlinkSync(tmpFile);
                await m.reply('✅ Method 3: Sent as sticker');
            } else {
                await m.reply('❌ Method 3 failed: Sticker conversion failed');
            }
        } catch (error) {
            await m.reply(`❌ Method 3 failed: ${error.message}`);
        }
        
        await m.reply('Testing completed.');
    } catch (error) {
        console.error('Error in direct-gif-test command:', error);
        m.reply(`Error: ${error.message}`);
    }
};

handler.help = ['directgif <reaction>'];
handler.tags = ['tools', 'test'];
handler.command = /^(directgif|dgif|directtest)$/i;

module.exports = handler;