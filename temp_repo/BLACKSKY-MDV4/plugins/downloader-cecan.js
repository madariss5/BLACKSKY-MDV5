const { getMessage } = require('../lib/languages');

 let fetch = require('node-fetch');

let handler = async (m, { conn, command }) => {
    // Get user's preferred language
    const user = global.db.data.users[m.sender];
    const chat = global.db.data.chats[m.chat];
    const lang = user?.language || chat?.language || global.language;
 {
    let api1 = `https://api.betabotz.eu.org/fire/cecan/${command}?apikey=${lann}`
    let api2 = `https://api.betabotz.eu.org/fire/cecan/${command}?apikey=${btc}`
    let buffer = await fetch(api1)
        .then(res => res.buffer())
        .catch(async (err) => {
            console.log(`fire 1 Failed with error: ${err}. Trying fire 2...`)
            buffer = await fetch(api2).then(res => res.buffer())
            return buffer
        })
    conn.sendFile(m.chat, buffer, 'Result.jpg', `Random ${command}`, m)
}

handler.help = handler.command = ['china','vietnam','thailand','indonesia','korea','japan','malaysia','justinaxie','jeni','jiso','ryujin','rose','hijaber']
handler.tags = ['downloader'];
handler.limit = true;
}

module.exports = handler;
