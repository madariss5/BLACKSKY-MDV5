/**
 * Emoji Reactions - Quick access to reaction GIFs via emoji commands
 * For example, send "❤️" to send the kiss GIF
 */

const fs = require('fs');
const path = require('path');
const { getMessage } = require('../lib/languages');
const { sendDirectGif } = require('./direct-gif-fix');

// Map emoji commands to reaction GIFs
const emojiMap = {
    '🫂': 'hug',     // Hug
    '❤️': 'kiss',    // Kiss with heart
    '💖': 'kiss',    // Kiss with sparkling heart
    '😘': 'kiss',    // Kiss face
    '👋': 'wave',    // Wave
    '😊': 'smile',   // Smile
    '😢': 'cry',     // Cry
    '😭': 'cry',     // Crying face
    '👏': 'clap',    // Clap
    '😂': 'laugh',   // Laugh
    '🤗': 'hug',     // Hug face
    '👍': 'thumbsup',// Thumbs up
    '✌️': 'peace',   // Peace
    '🎵': 'dance',   // Dancing
    '💃': 'dance',   // Dance
    '🕺': 'dance',   // Dancing man
    '😳': 'blush',   // Blushing
    '👊': 'punch',   // Punch
    '💥': 'slap',    // Slap
    '🤦': 'facepalm',// Facepalm
    '🤔': 'thinking',// Thinking
    '😴': 'sleepy',  // Sleepy
    '🙄': 'eyeroll', // Eye roll
    '🫡': 'salute',  // Salute
    '🐱': 'cat',     // Cat
    '🐶': 'dog'      // Dog
};

let handler = async (m, { conn, args }) => {
    // Only process text messages that are just emojis
    if (!m.text || m.text.length > 5) return; // Skip long messages
    
    // Check if the message is one of our emoji commands
    const emoji = m.text.trim();
    const reactionName = emojiMap[emoji];
    
    // If not a mapped emoji, skip
    if (!reactionName) return;
    
    // Path to the GIF file
    const gifPath = path.join(process.cwd(), 'gifs', `${reactionName}.gif`);
    
    // Check if GIF exists, silently exit if not
    if (!fs.existsSync(gifPath)) {
        console.log(`[EMOJI-REACTION] GIF not found for emoji ${emoji}: ${reactionName}.gif`);
        return;
    }
    
    // Get language for messages
    const userLang = m.isGroup ? global.db.data.groups[m.chat]?.language || global.language || 'de' : 
                     global.db.data.users[m.sender]?.language || global.language || 'de';
    
    // Get target (mentioned or replied user)
    let who;
    if (m.mentionedJid && m.mentionedJid[0]) {
        who = m.mentionedJid[0];
    } else if (m.quoted && m.quoted.sender) {
        who = m.quoted.sender;
    } else {
        // Self-reaction if nobody mentioned
        who = m.sender;
    }
    
    // Get the sender's display name
    const senderName = conn.getName(m.sender);
    
    // Get the target user's display name
    const targetName = (who === m.sender) ? senderName : conn.getName(who);
    
    // Create message based on reaction type and target
    let message;
    
    if (who === m.sender) {
        // Self reaction message
        switch(reactionName) {
            case 'hug':
                message = getMessage('reactions.selfHug', userLang, { user: senderName }) || 
                          `${senderName} hugs themselves`;
                break;
            case 'kiss':
                message = getMessage('reactions.selfKiss', userLang, { user: senderName }) || 
                          `${senderName} blows a kiss`;
                break;
            case 'dance':
                message = getMessage('reactions.dance', userLang, { user: senderName }) || 
                          `${senderName} dances`;
                break;
            case 'cry':
                message = getMessage('reactions.cry', userLang, { user: senderName }) || 
                          `${senderName} is crying`;
                break;
            default:
                message = `${senderName} ${reactionName}s`;
        }
    } else {
        // Reaction to someone else
        switch(reactionName) {
            case 'hug':
                message = getMessage('reactions.hug', userLang, { user: targetName }) || 
                          `${senderName} hugs ${targetName}`;
                break;
            case 'kiss':
                message = getMessage('reactions.kiss', userLang, { user: targetName }) || 
                          `${senderName} kisses ${targetName}`;
                break;
            case 'slap':
                message = getMessage('reactions.slap', userLang, { user: targetName }) || 
                          `${senderName} slaps ${targetName}`;
                break;
            case 'punch':
                message = getMessage('reactions.punch', userLang, { user: targetName }) || 
                          `${senderName} punches ${targetName}`;
                break;
            default:
                message = `${senderName} ${reactionName}s ${targetName}`;
        }
    }
    
    try {
        // Send the GIF with the direct method
        console.log(`[EMOJI-REACTION] Sending ${reactionName} GIF for emoji ${emoji}`);
        
        const success = await sendDirectGif(
            conn, 
            m.chat, 
            gifPath, 
            message, 
            m
        );
        
        if (!success) {
            console.error(`[EMOJI-REACTION] Failed to send ${reactionName} GIF for emoji ${emoji}`);
        }
    } catch (error) {
        console.error(`[EMOJI-REACTION] Error:`, error);
    }
};

// Register for before middleware to capture all messages
handler.before = true;
handler.all = true;

module.exports = handler;