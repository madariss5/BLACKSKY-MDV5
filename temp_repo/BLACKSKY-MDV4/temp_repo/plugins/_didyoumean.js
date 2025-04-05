// Thanks To Kasan
const { getMessage } = require('../lib/languages');

let didyoumean = require('didyoumean');

// Custom similarity function implementation
function similarity(s1, s2) {
    if (!s1 || !s2) return 0;
    
    // Convert both strings to lowercase to ensure case-insensitive comparison
    s1 = s1.toLowerCase();
    s2 = s2.toLowerCase();
    
    // Calculate the Levenshtein distance between the two strings
    const track = Array(s2.length + 1).fill(null).map(() => 
        Array(s1.length + 1).fill(null));
    
    for (let i = 0; i <= s1.length; i += 1) {
        track[0][i] = i;
    }
    
    for (let j = 0; j <= s2.length; j += 1) {
        track[j][0] = j;
    }
    
    for (let j = 1; j <= s2.length; j += 1) {
        for (let i = 1; i <= s1.length; i += 1) {
            const indicator = s1[i - 1] === s2[j - 1] ? 0 : 1;
            track[j][i] = Math.min(
                track[j][i - 1] + 1, // deletion
                track[j - 1][i] + 1, // insertion
                track[j - 1][i - 1] + indicator, // substitution
            );
        }
    }
    
    // Calculate similarity as a ratio of 0-1
    const maxLength = Math.max(s1.length, s2.length);
    if (maxLength === 0) return 1; // Both strings empty
    
    return 1 - (track[s2.length][s1.length] / maxLength);
}

let handler = m => m

handler.before = function (m, { match, usedPrefix, text, args }) {
        if ((usedPrefix = (match[0] || '')[0])) {
                // Get user's preferred language
                const user = global.db.data.users[m.sender];
                const chat = global.db.data.chats[m.chat];
                const lang = user?.language || chat?.language || global.language;
                
                let noPrefix = m.text.replace(usedPrefix, '').trim()
                let args = noPrefix.trim().split` `.slice(1)
                let alias = Object.values(global.plugins).filter(v => v.help && !v.disabled).map(v => v.help).flat(1)
                if (alias.includes(noPrefix)) return
                let mean = didyoumean(noPrefix, alias)
                let sim = similarity(noPrefix, mean)
                let som = sim * 100
                
                // Get translated message
                let tio = getMessage('didyoumean_suggestion', lang, {
                        user: m.sender.split`@`[0],
                        command: usedPrefix + mean,
                        similarity: parseInt(som)
                }) || `• Hello @${m.sender.split`@`[0]}  Are you looking for ${usedPrefix + mean}? 

 ◦ Menu name: *${usedPrefix + mean}* 
 ◦ Simirunty: *${parseInt(som)}%*`
                
                if (mean) this.relayMessage(m.chat, {
                        requestPaymentMessage: {
                                currencyCodeIso4217: 'IDR',
                                requestFrom: '0@s.whatsapp.net',
                                noteMessage: {
                                        extendedTextMessage: {
                                                text: tio,
                                                contextInfo: {
                                                        mentionedJid: [m.sender],
                                                        externalAdReply: {
                                                                showAdAttribution: true
                                                        }
                                                }
                                        }
                                }
                        }
                }, {})
        }
}

module.exports = handler
