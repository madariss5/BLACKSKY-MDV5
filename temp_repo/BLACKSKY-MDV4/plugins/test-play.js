/**
 * Test Play Command
 * A simplified version of the play command to test YouTube downloading functionality.
 */

const ytdl = require('ytdl-core');
const fs = require('fs');
const ffmpeg = require('fluent-ffmpeg');

let handler = async (m, { conn, text }) => {
  if (!text) return m.reply('Please provide a YouTube URL or search term');
  
  try {
    // First notify the user that we're processing
    conn.reply(m.chat, 'Please wait, testing YouTube download...', m);
    
    // Use a default YouTube video if no URL is provided
    const videoUrl = text.includes('youtube.com') || text.includes('youtu.be') 
      ? text 
      : 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'; // Default test video
    
    console.log('[TEST-PLAY] Attempting to download:', videoUrl);
    
    if (!ytdl.validateURL(videoUrl)) {
      return m.reply('Invalid YouTube URL. Please provide a valid URL.');
    }
    
    let info = await ytdl.getInfo(videoUrl);
    let title = info.videoDetails.title.replace(/[^\w\s]/gi, '');
    console.log('[TEST-PLAY] Video found:', title);
    
    // Create temporary files with timestamps to avoid conflicts
    const timestamp = Date.now();
    let inputFilePath = `./tmp/test_${timestamp}.webm`;
    let outputFilePath = `./tmp/test_${timestamp}.mp3`;
    
    // Log the directories for debugging
    console.log('[TEST-PLAY] Temporary files will be created at:', inputFilePath, outputFilePath);
    
    // Check if tmp directory exists, create if not
    if (!fs.existsSync('./tmp')) {
      console.log('[TEST-PLAY] tmp directory does not exist, creating...');
      fs.mkdirSync('./tmp', { recursive: true });
    }
    
    // Download the audio
    let audio = ytdl(videoUrl, { quality: 'highestaudio' });
    
    audio.on('error', (err) => {
      console.error('[TEST-PLAY] ytdl error:', err);
      m.reply(`YouTube download error: ${err.message}`);
    });
    
    audio.pipe(fs.createWriteStream(inputFilePath))
      .on('error', (err) => {
        console.error('[TEST-PLAY] File write error:', err);
        m.reply(`File write error: ${err.message}`);
      })
      .on('finish', () => {
        console.log('[TEST-PLAY] Download complete, starting conversion...');
        
        // Convert to MP3 using ffmpeg
        ffmpeg(inputFilePath)
          .toFormat('mp3')
          .on('start', (cmd) => {
            console.log('[TEST-PLAY] FFmpeg started with command:', cmd);
          })
          .on('error', (err) => {
            console.error('[TEST-PLAY] FFmpeg error:', err);
            m.reply(`FFmpeg error: ${err.message}`);
            
            // Clean up temporary files even on error
            if (fs.existsSync(inputFilePath)) fs.unlinkSync(inputFilePath);
            if (fs.existsSync(outputFilePath)) fs.unlinkSync(outputFilePath);
          })
          .on('end', async () => {
            console.log('[TEST-PLAY] Conversion complete, sending audio...');
            
            try {
              let buffer = fs.readFileSync(outputFilePath);
              conn.sendMessage(m.chat, {
                audio: buffer,
                mimetype: 'audio/mpeg',
                fileName: `${title}.mp3`,
                contextInfo: {
                  externalAdReply: {
                    title: title,
                    body: "Test Play Command",
                    thumbnailUrl: `https://i.ytimg.com/vi/${info.videoDetails.videoId}/hqdefault.jpg`,
                    sourceUrl: videoUrl
                  }
                }
              }, { quoted: m });
              
              console.log('[TEST-PLAY] Audio sent successfully');
            } catch (readError) {
              console.error('[TEST-PLAY] Error reading or sending file:', readError);
              m.reply(`Error sending audio: ${readError.message}`);
            } finally {
              // Clean up temporary files
              console.log('[TEST-PLAY] Cleaning up temporary files...');
              if (fs.existsSync(inputFilePath)) fs.unlinkSync(inputFilePath);
              if (fs.existsSync(outputFilePath)) fs.unlinkSync(outputFilePath);
            }
          })
          .save(outputFilePath);
      });
  } catch (e) {
    console.error('[TEST-PLAY] Main error:', e);
    m.reply(`Error: ${e.message}`);
  }
};

handler.command = handler.help = ['testplay'];
handler.tags = ['test'];
handler.limit = false; // No limit for testing

module.exports = handler;