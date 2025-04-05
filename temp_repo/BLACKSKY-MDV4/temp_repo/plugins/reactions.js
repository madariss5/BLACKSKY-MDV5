/**
 * Enhanced Reaction Commands for WhatsApp Bot
 * Sends animated GIFs with proper mention formatting
 * Supports multilingual messages (English and German)
 */

const fs = require('fs');
const path = require('path');
const logger = require('../utils/logger');
const { convertGifToMp4 } = require('../utils/gifConverter');
const { getMessage } = require('../lib/languages');
const { sendDirectGif } = require('./direct-gif-fix');

/**
 * Ensure necessary directories exist for storing GIFs
 */
function ensureDirectoriesExist() {
    const directories = ['./attached_assets', './media/reactions'];
    
    directories.forEach(dir => {
        if (!fs.existsSync(dir)) {
            try {
                fs.mkdirSync(dir, { recursive: true });
                logger.info(`Created directory: ${dir}`);
            } catch (err) {
                logger.error(`Failed to create directory ${dir}: ${err.message}`);
            }
        }
    });
}

/**
 * Verify that reaction GIF files exist
 */
function verifyReactionGifs() {
    const reactions = [
        'angry', 'bite', 'blush', 'bonk', 'bored', 'confused', 'cool', 'cry', 
        'cuddle', 'dance', 'disgusted', 'excited', 'facepalm', 'fuck', 'greedy', 
        'happy', 'highfive', 'horny', 'hug', 'hungry', 'jealous', 'kill', 'kiss', 
        'laugh', 'nervous', 'panic', 'pat', 'poke', 'proud', 'punch', 'sad', 'scared', 
        'shock', 'shy', 'sleepy', 'slap', 'smile', 'surprised', 'tired', 'wave', 
        'wink', 'yeet'
    ];
    
    let existingGifs = 0;
    reactions.forEach(reaction => {
        const mainPath = path.join(process.cwd(), 'gifs', `${reaction}.gif`);
        
        if (fs.existsSync(mainPath)) {
            existingGifs++;
        } else {
            logger.warn(`Missing GIF: ${reaction}`);
        }
    });
    
    logger.info(`Found ${existingGifs}/${reactions.length} reaction GIFs`);
}

/**
 * Handler for reaction commands
 */
let handler = async (m, { conn, args, usedPrefix, command }) => {
    try {
        // Map German commands to English ones for processing
        const originalCommand = command;
        if (germanToEnglishCommands[command.toLowerCase()]) {
            command = germanToEnglishCommands[command.toLowerCase()];
            logger.info(`[REACTION] Mapped German command "${originalCommand}" to "${command}"`);
        }
        
        // Get user's language preference
        const user = global.db.data.users[m.sender] || {};
        const chat = global.db.data.chats[m.chat] || {};
        
        // Make sure we're using the correct language hierarchy:
        // 1. User preference
        // 2. Group preference
        // 3. Global default
        // 4. Fallback to English if all else fails
        const userLang = user.language || (m.isGroup ? chat.language : null) || global.language || 'en';
        
        logger.info(`[REACTION] Using language: ${userLang} (User: ${user.language || 'unset'}, Group: ${chat.language || 'unset'}, Global: ${global.language || 'unset'})`);
        
        // Use correct sender ID
        const senderId = m.sender;
        const senderName = m.pushName || 'Someone';
        
        // Format mentions
        const formattedSender = `@${senderId.split('@')[0]}`;
        
        // Get target from mentions or args
        let targetId = m.mentionedJid?.[0] || (m.quoted ? m.quoted.sender : null);
        let formattedTarget;
        let selfReaction = false;
        
        if (targetId) {
            // Format mention to match WhatsApp's official format
            formattedTarget = `@${targetId.split('@')[0]}`;
        } else {
            // No mention found, use args as name or default
            formattedTarget = args.join(' ');
            
            // If no target is provided, it's a self-reaction
            if (!formattedTarget) {
                selfReaction = true;
                formattedTarget = userLang === 'de' ? 'sich selbst' : 'themselves';
            }
        }
        
        // Determine reaction message based on type
        let reactionMessage;
        const mentionsArray = [senderId];
        
        // Add target to mentions array if it exists
        if (targetId && targetId !== senderId) {
            mentionsArray.push(targetId);
        }
        
        // Handle the special 'reactions' command
        if (command === 'reactions') {
            // List all reactions
            const reactionCommands = [
                'hug', 'pat', 'kiss', 'cuddle', 'smile', 'happy', 'wave', 'dance', 'cry', 'blush',
                'laugh', 'wink', 'poke', 'slap', 'bonk', 'bite', 'punch', 'highfive', 'yeet', 'kill',
                'fuck', 'horny', 'angry', 'bored', 'confused', 'cool', 'scared', 'shy', 'sleepy',
                'surprised', 'tired', 'disgusted', 'excited', 'facepalm', 'greedy', 'hungry',
                'jealous', 'nervous', 'panic', 'proud', 'sad', 'shock'
            ];
            
            // For German users, add German commands too
            let formattedReactions;
            if (userLang === 'de') {
                // Display both English and German commands for German users
                const germanCommands = Object.entries(germanToEnglishCommands)
                    .filter(([germanCmd, englishCmd]) => reactionCommands.includes(englishCmd) && germanCmd !== 'reaktionen');
                    
                // Group by English command to show alternatives
                const commandGroups = {};
                germanCommands.forEach(([germanCmd, englishCmd]) => {
                    if (!commandGroups[englishCmd]) {
                        commandGroups[englishCmd] = [];
                    }
                    commandGroups[englishCmd].push(germanCmd);
                });
                
                // Format commands with their German alternatives
                formattedReactions = reactionCommands.map(cmd => {
                    const germanAlts = commandGroups[cmd] || [];
                    if (germanAlts.length > 0) {
                        return `• ${usedPrefix}${cmd} (${germanAlts.map(alt => usedPrefix + alt).join(', ')})`;
                    }
                    return `• ${usedPrefix}${cmd}`;
                }).join('\n');
            } else {
                // Just show English commands for English users
                formattedReactions = reactionCommands.map(cmd => `• ${usedPrefix}${cmd}`).join('\n');
            }
            
            // Get title, description, and example from language file
            const title = getMessage('reactions_list_title', userLang);
            const description = getMessage('reactions_list_description', userLang);
            const example = getMessage('reactions_list_example', userLang, { prefix: usedPrefix });
            
            // Send the list of reactions with proper translation
            await conn.reply(m.chat, `${title}\n\n${description}\n\n${formattedReactions}\n\n${example}`, m);
            return;
        }
        
        // Get the verb for this reaction in the user's language
        const verb = getMessage(command, userLang);
        logger.info(`[REACTION] Got verb for "${command}" in ${userLang}: "${verb}"`);
        
        // Create reaction message with proper language formatting
        if (selfReaction || ['smile', 'happy', 'dance', 'cry', 'blush', 'laugh', 'horny', 'angry', 
            'bored', 'confused', 'cool', 'scared', 'shy', 'sleepy', 'surprised', 'tired', 'disgusted', 
            'excited', 'facepalm', 'greedy', 'hungry', 'jealous', 'nervous', 'panic', 'proud', 'sad', 
            'shock'].includes(command)) {
            
            // Self-reaction
            if (userLang === 'de') {
                // German uses different templates for different emotions
                if (['smile', 'laugh', 'wink', 'facepalm'].includes(command)) {
                    reactionMessage = `${formattedSender} ${verb} 😊`;
                } else if (['happy', 'angry', 'bored', 'confused', 'scared', 'shy', 'sleepy', 'surprised', 
                    'tired', 'disgusted', 'excited', 'greedy', 'hungry', 'jealous', 'nervous', 'panic', 
                    'proud', 'sad', 'shock'].includes(command)) {
                    reactionMessage = `${formattedSender} ist ${verb} 😄`;
                } else if (['dance', 'cry', 'blush'].includes(command)) {
                    reactionMessage = `${formattedSender} ${verb} 💃`;
                } else {
                    reactionMessage = `${formattedSender} ${verb} sich selbst`;
                }
            } else {
                // English format for self-reactions
                if (['smile', 'laugh', 'wink', 'facepalm'].includes(command)) {
                    reactionMessage = `${formattedSender} ${verb} 😊`;
                } else if (['happy', 'angry', 'bored', 'confused', 'scared', 'shy', 'sleepy', 'surprised', 
                    'tired', 'disgusted', 'excited', 'greedy', 'hungry', 'jealous', 'nervous', 'panic', 
                    'proud', 'sad', 'shock', 'horny'].includes(command)) {
                    reactionMessage = `${formattedSender} is ${verb} 😄`;
                } else if (['dance', 'cry', 'blush'].includes(command)) {
                    reactionMessage = `${formattedSender} is ${verb} 💃`;
                } else {
                    reactionMessage = `${formattedSender} ${verb} themselves`;
                }
            }
        } else {
            // Target reaction
            if (userLang === 'de') {
                // Special handling for cuddle which requires 'mit' in German
                if (command === 'cuddle') {
                    reactionMessage = `${formattedSender} ${verb} ${formattedTarget} 🥰`;
                } else if (command === 'highfive') {
                    reactionMessage = `${formattedSender} ${verb} ${formattedTarget} ✋`;
                } else {
                    reactionMessage = `${formattedSender} ${verb} ${formattedTarget} 👋`;
                }
            } else {
                // English format for target reactions
                if (command === 'cuddle') {
                    reactionMessage = `${formattedSender} cuddles with ${formattedTarget} 🥰`;
                } else if (command === 'wink') {
                    reactionMessage = `${formattedSender} winks at ${formattedTarget} 😉`;
                } else if (command === 'wave') {
                    reactionMessage = `${formattedSender} waves at ${formattedTarget} 👋`;
                } else if (command === 'poke') {
                    reactionMessage = `${formattedSender} pokes ${formattedTarget} 👉`;
                } else if (command === 'slap') {
                    reactionMessage = `${formattedSender} slaps ${formattedTarget} 👋`;
                } else if (command === 'bonk') {
                    reactionMessage = `${formattedSender} bonks ${formattedTarget} 🔨`;
                } else if (command === 'bite') {
                    reactionMessage = `${formattedSender} bites ${formattedTarget} 😬`;
                } else if (command === 'punch') {
                    reactionMessage = `${formattedSender} punches ${formattedTarget} 👊`;
                } else if (command === 'highfive') {
                    reactionMessage = `${formattedSender} high fives ${formattedTarget} ✋`;
                } else if (command === 'yeet') {
                    reactionMessage = `${formattedSender} yeets ${formattedTarget} 🚀`;
                } else if (command === 'kill') {
                    reactionMessage = `${formattedSender} kills ${formattedTarget} 💀`;
                } else if (command === 'fuck') {
                    reactionMessage = `${formattedSender} fucks ${formattedTarget} 🔞`;
                } else {
                    reactionMessage = `${formattedSender} ${verb} ${formattedTarget}`;
                }
            }
        }
        
        // Default case for unknown reactions
        if (!reactionMessage) {
            reactionMessage = userLang === 'de' 
                ? `Unbekannte Reaktion: ${originalCommand}` 
                : `Unknown reaction: ${originalCommand}`;
        }
        
        // Path to the GIF file
        const gifPath = path.join(process.cwd(), 'gifs', `${command}.gif`);
        
        // Send text message
        await conn.reply(m.chat, reactionMessage, m, { 
            mentions: mentionsArray 
        });
        
        // Send GIF if it exists
        if (fs.existsSync(gifPath)) {
            try {
                // Use the enhanced direct GIF sending method for clear, properly animated GIFs
                logger.info(`[REACTION] Using enhanced direct GIF sender for ${command}`);
                
                const success = await sendDirectGif(
                    conn,
                    m.chat,
                    gifPath,
                    null, // Don't send caption with the GIF since we already sent the text separately
                    m,
                    mentionsArray
                );
                
                if (success) {
                    logger.info(`[REACTION] Successfully sent ${command}.gif with enhanced method`);
                } else {
                    logger.error(`[REACTION] Enhanced method failed for ${command}`);
                    
                    // Fallback approach #1: Try sending as document
                    try {
                        logger.info(`[REACTION] Trying document method for ${command}`);
                        await conn.sendMessage(m.chat, {
                            document: fs.readFileSync(gifPath),
                            mimetype: 'image/gif',
                            fileName: `${command}.gif`
                        }, { quoted: m });
                        logger.info(`[REACTION] Successfully sent ${command}.gif as document`);
                    } catch (err2) {
                        logger.error(`[REACTION] Document method failed: ${err2.message}`);
                        
                        // Fallback approach #2: Try using the standard video method
                        try {
                            logger.warn(`[REACTION] Trying standard video method`);
                            const gifBuffer = fs.readFileSync(gifPath);
                            await conn.sendMessage(m.chat, {
                                video: gifBuffer,
                                gifPlayback: true,
                                mimetype: 'video/mp4',
                                jpegThumbnail: null // Remove thumbnail to improve clarity
                            }, { quoted: m });
                            logger.info(`[REACTION] Successfully sent ${command}.gif as video`);
                        } catch (err3) {
                            logger.error(`[REACTION] All methods failed: ${err3.message}`);
                        }
                    }
                }
            } catch (error) {
                logger.error(`[REACTION] Error in GIF sending process: ${error.message}`);
            }
        } else {
            logger.warn(`[REACTION] GIF not found: ${gifPath}`);
        }
        
    } catch (error) {
        logger.error(`Error in ${command} command: ${error.message}`);
        m.reply(`❌ Error processing reaction command`);
    }
};

// Set up commands for all reactions
handler.help = ['hug', 'pat', 'kiss', 'cuddle', 'smile', 'happy', 'wave', 'dance', 'cry', 'blush',
                'laugh', 'wink', 'poke', 'slap', 'bonk', 'bite', 'punch', 'highfive', 'yeet', 'kill',
                'fuck', 'horny', 'angry', 'bored', 'confused', 'cool', 'scared', 'shy', 'sleepy',
                'surprised', 'tired', 'disgusted', 'excited', 'facepalm', 'greedy', 'hungry',
                'jealous', 'nervous', 'panic', 'proud', 'sad', 'shock', 'reactions'];
                
handler.tags = ['reactions', 'fun'];

// This is the crucial part - make the command regex match all the reaction types in both English and German
handler.command = /^(hug|pat|kiss|cuddle|smile|happy|wave|dance|cry|blush|laugh|wink|poke|slap|bonk|bite|punch|highfive|yeet|kill|fuck|horny|angry|bored|confused|cool|scared|shy|sleepy|surprised|tired|disgusted|excited|facepalm|greedy|hungry|jealous|nervous|panic|proud|sad|shock|reactions|umarmen|umarmung|kuss|küssen|schlag|schlagen|ohrfeige|tätscheln|streicheln|kuscheln|stupsen|beißen|schmatzen|lecken|zwinkern|lächeln|glücklich|froh|winken|tanzen|weinen|traurig|lachen|wütend|ärger|reaktionen)$/i;

// Map German command aliases to their English counterparts to handle direct aliases
const germanToEnglishCommands = {
    'umarmen': 'hug',
    'umarmung': 'hug',
    'kuss': 'kiss',
    'küssen': 'kiss',
    'schlag': 'slap',
    'schlagen': 'slap',
    'ohrfeige': 'slap', 
    'tätscheln': 'pat',
    'streicheln': 'pat',
    'kuscheln': 'cuddle',
    'stupsen': 'poke',
    'beißen': 'bite',
    'schmatzen': 'kiss',
    'lecken': 'lick',
    'zwinkern': 'wink',
    'lächeln': 'smile',
    'glücklich': 'happy', 
    'froh': 'happy',
    'winken': 'wave',
    'tanzen': 'dance',
    'weinen': 'cry',
    'traurig': 'sad',
    'lachen': 'laugh',
    'wütend': 'angry',
    'ärger': 'angry',
    'reaktionen': 'reactions'
};

// Initialize GIF directories when loaded
ensureDirectoriesExist();
verifyReactionGifs();

module.exports = handler;