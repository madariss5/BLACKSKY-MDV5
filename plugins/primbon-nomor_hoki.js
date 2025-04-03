const { getMessage } = require('../lib/languages');

let fetch = require('node-fetch');
let handler = async (m, { conn, text, usedPrefix, command }) => {
    // Get user's preferred language
    const user = global.db.data.users[m.sender];
    const chat = global.db.data.chats[m.chat];
    const lang = user?.language || chat?.language || global.language;
 {
// if (!text) throw `Masukkan Name!\n\nExample: ${usedPrefix + command} "dana"`;
if (!text) throw `Masukkan Nomor nya!\n\nExample: ${usedPrefix + command} 6281289694906\n\n*Use 62!*`;
try {
  await m.reply(wait)
  let res = await fetch(`https://api.betabotz.eu.org/fire/primbon/nomerhoki?nomer=${text}&apikey=${lann}`);
  let json = await res.json()
  let anu = [
       `―-NOMOR HOKI-―\n\nNomor hp: ${json.result.message.nomer_hp}\n\nAngka shuzi: ${json.result.message.angka_shuzi}\n\n
--energy positif: \nKerichan: ${json.result.message.energy_positif.kerichan}\nhealth: ${json.result.message.energy_positif.health}\ncinta: ${json.result.message.energy_positif.cinta}\nkestabilan: ${json.result.message.energy_positif.kestabilan}\npersentase: ${json.result.message.energy_positif.persentase}\n\n
--energy negatif: \nperselisihan: ${json.result.message.energy_negatif.perselisihan}\nlose: ${json.result.message.energy_negatif.lose}\nmaoldpka: ${json.result.message.energy_negatif.maoldpka}\nkehancuran: ${json.result.message.energy_negatif.kehancuran}\npersentase: ${json.result.message.energy_negatif.persentase}\n\n
--note: ${json.result.message.note}`, 
    ]
conn.reply(m.chat,`${(anu)}`);;
} catch (e) {
throw `Internal server eror!\n\nulangi again Command`
  }
}
  
    handler.help = ['nomerhoki nomor?']
    handler.tags = ['fun']
    handler.command = /^(nomerhoki)$/i
    handler.group = true
    
    }

module.exports = handler
    



//danaputra133
