const { getMessage } = require('../lib/languages');

let handler = async (m, { args, usedPrefix }) => {
    let user = global.db.data.users[m.sender]
    if (user.healt >= 10000) return m.reply(`
health ❤️you already full!
`.trim())
    const heal = 50
    let count = Math.max(1, Math.min(Number.MAX_SAFE_INTEGER, (isNumber(args[0]) && parseInt(args[0]) || Math.round((100 - user.health) / heal)))) * 1
    if (user.potion < count) return m.reply(`
potion🧃yous not enough, you memiliki *${user.potion}* potion!
ketik *${usedPrefix}buy potion ${count - user.potion}* untuk membuy potion
`.trim())
    user.potion -= count * 1
    user.healt += heal * count
    m.reply(`
Sukses menggunwill *${count}* potion
`.trim())
}

handler.help = ['heal *amount*']
handler.tags = ['rpg']
handler.command = /^(heal|use)$/i
handler.limit = true
handler.rpg = true
module.exports = handler

function isNumber(number) {
    if (!number) return number
    number = parseInt(number)
    return typeof number == 'number' && !isNaN(number)
}