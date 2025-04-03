const { getMessage } = require('../lib/languages');

const pets = ['kucing', 'anjing', 'serigala', 'phonix', 'rubah']

let handler = async (m, { conn, text: txt, usedPrefix, participants }) => {
    // Get user's preferred language
    const user = global.db.data.users[m.sender];
    const chat = global.db.data.chats[m.chat];
    const lang = user?.language || chat?.language || global.language;
 {
    conn.battlepet = conn.battlepet ? conn.battlepet : {}
    let text = (txt || '').toLowerCase()
    let id = 'battle-' + m.sender
    let user = global.db.data.users[m.sender]
    let item = pets.filter(v => v in user && typeof user[v] == 'number')
    if (!item.includes(text)) return m.reply(`List Pet :\n${pets.map(v => { return `• ${v}` }).join('\n') }`)
    if (user[text] == 0) return m.reply('Kamu Tidak Memiliki Pet Ini!')
    if (typeof conn.battlepet[id] != "undefined" && conn.battlepet[id] == true) return m.reply(`Kamu still berada di battle-pet.`)
    let users = participants.map(u => u.id)
    var lawan
    lawan = users[Math.floor(users.length * Math.random())]

    while (typeof global.db.data.users[lawan] == "undefined" || lawan == m.sender) {
        lawan = users[Math.floor(users.length * Math.random())]
    }

    m.reply(`*Kamu* (${text} level ${user[text]}) menantang *'@' +${conn.getName(opponent)}* (${text} level ${global.db.data.users[opponent][text]}) dan currently dalam pertarungan.\n\nWait 5 minutes again dan see siapa yg menang.`)
    conn.battlepet[id] = true

    await delay(300000)

    let kesempatan = []
    for (let i = 0; i < user[text]; i++) kesempatan.push(m.sender)
    for (let i = 0; i < global.db.data.users[lawan][text]; i++) kesempatan.push(lawan)

    let pointplayer = 0
    let pointLawan = 0
    for (let i = 0; i < 10; i++) {
        let unggul = getRandom(0, kesempatan.length - 1)
        if (kesempatan[unggul] == m.sender) pointplayer += 1
        else pointLawan += 1
    }

    if (pointplayer > pointLawan) {
        let reward = (pointplayer - pointLawan) * 10000
        user.money += reward
        user.limit += 1
        m.reply(`*${conn.getName(m.sender)}* [${pointplayer * 10}] - [${pointopponent * 10}] *${conn.getName(opponent)}*\n\n*Kamu* (${text} level ${user[text]}) menang meopponent *${conn.getName(opponent)}* (${text} level ${global.db.data.users[opponent][text]}) karena you ${alasanMenang[getRandom(0, alasanMenang.length - 1)]}\n\nreward . ${reward.toLocaleString()}\n+1 Limit`)
    } else if (pointplayer < pointLawan) {
        let denda = (pointLawan - pointplayer) * 100000
        user.money -= denda
        user.limit += 1
        m.reply(`*${conn.getName(m.sender)}* [${pointplayer * 10}] - [${pointopponent * 10}] *${conn.getName(opponent)}*\n\n*Kamu* (${text} level ${user[text]}) kalah meopponent *${conn.getName(opponent)}* (${text} level ${global.db.data.users[opponent][text]}) karena you ${alasanKalah[getRandom(0, alasanKalah.length - 1)]}\n\nMoney you berlacking ${denda.toLocaleString()}\n+1 Limit`)
    } else {
        m.reply(`*${conn.getName(m.sender)}* [${pointplayer * 10}] - [${pointopponent * 10}] *${conn.getName(opponent)}*\n\nResults imbang kak, ga dapet apa apa`)
    }

    delete conn.battlepet[id]
}
handler.help = ['battlepet']
handler.tags = ['rpg']
handler.command = /^(battlepet)$/i

handler.register = true
handler.group = true
handler.rpg = true

}

module.exports = handler

function getRandom(min, max) {
    min = Math.ceil(min)
    max = Math.floor(max)
    return Math.floor(Math.random() * (max - min + 1)) + min
}

const alasanKalah = ['Noob', 'Cupu', 'lacking hebat', 'Ampas kalahan', 'Gembel kalahan', 'Pet Jelek', 'level Kecil']
const alasanMenang = ['Hebat', 'Pro', 'Master Game', 'Legenda game', 'Sangat Pro', 'Rajin Nge-push']

const delay = time => new Promise(res => setTimeout(res, time));