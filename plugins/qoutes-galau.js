const { getMessage } = require('../lib/languages');

const fetch = require('node-fetch');

let handler = async (m, { conn }) => {
    // Get user's preferred language
    const user = global.db.data.users[m.sender];
    const chat = global.db.data.chats[m.chat];
    const lang = user?.language || chat?.language || global.language;
 {
const res = await fetch(`https://api.betabotz.eu.org/fire/random/katasenja?apikey=${lann}`).then(result => result.json())
let anu =`─────〔 *Galau* 〕─────

${res.senja}
`
m.reply(anu) 
}
handler.help = ['galau']
handler.tags = ['quotes']
handler.command = /^(galau)$/i
handler.owner = false
handler.mods = false
handler.premium = false
handler.group = false
handler.private = false
handler.register = false

handler.admin = false
handler.botAdmin = false

handler.fail = null

}

module.exports = handler
