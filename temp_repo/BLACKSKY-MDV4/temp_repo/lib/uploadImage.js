const axios = require('axios');
const FormData = require('form-data');
const { fromBuffer } = require('file-type');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

/**
 * Upload image to multiple services with robust fallbacks
 * Supported mimetypes:
 * - `image/jpeg`
 * - `image/png`
 * - `image/webp`
 * - `video/mp4`
 * - `video/avi`
 * - `video/mkv`
 * - `audio/mpeg`
 * - `audio/wav`
 * - `audio/ogg`
 * 
 * @param {Buffer} buffer - The file buffer to upload
 * @param {String} tmp - Set to 'true' to mark as temporary file
 * @returns {Promise<String>} URL of the uploaded file
 */
module.exports = async (buffer, tmp = 'false') => {
  // Create unique ID for logging
  const uploadId = crypto.randomBytes(4).toString('hex');
  console.log(`[UPLOAD-${uploadId}] Starting upload process`);
  
  try {
    // Determine file type
    const { ext, mime } = await fromBuffer(buffer) || { ext: 'jpg', mime: 'image/jpeg' };
    console.log(`[UPLOAD-${uploadId}] File type: ${mime}, extension: ${ext}`);
    
    // Save locally first as fallback
    const tmpDir = path.join(__dirname, '../tmp');
    if (!fs.existsSync(tmpDir)) {
      fs.mkdirSync(tmpDir, { recursive: true });
    }
    
    const localFilename = `upload_${Date.now()}_${Math.floor(Math.random() * 1000)}.${ext}`;
    const localPath = path.join(tmpDir, localFilename);
    fs.writeFileSync(localPath, buffer);
    console.log(`[UPLOAD-${uploadId}] Saved local copy to ${localPath}`);
    
    // Try first upload service: betabotz
    try {
      console.log(`[UPLOAD-${uploadId}] Trying primary upload service (betabotz)`);
      const form = new FormData();
      form.append("file", buffer, { filename: `file_${Date.now()}.${ext}`, contentType: mime });
      form.append("tmp", tmp);
      
      // Add API key from config
      const apikey = global.apikeys?.betabotz || process.env.BETABOTZ_API || 'YOURAPIKEY';
      form.append("apikey", apikey);
      
      const { data } = await axios.post("https://fire.betabotz.eu.org/fire/tools/upload", form, {
        headers: form.getHeaders(),
        timeout: 10000 // 10 second timeout
      });
      
      if (data && data.result) {
        console.log(`[UPLOAD-${uploadId}] Primary upload successful: ${data.result}`);
        return data.result;
      }
      throw new Error('No result URL in primary response');
    } catch (firstError) {
      console.log(`[UPLOAD-${uploadId}] Primary upload failed: ${firstError.message}`);
      
      // Try second upload service: telegra.ph
      try {
        console.log(`[UPLOAD-${uploadId}] Trying secondary upload service (telegra.ph)`);
        const fallbackForm = new FormData();
        fallbackForm.append('file', buffer, { filename: `image_${Date.now()}.${ext}` });
        
        const { data: fallbackData } = await axios.post('https://telegra.ph/upload', fallbackForm, {
          headers: fallbackForm.getHeaders(),
          timeout: 10000 // 10 second timeout
        });
        
        if (fallbackData && fallbackData[0] && fallbackData[0].src) {
          const url = 'https://telegra.ph' + fallbackData[0].src;
          console.log(`[UPLOAD-${uploadId}] Secondary upload successful: ${url}`);
          return url;
        }
        throw new Error('No valid URL in secondary response');
      } catch (secondError) {
        console.log(`[UPLOAD-${uploadId}] Secondary upload failed: ${secondError.message}`);
        
        // Try third upload service: tmpfiles.org
        try {
          console.log(`[UPLOAD-${uploadId}] Trying tertiary upload service (tmpfiles.org)`);
          const tertiaryForm = new FormData();
          tertiaryForm.append('file', buffer, { filename: `file_${Date.now()}.${ext}` });
          
          const { data: tertiaryData } = await axios.post('https://tmpfiles.org/api/v1/upload', tertiaryForm, {
            headers: tertiaryForm.getHeaders(),
            timeout: 15000 // 15 second timeout
          });
          
          if (tertiaryData && tertiaryData.data && tertiaryData.data.url) {
            console.log(`[UPLOAD-${uploadId}] Tertiary upload successful: ${tertiaryData.data.url}`);
            return tertiaryData.data.url;
          }
          throw new Error('No valid URL in tertiary response');
        } catch (thirdError) {
          console.log(`[UPLOAD-${uploadId}] All remote uploads failed, using data URL as fallback`);
          
          // Final fallback: return a data URL
          try {
            // For very large files, this might not be ideal but it's better than nothing
            if (buffer.length > 5 * 1024 * 1024) { // 5 MB limit
              throw new Error('File too large for data URL');
            }
            
            const dataUrl = `data:${mime};base64,${buffer.toString('base64')}`;
            console.log(`[UPLOAD-${uploadId}] Created data URL fallback (length: ${dataUrl.length})`);
            return dataUrl;
          } catch (dataUrlError) {
            throw new Error(`All upload methods failed: ${firstError.message}, ${secondError.message}, ${thirdError.message}, ${dataUrlError.message}`);
          }
        }
      }
    }
  } catch (error) {
    console.error(`[UPLOAD-${uploadId}] Fatal upload error:`, error);
    throw new Error(`Upload failed: ${error.message}`);
  }
};