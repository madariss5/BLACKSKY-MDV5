const { getMessage } = require('../lib/languages');
const { DateTime } = require('luxon');
const fs = require('fs');
const path = require('path');
const moment = require('moment-timezone');

let handler = async (m, { conn, usedPrefix: _p }) => {
    try {
        // No logo buffer - removed image requirements

        // Get user's language preference
        const user = global.db.data.users[m.sender];
        const chat = global.db.data.chats[m.chat];
        const lang = user?.language || chat?.language || global.language || 'de';

        // Generate greeting based on time
        const getGreeting = () => {
            const hour = moment().tz('Africa/Nairobi').hour(); // Use moment-timezone for accurate time
            if (hour >= 5 && hour < 12) return lang === 'de' ? '🌄 Guten Morgen' : '🌄 Good morning';
            if (hour >= 12 && hour < 18) return lang === 'de' ? '☀️ Guten Tag' : '☀️ Good afternoon';
            if (hour >= 18 && hour < 22) return lang === 'de' ? '🌆 Guten Abend' : '🌆 Good evening';
            return lang === 'de' ? '🌙 Gute Nacht' : '🌙 Good night';
        };

        const categories = [
            { name: 'AI', emoji: '💫' },
            { name: 'Image Ai', emoji: '🦸' },
            { name: 'Glow Text', emoji: '💎' },
            { name: 'General', emoji: '✍️' },
            { name: 'Tools Ai', emoji: '⚒️' },
            { name: 'Logo', emoji: '🖼️' },
            { name: 'Animu', emoji: '🐺' },
            { name: 'Media', emoji: '🎥' },
            { name: 'Search', emoji: '🔍' },
            { name: 'Editting', emoji: '✂️' },
            { name: 'Groups', emoji: '👥' },
            { name: 'Owner', emoji: '👑' },
            { name: 'Coding', emoji: '💻' },
            { name: 'Utils', emoji: '🎭' },
            { name: 'NSFW', emoji: '🔞' }
        ];

        // WhatsApp Group Link
        const groupLink = "https://whatsapp.com/channel/0029Va8ZH8fFXUuc69TGVw1q";


        const getCurrentTimeInNairobi = () => {
            return moment().tz('Africa/Nairobi').format('HH:mm');
        };

        // Create menu text
        let menuText = `╔════════《 🌌 *BLACKSKY-MD* 🌌 》════════╗\n`;
        menuText += `║      ⚡ *PREMIUM CYBERPUNK EDITION* ⚡      ║\n`;
        menuText += `╚══════════════════════════════════════╝\n\n`;

        menuText += `${getGreeting()} ${m.pushName}! 👋\n\n`;

        menuText += `┏━━━━━━━━━ *BOT INFO* ━━━━━━━━━┓\n`;
        menuText += `┃ 🤖 *BOT:* BLACKSKY-MD PREMIUM\n`;
        menuText += `┃ 🔌 *LIBRARY:* Baileys MD\n`;
        menuText += `┃ 📊 *COMMANDS:* ${Object.keys(global.commands).length}\n`; //Corrected commands count.
        menuText += `┃ ⏱️ *TIME:* ${getCurrentTimeInNairobi()}\n`;
        menuText += `┃ 🔑 *PREFIX:* ${_p}\n`;
        menuText += `┃ 🔓 *MODE:* ${global.opts['self'] ? 'Self' : 'Public'}\n`; //Corrected mode display
        menuText += `┗━━━━━━━━━━━━━━━━━━━━━━━━━━━┛\n\n`;

        // Add command categories
        for (const category of categories) {
            const categoryPath = path.join(__dirname, `../${category.name}`);
            if (!fs.existsSync(categoryPath)) continue;

            const commandFiles = fs.readdirSync(categoryPath).filter(file => file.endsWith('.js'));

            menuText += `\n⭐ *${category.name.toUpperCase()}* ${category.emoji}\n`;
            menuText += `━━━━━━━━━━━━━━\n`;

            for (const file of commandFiles) {
                const commandName = file.replace('.js', '');
                menuText += `➤ 🔹 *_p + ${commandName}*\n`;
            }

            menuText += '\n';
        }

        menuText += `╔════════《 💡 *TIPS* 💡 》════════╗\n`;
        menuText += `║ • Type *_p help <command>* for detailed help\n`;
        menuText += `╚══════════════════════════════════════╝\n\n`;

        menuText += `⚡ *POWERED BY BLACKSKY-MD PREMIUM* ⚡\n`;
        menuText += `🌐 *Join Our Group:* ${groupLink}\n`;


        // Send text-only menu
        await conn.sendMessage(m.chat, {
            text: menuText,
            contextInfo: {
                mentionedJid: [m.sender],
                externalAdReply: {
                    title: '🌌 BLACKSKY-MD PREMIUM',
                    body: 'Advanced Cyberpunk WhatsApp Assistant',
                    mediaType: 1,
                    previewType: 0,
                    renderLargerThumbnail: false,
                    showAdAttribution: true,
                    sourceUrl: 'https://whatsapp.com/channel/0029Va8ZH8fFXUuc69TGVw1q'
                }
            }
        }, { quoted: m });

    } catch (error) {
        console.error('Menu error:', error);
        m.reply('❌ An error occurred while generating the menu');
    }
};

handler.help = ['menu'];
handler.tags = ['main'];
handler.command = /^(menu|help|\?)$/i;

module.exports = handler;