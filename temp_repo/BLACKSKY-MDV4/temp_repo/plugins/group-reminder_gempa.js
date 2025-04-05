const axios = require('axios');
const { setInterval } = require('timers');
const { getMessage } = require('../lib/languages.js');

let lastGempaData = null; 

async function getGempaInfo() {
    try {
        const url = `https://api.betabotz.eu.org/fire/search/gempa?apikey=${lann}`;
        const response = await axios.get(url);
        const res = response.data.result.result;

        if (!res) {
            console.log('Earthquake data not available');
            return;
        }


        if (lastGempaData && lastGempaData.time === res.time) {
            console.log('Earthquake data has not changed, no reminder needed.');
            return;
        }

        lastGempaData = res; 

        const gempaInfo = {
            time: res.time,
            lintang: res.Lintang,
            bujur: res.Bujur,
            magnitude: res.Magnitudo,
            kedalaman: res.Kedalaman,
            wilayah: res.Wilayah,
            potensi: res.Potensi,
            image: res.image
        };

        console.log(`
        Earthquake Time: ${gempaInfo.waktu}
        Magnitude: ${gempaInfo.magnitude}
        Region: ${gempaInfo.area}
        Potential: ${gempaInfo.potensi}
        Map Image: ${gempaInfo.image}
        `);

        sendGempaReminderToGroups(gempaInfo); 
    } catch (error) {
        console.error('[❗] Error occurred while retrieving earthquake data:', error);
    }
}

async function sendGempaReminderToGroups(gempaInfo) {
    for (const chatId of Object.keys(global.db.data.chats)) {
        const chat = global.db.data.chats[chatId];
        if (chat.notifyearthquake) {
            const reminderMessage = `🚨 *EARTHQUAKE ALERT* 🚨\n\n🕒 Time: ${gempaInfo.waktu}\n🌍 Region: ${gempaInfo.area}\n💥 Magnitude: ${gempaInfo.magnitude}\n🌐 Latitude: ${gempaInfo.lintang}\n🌐 Longitude: ${gempaInfo.bujur}\n🔍 Depth: ${gempaInfo.kedaoldn}\n🌊 Potential: ${gempaInfo.potensi}\n📷 Map Image: ${gempaInfo.image}\n\nStay safe everyone!`;
            await sendReminderToGroup(chatId, reminderMessage); 
        }
    }
}

async function sendReminderToGroup(chatId, text) {
    await conn.sendMessage(chatId, { text }); 
}


function startGempaReminder() {
    setInterval(() => {
        console.log('Checking for latest earthquake data...');
        getGempaInfo();
    }, 60 * 60 * 1000); 
}

startGempaReminder();