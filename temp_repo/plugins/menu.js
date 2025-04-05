/**
 * Enhanced Premium Menu for BLACKSKY-MD
 * Features a stylish design, premium logo, and all commands in one menu
 */

const { getMessage } = require('../lib/languages');
const fs = require('fs');
const path = require('path');
const moment = require('moment-timezone');
const { svgToPng, getDefaultLogoPath } = require('../lib/svg-converter');

// WhatsApp Group Link (can be replaced with your actual link)
const groupLink = "https://whatsapp.com/channel/0029Va8ZH8fFXUuc69TGVw1q";

let handler = async (m, { conn, usedPrefix: _p, args = [], command }) => {
    // Get user's preferred language
    const user = global.db.data.users[m.sender];
    const chat = global.db.data.chats[m.chat];
    const lang = user?.language || chat?.language || global.language;
    
    try {
        // Get user and bot stats
        let { exp, limit, level } = global.db.data.users[m.sender];
        let name = `@${m.sender.split`@`[0]}`;
        
        // Set timezone and get date/time
        const timeZone = global.timezone || 'Europe/Berlin';
        let d = new Date();
        let locale = lang === 'de' ? 'de-DE' : 'en-US';
        
        let date = d.toLocaleDateString(locale, { 
            weekday: 'long', 
            day: 'numeric', 
            month: 'long', 
            year: 'numeric' 
        });
        
        let time = d.toLocaleTimeString(locale, { 
            hour: 'numeric', 
            minute: 'numeric',
            second: 'numeric',
            hour12: true
        });
        
        // Get uptime with proper format
        let uptime = formatUptime(process.uptime() * 1000, lang);
        
        // Organize all commands
        let tags = {};
        let totalCommands = 0;
        let premiumCommands = 0;
        let limitCommands = 0;
        
        // Collect all commands and organize by tags
        Object.values(global.plugins).filter(plugin => !plugin.disabled).forEach(plugin => {
            if (plugin.help && plugin.tags) {
                const commandCount = Array.isArray(plugin.help) ? plugin.help.length : 1;
                totalCommands += commandCount;
                
                if (plugin.premium) premiumCommands += commandCount;
                if (plugin.limit) limitCommands += commandCount;
                
                // Add commands to respective tags
                if (Array.isArray(plugin.tags)) {
                    plugin.tags.forEach(tag => {
                        if (!tags[tag]) tags[tag] = [];
                        if (Array.isArray(plugin.help)) {
                            plugin.help.forEach(help => {
                                if (help && !tags[tag].includes(help)) tags[tag].push(help);
                            });
                        } else if (plugin.help) {
                            if (!tags[tag].includes(plugin.help)) tags[tag].push(plugin.help);
                        }
                    });
                } else if (plugin.tags) {
                    const tag = plugin.tags;
                    if (!tags[tag]) tags[tag] = [];
                    if (Array.isArray(plugin.help)) {
                        plugin.help.forEach(help => {
                            if (help && !tags[tag].includes(help)) tags[tag].push(help);
                        });
                    } else if (plugin.help) {
                        if (!tags[tag].includes(plugin.help)) tags[tag].push(plugin.help);
                    }
                }
            }
        });
        
        // Generate greeting based on time of day
        const getGreeting = () => {
            const hour = moment().tz(timeZone).hour();
            if (hour >= 5 && hour < 12) return lang === 'de' ? '🌄 Guten Morgen' : '🌄 Good morning';
            if (hour >= 12 && hour < 18) return lang === 'de' ? '☀️ Guten Tag' : '☀️ Good afternoon';
            if (hour >= 18 && hour < 22) return lang === 'de' ? '🌆 Guten Abend' : '🌆 Good evening';
            return lang === 'de' ? '🌙 Gute Nacht' : '🌙 Good night';
        };
        
        // Create the menu text
        let menuText = `╔════════《 🌌 *BLACKSKY-MD* 🌌 》════════╗\n`;
        menuText += `║      ⚡ *PREMIUM CYBERPUNK EDITION* ⚡      ║\n`;
        menuText += `╚══════════════════════════════════════╝\n\n`;
        
        // Add greeting and user info
        menuText += `${getGreeting()} ${name}! 👋\n\n`;
        
        // Bot info section
        menuText += `┏━━━━━━━━━ *BOT INFO* ━━━━━━━━━┓\n`;
        menuText += `┃ 🤖 *BOT:* BLACKSKY-MD PREMIUM\n`;
        menuText += `┃ 🔌 *LIBRARY:* Baileys MD\n`;
        menuText += `┃ ⏱️ *UPTIME:* ${uptime}\n`;
        menuText += `┃ 📅 *DATE:* ${date}\n`;
        menuText += `┃ 🕒 *TIME:* ${time}\n`;
        menuText += `┃ 🔑 *PREFIX:* ${_p}\n`;
        menuText += `┃ 📊 *COMMANDS:* ${totalCommands}\n`;
        menuText += `┗━━━━━━━━━━━━━━━━━━━━━━━━━━━┛\n\n`;
        
        // User stats
        menuText += `┏━━━━━━━━━ *YOUR STATS* ━━━━━━━━━┓\n`;
        menuText += `┃ 📝 *NAME:* ${m.pushName}\n`;
        menuText += `┃ 💫 *LEVEL:* ${level}\n`;
        menuText += `┃ ✨ *EXP:* ${exp}\n`;
        menuText += `┃ 🔒 *LIMIT:* ${limit}\n`;
        menuText += `┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛\n\n`;
        
        // Category icons for reference
        const categoryIcons = {
            'ai': '🤖',
            'downloader': '📥',
            'game': '🎮',
            'fun': '🎭',
            'sticker': '🖼️',
            'group': '👥',
            'tools': '🛠️',
            'xp': '✨',
            'main': '📱',
            'internet': '🌐',
            'maker': '🎨',
            'advanced': '⚙️',
            'owner': '👑',
            'nsfw': '🔞',
            'rpg': '⚔️',
            'econ': '💰',
            'islam': '🕌',
            'info': 'ℹ️'
            // Add more categories as needed
        };
        
        // All commands section
        menuText += `┏━━━━━━━━━ *ALL COMMANDS* ━━━━━━━━━┓\n\n`;
        
        // Sort tags alphabetically
        const sortedTags = Object.keys(tags).sort();
        
        // List all commands by category
        for (const tag of sortedTags) {
            const icon = categoryIcons[tag] || '📋';
            
            // Add category header
            menuText += `┃ ${icon} *${tag.toUpperCase()}*\n`;
            menuText += `┃ ━━━━━━━━━━━━━━━━━━━━━\n`;
            
            // List all commands for this category
            if (tags[tag] && tags[tag].length > 0) {
                // Sort commands alphabetically within each category
                const sortedCommands = tags[tag].sort();
                
                for (const cmd of sortedCommands) {
                    if (cmd) {
                        menuText += `┃ • *${_p}${cmd}*\n`;
                    }
                }
            } else {
                menuText += `┃ • No commands available\n`;
            }
            
            menuText += `┃\n`;
        }
        
        menuText += `┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛\n\n`;
        
        // Quick commands section
        menuText += `┏━━━━━━━━━ *QUICK COMMANDS* ━━━━━━━━━┓\n`;
        menuText += `┃ 🎵 *${_p}play* - Play music from YouTube\n`;
        menuText += `┃ 🎬 *${_p}playvideo* - Play video from YouTube\n`;
        menuText += `┃ 🎮 *${_p}game* - Play fun games\n`;
        menuText += `┃ 🤖 *${_p}ai* - Chat with AI\n`;
        menuText += `┃ 🖼️ *${_p}sticker* - Create stickers\n`;
        menuText += `┃ 📥 *${_p}ytmp3* - Download YouTube audio\n`;
        menuText += `┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛\n\n`;
        
        // Footer with usage tips
        menuText += `╔════════《 💡 *TIPS* 💡 》════════╗\n`;
        menuText += `║ • Type *${_p}help <command>* for detailed help\n`;
        menuText += `╚══════════════════════════════════════╝\n\n`;
        
        // Logo and group info
        menuText += `⚡ *POWERED BY BLACKSKY-MD PREMIUM* ⚡\n`;
        menuText += `🌐 *Join Our Group:* ${groupLink}\n`;
        
        // Load the premium logo with better prioritization of files
        let logoBuffer;
        try {
            // Try to use the new gradient logo first
            const defaultLogoPath = getDefaultLogoPath();
            console.log(`[MENU] Using logo: ${defaultLogoPath}`);
            
            // Convert SVG to PNG with a dark background for better visibility
            logoBuffer = await svgToPng(defaultLogoPath, {
                width: 800,
                height: 800,
                background: { r: 0, g: 0, b: 0, alpha: 1 } // Solid black background
            });
            
            console.log('[MENU] Successfully converted logo SVG to PNG');
        } catch (e) {
            console.error('[MENU] Error converting primary logo:', e);
            try {
                // Fall back to image files if SVG conversion fails
                const alternateLogos = [
                    './blacksky-premium-gradient.svg', // New gradient logo
                    './blacksky-premium-logo.svg',
                    './blacksky-logo-premium.svg',
                    './attached_assets/Bot2.jpg',
                    './blacksky-bot-image.jpg',
                    './blacksky-techbot-logo.svg',
                    './blacksky-logo-cosmic.svg', 
                    './blacksky-logo.svg'
                ];
                
                for (const logo of alternateLogos) {
                    try {
                        if (logo.endsWith('.svg')) {
                            // Convert SVG to PNG for better compatibility
                            logoBuffer = await svgToPng(logo, {
                                width: 800,
                                height: 800,
                                background: { r: 0, g: 0, b: 0, alpha: 1 } // Solid black background
                            });
                        } else {
                            // Use JPG/PNG directly
                            logoBuffer = fs.readFileSync(logo);
                        }
                        console.log(`[MENU] Using alternate logo: ${logo}`);
                        break;
                    } catch (err) {
                        continue;
                    }
                }
                
                // If still no logo found, use default thumbnail URL
                if (!logoBuffer) {
                    console.log('[MENU] No logo files found, using default thumbnail URL');
                }
            } catch (e2) {
                console.log('[MENU] Error loading alternate logos:', e2);
                logoBuffer = null;
            }
        }
        
        // Send the menu with the premium logo - optimized for better image display
        await conn.sendMessage(m.chat, {
            text: menuText,
            contextInfo: {
                mentionedJid: [m.sender],
                externalAdReply: {
                    title: '🌌 BLACKSKY-MD PREMIUM',
                    body: 'Advanced Cyberpunk WhatsApp Assistant',
                    mediaType: 1, // 1 = image
                    previewType: 0, // 0 = no cropping issue
                    renderLargerThumbnail: true, // show large thumbnail
                    showAdAttribution: true, // show attribution
                    thumbnail: logoBuffer, // our actual image buffer
                    thumbnailUrl: '', // empty to prioritize buffer
                    sourceUrl: groupLink // link when clicked
                }
            }
        }, { quoted: m });
        
    } catch (error) {
        console.error('Menu error:', error);
        m.reply('❌ An error occurred while generating the menu.');
    }
};

// Format uptime in a user-friendly way
function formatUptime(ms, lang = 'en') {
    let d = Math.floor(ms / 86400000);
    let h = Math.floor(ms / 3600000) % 24;
    let m = Math.floor(ms / 60000) % 60;
    let s = Math.floor(ms / 1000) % 60;
    
    // Translated time units
    const dayUnit = lang === 'de' ? (d === 1 ? 'Tag' : 'Tage') : (d === 1 ? 'day' : 'days');
    const hourUnit = lang === 'de' ? (h === 1 ? 'Stunde' : 'Stunden') : (h === 1 ? 'hour' : 'hours');
    const minuteUnit = lang === 'de' ? (m === 1 ? 'Minute' : 'Minuten') : (m === 1 ? 'minute' : 'minutes');
    const secondUnit = lang === 'de' ? (s === 1 ? 'Sekunde' : 'Sekunden') : (s === 1 ? 'second' : 'seconds');
    
    // Build uptime string
    const parts = [];
    if (d > 0) parts.push(`${d} ${dayUnit}`);
    if (h > 0) parts.push(`${h} ${hourUnit}`);
    if (m > 0) parts.push(`${m} ${minuteUnit}`);
    if (s > 0 || parts.length === 0) parts.push(`${s} ${secondUnit}`);
    
    return parts.join(', ');
}

// Handler configuration
handler.help = ['menu', 'newmenu', 'premium', 'cybermenu', 'allmenu'];
handler.tags = ['main'];
handler.command = /^(menu|newmenu|premium|cybermenu|allmenu)$/i;

module.exports = handler;