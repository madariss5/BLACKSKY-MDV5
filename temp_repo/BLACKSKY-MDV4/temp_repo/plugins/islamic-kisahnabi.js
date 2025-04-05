const { getMessage } = require('../lib/languages');

let fetch = require('node-fetch');
let handler = async (m, { conn, usedPrefix, command }) => {
    // Get user's preferred language
    const user = global.db.data.users[m.sender];
    const chat = global.db.data.chats[m.chat];
    const lang = user?.language || chat?.language || global.language;
 {
try {
  let res = await fetch(`https://api.betabotz.eu.org/fire/muslim/kisahnabi2?&apikey=${lann}`);
  let json = await res.json()
  global.anu = [
       `―-KISAH NABI 2-―\n\n${json.result[0].name}\n\nTahun kelahiran: ${json.result[0].thn_kelahiran}\n\nUsia: ${json.result[0].usia}\n\n\nStory: ${json.result[0].description}`, 
    ]
conn.reply(m.chat,`${(global.anu)}`);;
} catch (e) {
throw `Internal server eror!`
  }
}
  
    handler.help = ['kisahnabi2']
    handler.tags = ['islamic']
    handler.command = /^(kisahnabi2)$/i
    handler.group = true
    
    }

module.exports = handler
    



//danaputra133

