const { getMessage } = require('../lib/languages');

module.exports = {
before: async function (m) {
    this.autosholat = this.autosholat || {}
    let who = m.mentionedJid && m.mentionedJid[0] ? m.mentionedJid[0] : m.fromMe ? this.user.jid : m.sender
    let id = m.chat
    let jadwalSholat = {
            Fajr: "04:49",
            Sunrise: "06:04",
            Dhuhr: "12:06",
            Asr: "15:21",
            Sunset: "18:08",
            Maghrib: "18:08",
            Isha: "19:38",
            Imsak: "04:39",
            Midnight: "00:06",
            Firstthird: "22:07",
            Lastthird: "02:06"
        }
    const date = new Date((new Date).toLocaleString("en-US", {
        timeZone: "Asia/Jakarta"
    }));
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const timeNow = `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`;
    let isActive = Object.values(this.autosholat).includes(true);
    if (id in this.autosholat && isActive) {
        return false
    }

    // Get user's preferred language
    const user = global.db.data.users[who];
    const chat = global.db.data.chats[id];
    const lang = user?.language || chat?.language || global.language;

    for (const [prayer, time] of Object.entries(jadwalSholat)) {
        if (timeNow === time && !(id in this.autosholat)) {
            let caption = getMessage('prayer_time_notification', lang, {
                user: who.split`@`[0],
                prayer: prayer,
                time: time
            }) || `Hello @${who.split`@`[0]},\nIt's time for *${prayer}* prayer, please take wudhu and pray.\n\n*${time}*\n_for Jakarta and surrounding areas._`;
            
            this.autosholat[id] = [
                this.reply(m.chat, caption, null, {
                    contextInfo: {
                        mentionedJid: [who]
                    }
                }),
                setTimeout(() => {
                    delete this.autosholat[id]
                }, 57000)
            ]
        }
    }
},
disabled: true
}
