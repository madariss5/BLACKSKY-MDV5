/**
 * Connection Success Message for BLACKSKY-MD
 * Shows premium logo and connection notification
 * 
 * Updated with SVG to PNG conversion for compatibility
 */

const fs = require('fs');
const path = require('path');
const { getMessage } = require('../lib/languages');
const { svgToPng, getDefaultLogoPath } = require('../lib/svg-converter');

// Event handler for successful connection
let handler = async (m, { conn, args, usedPrefix, command }) => {
    // This will be called manually by the connection event in connection-patch.js
};

// Main function to send connection notification
async function sendConnectionMessage(conn) {
    try {
        // Try to load and convert the premium logo with fallbacks
        let logoBuffer;
        try {
            // Try to use the new gradient logo first
            const defaultLogoPath = getDefaultLogoPath();
            console.log(`[CONNECTION] Using logo: ${defaultLogoPath}`);
            
            // Convert SVG to PNG with a dark background for better visibility
            // Reduced size from 800x800 to 400x400 for better performance
            logoBuffer = await svgToPng(defaultLogoPath, {
                width: 400,
                height: 400,
                background: { r: 0, g: 0, b: 0, alpha: 1 } // Solid black background
            });
            
            console.log('[CONNECTION] Successfully converted logo SVG to PNG');
        } catch (e) {
            console.error('[CONNECTION] Error converting primary logo:', e);
            try {
                // Try alternate logo formats with conversion for SVGs
                const alternateLogos = [
                    './blacksky-premium-gradient.svg', // New gradient logo
                    './blacksky-premium-logo.svg',
                    './blacksky-logo-premium.svg',
                    './blacksky-techbot-logo.svg',
                    './blacksky-logo-cosmic.svg', 
                    './blacksky-logo.svg',
                    './blacksky-bot-image.jpg',
                    './attached_assets/Bot2.jpg'
                ];
                
                for (const logo of alternateLogos) {
                    try {
                        if (logo.endsWith('.svg')) {
                            // Convert SVG to PNG for better compatibility
                            // Reduced size from 800x800 to 400x400 for better performance
                            logoBuffer = await svgToPng(logo, {
                                width: 400,
                                height: 400,
                                background: { r: 0, g: 0, b: 0, alpha: 1 } // Solid black background
                            });
                        } else {
                            // Use JPG/PNG directly
                            logoBuffer = fs.readFileSync(logo);
                        }
                        console.log(`[CONNECTION] Using alternate logo: ${logo}`);
                        break;
                    } catch (err) {
                        continue;
                    }
                }
                
                if (!logoBuffer) {
                    console.log('[CONNECTION] No logo files found, using default thumbnail URL');
                }
            } catch (e2) {
                console.log('[CONNECTION] Error loading alternate logos:', e2);
                logoBuffer = null;
            }
        }
        
        // Group link and message text (can be customized)
        const groupLink = "https://whatsapp.com/channel/0029Va8ZH8fFXUuc69TGVw1q";
        
        // Get bot info
        const botInfo = {
            name: global.botname || 'BLACKSKY-MD',
            version: '2.5.0 Premium',
            mode: 'Production',
            library: 'Baileys-MD',
        };
        
        // Build the connection message
        let messageText = `╔════════《 🌌 *BLACKSKY-MD* 🌌 》════════╗\n`;
        messageText += `║     ⚡ *CONNECTION SUCCESSFUL* ⚡      ║\n`;
        messageText += `╚══════════════════════════════════════╝\n\n`;
        
        // Bot details
        messageText += `┏━━━━━━━━━ *BOT INFO* ━━━━━━━━━┓\n`;
        messageText += `┃ 🤖 *BOT:* ${botInfo.name}\n`;
        messageText += `┃ 🔄 *VERSION:* ${botInfo.version}\n`;
        messageText += `┃ 🔌 *LIBRARY:* ${botInfo.library}\n`;
        messageText += `┃ 🖥️ *MODE:* ${botInfo.mode}\n`;
        messageText += `┗━━━━━━━━━━━━━━━━━━━━━━━━━━━┛\n\n`;
        
        // Status message
        messageText += `✅ *Bot connected successfully!*\n`;
        messageText += `⏱️ *Connected at:* ${new Date().toLocaleString()}\n\n`;
        
        // Tips
        messageText += `╔════════《 💡 *COMMANDS* 💡 》════════╗\n`;
        messageText += `║ • Type *.menu* for main menu\n`;
        messageText += `║ • Type *.help <command>* for detailed help\n`;
        messageText += `╚══════════════════════════════════════╝\n\n`;
        
        // Footer
        messageText += `⚡ *POWERED BY BLACKSKY-MD PREMIUM* ⚡\n`;
        messageText += `🌐 *Support Link:* ${groupLink}\n`;
        
        // Send the connection message to the bot's own JID
        if (conn && conn.user) {
            const botJid = conn.user.jid;
            
            // Send message with premium logo
            await conn.sendMessage(botJid, {
                text: messageText,
                contextInfo: {
                    externalAdReply: {
                        title: '🌌 BLACKSKY-MD PREMIUM',
                        body: 'Successfully Connected',
                        mediaType: 1,
                        previewType: 0,
                        thumbnailUrl: 'https://i.ibb.co/r7GLRnP/generated-icon.png',
                        thumbnail: logoBuffer,
                        sourceUrl: groupLink,
                        showAdAttribution: true,
                        renderLargerThumbnail: true
                    }
                }
            });
            
            console.log('[CONNECTION] Sent startup notification message with logo');
        } else {
            console.log('[CONNECTION] Could not send notification - missing connection or user');
        }
        
    } catch (error) {
        console.error('[CONNECTION] Error sending notification:', error);
    }
}

// Export both the handler and the connection message function
module.exports = handler;
module.exports.sendConnectionMessage = sendConnectionMessage;