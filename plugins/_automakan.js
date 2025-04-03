const { getMessage } = require('../lib/languages');

module.exports = {
    before: async function (m) {
        this.automakan = this.automakan || {}
        
        // Get user's preferred language
        const user = global.db.data.users[m.sender];
        const chat = global.db.data.chats[m.chat];
        const lang = user?.language || chat?.language || 'en'; // Default to English
        
        let who = m.mentionedJid && m.mentionedJid[0] ? m.mentionedJid[0] : m.fromMe ? this.user.jid : m.sender
        let id = m.chat
        
        // Meal schedule
        let mealSchedule = {
            breakfast: "07:00",
            lunch: "12:00",
            dinner: "19:00",
            midnight_snack: "23:00",
        }
        
        const date = new Date((new Date).toLocaleString("en-US", {
            timeZone: "Asia/Jakarta"
        }));
        const hours = date.getHours();
        const minutes = date.getMinutes();
        const timeNow = `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`;
        
        let isActive = Object.values(this.automakan).includes(true);
        if (id in this.automakan && isActive) {
            return false
        }
    
        for (const [mealType, time] of Object.entries(mealSchedule)) {
            if (timeNow === time && !(id in this.automakan)) {
                // Get translated reminder message with parameters
                const caption = getMessage('meal_reminder', lang, {
                    user: who.split`@`[0],
                    mealType: mealType,
                    time: time
                });
                
                this.automakan[id] = [
                    this.reply(m.chat, caption, null, {
                        contextInfo: {
                            mentionedJid: [who]
                        }
                    }),
                    setTimeout(() => {
                        delete this.automakan[id]
                    }, 57000)
                ]
            }
        }
    },
    disabled: false
}