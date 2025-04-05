const { getMessage } = require('../lib/languages');

let handler = async (m, { conn, usedPrefix }) => {
    // Get user's preferred language
    const user = global.db.data.users[m.sender];
    const chat = global.db.data.chats[m.chat];
    const lang = user?.language || chat?.language || global.language;
 {
         let paus = global.db.data.users[m.sender].paus 
         let kepiting = global.db.data.users[m.sender].kepiting
         let gurita = global.db.data.users[m.sender].gurita 
         let cumi = global.db.data.users[m.sender].cumi 
         let buntal = global.db.data.users[m.sender].buntal 
         let dory = global.db.data.users[m.sender].dory 
         let lumba = global.db.data.users[m.sender].lumba 
         let lobster = global.db.data.users[m.sender].lobster 
         let hiu = global.db.data.users[m.sender].hiu 
         let udang = global.db.data.users[m.sender].udang
         let ikan = global.db.data.users[m.sender].ikan 
         let orca = global.db.data.users[m.sender].orca 
         let pancingan = global.db.data.users[m.sender].pancingan
         let _pancingan = global.db.data.users[m.sender].anakpancingan 
         let dann = `
*Fish Pond*
Hiu: ${hiu}
Ikan: ${ikan}
Dory: ${dory}
Orca: ${orca}
Paus: ${paus}
Cumi: ${cumi}
Gurita: ${gurita}
Buntal: ${buntal}
Udang: ${udang}
Lumba²: ${lumba}
Lobster: ${lobster}
Kepiting: ${kepiting}
`.trim()

conn.reply(m.chat, dann, m)
}

handler.help = ['pond']
handler.tags = ['rpg']
handler.command = /^(pond)$/i
handler.group = true
handler.rpg = true
}

module.exports = handler