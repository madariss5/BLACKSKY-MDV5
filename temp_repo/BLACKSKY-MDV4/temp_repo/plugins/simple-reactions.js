/**
 * Simple Reactions - Enhanced GIF Sending
 * Uses the new enhanced GIF sender utility for clear, properly animated GIFs
 */

const fs = require('fs');
const path = require('path');
const { getMessage } = require('../lib/languages');
const { sendEnhancedGif } = require('../utils/enhancedGifSender');

let handler = async (m, { conn, args, usedPrefix, command }) => {
    // Get language
    const userLang = m.isGroup ? global.db.data.groups[m.chat].language || global.language || 'de' : 
                     global.db.data.users[m.sender].language || global.language || 'de';
    
    // Get tagged user or the person who sent the message being replied to
    let who;
    if (m.mentionedJid && m.mentionedJid[0]) {
        who = m.mentionedJid[0];
    } else if (m.quoted && m.quoted.sender) {
        who = m.quoted.sender;
    } else {
        // If no one is tagged or replied to, default to the sender
        who = m.sender;
    }
    
    // Don't react to self by default
    if (who === conn.user.jid && !args[1]) {
        return m.reply(getMessage('reactions.notSelf', userLang));
    }
    
    // Get the name of the tagged user
    let username = who.split('@')[0];
    
    // Basic command validation
    if (!command) {
        return m.reply(
            `*Usage Examples:*
${usedPrefix}hug @user
${usedPrefix}kiss @user
${usedPrefix}pat @user
${usedPrefix}dance`
        );
    }
    
    // Check for processed GIF first, then fall back to original
    const processedPath = path.join(process.cwd(), 'tmp', `${command}_processed.gif`);
    const originalPath = path.join(process.cwd(), 'gifs', `${command}.gif`);
    
    // Determine which GIF to use
    let gifPath;
    if (fs.existsSync(processedPath)) {
        console.log(`[REACTION] Using processed GIF for ${command}`);
        gifPath = processedPath;
    } else if (fs.existsSync(originalPath)) {
        console.log(`[REACTION] Using original GIF for ${command}`);
        gifPath = originalPath;
    } else {
        return m.reply(`GIF not found: ${command}.gif\n\nAvailable commands: blush, cry, dance, happy, hug, kiss, laugh, pat, punch, slap, smile`);
    }
    
    // Prepare message based on the command and language
    let message = '';
    
    // Handle different commands
    switch (command) {
        case 'hug':
            message = getMessage('reactions.hug', userLang, { user: username });
            break;
        case 'kiss':
            message = getMessage('reactions.kiss', userLang, { user: username });
            break;
        case 'pat':
            message = getMessage('reactions.pat', userLang, { user: username });
            break;
        case 'dance':
            message = getMessage('reactions.dance', userLang);
            break;
        case 'blush':
            message = getMessage('reactions.blush', userLang);
            break;
        case 'cry':
            message = getMessage('reactions.cry', userLang);
            break;
        case 'happy':
            message = getMessage('reactions.happy', userLang);
            break;
        case 'laugh':
            message = getMessage('reactions.laugh', userLang);
            break;
        case 'punch':
            message = getMessage('reactions.punch', userLang, { user: username });
            break;
        case 'slap':
            message = getMessage('reactions.slap', userLang, { user: username });
            break;
        case 'smile':
            message = getMessage('reactions.smile', userLang);
            break;
        default:
            message = `@${m.sender.split('@')[0]} ${command}s ${username}`;
    }
    
    // Prepare mentions
    const mentions = [who, m.sender].filter(Boolean);
    
    try {
        // Use the enhanced GIF sender for clear, properly animated GIFs
        console.log(`[REACTION] Sending ${command} GIF using enhanced sender`);
        const sent = await sendEnhancedGif(
            conn, 
            m.chat, 
            gifPath, 
            message, 
            m, 
            mentions
        );
        
        if (sent) {
            console.log(`[REACTION] Successfully sent ${command} GIF with enhanced sender`);
        } else {
            console.error(`[REACTION] Enhanced sender failed for ${command}`);
            
            // If enhanced sender fails, at least send the text message
            await conn.sendMessage(m.chat, { 
                text: message, 
                mentions: mentions 
            });
        }
    } catch (error) {
        console.error(`[REACTION] Error sending ${command} GIF:`, error);
        
        // Fallback to standard methods
        try {
            // Read the GIF into a buffer
            const buffer = fs.readFileSync(gifPath);
            
            // First send the message
            await conn.sendMessage(m.chat, { 
                text: message, 
                mentions: mentions 
            });
            
            // Then try to send the GIF with optimized settings
            await conn.sendMessage(m.chat, {
                video: buffer,
                gifPlayback: true,
                mimetype: 'video/mp4',
                jpegThumbnail: null, // Disable thumbnail which can cause blur
            }, { 
                quoted: m
            });
        } catch (fallbackError) {
            console.error(`[REACTION] Fallback also failed:`, fallbackError);
            // Already sent the text message above, so at least the user got something
        }
    }
};

// Register commands
handler.help = ['hug', 'kiss', 'pat', 'dance', 'blush', 'cry', 'happy', 'laugh', 'punch', 'slap', 'smile'];
handler.tags = ['reactions'];
handler.command = /^(hug|kiss|pat|dance|blush|cry|happy|laugh|punch|slap|smile)$/i;
handler.limit = true;

module.exports = handler;