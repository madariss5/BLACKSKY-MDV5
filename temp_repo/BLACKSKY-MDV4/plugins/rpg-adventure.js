const { getMessage } = require('../lib/languages');

let handler = async (m, { conn, usedPrefix, owner }) => {
    try {
        // Get user's preferred language
        const user = global.db.data.users[m.sender];
        const chat = global.db.data.chats[m.chat];
        const lang = user?.language || chat?.language || global.language || 'en';

        // Check if the user has both sword and armor
        if (!user.sword) {
            conn.reply(m.chat, getMessage('rpg_adventure_no_sword', lang, { prefix: usedPrefix  || {}}), m);
            return;
        }

        if (!user.armor) {
            conn.reply(m.chat, getMessage('rpg_adventure_no_armor', lang, { prefix: usedPrefix  || {}}), m);
            return;
        }

        let __timers = (new Date - user.lastadventure);
        let _timers = (600000 - __timers); // 10 minutes in milliseconds
        let timers = clockString(_timers);
        
        if (user.healt > 79) {
            if (new Date - user.lastadventure > 600000) { // 10 minutes cooldown
                // Send adventure start message
                conn.reply(m.chat, getMessage('rpg_adventure_start', lang, { location: '...'  || {}}), m);
                
                // Define monsters
                let monsters = [
                    { name: 'Goblin', health: 20, attack: 5 },
                    { name: 'Troll', health: 50, attack: 10 },
                    { name: 'Dragon', health: 100, attack: 20 },
                    { name: 'Zombie', health: 30, attack: 7 },
                    { name: 'Vampire', health: 40, attack: 15 },
                    { name: 'Werewolf', health: 70, attack: 17 },
                    { name: 'Skeleton', health: 25, attack: 8 },
                    { name: 'Orc', health: 60, attack: 12 },
                    { name: 'Witch', health: 45, attack: 14 },
                    { name: 'Golem', health: 80, attack: 18 },
                    { name: 'Demon', health: 120, attack: 25 },
                    { name: 'Phoenix', health: 150, attack: 30 },
                    { name: 'Hydra', health: 200, attack: 35 },
                    { name: 'Kraken', health: 250, attack: 40 },
                    { name: 'Minotaur', health: 300, attack: 45 },
                    { name: 'Basilisk', health: 350, attack: 50 },
                    { name: 'Griffin', health: 400, attack: 55 },
                    { name: 'Cyclops', health: 450, attack: 60 },
                    { name: 'Chimera', health: 500, attack: 65 },
                    { name: 'Leviathan', health: 550, attack: 70 }
                ];

                // Define bosses
                let bosses = [
                    { name: 'Ancient Dragon', health: 1000, attack: 100 },
                    { name: 'Dark Lord', health: 1200, attack: 120 },
                    { name: 'Titan', health: 1500, attack: 150 },
                    { name: 'Elder God', health: 2000, attack: 200 }
                ];

                // Pick a random monster or boss
                let isBoss = Math.random() < 0.1; // 10% chance to encounter a boss
                let enemy = isBoss ? bosses[Math.floor(Math.random() * bosses.length)] : monsters[Math.floor(Math.random() * monsters.length)];
                let enemyHealth = enemy.health;
                let enemyAttack = enemy.attack;

                // Simulate battle
                let userAttack = 10; // Example user attack power
                while (user.healt > 0 && enemyHealth > 0) {
                    enemyHealth -= userAttack;
                    if (enemyHealth > 0) {
                        user.healt -= enemyAttack;
                    }
                }

                if (user.healt <= 0) {
                    conn.reply(m.chat, getMessage('rpg_adventure_battle_lost', lang, { enemy: enemy.name  || {}}), m);
                    return;
                }

                // Generate rewards
                let _healt = `${Math.floor(Math.random() * 101)}`.trim();
                let healt = (_healt * 1);
                let exp = `${Math.floor(Math.random() * 10000)}`.trim();
                let money = `${Math.floor(Math.random() * 100000)}`.trim();
                let _potion = ['1', '2', '3'];
                let potion = _potion[Math.floor(Math.random() * _potion.length)];
                let _sampah = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22', '23', '24', '25', '26', '27', '28', '29', '30', '31', '32', '33', '34', '35', '36', '37', '38', '39', '40', '41', '42', '43', '44', '45', '46', '47', '48', '49', '50'];
                let sampah = _sampah[Math.floor(Math.random() * _sampah.length)];
                let _diamond = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'];
                let diamond = _diamond[Math.floor(Math.random() * _diamond.length)];
                let _common = ['1', '2', '3'];
                let common = _common[Math.floor(Math.random() * _common.length)];
                let _uncommon = ['1', '2', '1', '2'];
                let uncommon = _uncommon[Math.floor(Math.random() * _uncommon.length)];
                let _mythic = `${pickRandom(['1', '3', '1', '1', '2'])}`;
                let mythic = (_mythic * 1);
                let _legendary = `${pickRandom(['1', '3', '1', '1', '2'])}`;
                let legendary = (_legendary * 1);
                
                // Random locations
                let peta = pickRandom([
                    '🏯 Japan', '🇰🇷 Korea', '🏝️ Bali', '🇺🇸 America', '🇮🇶 Iraq', '🇸🇦 Arabia', '🇵🇰 Pakistan', 
                    '🇩🇪 Germany', '🇫🇮 Finland', '💤 Dream World', '🌍 Edge of the World', '🔴 Mars', '🇿🇼 Zimbabwe', 
                    '🌕 Moon', '🔵 Pluto', '☀️ Sun', '💖 Someone\'s Heart', '🌲 Amazon Forest', '🏜️ Sahara Desert', 
                    '🏔️ Himalayan Mountains', '🌊 Atlantic Ocean', '🏰 Abandoned Castle', '🌌 Andromeda Galaxy', 
                    '🏞️ Grand Canyon', '🏜️ Death Valley', '🏕️ Yosemite', '🏖️ Maldives', '🏙️ New York', '🇮🇳 India',
                    '🇧🇷 Brazil', '🇿🇦 South Africa', '🇦🇺 Australia', '🇨🇦 Canada', '🇷🇺 Russia', '🇲🇽 Mexico', '🇳🇿 New Zealand',
                    '🏞️ Patagonia', '🇫🇷 France', '🇪🇸 Spain', '🇮🇹 Italy', '🇬🇧 United Kingdom', '🇨🇭 Switzerland'
                ]);
                
                // Prepare message components
                let potionText = potion == 0 ? '' : `\n🧪 *${getMessage('rpg_item_potion', lang)}:* ${potion}`;
                let diamondText = diamond == 0 ? '' : `\n💎 *${getMessage('rpg_item_diamond', lang)}:* ${diamond}`;
                let crateText = `${common == 0 ? '' : `\n📦 *${getMessage('rpg_item_common_crate', lang)}:* ${common}`}${uncommon == 0 ? '' : `\n🎁 *${getMessage('rpg_item_uncommon_crate', lang)}:* ${uncommon}`}`;
                
                // Generate rewards message
                let rewardsText = getMessage('rpg_adventure_rewards', lang, {
                    health: healt * 1,
                    location: peta,
                    enemy: enemy.name,
                    exp: exp,
                    money: money,
                    tickets: 1,
                    trash: sampah,
                    potion: potionText,
                    diamond: diamondText,
                    crates: crateText
                });
                
                // Rare item message
                let itemrand = [
                    getMessage('rpg_adventure_rare_item', lang, { amount: mythic, item: 'Mythic' }),
                    getMessage('rpg_adventure_rare_item', lang, { amount: legendary, item: 'Legendary' })
                ];
                let rendem = itemrand[Math.floor(Math.random() * itemrand.length)];

                // Send rewards message with delay
                setTimeout(() => {
                    conn.reply(m.chat, rewardsText, m, {
                        contextInfo: {
                            externalAdReply: {
                                mediaType: 1,
                                title: 'BETABOTZ RPG',
                                thumbnailUrl: 'https://telegra.ph/file/221ec27b2997f203569eb.jpg',
                                renderLargerThumbnail: true,
                                sourceUrl: ''
                            }
                        }
                    });
                }, 0);
                
                // Send rare item message with delay
                setTimeout(() => {
                    conn.reply(m.chat, rendem, m);
                }, 1000);

                // Update user data
                user.healt -= healt * 1;
                user.exp += exp * 1;
                user.tiketcoin += 1;
                user.money += money * 1;
                user.potion += potion * 1;
                user.diamond += diamond * 1;
                user.common += common * 1;
                user.uncommon += uncommon * 1;
                user.sampah += sampah * 1;
                user.mythic += mythic * 1;
                user.legendary += legendary * 1;
                user.lastadventure = new Date * 1;

                // Decrease sword and armor durability
                user.sworddurability -= 1;
                user.armordurability -= 1;

                // Check for broken sword or armor
                if (user.sworddurability <= 0) {
                    user.sword = false;
                    conn.reply(m.chat, getMessage('rpg_adventure_broken_sword', lang), m);
                }
                if (user.armordurability <= 0) {
                    user.armor = false;
                    conn.reply(m.chat, getMessage('rpg_adventure_broken_armor', lang), m);
                }
            } else {
                conn.reply(m.chat, getMessage('rpg_adventure_exhausted', lang, { time: timers }), m);
            }
        } else {
            conn.reply(m.chat, getMessage('rpg_adventure_need_health', lang, { 
                amount: 80,
                prefix: usedPrefix
            }), m);
        }
    } catch (e) {
        console.log(e);
        conn.reply(m.chat, 'Error', m);
    }
};

handler.help = ['adventure'];
handler.tags = ['rpg'];
handler.command = /^(adventure)$/i;
handler.limit = true;
handler.group = true;
handler.rpg = true;
handler.fail = null;

module.exports = handler;

function pickRandom(list) {
    return list[Math.floor(Math.random() * list.length)];
}

function clockString(ms) {
    let h = Math.floor(ms / 3600000); // Hours
    let m = Math.floor(ms / 60000) % 60; // Minutes
    let s = Math.floor(ms / 1000) % 60; // Seconds
    return [h, m, s].map(v => v.toString().padStart(2, 0)).join(':');
}