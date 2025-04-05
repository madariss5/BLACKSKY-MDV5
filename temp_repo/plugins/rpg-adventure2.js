const { getMessage } = require('../lib/languages.js');
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

function createAdventures() {
    const areaNames = [
        "Deep Forest", "Hidden Village", "Mysterious Cave", "Mountain Peak", "Remote Lake",
        "Green Valley", "Abandoned Castle", "Secret Island", "Dark Forest", "Ancient Ruins",
        "Forgotten Temple", "Battlefield", "Refugee Camp", "Bamboo Forest", "Beach Village",
        "Snow Forest", "Desert", "Crystal Cave", "Pirate Camp", "Misty Swamp",
        "Volcanic Mountain", "Underwater Cave", "Ice Palace", "Stormy Ocean", "Dragon Cave"
    ];

    let adventurings = areaNames.map((areaName, i) => ({
        area: `Adventure in ${areaName}`,
        txt: areaName.toLowerCase().replace(/ /g, "_"),
        reward: {
            exp: 50 + (i * 50),
            loot: {
                potion: Math.floor(Math.random() * 10) + 1,
                diamond: Math.floor(Math.random() * 5) + 1,
                gold: Math.floor(Math.random() * 10) + 1,
                money: Math.floor(Math.random() * (50000 - 1000 + 1)) + 1000,
                limit: Math.floor(Math.random() * 10) + 1
            }
        }
    }));
    return adventurings;
}

function formatTime(ms) {
    let d = isNaN(ms) ? '--' : Math.floor(ms / 86400000);
    let h = isNaN(ms) ? '--' : Math.floor(ms / 3600000) % 24;
    let m = isNaN(ms) ? '--' : Math.floor(ms / 60000) % 60;
    let s = isNaN(ms) ? '--' : Math.floor(ms / 1000) % 60;
    return ['\n' + d, ' *days ☀️*\n', h, ' *hours 🕐*\n', m, ' *minutes ⏰*\n', s, ' *seconds ⏱️*'].map(v => v.toString().padStart(2, 0)).join('');
}

async function handler(m, { conn, text }) {
    conn.adventuring = conn.adventuring || {};
    let user = global.db.data.users[m.sender];

    if (m.sender in conn.adventuring) {
        if (conn.adventuring[m.sender].currentArea >= conn.adventuring[m.sender].areas.length) {
            return m.reply("🏆 You have completed all adventure areas.");
        }
        return m.reply("⏳ You still have adventure areas that are not yet completed. Please complete them first.");
    } else {
        if (text === 'start') {
            let adventurings = createAdventures();

            if (!user) return m.reply("📝 Please sign up to play the game.");
            if (user.healt === 0 || user.stamina === 0) return m.reply("❗ Your stamina/health is below 100.");
            if (typeof user.exp !== "number") global.db.data.users[m.sender].exp = 0;
            if (typeof user.loot !== "object") global.db.data.users[m.sender].loot = { potion: 0, diamond: 0, gold: 0, money: 0, limit: 0 };
            if (typeof user.lastGameTime !== "number") global.db.data.users[m.sender].kerjasatu = 0;

            const cooldown = 5 * 60 * 1000; // 5 minutes cooldown
            let timers = cooldown - (Date.now() - (user.kerjasatu || 0));
            if (timers > 0) return m.reply(`Please wait ${formatTime(timers)} before starting a new adventure.`);

            let { area, txt, reward } = adventurings[0]; // Start with the first area
            let currentArea = 0;
            let adventureResults = 0;
            let totalReward = { potion: 0, diamond: 0, gold: 0, money: 0, limit: 0 };

            conn.adventuring[m.sender] = {
                areas: adventurings,
                currentArea,
                adventureResults,
                lastadventureTime: Date.now(),
                totalReward,
            };

            let caption = `🏞️ *ADVENTURE AREA:* ${area}\n\n🪓 Type *'${txt}'* to start an adventure in this area.\n🔍 Total adventure results that can be obtained: ${adventureResults}\n💰 Exp that can be obtained: ${reward.exp}\n🎁 Loot that can be obtained: Potion: ${reward.loot.potion}, Diamond: ${reward.loot.diamond}, Gold: ${reward.loot.gold}, Money: ${reward.loot.money}, Limit: ${reward.loot.limit}`;

            return m.reply(caption);
        } else {
            let instructions = "🏅 Welcome to the adventure game!\n";
            instructions += "Type *'adventuring2 start'* to start an adventure.\n";
            instructions += "Type *'stop'* to end the adventure while playing.";

            return m.reply(instructions);
        }
    }
}

handler.before = async m => {
    conn.adventuring = conn.adventuring || {};
    if (!(m.sender in conn.adventuring)) return;
    if (m.isBaileys) return;

    let { areas, currentArea, adventureResults, lastadventureTime, totalReward } = conn.adventuring[m.sender];
    const cooldown = 5 * 60 * 1000; // 5 minutes cooldown
    let user = global.db.data.users[m.sender];

    let msg = m.text.toLowerCase();
    if (msg === 'stop') {
        // Get user's preferred language
        const user = global.db.data.users[m.sender];
        const chat = global.db.data.chats[m.chat];
        const lang = user?.language || chat?.language || global.language;
        
        m.reply(getMessage('error', lang));
        delete conn.adventuring[m.sender];
        return false;
    } else if (currentArea < areas.length) {
        if (areas[currentArea].txt === msg) {
            let { area, reward } = areas[currentArea];
            user.exp += reward.exp;
            for (let item in reward.loot) {
                user.loot[item] += reward.loot[item];
                totalReward[item] += reward.loot[item];
            }
            adventureResults++;
            currentArea++;
            conn.adventuring[m.sender].currentArea = currentArea;
            conn.adventuring[m.sender].adventureResults = adventureResults;
            conn.adventuring[m.sender].totalReward = totalReward;
            conn.adventuring[m.sender].lastadventureTime = Date.now();

            if (currentArea >= areas.length) {
                m.reply(`🎉 Congratulations! You have completed all adventure areas.\nTotal adventure results: ${adventureResults}\nExp earned: ${reward.exp}\nTotal loot obtained: Potion: ${totalReward.potion}, Diamond: ${totalReward.diamond}, Gold: ${totalReward.gold}, Money: ${totalReward.money}, Limit: ${totalReward.limit}`);
                delete conn.adventuring[m.sender];
                return false;
            } else {
                let nextArea = areas[currentArea].area;
                let caption = `🏞️ *ADVENTURE AREA:* ${nextArea}\n\n🪓 Type *'${areas[currentArea].txt}'* to start an adventure in this area.\n🔍 Total adventure results that can be obtained: ${adventureResults}\n💰 Exp that can be obtained: ${reward.exp}\n🎁 Loot that can be obtained: Potion: ${reward.loot.potion}, Diamond: ${reward.loot.diamond}, Gold: ${reward.loot.gold}, Money: ${reward.loot.money}, Limit: ${reward.loot.limit}\n\n> Type *stop* to end the adventure`;
                m.reply(caption);
                return false;
            }
        }
    }
};

handler.help = ['adventuring2'];
handler.tags = ['rpg'];
handler.command = /^(adventuring2)$/i;
handler.group = true;
handler.limit = true;
handler.rpg = true;
handler.register = true;
module.exports = handler;