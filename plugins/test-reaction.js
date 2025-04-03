/**
 * Test Reaction - For testing various reaction GIF formats
 */
 
const fs = require('fs');
const path = require('path');
const { sendDirectGif } = require('./direct-gif-fix');

let handler = async (m, { conn, args, usedPrefix, command }) => {
    // This is a special test command only for owners
    if (!m.isOwner) {
        return m.reply('This command is for bot owners only to test GIF reactions');
    }
    
    // Help text if no args
    if (!args[0] || args[0] === 'help') {
        return m.reply(`
📋 GIF Reaction Tester

Usage:
${usedPrefix}${command} <method> <reaction>

Available methods:
- direct = Use direct GIF sending method
- normal = Use standard WhatsApp sendFile method
- video = Send as video with gifPlayback
- document = Send as document

Examples:
${usedPrefix}${command} direct hug
${usedPrefix}${command} video kiss
${usedPrefix}${command} normal dance

Available reactions: hug, kiss, pat, dance, punch, slap, etc.
        `.trim());
    }
    
    const method = args[0].toLowerCase();
    const reactionName = args[1]?.toLowerCase() || 'hug';
    
    // Path to the GIF
    const gifPath = path.join(process.cwd(), 'gifs', `${reactionName}.gif`);
    
    // Check if the GIF exists
    if (!fs.existsSync(gifPath)) {
        return m.reply(`GIF not found: ${reactionName}.gif\n\nPlease check if the file exists in the gifs folder.`);
    }
    
    await m.reply(`Testing ${reactionName}.gif using ${method} method...`);
    
    // Prepare a test caption
    const caption = `Test: ${reactionName} (${method} method)`;
    
    try {
        // Different sending methods
        switch (method) {
            case 'direct':
                // Use our enhanced direct GIF sender
                const success = await sendDirectGif(
                    conn, 
                    m.chat, 
                    gifPath, 
                    caption, 
                    m
                );
                
                if (success) {
                    await m.reply(`✅ Direct method successful`);
                } else {
                    await m.reply(`❌ Direct method failed`);
                }
                break;
                
            case 'normal':
                // Standard sendFile method
                await conn.sendFile(
                    m.chat,
                    gifPath,
                    `${reactionName}.gif`,
                    caption,
                    m,
                    false, // Don't treat as thumbnail
                    { asDocument: false, mimetype: 'image/gif' }
                );
                await m.reply(`✅ Normal method completed`);
                break;
                
            case 'video':
                // Send as video with gifPlayback
                const buffer = fs.readFileSync(gifPath);
                await conn.sendMessage(m.chat, {
                    video: buffer,
                    gifPlayback: true,
                    caption: caption,
                    mimetype: 'video/mp4'
                }, { quoted: m });
                await m.reply(`✅ Video method completed`);
                break;
                
            case 'document':
                // Send as document
                await conn.sendFile(
                    m.chat,
                    gifPath,
                    `${reactionName}.gif`,
                    caption,
                    m,
                    false,
                    { asDocument: true }
                );
                await m.reply(`✅ Document method completed`);
                break;
                
            default:
                await m.reply(`Unknown method: ${method}\nUse: direct, normal, video, or document`);
        }
    } catch (error) {
        console.error(`[TEST-REACTION] Error with ${method} method:`, error);
        await m.reply(`❌ Error with ${method} method: ${error.message}`);
    }
};

// Register command
handler.help = ['testreaction'];
handler.tags = ['owner'];
handler.command = /^testreaction$/i;
handler.owner = true;

module.exports = handler;