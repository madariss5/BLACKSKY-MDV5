/**
 * JID Helper Utility
 * Provides safe methods for interacting with WhatsApp JIDs (Jabber IDs)
 * and sending messages with proper error handling
 */

const { Boom } = require('@hapi/boom');
const logger = require('./logger');

/**
 * Safely sends a message to a JID with error handling
 * @param {Object} sock - The WhatsApp socket connection
 * @param {string} jid - The JID to send the message to
 * @param {Object} content - The message content
 * @returns {Promise<Object|null>} - The sent message or null if error
 */
async function safeSendMessage(sock, jid, content) {
  try {
    if (!sock || !jid) {
      throw new Error('Missing required parameters');
    }
    
    // Validate JID format
    if (!jid.includes('@') || (!jid.endsWith('@s.whatsapp.net') && !jid.endsWith('@g.us'))) {
      throw new Error(`Invalid JID format: ${jid}`);
    }
    
    // Send the message
    const sentMsg = await sock.sendMessage(jid, content);
    return sentMsg;
  } catch (error) {
    // Special handling for Boom errors (Baileys)
    if (error instanceof Boom) {
      logger.error(`Boom error sending message: ${error.output.payload.message}`);
    } else {
      logger.error(`Error sending message: ${error.message}`);
    }
    return null;
  }
}

/**
 * Safely sends an animated GIF to a JID with error handling
 * @param {Object} sock - The WhatsApp socket connection
 * @param {string} jid - The JID to send the message to
 * @param {Buffer} gifBuffer - The GIF buffer data (MP4 format)
 * @param {string} caption - Optional caption for the GIF
 * @returns {Promise<Object|null>} - The sent message or null if error
 */
async function safeSendAnimatedGif(sock, jid, gifBuffer, caption = '') {
  try {
    if (!sock || !jid || !gifBuffer) {
      throw new Error('Missing required parameters');
    }
    
    // Validate JID format
    if (!jid.includes('@') || (!jid.endsWith('@s.whatsapp.net') && !jid.endsWith('@g.us'))) {
      throw new Error(`Invalid JID format: ${jid}`);
    }
    
    // Send as video for proper animated GIF display in WhatsApp
    const sentMsg = await sock.sendMessage(jid, { 
      video: gifBuffer, 
      caption: caption,
      gifPlayback: true, // This makes it play as an animated GIF
      mimetype: 'video/mp4'
    });
    
    return sentMsg;
  } catch (error) {
    // Special handling for Boom errors (Baileys)
    if (error instanceof Boom) {
      logger.error(`Boom error sending animated GIF: ${error.output.payload.message}`);
    } else {
      logger.error(`Error sending animated GIF: ${error.message}`);
    }
    return null;
  }
}

/**
 * Validates a WhatsApp JID format
 * @param {string} jid - The JID to validate
 * @returns {boolean} - Whether the JID is valid
 */
function isValidJid(jid) {
  if (!jid || typeof jid !== 'string') return false;
  return jid.includes('@') && (jid.endsWith('@s.whatsapp.net') || jid.endsWith('@g.us'));
}

/**
 * Extracts a phone number from a JID
 * @param {string} jid - The JID to extract from
 * @returns {string|null} - The extracted phone number or null
 */
function extractPhoneNumber(jid) {
  if (!isValidJid(jid)) return null;
  
  // Extract the part before the @
  const parts = jid.split('@');
  return parts[0];
}

module.exports = {
  safeSendMessage,
  safeSendAnimatedGif,
  isValidJid,
  extractPhoneNumber
};