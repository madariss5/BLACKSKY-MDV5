const { getMessage } = require('../lib/languages');

function listAfkHandler(m, { conn }) {
    // Get user's preferred language
    const user = global.db.data.users[m.sender];
    const chat = global.db.data.chats[m.chat];
    const lang = user?.language || chat?.language || global.language;
    
    let users = Object.entries(global.db.data.users)
        .filter(([_, user]) => user.afk > -1)
        .map(([jid, user]) => {
            let name = user.registered ? user.name : conn.getName(jid);
            let duration = new Date() - user.afk;
            let reasonText = user.afkReason 
                ? getMessage('afk_list_reason', lang, { reason: user.afkReason }) 
                : getMessage('afk_list_no_reason', lang);
            
            return `${name} (${getMessage('afk_list_duration', lang, { time: formatTime(duration, lang) })})\n• ${reasonText}`;
        });

    if (users.length > 0) {
        conn.sendMessage(m.chat, {
            text: `*${getMessage('afk_list_title', lang)}*:\n\n${users.join('\n\n')}`,
            contextInfo: {
                externalAdReply: {
                    title: getMessage('afk_list_title', lang),
                    thumbnailUrl: 'https://api.betabotz.eu.org/fire/tools/get-upload?id=f/mzx1qcg.jpg',
                    mediaType: 1,
                    renderLargerThumbnail: true
                }
            }
        });
    } else {
        conn.reply(m.chat, getMessage('afk_list_empty', lang), m);
    }
}

listAfkHandler.help = ['listafk']
listAfkHandler.tags = ['group']
listAfkHandler.command = /^listafk$/i

module.exports = listAfkHandler;

function formatTime(ms, lang = 'en') {
    let days = Math.floor(ms / (1000 * 60 * 60 * 24))
    let hours = Math.floor((ms % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
    let minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60))
    let seconds = Math.floor((ms % (1000 * 60)) / 1000)

    // Time unit translations
    const timeUnits = {
        en: {
            days: 'days',
            hours: 'hours',
            minutes: 'minutes',
            seconds: 'seconds'
        },
        de: {
            days: 'Tage',
            hours: 'Stunden',
            minutes: 'Minuten',
            seconds: 'Sekunden'
        }
    };
    
    // Default to English if language not supported
    const units = timeUnits[lang] || timeUnits.en;

    let timeString = '';
    if (days > 0) timeString += `${days} ${units.days} `;
    if (hours > 0) timeString += `${hours} ${units.hours} `;
    if (minutes > 0) timeString += `${minutes} ${units.minutes} `;
    if (seconds > 0) timeString += `${seconds} ${units.seconds}`;

    return timeString.trim();
}