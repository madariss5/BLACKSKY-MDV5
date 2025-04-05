const { getMessage } = require('../lib/languages');

const fs = require('fs');

const premXP = 1000; // XP amount for premium users
const freeXP = 100; // XP amount for free users
const premMoney = 5000; // Money amount for premium users
const freeMoney = 1000; // Money amount for free users

let handler = async (m, {conn, text, isPrems}) => {
    // Get user's preferred language
    const user = global.db.data.users[m.sender];
    const chat = global.db.data.chats[m.chat];
    const lang = user?.language || chat?.language || global.language;
    
    let lastClaimTime = global.db.data.users[m.sender].lastclaim || 0;
    let currentTime = new Date().getTime();

    // Check if 24 hours (86400000 ms) have passed since last claim
    if (currentTime - lastClaimTime < 86400000) {
        const timeLeft = msToTime(86400000 - (currentTime - lastClaimTime));
        throw `🎁 *You have already collected your daily reward*\n\n🕚 Come back in *${timeLeft}*`;
    }

    // Add XP and money based on user type
    const xpReward = isPrems ? premXP : freeXP;
    const moneyReward = isPrems ? premMoney : freeMoney;
    
    global.db.data.users[m.sender].exp += xpReward;
    global.db.data.users[m.sender].money += moneyReward;
    
    m.reply(`
🎁 *Daily Reward Collected!*
*Keep active to earn more rewards*

🆙 *XP* : +${xpReward}
💰 *Money* : +${moneyReward}

💡 Check your balance with .balance
🎮 Try games with .slot, .rps, or .game`);

    // Update last claim time
    global.db.data.users[m.sender].lastclaim = currentTime;
}

handler.help = handler.command = ['daily'];
handler.tags = ['rpg'];
handler.rpg = true

module.exports = handler;

function msToTime(duration) {
    var milliseconds = parseInt((duration % 1000) / 100),
        seconds = Math.floor((duration / 1000) % 60),
        minutes = Math.floor((duration / (1000 * 60)) % 60),
        hours = Math.floor((duration / (1000 * 60 * 60)) % 24);

    hours = (hours < 10) ? "0" + hours : hours;
    minutes = (minutes < 10) ? "0" + minutes : minutes;
    seconds = (seconds < 10) ? "0" + seconds : seconds;

    return hours + " hours " + minutes + " minutes";
}