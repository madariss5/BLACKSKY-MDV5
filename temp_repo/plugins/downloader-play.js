const { getMessage } = require('../lib/languages');
const search = require('yt-search');
const ytdl = require('@distube/ytdl-core');
const fs = require('fs');
const ffmpeg = require('fluent-ffmpeg');
const axios = require('axios');
const fetch = require('node-fetch');
const { spawn } = require('child_process');
const path = require('path');

// Array of different user agents to try
const USER_AGENTS = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/113.0.0.0 Safari/537.36',
  'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1',
  'Mozilla/5.0 (iPad; CPU OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/113.0',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.5 Safari/605.1.15',
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/113.0.0.0 Safari/537.36'
];

// Download methods to try in order
const DOWNLOAD_METHODS = ['ytdl-direct', 'ytdl-alternative', 'fetch-stream', 'ytdl-alternative-library'];

let handler = async (m, { conn, text }) => {
  // Get user's preferred language
  const user = global.db.data.users[m.sender];
  const chat = global.db.data.chats[m.chat];
  const lang = user?.language || chat?.language || 'en'; // Default to English
  
  if (!text) throw getMessage('play_no_title', lang);
  
  try {
    // First notify the user that we're processing
    conn.reply(m.chat, getMessage('play_please_wait', lang), m);
    
    console.log('[PLAY] Searching for:', text);
    
    // Create tmp directory if it doesn't exist
    if (!fs.existsSync('./tmp')) {
      console.log('[PLAY] Creating tmp directory');
      fs.mkdirSync('./tmp', { recursive: true });
    }
    
    // Handle direct YouTube URL or search term
    let videoId, info;
    if (ytdl.validateURL(text)) {
      console.log('[PLAY] Direct YouTube URL detected');
      try {
        info = await ytdl.getInfo(text);
        videoId = info.videoDetails.videoId;
      } catch (urlError) {
        console.error('[PLAY] Error getting info from URL:', urlError);
        throw new Error(`Failed to get video info: ${urlError.message}`);
      }
    } else {
      // Search for the video
      try {
        const results = await search(text);
        console.log('[PLAY] Search results:', results ? 'Success' : 'No results');
        
        if (!results || !results.videos || !results.videos.length) {
          console.log('[PLAY] No videos found in search results');
          throw getMessage('play_not_found', lang);
        }
        
        videoId = results.videos[0].videoId;
        info = await ytdl.getInfo(videoId);
      } catch (searchError) {
        console.error('[PLAY] Search error:', searchError);
        throw new Error(`Search error: ${searchError.message}`);
      }
    }
    
    // Process video information
    let title = info.videoDetails.title.replace(/[^\w\s]/gi, '');
    let thumbnailUrl = `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;
    let url = info.videoDetails.video_url;
    let duration = parseInt(info.videoDetails.lengthSeconds);
    
    // Check if the video is too long
    if (duration >= 3600) {
      return conn.reply(m.chat, getMessage('play_too_long', lang), m);
    }
    
    // Generate unique filenames with timestamp to avoid conflicts
    const timestamp = Date.now();
    let inputFilePath = `./tmp/${title}_${timestamp}.webm`;
    let outputFilePath = `./tmp/${title}_${timestamp}.mp3`;
    
    // Get additional video details
    let uploadDate = new Date(info.videoDetails.publishDate).toLocaleDateString();
    let views = info.videoDetails.viewCount;
    let minutes = Math.floor(duration / 60);
    let description = info.videoDetails.description || 'No description';
    if (description.length > 100) {
      description = description.substring(0, 97) + '...';
    }
    let seconds = duration % 60;
    let durationText = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;       
    let viewsFormatted = formatViews(views);
    
    // Create caption with multilingual support
    let infoText = '';
    infoText += `◦ *${getMessage('play_title', lang)}*: ${title}\n`;
    infoText += `◦ *${getMessage('play_duration', lang)}*: ${durationText}\n`;
    infoText += `◦ *${getMessage('play_upload_at', lang)}*: ${uploadDate}\n`;
    infoText += `◦ *${getMessage('play_viewers', lang)}*: ${viewsFormatted}\n`;
    infoText += `◦ *${getMessage('play_id', lang)}*: ${videoId}\n`;
    infoText += `◦ *${getMessage('play_description', lang)}*: ${description}\n`;
    infoText += `◦ *${getMessage('play_url', lang)}*: ${url}`;
    
    // Send the info message
    try {
      conn.relayMessage(m.chat, {
        extendedTextMessage:{
          text: infoText, 
          contextInfo: {
            externalAdReply: {
              title: global.wm || 'WhatsApp Bot',
              body: "",
              mediaType: 1,
              previewType: 0,
              renderLargerThumbnail: true,
              thumbnailUrl: thumbnailUrl,
              sourceUrl: url
            }
          }, 
          mentions: [m.sender]
        }
      }, {});
    } catch (infoError) {
      console.error('[PLAY] Error sending info message:', infoError);
      // Continue even if info message fails
    }
    
    // Select the best audio format
    const audioFormats = ytdl.filterFormats(info.formats, 'audioonly');
    const bestAudioFormat = audioFormats.reduce((prev, curr) => {
      return (curr.audioBitrate || 0) > (prev.audioBitrate || 0) ? curr : prev;
    }, audioFormats[0] || null);
    
    if (!bestAudioFormat) {
      throw new Error('No audio formats available');
    }
    
    // Store the audio URL
    const audioUrl = bestAudioFormat.url;
    
    // Try downloading with multiple methods
    let downloadSuccess = false;
    let currentMethodIndex = 0;
    
    while (!downloadSuccess && currentMethodIndex < DOWNLOAD_METHODS.length) {
      const method = DOWNLOAD_METHODS[currentMethodIndex];
      console.log(`[PLAY] Trying download method: ${method} (${currentMethodIndex + 1}/${DOWNLOAD_METHODS.length})`);
      
      try {
        switch (method) {
          case 'ytdl-direct':
            await downloadWithYtdlDirect(videoId, inputFilePath, USER_AGENTS[0]);
            downloadSuccess = true;
            break;
            
          case 'ytdl-alternative':
            await downloadWithYtdlAlternative(videoId, inputFilePath, USER_AGENTS[1]);
            downloadSuccess = true;
            break;
            
          case 'fetch-stream':
            await downloadWithFetchStream(audioUrl, inputFilePath, USER_AGENTS[2]);
            downloadSuccess = true;
            break;
            
          case 'ytdl-alternative-library':
            await downloadWithAlternativeLibrary(videoId, inputFilePath);
            downloadSuccess = true;
            break;
            
          default:
            console.log(`[PLAY] Unknown download method: ${method}`);
        }
      } catch (methodError) {
        console.error(`[PLAY] Method ${method} failed:`, methodError);
        currentMethodIndex++;
        
        // If we've tried all methods, throw an error
        if (currentMethodIndex >= DOWNLOAD_METHODS.length) {
          throw new Error(`All download methods failed: ${methodError.message}`);
        }
        
        // Otherwise try the next method
        console.log(`[PLAY] Trying next method (${currentMethodIndex + 1}/${DOWNLOAD_METHODS.length})`);
      }
    }
    
    // If we reach here, a download method was successful
    console.log('[PLAY] Download complete, starting conversion...');
    
    try {
      // Check if input file exists and has size > 0
      if (!fs.existsSync(inputFilePath) || fs.statSync(inputFilePath).size === 0) {
        throw new Error('Downloaded file is empty or does not exist');
      }
      
      await convertToMp3(inputFilePath, outputFilePath);
      console.log('[PLAY] Conversion complete, sending audio...');
      
      // Check if output file exists and has size > 0
      if (!fs.existsSync(outputFilePath) || fs.statSync(outputFilePath).size === 0) {
        throw new Error('Converted file is empty or does not exist');
      }
      
      let buffer = fs.readFileSync(outputFilePath);
      
      // Verify buffer is not empty
      if (!buffer || buffer.length === 0) {
        throw new Error('Audio buffer is empty');
      }
      
      conn.sendMessage(m.chat, {         
        audio: buffer,
        mimetype: 'audio/mpeg',
        fileName: `${title}.mp3`,
        contextInfo: {
          externalAdReply: {
            title: title,
            body: "",
            thumbnailUrl: thumbnailUrl,
            sourceUrl: url,
            mediaType: 1,
            showAdAttribution: true,
            renderLargerThumbnail: true
          }
        }
      }, {
        quoted: m
      });
      
      console.log('[PLAY] Audio sent successfully');
    } catch (conversionError) {
      console.error('[PLAY] Conversion or sending error:', conversionError);
      
      // Fall back to sending a direct link if available
      try {
        const directLink = info?.formats.find(f => f.hasAudio && f.url)?.url;
        if (directLink) {
          const errorMsg = getMessage('play_error', lang).replace('%error%', 
            `${conversionError.message}\n\n✅ Direct link: ${directLink}`);
          conn.reply(m.chat, errorMsg, m);
        } else {
          conn.reply(m.chat, getMessage('play_error', lang).replace('%error%', 
            `Processing error: ${conversionError.message}`), m);
        }
      } catch (fallbackError) {
        conn.reply(m.chat, getMessage('play_error', lang).replace('%error%', 
          `Processing error: ${conversionError.message}`), m);
      }
    } finally {
      // Clean up temporary files
      console.log('[PLAY] Cleaning up temporary files');
      try {
        if (fs.existsSync(inputFilePath)) fs.unlinkSync(inputFilePath);
        if (fs.existsSync(outputFilePath)) fs.unlinkSync(outputFilePath);
      } catch (cleanupError) {
        console.error('[PLAY] Error cleaning up files:', cleanupError);
      }
    }
  } catch (e) {
    console.error('[PLAY] Main command error:', e);
    conn.reply(m.chat, getMessage('play_error', lang).replace('%error%', e.message), m);
  }
};

// DOWNLOAD METHOD 1: Direct ytdl download
async function downloadWithYtdlDirect(videoId, outputPath, userAgent) {
  return new Promise((resolve, reject) => {
    const requestOptions = {
      headers: {
        'User-Agent': userAgent,
        'Accept': '*/*',
        'Accept-Encoding': 'gzip, deflate, br',
        'Range': 'bytes=0-',
        'Connection': 'keep-alive',
        'Referer': 'https://www.youtube.com/watch?v=' + videoId
      }
    };
    
    console.log('[PLAY] Downloading with ytdl direct method');
    
    const audio = ytdl(videoId, { 
      quality: 'highestaudio',
      filter: 'audioonly',
      requestOptions: requestOptions,
      highWaterMark: 1 << 25 // 32MB buffer
    });
    
    let errorOccurred = false;
    
    audio.on('error', (err) => {
      if (errorOccurred) return;
      errorOccurred = true;
      console.error('[PLAY] ytdl-direct download error:', err);
      reject(err);
    });
    
    const writeStream = fs.createWriteStream(outputPath);
    
    writeStream.on('error', (err) => {
      if (errorOccurred) return;
      errorOccurred = true;
      console.error('[PLAY] ytdl-direct write stream error:', err);
      reject(err);
    });
    
    writeStream.on('finish', () => {
      if (!errorOccurred) {
        console.log('[PLAY] ytdl-direct download complete');
        resolve();
      }
    });
    
    audio.pipe(writeStream);
  });
}

// DOWNLOAD METHOD 2: Alternative ytdl download with different options
async function downloadWithYtdlAlternative(videoId, outputPath, userAgent) {
  return new Promise((resolve, reject) => {
    const requestOptions = {
      headers: {
        'User-Agent': userAgent,
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
        'Sec-Fetch-Dest': 'document',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-Site': 'cross-site',
        'Pragma': 'no-cache',
        'Cache-Control': 'no-cache',
        'TE': 'trailers'
      }
    };
    
    console.log('[PLAY] Downloading with ytdl alternative method');
    
    const audio = ytdl(videoId, { 
      quality: 'lowestaudio', // Try lowest audio to avoid throttling
      filter: 'audioonly',
      requestOptions: requestOptions,
      highWaterMark: 1 << 25 // 32MB buffer
    });
    
    let errorOccurred = false;
    
    audio.on('error', (err) => {
      if (errorOccurred) return;
      errorOccurred = true;
      console.error('[PLAY] ytdl-alternative download error:', err);
      reject(err);
    });
    
    const writeStream = fs.createWriteStream(outputPath);
    
    writeStream.on('error', (err) => {
      if (errorOccurred) return;
      errorOccurred = true;
      console.error('[PLAY] ytdl-alternative write stream error:', err);
      reject(err);
    });
    
    writeStream.on('finish', () => {
      if (!errorOccurred) {
        console.log('[PLAY] ytdl-alternative download complete');
        resolve();
      }
    });
    
    audio.pipe(writeStream);
  });
}

// DOWNLOAD METHOD 3: Use node-fetch to stream the audio directly
async function downloadWithFetchStream(audioUrl, outputPath, userAgent) {
  return new Promise(async (resolve, reject) => {
    console.log('[PLAY] Downloading with fetch stream method');
    
    try {
      const response = await fetch(audioUrl, {
        headers: {
          'User-Agent': userAgent,
          'Accept': '*/*',
          'Accept-Encoding': 'identity;q=1, *;q=0',
          'Accept-Language': 'en-US,en;q=0.9',
          'Range': 'bytes=0-',
          'Connection': 'keep-alive',
          'Referer': 'https://www.youtube.com/'
        }
      });
      
      if (!response.ok) {
        throw new Error(`Fetch failed with status ${response.status}`);
      }
      
      const writeStream = fs.createWriteStream(outputPath);
      
      writeStream.on('error', (err) => {
        console.error('[PLAY] fetch-stream write error:', err);
        reject(err);
      });
      
      writeStream.on('finish', () => {
        console.log('[PLAY] fetch-stream download complete');
        resolve();
      });
      
      response.body.pipe(writeStream);
    } catch (error) {
      console.error('[PLAY] fetch-stream error:', error);
      reject(error);
    }
  });
}

// DOWNLOAD METHOD 4: Use an alternative library approach (btch-downloader)
async function downloadWithAlternativeLibrary(videoId, outputPath) {
  return new Promise(async (resolve, reject) => {
    console.log('[PLAY] Downloading with alternative library method');
    
    try {
      // Use btch-downloader since it's already in package.json
      const btchDownloader = require('btch-downloader');
      
      await btchDownloader.YouTube.mp3({
        url: `https://www.youtube.com/watch?v=${videoId}`,
        file: path.basename(outputPath)
      }).then(async (data) => {
        // Check if data exists and has a file property
        if (data && data.file && fs.existsSync(data.file)) {
          fs.renameSync(data.file, outputPath);
          console.log('[PLAY] alternative-library download complete');
          resolve();
        } else {
          // Handle case where data or data.file might be undefined
          console.error('[PLAY] alternative-library received invalid data:', data);
          // Create an empty file as a fallback to prevent errors in the conversion step
          fs.writeFileSync(outputPath, Buffer.from(''));
          throw new Error('Downloaded file not found or invalid data returned');
        }
      }).catch(err => {
        // Additional error handling for the promise
        console.error('[PLAY] btch-downloader promise error:', err);
        reject(err);
      });
    } catch (error) {
      console.error('[PLAY] alternative-library error:', error);
      reject(error);
    }
  });
}

// Convert audio file to MP3 using ffmpeg
async function convertToMp3(inputPath, outputPath) {
  return new Promise((resolve, reject) => {
    ffmpeg(inputPath)
      .toFormat('mp3')
      .on('start', (cmd) => {
        console.log('[PLAY] FFmpeg started with command:', cmd);
      })
      .on('end', () => {
        resolve();
      })
      .on('error', (err) => {
        console.error('[PLAY] FFmpeg error:', err);
        reject(err);
      })
      .save(outputPath);
  });
}

handler.command = handler.help = ['play', 'song', 'ds'];
handler.tags = ['downloader'];
handler.premium = false;
handler.limit = true;

module.exports = handler;

function formatViews(views) {
  if (views >= 1000000) {
    return (views / 1000000).toFixed(1) + 'M';
  } else if (views >= 1000) {
    return (views / 1000).toFixed(1) + 'K';
  } else {
    return views.toString();
  }
}