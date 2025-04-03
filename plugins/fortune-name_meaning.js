const { getMessage } = require('../lib/languages');

let fetch = require('node-fetch');
let handler = async (m, { conn, text, usedPrefix, command }) => {
    // Get user's preferred language
    const user = global.db.data.users[m.sender];
    const chat = global.db.data.chats[m.chat];
    const lang = user?.language || chat?.language || global.language;
 {
// if (!text) throw `Masukkan Name!\n\nExample: ${usedPrefix + command} "dana"`;
if (!text) throw `Masukkan Name!\n\nExample: ${usedPrefix + command} Budi `;
try {
  await m.reply(wait)
  let res = await fetch(`https://api.betabotz.eu.org/fire/primbon/artinama?nama=${text}&apikey=${lann}`);
  let json = await res.json()
  let anu = [
       `―-ARTI Name-―\n\nName: ${json.result.message.Name}\n\nArti: ${json.result.message.arti}`, 
    ]
conn.reply(m.chat,`${(anu)}`);;
} catch (e) {
throw `Internal server eror!\n\nulangi again Command`
  }
}
  
    handler.help = ['artinama']
    handler.tags = ['fun']
    handler.command = /^(artinama)$/i
    handler.group = true
    
    }

module.exports = handler
    



//danaputra133