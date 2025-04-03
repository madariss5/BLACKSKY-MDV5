/**
 * Enhance GIFs - Process and optimize GIFs for WhatsApp
 * This plugin helps convert existing GIFs to better formats for WhatsApp
 */

const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const { promisify } = require('util');
const execAsync = promisify(exec);

let handler = async (m, { conn, args, usedPrefix, command }) => {
    // Only owners can use this command
    if (!m.isOwner) {
        return m.reply('This command is for bot owners only');
    }
    
    // Help text if no args
    if (!args[0] || args[0] === 'help') {
        return m.reply(`
📋 GIF Enhancer Tool

This tool optimizes GIFs for better display in WhatsApp.

Usage:
${usedPrefix}${command} <action> [gifname]

Actions:
- process <name> - Process a single GIF (e.g., ${usedPrefix}${command} process hug)
- processall - Process all GIFs in the gifs folder
- list - List available GIFs
- test <name> - Test a processed GIF

Examples:
${usedPrefix}${command} process hug
${usedPrefix}${command} processall
${usedPrefix}${command} list
        `.trim());
    }
    
    const action = args[0].toLowerCase();
    
    // Process a single GIF
    if (action === 'process') {
        const gifName = args[1];
        if (!gifName) {
            return m.reply(`Please specify a GIF name, e.g. ${usedPrefix}${command} process hug`);
        }
        
        // Path to the GIF file
        const gifPath = path.join(process.cwd(), 'gifs', `${gifName}.gif`);
        
        // Check if GIF exists
        if (!fs.existsSync(gifPath)) {
            return m.reply(`GIF not found: ${gifName}.gif\n\nPlease check if the file exists in the gifs folder.`);
        }
        
        await processGif(m, gifPath);
    }
    // Process all GIFs
    else if (action === 'processall') {
        const gifsDir = path.join(process.cwd(), 'gifs');
        if (!fs.existsSync(gifsDir)) {
            return m.reply(`❌ Gifs directory not found`);
        }
        
        const gifs = fs.readdirSync(gifsDir).filter(file => file.endsWith('.gif'));
        
        if (gifs.length === 0) {
            return m.reply(`No GIFs found in the gifs directory`);
        }
        
        await m.reply(`Processing ${gifs.length} GIFs. This may take some time...`);
        
        let processed = 0;
        let failed = 0;
        
        for (const gif of gifs) {
            const gifPath = path.join(gifsDir, gif);
            try {
                await processGifSilent(gifPath);
                processed++;
                
                // Send a progress update every 5 GIFs
                if (processed % 5 === 0) {
                    await m.reply(`Progress: Processed ${processed}/${gifs.length} GIFs...`);
                }
            } catch (error) {
                console.error(`Error processing ${gif}:`, error);
                failed++;
            }
        }
        
        await m.reply(`✅ Processing complete!\n- Successfully processed: ${processed}\n- Failed: ${failed}`);
    }
    // List available GIFs
    else if (action === 'list') {
        const gifsDir = path.join(process.cwd(), 'gifs');
        const processedDir = path.join(process.cwd(), 'tmp');
        
        if (!fs.existsSync(gifsDir)) {
            return m.reply(`❌ Gifs directory not found`);
        }
        
        const gifs = fs.readdirSync(gifsDir).filter(file => file.endsWith('.gif'));
        
        // Check which ones have processed versions
        const processedGifs = fs.existsSync(processedDir) ? 
            fs.readdirSync(processedDir).filter(file => file.endsWith('_optimized.mp4') || file.endsWith('_processed.gif')) : 
            [];
        
        // Create processed GIF names for comparison
        const processedNames = processedGifs.map(name => {
            return name.replace('_optimized.mp4', '').replace('_processed.gif', '');
        });
        
        if (gifs.length === 0) {
            return m.reply(`No GIFs found in the gifs directory`);
        }
        
        let message = `📋 Available GIFs (${gifs.length}):\n\n`;
        
        for (const gif of gifs) {
            const name = gif.replace('.gif', '');
            const isProcessed = processedNames.includes(name);
            message += `${isProcessed ? '✅' : '❌'} ${name}\n`;
        }
        
        message += `\n✅ = Processed for better quality\n❌ = Not processed yet`;
        
        await m.reply(message);
    }
    // Test a processed GIF
    else if (action === 'test') {
        const gifName = args[1];
        if (!gifName) {
            return m.reply(`Please specify a GIF name, e.g. ${usedPrefix}${command} test hug`);
        }
        
        // Try to find the processed file first
        const processedMp4 = path.join(process.cwd(), 'tmp', `${gifName}_optimized.mp4`);
        const processedGif = path.join(process.cwd(), 'tmp', `${gifName}_processed.gif`);
        const originalGif = path.join(process.cwd(), 'gifs', `${gifName}.gif`);
        
        let filePath;
        let fileType;
        
        if (fs.existsSync(processedMp4)) {
            filePath = processedMp4;
            fileType = 'optimized MP4';
        } else if (fs.existsSync(processedGif)) {
            filePath = processedGif;
            fileType = 'processed GIF';
        } else if (fs.existsSync(originalGif)) {
            filePath = originalGif;
            fileType = 'original GIF';
        } else {
            return m.reply(`No files found for ${gifName}. Please make sure the GIF exists.`);
        }
        
        await m.reply(`Testing ${fileType} for ${gifName}...`);
        
        try {
            // Send as video with gifPlayback
            const buffer = fs.readFileSync(filePath);
            await conn.sendMessage(m.chat, {
                video: buffer,
                gifPlayback: true,
                caption: `Test: ${gifName} (${fileType})`,
                mimetype: 'video/mp4'
            }, { quoted: m });
            
            await m.reply(`✅ Test completed for ${fileType}`);
        } catch (error) {
            console.error(`Error testing ${gifName}:`, error);
            await m.reply(`❌ Error testing ${gifName}: ${error.message}`);
        }
    }
    else {
        await m.reply(`Unknown action: ${action}\n\nUse ${usedPrefix}${command} help to see usage examples.`);
    }
};

// Process a GIF and send progress updates
async function processGif(m, gifPath) {
    try {
        // Create tmp directory if it doesn't exist
        const tmpDir = path.join(process.cwd(), 'tmp');
        if (!fs.existsSync(tmpDir)) {
            fs.mkdirSync(tmpDir, { recursive: true });
        }
        
        const gifName = path.basename(gifPath, '.gif');
        const mp4Path = path.join(tmpDir, `${gifName}_optimized.mp4`);
        
        await m.reply(`Processing ${gifName}.gif...`);
        
        // Convert GIF to MP4 with ffmpeg optimized for WhatsApp
        await execAsync(`ffmpeg -y -i "${gifPath}" -movflags faststart -pix_fmt yuv420p -vf "scale=trunc(iw/2)*2:trunc(ih/2)*2" "${mp4Path}"`);
        
        if (!fs.existsSync(mp4Path)) {
            return await m.reply(`❌ Failed to create optimized file for ${gifName}.gif`);
        }
        
        // Test the processed file
        await m.reply(`✅ Successfully processed ${gifName}.gif\n\nNow testing the optimized version...`);
        
        const buffer = fs.readFileSync(mp4Path);
        await m.conn.sendMessage(m.chat, {
            video: buffer,
            gifPlayback: true,
            caption: `Optimized GIF test: ${gifName}`,
            mimetype: 'video/mp4'
        }, { quoted: m });
        
        await m.reply(`✅ Test sent for optimized ${gifName}.gif\n\nThis version should appear clear and properly animated in WhatsApp.`);
        
        return true;
    } catch (error) {
        console.error(`Error processing GIF:`, error);
        await m.reply(`❌ Error processing GIF: ${error.message}`);
        return false;
    }
}

// Process a GIF silently (for batch processing)
async function processGifSilent(gifPath) {
    try {
        // Create tmp directory if it doesn't exist
        const tmpDir = path.join(process.cwd(), 'tmp');
        if (!fs.existsSync(tmpDir)) {
            fs.mkdirSync(tmpDir, { recursive: true });
        }
        
        const gifName = path.basename(gifPath, '.gif');
        const mp4Path = path.join(tmpDir, `${gifName}_optimized.mp4`);
        
        // Convert GIF to MP4 with ffmpeg optimized for WhatsApp
        await execAsync(`ffmpeg -y -i "${gifPath}" -movflags faststart -pix_fmt yuv420p -vf "scale=trunc(iw/2)*2:trunc(ih/2)*2" "${mp4Path}"`);
        
        return fs.existsSync(mp4Path);
    } catch (error) {
        console.error(`Error processing GIF silently:`, error);
        return false;
    }
}

// Register command
handler.help = ['enhancegifs'];
handler.tags = ['owner'];
handler.command = /^(enhancegifs|egifs|processgifs)$/i;
handler.owner = true;

module.exports = handler;