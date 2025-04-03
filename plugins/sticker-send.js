/**
 * Convert GIF to sticker and send
 * This is the most reliable method to display animated reactions
 */

const fs = require('fs');
const path = require('path');
const { promisify } = require('util');
const exec = promisify(require('child_process').exec);

let handler = async (m, { conn, args, usedPrefix, command }) => {
    try {
        if (!args[0]) {
            return m.reply(`
*GIF to Sticker Converter*

This command converts a reaction GIF to a sticker and sends it.
It's the most reliable way to display animated reactions.

*Usage:* 
${usedPrefix}${command} <reaction>

*Example:*
${usedPrefix}${command} hug
${usedPrefix}${command} kiss
            `);
        }
        
        const reaction = args[0];
        const gifPath = path.join(process.cwd(), 'gifs', `${reaction}.gif`);
        
        // Check if GIF exists
        if (!fs.existsSync(gifPath)) {
            return m.reply(`GIF not found: ${reaction}.gif\n\nAvailable reactions: hug, kiss, pat, slap, bite, bonk`);
        }
        
        // Reply with processing message
        await m.reply(`Converting ${reaction}.gif to sticker...`);
        
        // Create tmp directory if it doesn't exist
        const tmpDir = path.join(process.cwd(), 'tmp');
        if (!fs.existsSync(tmpDir)) {
            fs.mkdirSync(tmpDir, { recursive: true });
        }
        
        // Convert GIF to WebP sticker
        const tmpFile = path.join(tmpDir, `${reaction}_${Date.now()}.webp`);
        
        try {
            // Use FFmpeg to convert GIF to WebP
            await exec(`ffmpeg -i "${gifPath}" -vf "scale=512:512:force_original_aspect_ratio=decrease" "${tmpFile}"`);
            
            if (fs.existsSync(tmpFile)) {
                // Send as sticker
                const stickerBuffer = fs.readFileSync(tmpFile);
                await conn.sendMessage(m.chat, { 
                    sticker: stickerBuffer 
                }, { quoted: m });
                
                // Clean up temp file
                fs.unlinkSync(tmpFile);
                
                // Report success
                await m.reply(`✅ ${reaction} sticker sent successfully!`);
            } else {
                await m.reply(`❌ Failed to convert ${reaction}.gif to sticker.`);
            }
        } catch (error) {
            console.error(`Error converting GIF to sticker:`, error);
            await m.reply(`❌ Error: ${error.message}`);
        }
    } catch (error) {
        console.error('Error in sticker-send command:', error);
        m.reply(`Error: ${error.message}`);
    }
};

handler.help = ['stickersend <reaction>'];
handler.tags = ['fun', 'sticker'];
handler.command = /^(stickersend|ssend|sticksend)$/i;

module.exports = handler;