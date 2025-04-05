const { getMessage } = require('../lib/languages.js');
module.exports = {
    before: async function (m) {
        this.automakan= this.automakan || {}
        let who = m.mentionedJid && m.mentionedJid[0] ? m.mentionedJid[0] : m.fromMe ? this.user.jid : m.sender
        let id = m.chat
        // var utama
        let jadwalmakan = {
                makanpagi: "07:00",
                makansiang: "12:00",
                makanmalam: "19:00",
                makantengahmalam: "23:00",

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
    
        for (const [eat, time] of Object.entries(jadwalmakan)) {
            if (timeNow === time && !(id in this.automakan)) {
                let caption = `Hai kak @${who.split`@`[0]},\nWaktu *${eat}* has tiba, ambilah nasi dan lauk dan segera eat.\n\n*${timeNow}*\nSegera isi perutmu dengan food which *bergizi!*\neatlah dengan full rasa syukur dan nikdead setiap suapannya!`
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
    







// module.exports = {
//     before: async function (m) {
//         this.autoeat= this.autoeat || {}
//         let who = m.mentionedJid && m.mentionedJid[0] ? m.mentionedJid[0] : m.fromMe ? this.user.jid : m.sender
//         let id = m.chat
//         // var utama
//         let jadwaleat = {
//                 makapagi: "07:00",
//                 makapagi: "07:01",
//                 makapagi: "07:02",
//                 makapagi: "07:03",
//                 makapagi: "07:04",
//                 makapagi: "07:05",
//                 eatsiang: "12:00",
//                 eatsiang: "12:01",
//                 eatsiang: "12:02",
//                 eatsiang: "10:13",
//                 eatsiang: "12:04",
//                 eatsiang: "12:05",
//                 eatmalam: "19:00",
//                 eatmalam: "19:01",
//                 eatmalam: "19:02",
//                 eatmalam: "19:03",
//                 eatmalam: "19:04",
//                 eatmalam: "19:05",
//             }
//         const date = new Date((new Date).toLocaleString("en-US", {
//             timeZone: "Asia/Jakarta"
//         }));
//         const hours = date.getHours();
//         const minutes = date.getMinutes();
//         const timeNow = `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`;
//         let isActive = Object.values(this.autoeat).includes(true);
//         if (id in this.autoeat && isActive) {
//             return false
//         }
    
//         for (const [eat, waktuTime] of Object.entries(jadwaleat)) {
//             if (timeNow === waktuTime && !(id in this.autoeat)) {
//                 let caption = `Hai kak @${who.split`@`[0]},\nWaktu *${eat}* has tiba, ambilah nasi dan lauk dan segera eat.\n\n*${timeNow}*\nSegera isi perutmu dengan food which *bergizi!*\neatlah dengan full rasa syukur dan nikdead setiap suapannya!`
//                 this.autoeat[id] = [
//                     this.reply(m.chat, caption, null, {
//                         contextInfo: {
//                             mentionedJid: [who]
//                         }
//                     }),
//                     setTimeout(() => {
//                         delete this.autoeat[id]
//                     }, 57000)
//                 ]
//             }
//         }
//     },
//     disabled: false
//     }
    