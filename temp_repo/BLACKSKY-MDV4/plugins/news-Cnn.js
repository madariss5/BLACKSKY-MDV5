const { getMessage } = require('../lib/languages');

let fetch = require('node-fetch');
let handler = async (m, { conn }) => {
    // Get user's preferred language
    const user = global.db.data.users[m.sender];
    const chat = global.db.data.chats[m.chat];
    const lang = user?.language || chat?.language || global.language;
 {
try {
  let res = await fetch(`https://api.betabotz.eu.org/fire/news/cnn?&apikey=${lann}`);
  let json = await res.json()
  // array berisi result berita
  global.anu = [
       `―CNNC―\n\nBerita: ${json.result[0].berita}\n\nBeritaUrl: ${json.result[0].berita_url}`, 
       `―CNNC―\n\nBerita: ${json.result[1].berita}\n\nBeritaUrl: ${json.result[1].berita_url}`, 
       `―CNNC―\n\nBerita: ${json.result[2].berita}\n\nBeritaUrl: ${json.result[2].berita_url}`, 
       `―CNNC―\n\nBerita: ${json.result[3].berita}\n\nBeritaUrl: ${json.result[3].berita_url}`, 
       `―CNNC―\n\nBerita: ${json.result[4].berita}\n\nBeritaUrl: ${json.result[4].berita_url}`, 
       `―CNNC―\n\nBerita: ${json.result[5].berita}\n\nBeritaUrl: ${json.result[5].berita_url}`, 
       `―CNNC―\n\nBerita: ${json.result[6].berita}\n\nBeritaUrl: ${json.result[6].berita_url}`, 
       `―CNNC―\n\nBerita: ${json.result[7].berita}\n\nBeritaUrl: ${json.result[7].berita_url}`, 
       `―CNNC―\n\nBerita: ${json.result[8].berita}\n\nBeritaUrl: ${json.result[8].berita_url}`, 
    
    ]
//   conn.reply(m.chat, `―CNBC―\n\n"${json.result[0].berita}"`,)
// variabel able to di ganti jika dineedkan
conn.reply(m.chat,`${pickRandom(global.anu)}`);;
} catch (e) {
throw `Internal server eror!`
  }
}
  
    handler.help = ['cnn']
    handler.tags = ['news']
    handler.command = /^(cnn)$/i
    handler.group = true
    
    }

module.exports = handler

    function pickRandom(list) {
      return list[Math.floor(list.length * Math.random())]
    }
    
