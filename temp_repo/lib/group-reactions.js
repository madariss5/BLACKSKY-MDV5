/**
 * Group Reaction Utilities for BLACKSKY-MD
 * 
 * This module provides utilities for sending reactions to all group members
 * with proper internationalization support.
 */

const fs = require('fs');
const path = require('path');

// Translations for reaction commands
const translations = {
  en: {
    hug: {
      title: "Group Hug",
      message: "{sender} is hugging everyone!",
      individualMessage: "{sender} hugs {receiver} ❤️"
    },
    kiss: {
      title: "Group Kiss",
      message: "{sender} is kissing everyone!",
      individualMessage: "{sender} kisses {receiver} 😘"
    },
    pat: {
      title: "Group Pat",
      message: "{sender} is patting everyone!",
      individualMessage: "{sender} pats {receiver} 🥰"
    },
    slap: {
      title: "Group Slap",
      message: "{sender} is slapping everyone!",
      individualMessage: "{sender} slaps {receiver} 👋"
    },
    bonk: {
      title: "Group Bonk",
      message: "{sender} is bonking everyone!",
      individualMessage: "{sender} bonks {receiver} 🔨"
    },
    highfive: {
      title: "Group High Five",
      message: "{sender} is high-fiving everyone!",
      individualMessage: "{sender} gives {receiver} a high five ✋"
    },
    bite: {
      title: "Group Bite",
      message: "{sender} is biting everyone!",
      individualMessage: "{sender} bites {receiver} 😬"
    },
    cuddle: {
      title: "Group Cuddle",
      message: "{sender} is cuddling everyone!",
      individualMessage: "{sender} cuddles with {receiver} 🤗"
    },
    kill: {
      title: "Group Kill",
      message: "{sender} is killing everyone! (virtually of course)",
      individualMessage: "{sender} kills {receiver} 💀"
    }
  },
  de: {
    hug: {
      title: "Gruppenumarmung",
      message: "{sender} umarmt alle!",
      individualMessage: "{sender} umarmt {receiver} ❤️"
    },
    kiss: {
      title: "Gruppenkuss",
      message: "{sender} küsst alle!",
      individualMessage: "{sender} küsst {receiver} 😘"
    },
    pat: {
      title: "Gruppen-Streicheln",
      message: "{sender} streichelt alle!",
      individualMessage: "{sender} streichelt {receiver} 🥰"
    },
    slap: {
      title: "Gruppen-Klaps",
      message: "{sender} gibt allen einen Klaps!",
      individualMessage: "{sender} gibt {receiver} einen Klaps 👋"
    },
    bonk: {
      title: "Gruppen-Bonk",
      message: "{sender} bonkt alle!",
      individualMessage: "{sender} bonkt {receiver} 🔨"
    },
    highfive: {
      title: "Gruppen-High-Five",
      message: "{sender} gibt allen ein High-Five!",
      individualMessage: "{sender} gibt {receiver} ein High-Five ✋"
    },
    bite: {
      title: "Gruppen-Biss",
      message: "{sender} beißt alle!",
      individualMessage: "{sender} beißt {receiver} 😬"
    },
    cuddle: {
      title: "Gruppen-Kuscheln",
      message: "{sender} kuschelt mit allen!",
      individualMessage: "{sender} kuschelt mit {receiver} 🤗"
    },
    kill: {
      title: "Gruppen-Kill",
      message: "{sender} tötet alle! (natürlich nur virtuell)",
      individualMessage: "{sender} tötet {receiver} 💀"
    }
  }
};

/**
 * Get GIF file path for a specific reaction
 * @param {string} reaction - The reaction type (hug, kiss, etc.)
 * @returns {string} - Path to the GIF file
 */
function getReactionGifPath(reaction) {
  // First check in attached_assets folder
  const assetPath = path.join(__dirname, '..', 'attached_assets', `${reaction}.gif`);
  if (fs.existsSync(assetPath)) {
    return assetPath;
  }
  
  // Then check in gifs folder
  const gifsPath = path.join(__dirname, '..', 'gifs', `${reaction}.gif`);
  if (fs.existsSync(gifsPath)) {
    return gifsPath;
  }
  
  // Finally check in media folder
  const mediaPath = path.join(__dirname, '..', 'media', `${reaction}.gif`);
  if (fs.existsSync(mediaPath)) {
    return mediaPath;
  }
  
  // If no specific GIF found, use a fallback
  console.log(`[WARNING] No GIF found for reaction: ${reaction}`);
  return path.join(__dirname, '..', 'attached_assets', 'happy.gif');
}

/**
 * Get translation for a specific reaction
 * @param {string} reaction - The reaction type (hug, kiss, etc.)
 * @param {string} language - The language code (en, de)
 * @returns {Object} - Translation object for the reaction
 */
function getReactionTranslation(reaction, language) {
  if (!translations[language] || !translations[language][reaction]) {
    // Fallback to English if translation not found
    return translations.en[reaction];
  }
  return translations[language][reaction];
}

/**
 * Get formatted reaction message
 * @param {string} template - Message template with placeholders
 * @param {string} sender - Name of the sender
 * @param {string} receiver - Name of the receiver
 * @returns {string} - Formatted message
 */
function formatMessage(template, sender, receiver = null) {
  let message = template.replace('{sender}', sender);
  if (receiver) {
    message = message.replace('{receiver}', receiver);
  }
  return message;
}

/**
 * Send a mass reaction to all participants in a group
 * @param {Object} m - Message object
 * @param {Object} conn - Connection object
 * @param {string} reaction - The reaction type (hug, kiss, etc.)
 * @param {string} language - The language code (en, de)
 */
async function sendMassReaction(m, conn, reaction, language = 'en') {
  try {
    // Check if in a group
    if (!m.isGroup) {
      return m.reply(language === 'de' 
        ? 'Dieser Befehl funktioniert nur in Gruppen!'
        : 'This command only works in groups!');
    }
    
    // Get all participants
    const groupMetadata = await conn.groupMetadata(m.chat);
    const participants = groupMetadata.participants;
    
    if (participants.length <= 1) {
      return m.reply(language === 'de'
        ? 'Es gibt nicht genügend Teilnehmer in dieser Gruppe!'
        : 'There are not enough participants in this group!');
    }
    
    // Get reaction GIF
    const gifPath = getReactionGifPath(reaction);
    
    // Get translation
    const translation = getReactionTranslation(reaction, language);
    
    // Get sender's name
    const senderName = m.pushName || 'Someone';
    
    // Create header message
    const headerMessage = formatMessage(translation.message, senderName);
    
    // Create list of individual reaction messages
    let individualMessages = '';
    for (const participant of participants) {
      // Skip the sender
      if (participant.id === m.sender) continue;
      
      // Get receiver's jid
      const receiverJid = participant.id;
      
      // Format proper WhatsApp mention
      const formattedMention = `@${receiverJid.split('@')[0]}`;
      
      // Add to individual messages list with proper WhatsApp mention format
      individualMessages += formatMessage(translation.individualMessage, senderName, formattedMention) + '\n';
    }
    
    // Build complete message
    const completeMessage = `*${translation.title}*\n\n${headerMessage}\n\n${individualMessages}`;
    
    // Enhanced direct approach for better GIF animation
    console.log(`[INFO] [REACTION] Using enhanced direct GIF sender for ${reaction}`);
    
    try {
      // Direct processing of the GIF for better animation
      console.log(`[DIRECT-GIF-FIX] Processing GIF: ${gifPath}`);
      
      // Create a tmp directory for optimized files if it doesn't exist
      const tmpDir = path.join(process.cwd(), 'tmp');
      if (!fs.existsSync(tmpDir)) {
        fs.mkdirSync(tmpDir, { recursive: true });
      }
      
      // Set output path for optimized mp4 (better for WhatsApp)
      const outPath = path.join(tmpDir, `${path.basename(gifPath, '.gif')}_optimized.mp4`);
      const { exec } = require('child_process');
      const { promisify } = require('util');
      const execAsync = promisify(exec);
      
      // Check if we need to process the GIF or if it's already processed
      if (!fs.existsSync(outPath)) {
        // Convert GIF to MP4 with ffmpeg (better quality for WhatsApp)
        await execAsync(`ffmpeg -y -i "${gifPath}" -movflags faststart -pix_fmt yuv420p -vf "scale=trunc(iw/2)*2:trunc(ih/2)*2" "${outPath}"`);
      }
      
      // Use the optimized file if available, otherwise fall back to the original
      const videoBuffer = fs.existsSync(outPath) ? fs.readFileSync(outPath) : fs.readFileSync(gifPath);
      
      // Send as video with optimal settings for animation
      await conn.sendMessage(m.chat, {
        video: videoBuffer,
        gifPlayback: true,
        caption: completeMessage,
        mentions: participants.map(p => p.id), // Tag everyone
        mimetype: 'video/mp4',
        // These settings help with animation clarity
        jpegThumbnail: null, // No thumbnail which can cause blur
        mediaType: 2, // Video type
        ptt: false
      }, { quoted: m });
      
      console.log(`[INFO] [REACTION] Successfully sent ${reaction}.gif with enhanced method`);
    } catch (gifError) {
      console.error(`[INFO] [REACTION] Enhanced GIF method failed, using fallback: ${gifError.message}`);
      // Fallback to standard method
      await conn.sendMessage(m.chat, {
        video: { url: gifPath },
        gifPlayback: true,
        caption: completeMessage,
        mentions: participants.map(p => p.id) // Tag everyone
      });
    }
    
  } catch (error) {
    console.error(`Error in sendMassReaction: ${error}`);
    m.reply(language === 'de'
      ? `❌ Fehler beim Ausführen der Reaktion: ${error.message}`
      : `❌ Error performing reaction: ${error.message}`);
  }
}

module.exports = {
  sendMassReaction,
  getReactionGifPath,
  getReactionTranslation,
  formatMessage
};