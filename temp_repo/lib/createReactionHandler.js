/**
 * Create Reaction Handler
 * 
 * This utility creates standardized reaction handlers (kiss, hug, etc.)
 * for use in plugins. It ensures consistent behavior across all reaction
 * commands and centralizes the logic for processing reactions.
 */

const fs = require('fs');
const path = require('path');
const { languages } = require('./languages');
const { sendEnhancedGif } = require('../utils/enhancedGifSender');

/**
 * Creates a standardized reaction handler function
 * 
 * @param {string} reactionType - The type of reaction (kiss, hug, etc.)
 * @param {Object} options - Options for customizing the reaction
 * @param {string} options.fallbackGif - Fallback GIF path if the main one doesn't exist
 * @param {Function} options.customMessageFormatter - Custom function to format messages
 * @returns {Function} Handler function for use in plugins
 */
function createReactionHandler(reactionType, options = {}) {
  return async function handler(m, { conn, text, usedPrefix, command }) {
    try {
      // Get user's language, default to English if not set
      const userLang = global.db.data.users[m.sender]?.language || 'en';
      const langStrings = languages[userLang] || languages.en;
      
      // Parse mentions and get target
      // Allow both @mentions and plain text for flexibility
      let targetUser = text ? text.trim() : '';
      let targetDisplay = targetUser;
      let selfReaction = false;
      
      // Handle mentioned users
      if (m.mentionedJid && m.mentionedJid.length > 0) {
        // Get first mentioned user
        const mentioned = m.mentionedJid[0];
        targetUser = '@' + mentioned.split('@')[0];
        targetDisplay = targetUser;
      }
      
      // If no target, assume self-reaction
      if (!targetUser) {
        selfReaction = true;
      }
      
      // Log language and detail verbosity for easier debugging
      console.log(`[REACTION] Using language: ${userLang}`);
      console.log(`[REACTION] Command type: ${reactionType}`);
      console.log(`[REACTION] Available translation keys:`, Object.keys(langStrings).filter(key => 
        key === reactionType || key === `${reactionType}_target` || key === `${reactionType}_self`).join(', '));
      
      // Get the verb translation explicitly for this reaction type
      // Log actual translation keys used to debug any issues
      console.log(`[REACTION] Looking for verb key "${reactionType}" in language strings`);
      
      // Get the verb translation with fallback to base reactionType if not found
      const verbTranslation = langStrings[reactionType] || reactionType;
      console.log(`[REACTION] Final verb translation for ${reactionType}: "${verbTranslation}"`);
      
      // Get appropriate message template based on whether there's a target
      let message;
      
      if (selfReaction) {
        // Use self_reaction template if available, otherwise fall back to no_target
        if (langStrings[`${reactionType}_self`]) {
          message = langStrings[`${reactionType}_self`]
            .replace('{user}', '@' + m.sender.split('@')[0])
            .replace('%sender%', '@' + m.sender.split('@')[0])
            .replace('%verb%', verbTranslation);
          console.log(`[REACTION] Using specific self template: ${message}`);
        } else {
          const template = langStrings.reaction_self || langStrings.reaction_no_target;
          console.log(`[REACTION] Using generic self template: ${template}`);
          
          message = template
            .replace('{user}', '@' + m.sender.split('@')[0])
            .replace('%sender%', '@' + m.sender.split('@')[0])
            .replace('{reaction}', reactionType)
            .replace('%verb%', verbTranslation);
          
          console.log(`[REACTION] Final message: ${message}`);
        }
      } else {
        // Use specific reaction template if available, otherwise use generic template
        if (langStrings[`${reactionType}_target`]) {
          message = langStrings[`${reactionType}_target`]
            .replace('{user}', '@' + m.sender.split('@')[0])
            .replace('%sender%', '@' + m.sender.split('@')[0])
            .replace('{target}', targetDisplay)
            .replace('%target%', targetDisplay)
            .replace('%verb%', verbTranslation);
          console.log(`[REACTION] Using specific target template: ${message}`);
        } else {
          const template = langStrings.reaction_with_target;
          console.log(`[REACTION] Using generic target template: ${template}`);
          
          message = template
            .replace('{user}', '@' + m.sender.split('@')[0])
            .replace('%sender%', '@' + m.sender.split('@')[0])
            .replace('{target}', targetDisplay)
            .replace('%target%', targetDisplay)
            .replace('{reaction}', reactionType)
            .replace('%verb%', verbTranslation);
          
          console.log(`[REACTION] Final message: ${message}`);
        }
      }
      
      // Allow custom message formatting if provided
      if (options.customMessageFormatter) {
        message = options.customMessageFormatter(message, {
          reactionType,
          selfReaction,
          targetUser,
          sender: m.sender,
          langStrings
        });
      }
      
      // Get GIF path
      const gifPath = path.join(process.cwd(), 'gifs', `${reactionType}.gif`);
      let fallbackPath = null;
      
      if (options.fallbackGif) {
        fallbackPath = path.join(process.cwd(), 'gifs', options.fallbackGif);
      }
      
      // Check if GIF exists
      if (!fs.existsSync(gifPath) && !fallbackPath) {
        return m.reply(`❌ ${langStrings.reaction_gif_not_found || 'GIF not found for'} ${reactionType}!`);
      }
      
      // Path to the GIF file to use
      const finalGifPath = fs.existsSync(gifPath) ? gifPath : fallbackPath;
      
      // Prepare mentioned JIDs
      let mentionedJid = [m.sender];
      if (m.mentionedJid && m.mentionedJid.length > 0) {
        mentionedJid = [...mentionedJid, ...m.mentionedJid];
      }
      
      // Additional logging for debugging
      console.log(`[REACTION] Sending GIF to chat ${m.chat}`);
      console.log(`[REACTION] Message: ${message}`);
      console.log(`[REACTION] Mentions: ${JSON.stringify(mentionedJid)}`);
      
      // Check for potential duplicate message if deduplication is available
      if (global.messageDeduplication && 
          global.messageDeduplication.isDuplicateOutgoingMessage) {
        
        // Create a simplified message object for deduplication check with more unique identifiers
        const dedupMsg = {
          text: message,
          type: 'reaction_gif',
          reactionType: reactionType,
          targetUser: targetDisplay,
          sender: m.sender,
          timestamp: Date.now()  // Add timestamp for better uniqueness
        };
        
        // Check if this would be a duplicate
        if (global.messageDeduplication.isDuplicateOutgoingMessage(dedupMsg, m.chat)) {
          console.log(`[REACTION] Prevented duplicate ${reactionType} reaction to ${m.chat}`);
          // Acknowledge receipt with an emoji reaction instead of sending duplicate
          if (m.key && conn.sendReaction) {
            try {
              await conn.sendReaction(m.chat, m.key, "✅");
              console.log(`[REACTION] Sent reaction emoji instead of duplicate GIF`);
            } catch (reactError) {
              console.log(`[REACTION] Failed to send reaction emoji: ${reactError.message}`);
            }
          }
          return; // Skip sending to prevent duplicate
        }
        
        // Mark this message as being sent to prevent future duplicates
        global.messageDeduplication.markMessageSent(dedupMsg, m.chat);
      }
      
      // Use the enhanced GIF sender to ensure clear and animated GIFs
      try {
        // Read the GIF file
        const success = await sendEnhancedGif(
          conn, 
          m.chat, 
          finalGifPath, 
          message, 
          m, 
          mentionedJid
        );
        
        if (success) {
          console.log(`[REACTION] Successfully sent enhanced GIF for ${reactionType}`);
        } else {
          // If enhanced sender fails, try the legacy method as a fallback
          console.log(`[REACTION] Enhanced GIF sender failed, trying legacy method`);
          
          // Read the file buffer
          const gifBuffer = fs.readFileSync(finalGifPath);
          
          // Legacy method 1: Send as video with gifPlayback
          await conn.sendMessage(m.chat, {
            video: gifBuffer,
            caption: message,
            gifPlayback: true,
            mimetype: 'video/mp4',
            mentions: mentionedJid,
            quoted: m,
            jpegThumbnail: null  // Skip thumbnail for faster sending
          });
        }
      } catch (error) {
        console.error(`[REACTION] All sending methods failed: ${error.message}`);
        
        // Last resort: Send text-only response
        try {
          await conn.sendMessage(m.chat, { 
            text: message, 
            mentions: mentionedJid 
          });
          console.log(`[REACTION] Sent text-only fallback`);
        } catch (textError) {
          console.error(`[REACTION] Even text-only fallback failed: ${textError.message}`);
        }
      }
      
    } catch (error) {
      console.error(`Error in ${reactionType} reaction:`, error);
      m.reply(`❌ Error: ${error.message}`);
    }
  };
}

module.exports = {
  createReactionHandler
};