/**
 * Direct GIF Fix - Specialized handling for clear animated GIFs
 * This plugin provides commands to fix and test GIF animations directly
 */

const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const { promisify } = require('util');
const execAsync = promisify(exec);

// Store processed GIFs in memory for quick access
const processedGifs = new Map();

/**
 * Process a GIF to ensure it's clear and animated
 * @param {string} gifPath - Path to the original GIF
 * @returns {Promise<Buffer>} - Processed GIF buffer
 */
async function processGif(gifPath) {
  try {
    // Check if already processed this session
    if (processedGifs.has(gifPath)) {
      return processedGifs.get(gifPath);
    }
    
    // Create tmp directory if it doesn't exist
    const tmpDir = path.join(process.cwd(), 'tmp');
    if (!fs.existsSync(tmpDir)) {
      fs.mkdirSync(tmpDir, { recursive: true });
    }
    
    const outPath = path.join(tmpDir, `${path.basename(gifPath, '.gif')}_optimized.mp4`);
    
    // Convert GIF to MP4 with ffmpeg (better for WhatsApp)
    await execAsync(`ffmpeg -y -i "${gifPath}" -movflags faststart -pix_fmt yuv420p -vf "scale=trunc(iw/2)*2:trunc(ih/2)*2" "${outPath}"`);
    
    if (!fs.existsSync(outPath)) {
      throw new Error(`Processed file not created: ${outPath}`);
    }
    
    // Read the processed file and store in memory
    const buffer = fs.readFileSync(outPath);
    processedGifs.set(gifPath, buffer);
    
    return buffer;
  } catch (error) {
    console.error(`[DIRECT-GIF-FIX] Error processing GIF: ${error.message}`);
    // If processing fails, return the original GIF
    return fs.readFileSync(gifPath);
  }
}

/**
 * Send a GIF with direct handling to ensure animation works
 */
async function sendDirectGif(conn, jid, gifPath, caption = '', quoted = null) {
  try {
    console.log(`[DIRECT-GIF-FIX] Processing GIF: ${gifPath}`);
    
    // Process the GIF for better compatibility
    const buffer = await processGif(gifPath);
    
    // Create appropriate mentions
    let mentions = [];
    if (quoted && quoted.mentionedJid) {
      mentions = [...quoted.mentionedJid];
    }
    if (quoted && quoted.sender) {
      mentions.push(quoted.sender);
    }
    
    // Send as video with optimal settings for animation
    await conn.sendMessage(jid, {
      video: buffer,
      gifPlayback: true,
      caption: caption,
      mentions: mentions,
      mimetype: 'video/mp4',
      // These settings help with animation clarity
      jpegThumbnail: null, // No thumbnail which can cause blur
      mediaType: 2, // Video type
      ptt: false
    }, { 
      quoted,
      ephemeralExpiration: 0 // Don't expire
    });
    
    console.log(`[DIRECT-GIF-FIX] Successfully sent GIF`);
    return true;
  } catch (error) {
    console.error(`[DIRECT-GIF-FIX] Error sending GIF: ${error.message}`);
    return false;
  }
}

// Main handler for commands
let handler = async (m, { conn, args, usedPrefix, command }) => {
  try {
    // If running directgiffix command
    if (command === 'directgiffix') {
      // Only owners can use this command
      if (!m.isOwner) {
        return m.reply('This command is for bot owners only');
      }
      
      // Help text if no args
      if (!args[0] || args[0] === 'help') {
        return m.reply(`
📋 Direct GIF Fix Tool

Usage:
${usedPrefix}${command} test <name> - Test a specific GIF
${usedPrefix}${command} process <name> - Process a GIF for better quality
${usedPrefix}${command} list - List available GIFs
        `.trim());
      }
      
      const action = args[0].toLowerCase();
      
      // Process a GIF
      if (action === 'process') {
        const reactionName = args[1];
        if (!reactionName) {
          return m.reply(`Please specify a GIF name, e.g. ${usedPrefix}${command} process hug`);
        }
        
        // Path to the GIF file
        const gifPath = path.join(process.cwd(), 'gifs', `${reactionName}.gif`);
        
        // Check if GIF exists
        if (!fs.existsSync(gifPath)) {
          return m.reply(`GIF not found: ${reactionName}.gif\n\nPlease make sure the GIF file exists.`);
        }
        
        // Process the GIF
        await m.reply(`Processing GIF: ${reactionName}.gif...`);
        try {
          await processGif(gifPath);
          await m.reply(`✅ GIF processed successfully: ${reactionName}.gif`);
          
          // Test the processed GIF
          await m.reply(`Now testing the processed GIF...`);
          const success = await sendDirectGif(
            conn, 
            m.chat, 
            gifPath, 
            `Processed GIF test: ${reactionName}`, 
            m
          );
          
          if (success) {
            await m.reply(`✅ Processed GIF test sent successfully`);
          } else {
            await m.reply(`❌ Error sending processed GIF`);
          }
        } catch (error) {
          await m.reply(`❌ Error processing GIF: ${error.message}`);
        }
      }
      // Test sending a GIF
      else if (action === 'test') {
        const reactionName = args[1] || 'hug';
        
        // Path to the GIF file
        const gifPath = path.join(process.cwd(), 'gifs', `${reactionName}.gif`);
        
        // Check if GIF exists
        if (!fs.existsSync(gifPath)) {
          return m.reply(`GIF not found: ${reactionName}.gif\n\nPlease make sure the GIF file exists.`);
        }
        
        // Send test message
        await m.reply(`Testing direct GIF sending for "${reactionName}"...`);
        
        const success = await sendDirectGif(
          conn, 
          m.chat, 
          gifPath, 
          `Direct GIF test: ${reactionName}`, 
          m
        );
        
        if (success) {
          await m.reply(`✅ Direct GIF test sent successfully`);
        } else {
          await m.reply(`❌ Error sending direct GIF test`);
        }
      }
      // List available GIFs
      else if (action === 'list') {
        const gifsDir = path.join(process.cwd(), 'gifs');
        if (!fs.existsSync(gifsDir)) {
          return m.reply(`❌ Gifs directory not found`);
        }
        
        const gifs = fs.readdirSync(gifsDir).filter(file => file.endsWith('.gif'));
        
        if (gifs.length === 0) {
          return m.reply(`No GIFs found in the gifs directory`);
        }
        
        let message = `📋 Available GIFs (${gifs.length}):\n\n`;
        message += gifs.map(gif => `- ${gif.replace('.gif', '')}`).join('\n');
        
        await m.reply(message);
      }
      else {
        await m.reply(`Unknown action: ${action}\nUse ${usedPrefix}${command} help to see available options.`);
      }
    }
    // If using a direct GIF command
    else if (command.startsWith('direct')) {
      // Get the reaction name from command
      const reactionName = command.replace('direct', '').toLowerCase();
      
      // Path to the GIF file
      const gifPath = path.join(process.cwd(), 'gifs', `${reactionName}.gif`);
      
      // Check if GIF exists
      if (!fs.existsSync(gifPath)) {
        return m.reply(`GIF not found: ${reactionName}.gif`);
      }
      
      // Get target user
      let targetJid, targetName;
      
      if (m.mentionedJid && m.mentionedJid.length > 0) {
        targetJid = m.mentionedJid[0];
        targetName = conn.getName(targetJid);
      } else if (m.quoted) {
        targetJid = m.quoted.sender;
        targetName = conn.getName(targetJid);
      } else {
        targetJid = m.sender;
        targetName = conn.getName(targetJid);
      }
      
      // Create appropriate caption
      const senderName = conn.getName(m.sender);
      let caption;
      
      if (targetJid === m.sender) {
        // Self reaction
        caption = `${senderName} ${reactionName}s`;
      } else {
        // Reaction to someone else
        caption = `${senderName} ${reactionName}s ${targetName}`;
      }
      
      // Send the GIF
      const success = await sendDirectGif(
        conn, 
        m.chat, 
        gifPath, 
        caption, 
        m
      );
      
      if (!success) {
        await m.reply(`❌ Error sending ${reactionName} GIF`);
      }
    }
  } catch (error) {
    console.error('[DIRECT-GIF-FIX]', error);
    m.reply(`Error: ${error.message}`);
  }
};

// Register commands
handler.help = ['directgiffix', 'directhug', 'directkiss', 'directpat', 'directslap'];
handler.tags = ['tools', 'reactions'];
handler.command = /^(directgiffix|direct(hug|kiss|pat|slap))$/i;
handler.owner = true; // Make directgiffix owner-only

// Export the handler and utility function for other plugins
handler.sendDirectGif = sendDirectGif;
module.exports = handler;