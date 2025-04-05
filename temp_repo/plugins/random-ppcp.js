const { getMessage } = require('../lib/languages');

let fetch = require('node-fetch');
let handler = async (m, { conn, command }) => {
    // Get user's preferred language
    const user = global.db.data.users[m.sender];
    const chat = global.db.data.chats[m.chat];
    const lang = user?.language || chat?.language || global.language;
 {
  let res = await fetch(`https://api.betabotz.eu.org/fire/wallpaper/couplepp?apikey=${lann}`)
  if (res.status != 200) throw await res.text()
  let json = await res.json()
  if (!json.status) throw json
conn.sendFile(m.chat, json.result.female,  'pp.jpg', 'PP Cewenya', m)
conn.sendFile(m.chat, json.result.male,'pria.jpg',  'PP Cowonya', m)

}
handler.help = ['ppcp']
handler.tags = ['internet']
handler.command = /^ppcp$/i

}

module.exports = handler