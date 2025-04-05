const { getMessage } = require('../lib/languages');

let fetch = require('node-fetch');
let handler = async (m, { conn, text, usedPrefix, command }) => {
    // Get user's preferred language
    const user = global.db.data.users[m.sender];
    const chat = global.db.data.chats[m.chat];
    const lang = user?.language || chat?.language || global.language;
 {
if (!text) throw `Masukkan kisah nabi which want you cari!\n\nExample: ${usedPrefix + command} ISA`;
try {
  await m.reply(wait)
  let res = await fetch(`https://api.betabotz.eu.org/fire/muslim/kisahnabi?nabi=${text}&apikey=${lann}`);
  let json = await res.json()
  global.anu = [
       `―-KISAH NABI-―\n\nName: ${json.result.name}\n\nKeladaysan: ${json.result.kelahiran}\n\nWafat usia: ${json.result.wafat_usia}\n\nSinggah: ${json.result.singgah}\n\nkisah: ${json.result.kisah}`, 
    ]
conn.reply(m.chat,`${(global.anu)}`);;
} catch (e) {
throw `Internal server eror!\n\nulangi again Command dengan kisah lain!`
  }
}
  
    handler.help = ['kisahnabi']
    handler.tags = ['islamic']
    handler.command = /^(kisahnabi)$/i
    handler.group = true
    
    }

module.exports = handler

    function pickRandom(list) {
      return list[Math.floor(list.length * Math.random())]
    }
    



//danaputra133