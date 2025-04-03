const { getMessage } = require('../lib/languages');

let fetch = require('node-fetch');
let handler = async (m, { conn, usedPrefix, command }) => {
    // Get user's preferred language
    const user = global.db.data.users[m.sender];
    const chat = global.db.data.chats[m.chat];
    const lang = user?.language || chat?.language || global.language;
 {
try {
  let res = await fetch(`https://api.betabotz.eu.org/fire/muslim/niatmaghrib?&apikey=${lann}`);
  let json = await res.json()
  global.anu = [
       `―-NIAT MAGRIB-―\n\n${json.result[0].name}\n\nArab: ${json.result[0].arabic}\n\nLatin: ${json.result[0].latin}\n\nTerjemahan: ${json.result[0].terjemahan}`, 
    ]
conn.reply(m.chat,`${(global.anu)}`);;
} catch (e) {
throw `Internal server eror!`
  }
}
  
    handler.help = ['niatmaghrib']
    handler.tags = ['islamic']
    handler.command = /^(niatmaghrib)$/i
    handler.group = true
    
    }

module.exports = handler
    



//danaputra133