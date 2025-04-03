const { getMessage } = require('../lib/languages');

let handler = async (m, { conn, usedPrefix, text, command }) => {
    // Get user's preferred language
    const user = global.db.data.users[m.sender];
    const chat = global.db.data.chats[m.chat];
    const lang = user?.language || chat?.language || global.language;
 {
    let user = global.db.data.users[m.sender]
    let skill = {
        "barbarian": { difficulty: "hard", stars: "⭐⭐⭐⭐" },
        "bard": { difficulty: "medium", stars: "⭐⭐⭐" },
        "cleric": { difficulty: "medium", stars: "⭐⭐⭐" },
        "druid": { difficulty: "hard", stars: "⭐⭐⭐⭐" },
        "fighter": { difficulty: "easy", stars: "⭐⭐" },
        "monk": { difficulty: "expert", stars: "⭐⭐⭐⭐⭐" },
        "paladin": { difficulty: "hard", stars: "⭐⭐⭐⭐" },
        "ranger": { difficulty: "medium", stars: "⭐⭐⭐" },
        "rogue": { difficulty: "medium", stars: "⭐⭐⭐" },
        "sorcerer": { difficulty: "expert", stars: "⭐⭐⭐⭐⭐" },
        "warlock": { difficulty: "hard", stars: "⭐⭐⭐⭐" },
        "wizard": { difficulty: "expert", stars: "⭐⭐⭐⭐⭐" }
    }

    let skil = text.trim().toLowerCase() // filter text

    if (!Object.keys(skill).includes(skil)) {
        // Generate the list of skills with their difficulty and star rating
        let skillList = Object.keys(skill).map(s => {
            let { difficulty, stars } = skill[s]
            return `- *${s}* *[ ${stars} ]*\n_Difficulty_ : ${difficulty}`
        }).join('\n')

        // Context info for available skills with externalAdReply
        const availableSkillsMessage = `乂 *C L A S S*\n\nChoose a *Class* that you like or matches your skills or talents:\n\n${skillList}\n\n_How To Use_ :\n${usedPrefix + command} *skillname*\n\n_Example_ :\n${usedPrefix + command} *wizard*`.trim();
        await conn.reply(m.chat, availableSkillsMessage, m, {
            contextInfo: {
                externalAdReply: {
                    mediaType: 1,
                    title: 'AXELLDX',
                    thumbnailUrl: 'https://telegra.ph/file/a0e0fd6b16e109e36e455.jpg',
                    renderLargerThumbnail: true,
                    sourceUrl: ''
                }
            }
        });
        return;
    }

    // Initialize user skills if not present
    if (!user.skills) {
        user.skills = []
    }

    let { difficulty, stars } = skill[skil]

    // Remove previous skills
    if (user.skill) {
        let index = user.skills.findIndex(s => s.name === user.skill)
        user.skills.splice(index, 1)
    }

    let newSkill = {
        name: skil,
        difficulty: difficulty,
        stars: stars
    }

    user.skills.push(newSkill)
    user.skill = skil // Update current skills
    m.reply(`You have selected the ${skil} skills with difficulty level ${difficulty} and rating ${stars}.`)
}

handler.help = ['selectskill <Type>']
handler.tags = ['rpg']
handler.command = /^(selectskill)$/i
handler.register = true
handler.group = true
handler.rpg = true
}

module.exports = handler