const { getMessage } = require('../lib/languages');
const ytdl = require('@distube/ytdl-core');
const fs = require('fs');
const search = require('yt-search');
const axios = require('axios');
const fetch = require('node-fetch');
const path = require('path');

// Array of different user agents to try
const USER_AGENTS = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/113.0.0.0 Safari/537.36',
  'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1',
  'Mozilla/5.0 (iPad; CPU OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/113.0',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.5 Safari/605.1.15'
];

// Download methods to try in order
const DOWNLOAD_METHODS = ['ytdl-direct', 'ytdl-alternative', 'fetch-stream', 'btch-downloader'];

let handler = async (m, { conn, text }) => {
  // Get user's preferred language
  const user = global.db.data.users[m.sender];
  const chat = global.db.data.chats[m.chat];
  const lang = user?.language || chat?.language || global.language || 'en';
  
  if (!text) throw getMessage('playvid_no_title', lang) || 'Please provide a YouTube URL or search term';
  
  try {
    conn.reply(m.chat, getMessage('playvid_searching', lang) || 'Searching...', m);
    
    console.log('[PLAYVID] Searching for:', text);
    
    // Create tmp directory if it doesn't exist
    if (!fs.existsSync('./tmp')) {
      console.log('[PLAYVID] Creating tmp directory');
      fs.mkdirSync('./tmp', { recursive: true });
    }
    
    // Handle direct YouTube URL or search term
    let videoId, info;
    if (ytdl.validateURL(text)) {
      console.log('[PLAYVID] Direct YouTube URL detected');
      try {
        info = await ytdl.getInfo(text);
        videoId = info.videoDetails.videoId;
      } catch (urlError) {
        console.error('[PLAYVID] Error getting info from URL:', urlError);
        throw new Error(`Failed to get video info: ${urlError.message}`);
      }
    } else {
      // Search for the video
      try {
        const results = await search(text);
        console.log('[PLAYVID] Search results:', results ? 'Success' : 'No results');
        
        if (!results || !results.videos || !results.videos.length) {
          console.log('[PLAYVID] No videos found in search results');
          throw getMessage('playvid_not_found', lang) || 'No videos found';
        }
        
        videoId = results.videos[0].videoId;
        info = await ytdl.getInfo(videoId);
      } catch (searchError) {
        console.error('[PLAYVID] Search error:', searchError);
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
      return conn.reply(m.chat, getMessage('playvid_too_long', lang) || 'Video is too long (over 1 hour)', m);
    }
    
    // Generate unique filenames with timestamp to avoid conflicts
    const timestamp = Date.now();
    let inputFilePath = `./tmp/${title}_${timestamp}.mp4`;
    
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
    let caption = '';
    caption += `∘ ${getMessage('play_title', lang) || 'Title'}: ${title}\n`;
    caption += `∘ ${getMessage('play_duration', lang) || 'Duration'}: ${durationText}\n`;
    caption += `∘ ${getMessage('play_upload_at', lang) || 'Uploaded'}: ${uploadDate}\n`;
    caption += `∘ ${getMessage('play_viewers', lang) || 'Views'}: ${viewsFormatted}\n`;
    caption += `∘ ${getMessage('play_id', lang) || 'ID'}: ${videoId}\n`;
    caption += `∘ ${getMessage('play_description', lang) || 'Description'}: ${description}\n`;
    caption += `∘ ${getMessage('play_url', lang) || 'URL'}: ${url}`;
    
    // Send info message first
    try {
      await conn.relayMessage(m.chat, {
        extendedTextMessage: {
          text: caption,
          contextInfo: {
            externalAdReply: {
              title: title,
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
      console.error('[PLAYVID] Error sending info message:', infoError);
      // Continue even if info message fails
    }
    
    try {
      console.log('[PLAYVID] Starting video download for:', videoId);
      
      // Get the highest quality video stream that's not too large
      const videoFormats = ytdl.filterFormats(info.formats, 'videoandaudio');
      
      // Choose a reasonable quality (not too high to avoid large file sizes)
      let selectedFormat;
      for (const format of videoFormats) {
        if (format.qualityLabel === '480p' || format.qualityLabel === '360p') {
          selectedFormat = format;
          break;
        }
      }
      
      // If no preferred quality found, use the first available one
      if (!selectedFormat && videoFormats.length > 0) {
        selectedFormat = videoFormats[0];
      }
      
      if (!selectedFormat) {
        throw new Error('No suitable video format found');
      }
      
      console.log('[PLAYVID] Selected format:', selectedFormat.qualityLabel);
      
      // Try downloading with multiple methods
      let downloadSuccess = false;
      let currentMethodIndex = 0;
      
      while (!downloadSuccess && currentMethodIndex < DOWNLOAD_METHODS.length) {
        const method = DOWNLOAD_METHODS[currentMethodIndex];
        console.log(`[PLAYVID] Trying download method: ${method} (${currentMethodIndex + 1}/${DOWNLOAD_METHODS.length})`);
        
        try {
          switch (method) {
            case 'ytdl-direct':
              await downloadWithYtdlDirect(videoId, inputFilePath, selectedFormat, USER_AGENTS[0]);
              downloadSuccess = true;
              break;
              
            case 'ytdl-alternative':
              await downloadWithYtdlAlternative(videoId, inputFilePath, selectedFormat, USER_AGENTS[1]);
              downloadSuccess = true;
              break;
              
            case 'fetch-stream':
              // If we have a direct format URL, use it for fetch download
              if (selectedFormat.url) {
                await downloadWithFetchStream(selectedFormat.url, inputFilePath, USER_AGENTS[2]);
                downloadSuccess = true;
              } else {
                throw new Error('No direct URL available for fetch method');
              }
              break;
              
            case 'btch-downloader':
              try {
                const btchDownloader = require('btch-downloader');
                await btchDownloader.YouTube.video({
                  url: `https://www.youtube.com/watch?v=${videoId}`,
                  file: path.basename(inputFilePath)
                }).then(async (data) => {
                  // Check if data exists and has a file property
                  if (data && data.file && fs.existsSync(data.file)) {
                    fs.renameSync(data.file, inputFilePath);
                    console.log('[PLAYVID] btch-downloader download complete');
                    downloadSuccess = true;
                  } else {
                    // Handle case where data or data.file might be undefined
                    console.error('[PLAYVID] btch-downloader received invalid data:', data);
                    // Create an empty file as a fallback to prevent errors in the conversion step
                    fs.writeFileSync(inputFilePath, Buffer.from(''));
                    throw new Error('Downloaded file not found or invalid data returned');
                  }
                }).catch(err => {
                  // Additional error handling for the promise
                  console.error('[PLAYVID] btch-downloader promise error:', err);
                  throw err;
                });
              } catch (btchError) {
                console.error('[PLAYVID] btch-downloader error:', btchError);
                throw btchError;
              }
              break;
              
            default:
              console.log(`[PLAYVID] Unknown download method: ${method}`);
          }
        } catch (methodError) {
          console.error(`[PLAYVID] Method ${method} failed:`, methodError);
          currentMethodIndex++;
          
          // If we've tried all methods, throw an error
          if (currentMethodIndex >= DOWNLOAD_METHODS.length) {
            throw new Error(`All download methods failed. Last error: ${methodError.message}`);
          }
          
          // Otherwise try the next method
          console.log(`[PLAYVID] Trying next method (${currentMethodIndex + 1}/${DOWNLOAD_METHODS.length})`);
        }
      }
      
      // If we reach here, a download method was successful
      console.log('[PLAYVID] Download complete, sending video...');
      
      // Check if file exists and is not empty
      if (!fs.existsSync(inputFilePath)) {
        throw new Error('Downloaded file does not exist');
      }
      
      // Check file size - if too large, send a message and provide a YouTube link instead
      const fileStats = fs.statSync(inputFilePath);
      
      if (fileStats.size === 0) {
        throw new Error('Downloaded file is empty');
      }
      
      const fileSizeMB = fileStats.size / (1024 * 1024);
        
      if (fileSizeMB > 90) {
        console.log('[PLAYVID] File too large:', fileSizeMB.toFixed(2), 'MB');
        conn.reply(m.chat, `Video is too large (${fileSizeMB.toFixed(2)} MB) to send. Please watch it on YouTube: ${url}`, m);
        
        // Clean up
        try {
          if (fs.existsSync(inputFilePath)) fs.unlinkSync(inputFilePath);
        } catch (cleanupError) {
          console.error('[PLAYVID] Error cleaning up files:', cleanupError);
        }
      } else {
        try {
          // Read the file
          const videoBuffer = fs.readFileSync(inputFilePath);
          
          // Verify buffer is not empty
          if (!videoBuffer || videoBuffer.length === 0) {
            throw new Error('Video buffer is empty');
          }
          
          // Send the video
          await conn.sendMessage(m.chat, {
            video: videoBuffer,
            mimetype: 'video/mp4',
            fileName: `${title}.mp4`,
            caption: title,
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
          
          console.log('[PLAYVID] Video sent successfully');
        } catch (sendError) {
          console.error('[PLAYVID] Error sending video:', sendError);
          
          // Fall back to sending a direct link if available
          try {
            const directLink = info?.formats.find(f => f.hasVideo && f.hasAudio && f.url)?.url;
            if (directLink) {
              const errorMsg = getMessage('play_error', lang).replace('%error%', 
                `${sendError.message}\n\n✅ Direct link: ${directLink}`);
              conn.reply(m.chat, errorMsg, m);
            } else {
              conn.reply(m.chat, getMessage('play_error', lang).replace('%error%', 
                `Sending error: ${sendError.message}`), m);
            }
          } catch (fallbackError) {
            conn.reply(m.chat, getMessage('play_error', lang).replace('%error%', 
              `Sending error: ${sendError.message}`), m);
          }
        } finally {
          // Clean up temporary files
          console.log('[PLAYVID] Cleaning up temporary files');
          try {
            if (fs.existsSync(inputFilePath)) fs.unlinkSync(inputFilePath);
          } catch (cleanupError) {
            console.error('[PLAYVID] Error cleaning up files:', cleanupError);
          }
        }
      }
    } catch (downloadError) {
      console.error('[PLAYVID] Download error:', downloadError);
      conn.reply(m.chat, getMessage('play_error', lang).replace('%error%', downloadError.message), m);
    }
  } catch (e) {
    console.error('[PLAYVID] Main command error:', e);
    conn.reply(m.chat, getMessage('play_error', lang).replace('%error%', e.message), m);
  }
};

// DOWNLOAD METHOD 1: Direct ytdl download
async function downloadWithYtdlDirect(videoId, outputPath, format, userAgent) {
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
    
    console.log('[PLAYVID] Downloading with ytdl direct method');
    
    const video = ytdl(videoId, { 
      format: format,
      requestOptions: requestOptions,
      highWaterMark: 1 << 25 // 32MB buffer
    });
    
    let errorOccurred = false;
    
    video.on('error', (err) => {
      if (errorOccurred) return;
      errorOccurred = true;
      console.error('[PLAYVID] ytdl-direct download error:', err);
      reject(err);
    });
    
    const writeStream = fs.createWriteStream(outputPath);
    
    writeStream.on('error', (err) => {
      if (errorOccurred) return;
      errorOccurred = true;
      console.error('[PLAYVID] ytdl-direct write stream error:', err);
      reject(err);
    });
    
    writeStream.on('finish', () => {
      if (!errorOccurred) {
        console.log('[PLAYVID] ytdl-direct download complete');
        resolve();
      }
    });
    
    video.pipe(writeStream);
  });
}

// DOWNLOAD METHOD 2: Alternative ytdl download with different options
async function downloadWithYtdlAlternative(videoId, outputPath, format, userAgent) {
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
    
    console.log('[PLAYVID] Downloading with ytdl alternative method');
    
    // Try a different quality or format if available
    const video = ytdl(videoId, { 
      quality: 'lowestvideo', // Try lowest video to avoid throttling
      requestOptions: requestOptions,
      highWaterMark: 1 << 25 // 32MB buffer
    });
    
    let errorOccurred = false;
    
    video.on('error', (err) => {
      if (errorOccurred) return;
      errorOccurred = true;
      console.error('[PLAYVID] ytdl-alternative download error:', err);
      reject(err);
    });
    
    const writeStream = fs.createWriteStream(outputPath);
    
    writeStream.on('error', (err) => {
      if (errorOccurred) return;
      errorOccurred = true;
      console.error('[PLAYVID] ytdl-alternative write stream error:', err);
      reject(err);
    });
    
    writeStream.on('finish', () => {
      if (!errorOccurred) {
        console.log('[PLAYVID] ytdl-alternative download complete');
        resolve();
      }
    });
    
    video.pipe(writeStream);
  });
}

// DOWNLOAD METHOD 3: Use node-fetch to stream the video directly
async function downloadWithFetchStream(videoUrl, outputPath, userAgent) {
  return new Promise(async (resolve, reject) => {
    console.log('[PLAYVID] Downloading with fetch stream method');
    
    try {
      const response = await fetch(videoUrl, {
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
        console.error('[PLAYVID] fetch-stream write error:', err);
        reject(err);
      });
      
      writeStream.on('finish', () => {
        console.log('[PLAYVID] fetch-stream download complete');
        resolve();
      });
      
      response.body.pipe(writeStream);
    } catch (error) {
      console.error('[PLAYVID] fetch-stream error:', error);
      reject(error);
    }
  });
}

handler.command = handler.help = ['playvid'];
handler.tags = ['downloader'];

handler.limit = true;
handler.premium = false;

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