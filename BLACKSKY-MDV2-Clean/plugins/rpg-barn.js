const { getMessage } = require('../lib/languages');

let handler = async (m, { conn, usedPrefix }) => {
    // Get user's preferred language
    const user = global.db.data.users[m.sender];
    const chat = global.db.data.chats[m.chat];
    const lang = user?.language || chat?.language || global.language;
 {
        let user = global.db.data.users[m.sender]
        let cap = `*━━━ ❨ Hunting Barn ❩ ━━┄┈*

=> *Barn Contents for:*  @${m.sender.split`@`[0]}

*🐂 = [ ${user.bull} ] Bull*
*🐅 = [ ${user.tiger} ] Tiger*
*🐘 = [ ${user.elephant} ] Elephant*
*🐐 = [ ${user.goat} ] Goat*
*🐼 = [ ${user.panda} ] Panda*
*🐊 = [ ${user.crocodile} ] Crocodile*
*🐃 = [ ${user.buffalo} ] Buffalo*
*🐮 = [ ${user.cow} ] Cow*
*🐒 = [ ${user.monkey} ] Monkey*
*🐗 = [ ${user.wildboar} ] Wild Boar*
*🐖 = [ ${user.pig} ] Pig*
*🐓 = [ ${user.chicken} ] Chicken*

Use *${usedPrefix}market* to sell or *${usedPrefix}cook* to use as cooking materials.`

        conn.reply(m.chat, cap, m, { mentions: await conn.parseMention(cap) } )
}

handler.help = ['barn']
handler.tags = ['rpg']
handler.command = /^(barn)$/i
handler.rpg = true

}

module.exports = handler