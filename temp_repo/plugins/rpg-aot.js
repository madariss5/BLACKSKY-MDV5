const { getMessage } = require('../lib/languages');

let handler = async (m, { conn, usedPrefix, owner }) => {
    // Get user's preferred language
    const user = global.db.data.users[m.sender];
    const chat = global.db.data.chats[m.chat];
    const lang = user?.language || chat?.language || global.language;
 {
    try {
        let user = global.db.data.users[m.sender]

        // Check if the user has both sword and armor
        if (!user.sword) {
            conn.reply(m.chat, '⚔️ You don\'t have a sword yet, Type *' + usedPrefix + 'craft sword* to start your adventure', m)
            return
        }

        if (!user.armor) {
            conn.reply(m.chat, '🛡️ You don\'t have armor yet, Type *' + usedPrefix + 'craft armor* to start your adventure', m)
            return
        }

        let __timers = (new Date - user.lastadventure)
        let _timers = (600000 - __timers) // 10 minutes in milliseconds
        let timers = clockString(_timers)
        if (user.healt > 79) {
            if (new Date - user.lastadventure > 600000) { // 10 minutes cooldown
                // Define Titans
                let monsters = [
                    { name: 'Pure Titan', health: 20, attack: 5 },
                    { name: 'Abnormal Titan', health: 50, attack: 10 },
                    { name: 'Armored Titan', health: 100, attack: 20 },
                    { name: 'Female Titan', health: 30, attack: 7 },
                    { name: 'Colossal Titan', health: 40, attack: 15 },
                    { name: 'Beast Titan', health: 70, attack: 17 },
                    { name: 'Cart Titan', health: 25, attack: 8 },
                    { name: 'Jaw Titan', health: 60, attack: 12 },
                    { name: 'War Hammer Titan', health: 45, attack: 14 },
                    { name: 'Attack Titan', health: 80, attack: 18 },
                    { name: 'Founding Titan', health: 120, attack: 25 },
                    { name: 'Ymir’s Titan', health: 150, attack: 30 },
                    { name: 'Rod Reiss Titan', health: 200, attack: 35 },
                    { name: 'Mindless Titan', health: 250, attack: 40 },
                    { name: 'Dina Fritz Titan', health: 300, attack: 45 },
                    { name: 'Smiling Titan', health: 350, attack: 50 },
                    { name: 'Grisha Yeager Titan', health: 400, attack: 55 },
                    { name: 'Frieda Reiss Titan', health: 450, attack: 60 },
                    { name: 'Eren Yeager Titan', health: 500, attack: 65 },
                    { name: 'Armin Arlert Titan', health: 550, attack: 70 }
                ]

                // Define Boss Titans
                let bosses = [
                    { name: 'Eren Yeager (Founding Titan)', health: 1000, attack: 100 },
                    { name: 'Zeke Yeager (Beast Titan)', health: 1200, attack: 120 },
                    { name: 'Reiner Braun (Armored Titan)', health: 1500, attack: 150 },
                    { name: 'Bertholdt Hoover (Colossal Titan)', health: 2000, attack: 200 }
                ]

                // Pick a random Titan or Boss Titan
                let isBoss = Math.random() < 0.1 // 10% chance to encounter a boss
                let enemy = isBoss ? bosses[Math.floor(Math.random() * bosses.length)] : monsters[Math.floor(Math.random() * monsters.length)]
                let enemyHealth = enemy.health
                let enemyAttack = enemy.attack

                // Simulate battle
                let userAttack = 10 // Example user attack power
                while (user.healt > 0 && enemyHealth > 0) {
                    enemyHealth -= userAttack
                    if (enemyHealth > 0) {
                        user.healt -= enemyAttack
                    }
                }

                if (user.healt <= 0) {
                    conn.reply(m.chat, `😵 You were defeated in battle against ${enemy.name}. Heal yourself first.`, m)
                    return
                }

                let _money = `${Math.floor(Math.random() * 100001)}`.trim()
                let money = (_money * 1)
                let exp = `${Math.floor(Math.random() * 10001)}`.trim()
                let kayu = `${Math.floor(Math.random() * 51)}`.trim()
                let batu = `${Math.floor(Math.random() * 51)}`.trim()
                let limit = `${Math.floor(Math.random() * 50) + 1}`.trim() // Random limit between 1 and 50
                let _stamina = `${Math.floor(Math.random() * 51)}`.trim()
                let stamina = (_stamina * 1)
                let _mythic = `${pickRandom(['1', '3', '1', '1', '2'])}`
                let mythic = (_mythic * 1)
                let _legendary = `${pickRandom(['1', '3', '1', '1', '2'])}`
                let legendary = (_legendary * 1)
                let itemrand = [`*Congratulations, you got a rare item*\n${mythic} 🎁 Mythic Crate`, `*Congratulations, you got a rare item*\n${legendary} 🎁 Legendary Crate`]
                let rendem = itemrand[Math.floor(Math.random() * itemrand.length)]
                let peta = pickRandom([
                    'Wall Maria', 'Wall Rose', 'Wall Sina', 'Shiganshina District', 'Trost District', 'Stohess District', 
                    'Ragako Village', 'Utgard Castle', 'Forest of Giant Trees', 'Warriors District', 'Yeagerist Base',
                    'Liberio', 'Marley', 'Paths', 'Fort Slava', 'Paradise Island', 'Mahr Headquarters', 'Odiha', 
                    'Port of Kiyomi', 'Hizuru', 'Port of Marley', 'Underground City', 'Southern Slums', 'Northern Slums',
                    'Eastern Slums', 'Western Slums', 'Training Grounds', 'Orvud District', 'Utopia District', 
                    'Klorva District', 'Karanes District', 'Kolkhoz Village'
                ])
                let str = `
🩸 Your *health* has decreased by -${userAttack * 1} because you adventured to *${map}* and fought *${enemy.name}*. You received:
⚗️ *Exp:* ${exp}
💵 *Money:* ${money}
🎟️ *Ticket Coin:* 1
🪵 *Wood:* ${wood}
🪨 *Stone:* ${stone}
🏷️ *Limit:* ${limit}
⚡ *stamina decreased:* -${stamina}
`.trim()

                setTimeout(() => {
                    conn.reply(m.chat, str, m, {
                        contextInfo: {
                            externalAdReply: {
                                mediaType: 1,
                                title: 'BETABOTZ RPG',
                                thumbnailUrl: 'https://telegra.ph/file/e615e0a6000ff647b4314.jpg',
                                renderLargerThumbnail: true,
                                sourceUrl: ''
                            }
                        }
                    })
                }, 0)
                setTimeout(() => {
                    conn.reply(m.chat, rendem, m)
                }, 1000)
                
                user.health -= userAttack * 1
                user.exp += exp * 1
                user.tiketcoin += 1
                user.money += money * 1
                user.kayu += kayu * 1
                user.batu += batu * 1
                user.stamina -= stamina // Decrease stamina by random value
                user.limit += limit * 1 // Increase limit
                user.lastadventure = new Date * 1

                // Decrease sword and armor durability
                user.sworddurability -= 1
                user.armordurability -= 1

                // Check for broken sword or armor
                if (user.sworddurability <= 0) {
                    user.sword = false
                    conn.reply(m.chat, '⚔️ Your sword has broken, craft a new one to continue adventuring.', m)
                }
                if (user.armordurability <= 0) {
                    user.armor = false
                    conn.reply(m.chat, '🛡️ Your armor has broken, craft a new one to continue adventuring.', m)
                }

            } else {
                conn.reply(m.chat, `💧 You've already adventured and are tired, please try again in *${timers}*`, m)
            }
        } else {
            conn.reply(m.chat, '🩸 You need at least 80 health to adventure, buy potions first by typing *' + usedPrefix + 'shop buy potion <amount>*\nand then Type *' + usedPrefix + 'use potion <amount>*', m)
        }
    } catch (e) {
        console.log(e)
        conn.reply(m.chat, 'Error', m)
    }
}

handler.help = ['attacktitan']
handler.tags = ['rpg']
handler.command = /^(attacktitan)$/i
handler.limit = true
handler.group = true
handler.rpg = true
handler.fail = null

}

module.exports = handler

function pickRandom(list) {
    return list[Math.floor(Math.random() * list.length)]
}

function clockString(ms) {
    let h = Math.floor(ms / 3600000) // Hours
    let m = Math.floor(ms / 60000) % 60 // Minutes
    let s = Math.floor(ms / 1000) % 60 // Seconds
    return [h, m, s].map(v => v.toString().padStart(2, 0)).join(':')
}