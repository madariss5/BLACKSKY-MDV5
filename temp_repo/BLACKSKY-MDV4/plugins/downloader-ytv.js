const { getMessage } = require('../lib/languages');
const axios = require('axios');
const ytdl = require('ytdl-core');
const fs = require('fs');
const { randomBytes } = require('crypto');

/**
 * Enhanced YouTube downloader with multiple fallback methods
 */
let handler = async (m, { conn, text, usedPrefix, command }) => {
    // Get user's preferred language
    const user = global.db.data.users[m.sender];
    const chat = global.db.data.chats[m.chat];
    const lang = user?.language || chat?.language || global.language;
    
    if (!text) throw getMessage('download_enter_url', lang, {
        prefix: usedPrefix,
        command: command,
        example: 'https://youtu.be/4rDOsvzTicY?si=3Ps-SJyRGzMa83QT'
    });
        
    m.reply(getMessage('download_processing', lang));
    
    let attempts = 0;
    let success = false;
    let error = null;
    
    // Method 1: Try API-based download
    try {
        attempts++;
        console.log(`[YT-DOWNLOADER] Attempt ${attempts}: Using API-based download`);
        const response = await axios.get(`https://api.betabotz.eu.org/fire/download/ytmp4?url=${text}&apikey=${lann}`, { timeout: 10000 });
        
        if (response.data && response.data.result) {
            const res = response.data.result;      
            var { mp4, id, title, source, duration } = res;
            
            let capt = `*${getMessage('download_yt_mp4_title', lang)}*\n\n`;
            capt += `◦ *${getMessage('download_id', lang)}* : ${id}\n`;
            capt += `◦ *${getMessage('download_title', lang)}* : ${title}\n`;
            capt += `◦ *${getMessage('download_source', lang)}* : ${source}\n`;
            capt += `◦ *${getMessage('download_duration', lang)}* : ${duration}\n`;
            capt += `\n`;        
            
            await conn.sendMessage(m.chat, { 
                document: { url: mp4 }, 
                mimetype: 'video/mp4',
                fileName: `${title}##.mp4`,
                caption: capt
            }, { quoted: m });
            
            success = true;
            console.log(`[YT-DOWNLOADER] Success with API-based download!`);
        } else {
            throw new Error('Invalid API response format');
        }
    } catch (e) {
        console.log(`[YT-DOWNLOADER] Attempt ${attempts} failed: ${e.message}`);
        error = e;
        
        // Method 2: Try direct ytdl download
        if (!success) {
            try {
                attempts++;
                console.log(`[YT-DOWNLOADER] Attempt ${attempts}: Using direct ytdl`);
                
                // Validate YouTube URL
                if (!ytdl.validateURL(text)) {
                    throw new Error('Invalid YouTube URL');
                }
                
                // Get video info
                const info = await ytdl.getInfo(text);
                const videoDetails = info.videoDetails;
                const title = videoDetails.title;
                const id = videoDetails.videoId;
                const duration = parseInt(videoDetails.lengthSeconds);
                const formattedDuration = new Date(duration * 1000).toISOString().substr(11, 8);
                
                // Generate random filename
                const randomId = randomBytes(4).toString('hex');
                const _filename = `./tmp/yt_${randomId}.mp4`;
                
                // Reply with progress message
                await m.reply(getMessage('download_processing_direct', lang) || 'Processing direct download, please wait...');
                
                // Create write stream
                const writer = fs.createWriteStream(_filename);
                
                // Create promise to handle download completion
                return new Promise((resolve, reject) => {
                    // Download directly via ytdl (select a format with both video and audio)
                    const format = ytdl.chooseFormat(info.formats, { quality: 'highest', filter: 'audioandvideo' });
                    
                    if (!format) {
                        throw new Error('No suitable format found');
                    }
                    
                    ytdl(text, { format: format }).pipe(writer);
                    
                    writer.on("error", (err) => {
                        console.log(`[YT-DOWNLOADER] Write error: ${err.message}`);
                        m.reply(getMessage('download_error', lang));
                        resolve();
                    });
                    
                    writer.on("close", async () => {
                        try {
                            console.log(`[YT-DOWNLOADER] File download completed: ${_filename}`);
                            
                            let capt = `*${getMessage('download_yt_mp4_title', lang)}*\n\n`;
                            capt += `◦ *${getMessage('download_id', lang)}* : ${id}\n`;
                            capt += `◦ *${getMessage('download_title', lang)}* : ${title}\n`;
                            capt += `◦ *${getMessage('download_source', lang)}* : YouTube\n`;
                            capt += `◦ *${getMessage('download_duration', lang)}* : ${formattedDuration}\n`;
                            capt += `\n`;
                            
                            await conn.sendMessage(
                                m.chat,
                                {
                                    document: {
                                        stream: fs.createReadStream(_filename),
                                    },
                                    mimetype: 'video/mp4',
                                    fileName: `${title}.mp4`,
                                    caption: capt
                                },
                                { quoted: m }
                            );
                            
                            // Cleanup
                            fs.unlinkSync(_filename);
                            success = true;
                            console.log(`[YT-DOWNLOADER] Success with direct download!`);
                        } catch (error) {
                            console.log(`[YT-DOWNLOADER] Send error: ${error.message}`);
                            m.reply(getMessage('download_error', lang));
                        }
                        resolve();
                    });
                });
            } catch (e2) {
                console.log(`[YT-DOWNLOADER] Attempt ${attempts} failed: ${e2.message}`);
                error = e2;
            }
        }
    }
    
    // If all methods failed
    if (!success) {
        console.log(`[YT-DOWNLOADER] All ${attempts} attempts failed!`);
        const errorMessage = getMessage('download_error_detailed', lang) || 
                          `⚠️ Download failed after ${attempts} attempts.\nPlease try again later or with a different video.`;
        throw errorMessage;
    }
};

handler.help = ['ytmp4'];
handler.command = /^(ytmp4)$/i
handler.tags = ['downloader'];
handler.limit = true;
handler.group = false;
handler.premium = false;
handler.owner = false;
handler.admin = false;
handler.botAdmin = false;
handler.fail = null;
handler.private = false;

module.exports = handler;