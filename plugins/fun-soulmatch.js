const { getMessage } = require('../lib/languages');

const moment = require('moment-timezone');

let handler = async (m, { text, conn }) => {
    // Get the user's preferred language
    const user = global.db.data.users[m.sender];
    const chat = global.db.data.chats[m.chat];
    const lang = user?.language || chat?.language || global.language;
    
    if (!text) {
        return m.reply(`╭═══❯ *${getMessage('soulmatch_title', lang)}* ❮═══
│
│ ${getMessage('soulmatch_usage', lang)}
│
╰════════════════════`);
    }

    try {
        const [nama1, nama2] = text.split("|").map(name => name.trim());

        if (!nama2) {
            return m.reply(getMessage('soulmatch_format_error', lang));
        }

        const generateSoulData = (name, previousElement) => {
            const numerologyValue = name.toLowerCase().split('')
                .map(char => char.charCodeAt(0) - 96)
                .reduce((a, b) => a + b, 0) % 9 + 1;

            // Translated elements
            const elements = [
                getMessage('element_fire', lang), 
                getMessage('element_water', lang), 
                getMessage('element_earth', lang), 
                getMessage('element_wind', lang), 
                getMessage('element_lightning', lang), 
                getMessage('element_ice', lang), 
                getMessage('element_light', lang), 
                getMessage('element_shadow', lang)
            ];

            let element;
            do {
                element = elements[Math.floor(Math.random() * elements.length)];
            } while (element === previousElement); 

            const zodiacSigns = ['♈ Aries', '♉ Taurus', '♊ Gemini', '♋ Cancer', '♌ Leo', '♍ Virgo', 
                                 '♎ Libra', '♏ Scorpio', '♐ Sagittarius', '♑ Capricorn', '♒ Aquarius', '♓ Pisces'];
            const zodiac = zodiacSigns[Math.floor(Math.random() * zodiacSigns.length)]; 

            return { numerologyValue, element, zodiac };
        };

        let previousElement = null; 
        const soul1 = generateSoulData(nama1, previousElement);
        previousElement = soul1.element; 

        const soul2 = generateSoulData(nama2, previousElement);

        const calculateCompatibility = () => Math.floor(Math.random() * 100) + 1;

        const compatibility = calculateCompatibility();

        // Translated soul types
        const soulTypes = [
            getMessage('soul_type_1', lang),
            getMessage('soul_type_2', lang),
            getMessage('soul_type_3', lang),
            getMessage('soul_type_4', lang),
            getMessage('soul_type_5', lang),
            getMessage('soul_type_6', lang),
            getMessage('soul_type_7', lang),
            getMessage('soul_type_8', lang),
            getMessage('soul_type_9', lang)
        ];

        const getRandomSoulType = () => soulTypes[Math.floor(Math.random() * soulTypes.length)];

        const getMatchDescription = (score) => {
            if (score >= 90) return getMessage('match_true_destiny', lang);
            if (score >= 80) return getMessage('match_perfect_harmony', lang);
            if (score >= 70) return getMessage('match_strong_connection', lang);
            if (score >= 60) return getMessage('match_good_potential', lang);
            if (score >= 50) return getMessage('match_needs_work', lang);
            return getMessage('match_difficult_challenge', lang);
        };

        const generateSoulReading = (compatibility) => {
            if (compatibility >= 90) return getMessage('reading_90plus', lang);
            if (compatibility >= 80) return getMessage('reading_80plus', lang);
            if (compatibility >= 70) return getMessage('reading_70plus', lang);
            if (compatibility >= 60) return getMessage('reading_60plus', lang);
            if (compatibility >= 50) return getMessage('reading_50plus', lang);
            return getMessage('reading_below50', lang);
        };

        const caption = `╭═══❯ *${getMessage('soulmatch_title', lang)}* ❮═══
│
│ 👤 *${nama1}*
│ ├ 🔮 ${getMessage('soulmatch_soul_type', lang)}: ${getRandomSoulType()}
│ ├ 🌟 ${getMessage('soulmatch_element', lang)}: ${soul1.element}
│ └ 🎯 ${getMessage('soulmatch_zodiac', lang)}: ${soul1.zodiac}
│
│ 👤 *${nama2}*
│ ├ 🔮 ${getMessage('soulmatch_soul_type', lang)}: ${getRandomSoulType()}
│ ├ 🌟 ${getMessage('soulmatch_element', lang)}: ${soul2.element}
│ └ 🎯 ${getMessage('soulmatch_zodiac', lang)}: ${soul2.zodiac}
│
│ 💫 *${getMessage('soulmatch_compatibility', lang)}*
│ ├ 📊 ${getMessage('soulmatch_score', lang)}: ${compatibility}%
│ └ 🎭 ${getMessage('soulmatch_status', lang)}: ${getMatchDescription(compatibility)}
│
│ 🔮 *${getMessage('soulmatch_reading', lang)}*
${generateSoulReading(compatibility)}
│
╰════════════════════

📅 *${getMessage('soulmatch_analysis_date', lang)}* ${moment().tz('Asia/Jakarta').format('DD/MM/YYYY HH:mm:ss')}`;

        return m.reply(caption);

    } catch (error) {
        console.error('Error in soulmatch command:', error);
        return m.reply(`╭══════════════════════
│ ${getMessage('soulmatch_error', lang)}
╰═════════════════════`);
    }
};

handler.help = ['soulmatch'];
handler.tags = ['fun'];
handler.command = /^soulmatch$/i;
handler.group = true;
handler.limit = 1;

module.exports = handler;


//base by DEVOLUTION-MD1
//recode by danaputra133