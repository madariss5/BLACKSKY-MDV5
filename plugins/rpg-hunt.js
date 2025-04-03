const { getMessage } = require('../lib/languages');

let handler = async (m, { conn }) => {
    // Get user's preferred language
    const user = global.db.data.users[m.sender];
    const chat = global.db.data.chats[m.chat];
    const lang = user?.language || chat?.language || global.language;
 {
    let __timers = (new Date - global.db.data.users[m.sender].lasthunting)
    let _timers = (3600000 - __timers)
    let timers = clockString(_timers)
    let name = conn.getName(m.sender)
    let user = global.db.data.users[m.sender]

    if (new Date - global.db.data.users[m.sender].lasthunting > 3600000) {
        let bullRandom = `${Math.floor(Math.random() * 10)}`
        let tigerRandom = `${Math.floor(Math.random() * 10)}`
        let goatRandom = `${Math.floor(Math.random() * 10)}`
        let elephantRandom = `${Math.floor(Math.random() * 10)}`
        let pandaRandom = `${Math.floor(Math.random() * 10)}`
        let crocodileRandom = `${Math.floor(Math.random() * 10)}`
        let buffaloRandom = `${Math.floor(Math.random() * 10)}`
        let cowRandom = `${Math.floor(Math.random() * 10)}`
        let monkeyRandom = `${Math.floor(Math.random() * 10)}`
        let wildboarRandom = `${Math.floor(Math.random() * 10)}`
        let pigRandom = `${Math.floor(Math.random() * 10)}`
        let chickenRandom = `${Math.floor(Math.random() * 10)}`
            .trim()

        let bullCount = (bullRandom * 1)
        let tigerCount = (tigerRandom * 1)
        let elephantCount = (elephantRandom * 1)
        let goatCount = (goatRandom * 1)
        let pandaCount = (pandaRandom * 1)
        let crocodileCount = (crocodileRandom * 1)
        let buffaloCount = (buffaloRandom * 1)
        let cowCount = (cowRandom * 1)
        let monkeyCount = (monkeyRandom * 1)
        let wildboarCount = (wildboarRandom * 1)
        let pigCount = (pigRandom * 1)
        let chickenCount = (chickenRandom * 1)

        let bullResult = `${bullCount}`
        let tigerResult = `${tigerCount}`
        let elephantResult = `${elephantCount}`
        let goatResult = `${goatCount}`
        let pandaResult = `${pandaCount}`
        let crocodileResult = `${crocodileCount}`
        let buffaloResult = `${buffaloCount}`
        let cowResult = `${cowCount}`
        let monkeyResult = `${monkeyCount}`
        let wildboarResult = `${wildboarCount}`
        let pigResult = `${pigCount}`
        let chickenResult = `${chickenCount}`

        let huntResults = `
• *Hunt Results*

 *🐂 = [ ${bullResult} ]*         *🐃 = [ ${buffaloResult} ]*
 *🐅 = [ ${tigerResult} ]*         *🐮 = [ ${cowResult} ]*
 *🐘 = [ ${elephantResult} ]*         *🐒 = [ ${monkeyResult} ]*
 *🐐 = [ ${goatResult} ]*         *🐗 = [ ${wildboarResult} ]*
 *🐼 = [ ${pandaResult} ]*         *🐖 = [ ${pigResult} ]*
 *🐊 = [ ${crocodileResult} ]*         *🐓 = [ ${chickenResult} ]*
`
        global.db.data.users[m.sender].bull += bullCount
        global.db.data.users[m.sender].tiger += tigerCount
        global.db.data.users[m.sender].elephant += elephantCount
        global.db.data.users[m.sender].goat += goatCount
        global.db.data.users[m.sender].panda += pandaCount
        global.db.data.users[m.sender].crocodile += crocodileCount
        global.db.data.users[m.sender].buffalo += buffaloCount
        global.db.data.users[m.sender].cow += cowCount
        global.db.data.users[m.sender].monkey += monkeyCount
        global.db.data.users[m.sender].wildboar += wildboarCount
        global.db.data.users[m.sender].pig += pigCount
        global.db.data.users[m.sender].chicken += chickenCount

        setTimeout(() => {
            m.reply(huntResults)
        }, 11000)

        setTimeout(() => {
            m.reply('Target spotted!')
        }, 10000)

        setTimeout(() => {
            m.reply('Searching for prey...')
        }, 0)
        user.lasthunting = new Date * 1
    } else {
        m.reply(`\nYou seem tired. Please rest for about *${timers}* before you can hunt again.`)
    }
}

handler.help = ['hunt']
handler.tags = ['rpg']
handler.command = /^(hunt)$/i
handler.rpg = true

}

module.exports = handler

function clockString(ms) {
    let h = Math.floor(ms / 3600000)
    let m = Math.floor(ms / 60000) % 60
    let s = Math.floor(ms / 1000) % 60
    console.log({ ms, h, m, s })
    return [h, m, s].map(v => v.toString().padStart(2, 0)).join(':')
}