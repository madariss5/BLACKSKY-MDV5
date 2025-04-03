/**
 * Fixed Reactions - Guaranteed Animated GIFs
 * Uses direct GIF fix to ensure clear, properly animated GIFs
 */

const fs = require('fs');
const path = require('path');
const { getMessage } = require('../lib/languages');
const { sendDirectGif } = require('./direct-gif-fix');

let handler = async (m, { conn, args, usedPrefix, command }) => {
    // Get language
    const userLang = m.isGroup ? global.db.data.groups[m.chat]?.language || global.language || 'de' : 
                     global.db.data.users[m.sender]?.language || global.language || 'de';
    
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
        return m.reply(getMessage('reactions.notSelf', userLang, {}));
    }
    
    // Get the name of the tagged user
    let username = conn.getName(who);
    
    // Basic command validation
    if (!command) {
        return m.reply(
            `*Usage Examples:*
${usedPrefix}fixed-hug @user
${usedPrefix}fixed-kiss @user
${usedPrefix}fixed-pat @user
${usedPrefix}fixed-dance`
        );
    }
    
    // Extract the actual reaction name from "fixed-{reaction}"
    const reactionName = command.replace('fixed-', '');
    
    // Path to the GIF file
    const gifPath = path.join(process.cwd(), 'gifs', `${reactionName}.gif`);
    
    // Check if GIF exists
    if (!fs.existsSync(gifPath)) {
        return m.reply(`GIF not found: ${reactionName}.gif\n\nAvailable commands: blush, cry, dance, happy, hug, kiss, laugh, pat, punch, slap, smile`);
    }
    
    // Prepare message based on the command and language
    let message = '';
    
    // Handle different commands
    switch (reactionName) {
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
            message = getMessage('reactions.dance', userLang, {});
            break;
        case 'blush':
            message = getMessage('reactions.blush', userLang, {});
            break;
        case 'cry':
            message = getMessage('reactions.cry', userLang, {});
            break;
        case 'happy':
            message = getMessage('reactions.happy', userLang, {});
            break;
        case 'laugh':
            message = getMessage('reactions.laugh', userLang, {});
            break;
        case 'punch':
            message = getMessage('reactions.punch', userLang, { user: username });
            break;
        case 'slap':
            message = getMessage('reactions.slap', userLang, { user: username });
            break;
        case 'smile':
            message = getMessage('reactions.smile', userLang, {});
            break;
        default:
            message = `${conn.getName(m.sender)} ${reactionName}s ${username}`;
    }
    
    try {
        // Send directly with the improved method that guarantees animation
        console.log(`[FIXED-REACTION] Sending ${reactionName} GIF using direct sender`);
        
        const success = await sendDirectGif(
            conn, 
            m.chat, 
            gifPath, 
            message, 
            m
        );
        
        if (success) {
            console.log(`[FIXED-REACTION] Successfully sent ${reactionName} GIF`);
        } else {
            console.error(`[FIXED-REACTION] Failed to send ${reactionName} GIF`);
            
            // If direct GIF fails, at least send the text
            await conn.sendMessage(m.chat, { 
                text: message, 
                mentions: [who, m.sender].filter(Boolean)
            });
        }
    } catch (error) {
        console.error(`[FIXED-REACTION] Error:`, error);
        
        // Send just the text message as fallback
        await conn.sendMessage(m.chat, { 
            text: message, 
            mentions: [who, m.sender].filter(Boolean)
        });
    }
};

// Register commands with fixed- prefix
handler.help = [
    'fixed-hug', 'fixed-kiss', 'fixed-pat', 'fixed-dance', 
    'fixed-blush', 'fixed-cry', 'fixed-happy', 'fixed-laugh', 
    'fixed-punch', 'fixed-slap', 'fixed-smile'
];
handler.tags = ['reactions'];
handler.command = /^fixed-(hug|kiss|pat|dance|blush|cry|happy|laugh|punch|slap|smile)$/i;
handler.limit = true;

module.exports = handler;