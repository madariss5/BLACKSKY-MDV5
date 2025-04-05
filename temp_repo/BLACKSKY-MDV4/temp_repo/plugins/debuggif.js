/**
 * Debug command for testing reaction GIFs
 * This will test different methods of sending GIFs to help diagnose issues
 */

const fs = require('fs');
const path = require('path');
const { promisify } = require('util');
const exec = promisify(require('child_process').exec);

let handler = async (m, { conn, args, usedPrefix, command }) => {
    // Only allow owner to use this command
    if (!m.isOwner) return m.reply('This is an owner-only command for debugging');
    
    try {
        // If no arguments, show available GIFs
        if (!args[0]) {
            const gifsDir = path.join(process.cwd(), 'gifs');
            const gifs = fs.readdirSync(gifsDir)
                .filter(f => f.endsWith('.gif'))
                .map(f => f.replace('.gif', ''))
                .join(', ');
            
            return m.reply(`Available GIFs: ${gifs}\n\nUsage: ${usedPrefix}${command} [gifName]`);
        }
        
        const gifName = args[0];
        const gifPath = path.join(process.cwd(), 'gifs', `${gifName}.gif`);
        
        // Check if GIF exists
        if (!fs.existsSync(gifPath)) {
            return m.reply(`GIF not found: ${gifPath}`);
        }
        
        await m.reply(`Testing GIF: ${gifName}.gif\nPath: ${gifPath}`);
        
        // Get file size for debugging
        const stats = fs.statSync(gifPath);
        const fileSizeKB = Math.round(stats.size / 1024);
        
        await m.reply(`File size: ${fileSizeKB} KB`);
        
        // METHOD 1: Send as video with gifPlayback
        try {
            console.log(`[DEBUG-GIF] Sending ${gifName}.gif as video with gifPlayback`);
            const buffer = fs.readFileSync(gifPath);
            await conn.sendMessage(m.chat, {
                video: buffer,
                gifPlayback: true,
                caption: `Debug GIF: ${gifName} (video method)`,
                mimetype: 'video/mp4'
            }, { quoted: m });
            console.log(`[DEBUG-GIF] Successfully sent ${gifName}.gif as video`);
            await m.reply('✅ Video method successful');
        } catch (error) {
            console.error(`[DEBUG-GIF] Video method failed: ${error.message}`);
            await m.reply(`❌ Video method failed: ${error.message}`);
        }
        
    } catch (error) {
        console.error('[DEBUG-GIF] Error:', error);
        m.reply(`Error: ${error.message}`);
    }
};

handler.help = ['debuggif'];
handler.tags = ['owner'];
handler.command = /^(debug(gif|reaction)|testgif)$/i;
handler.owner = true;

module.exports = handler;