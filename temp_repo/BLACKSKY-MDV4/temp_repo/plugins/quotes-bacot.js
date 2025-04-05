const { getMessage } = require('../lib/languages');

let fetch = require('node-fetch');
let handler = async (m, { conn } ) => {   
    // Get user's preferred language
    const user = global.db.data.users[m.sender];
    const chat = global.db.data.chats[m.chat];
    const lang = user?.language || chat?.language || global.language;
    
    let res = await fetch(`https://api.betabotz.eu.org/fire/random/bacot?apikey=${lann}`).then(result => result.json())
    let anu =`
─────〔 *Bacot* 〕─────

${res.hasl}
`
    conn.reply(m.chat, anu, m) 
}
handler.help = ['bacot']
handler.tags = ['quotes']
handler.command = /^(bacot)$/i
handler.owner = false
handler.mods = false
handler.premium = false
handler.group = false
handler.private = false

handler.admin = false
handler.botAdmin = false

handler.fail = null

module.exports = handler