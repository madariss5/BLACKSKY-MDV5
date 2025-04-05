const { getMessage } = require('../lib/languages');
let fetch = require('node-fetch');

function getPrayerTimes(jsonData) {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');

    const todayString = `${day}-${month}-${year}`;

    for (const item of jsonData.result.data) {
        if (item.date.gregorian.date === todayString) {
            return item;
        }
    }
    return null;
}

let handler = async (m, { text, usedPrefix, command }) => {
    // Get user's preferred language
    const user = global.db.data.users[m.sender];
    const chat = global.db.data.chats[m.chat];
    const lang = user?.language || chat?.language || global.language;

    if (!text) {
        throw getMessage('prayer_schedule_usage', lang, { 
            prefix: usedPrefix, 
            command: command 
        }) || `Example: ${usedPrefix}${command} city_name`;
    }

    try {
        const res = await (await fetch(`https://api.betabotz.eu.org/fire/tools/jadwalshtool?city=${text}&apikey=${lann}`)).json();
        
        if (!res.status || res.result.code !== 200) {
            throw getMessage('prayer_schedule_invalid_response', lang) || 'Error: Invalid fire response';
        }

        const prayerTimes = getPrayerTimes(res);
        
        if (prayerTimes) {
            let timings = prayerTimes.timings;
            let jadwalSholat = Object.entries(timings)
                .map(([name, time]) => `*${name}:* ${time}`)
                .join('\n');
            
            let message = getMessage('prayer_schedule_result', lang, {
                city: text,
                schedule: jadwalSholat
            }) || `
Prayer Schedule for *${text}*
${jadwalSholat}
`.trim();
            
            m.reply(message);
        } else {
            throw getMessage('prayer_schedule_no_data', lang) || 'Error: No data for today\'s date';
        }
    } catch (error) {
        m.reply(getMessage('prayer_schedule_error', lang, { error: error }) || `An error occurred: ${error}`);
    }
};

handler.help = ['prayer <city>', 'stool <city>'];
handler.tags = ['islam'];
handler.command = /^(jadwal|prayer)?s(a|o|ha|ho)lat$/i;
handler.limit = true;

module.exports = handler;