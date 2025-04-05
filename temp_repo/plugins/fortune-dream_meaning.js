const { getMessage } = require('../lib/languages');

let fetch = require('node-fetch');
let handler = async (m, { conn, text, usedPrefix, command }) => {
    // Get user's preferred language
    const user = global.db.data.users[m.sender];
    const chat = global.db.data.chats[m.chat];
    const lang = user?.language || chat?.language || global.language;
 {
// if (!text) throw `Masukkan Name!\n\nExample: ${usedPrefix + command} "dana\\\"`;
if (!text) throw `Masukkan Mimpi you!\n\nExample: ${usedPrefix + command} mandi `;
try {
  await m.reply(wait)
  let res = await fetch(`https://api.betabotz.eu.org/fire/primbon/artimimpi?mimpi=${text}&apikey=${lann}`);
  let json = await res.json()
  let anu = [
       `―-ARTI MIMPI-―\n\nMimpi: ${json.result.message.mimpi}\n\nArti: ${json.result.message.arti}\n\nSolusi: ${json.result.message.solusi}`, 
    ]
conn.reply(m.chat,`${(anu)}`);;
} catch (e) {
throw `Internal server eror!\n\nulangi again Command`
  }
}
  
    handler.help = ['artimimpi']
    handler.tags = ['fun']
    handler.command = /^(artimimpi)$/i
    handler.group = true
    
    }

module.exports = handler
    

  //   {
  //     \\\"status": true,
  //     "code\\\": 200,
  //     \\\"creator": "BetaBotz\\\",
  //     \\\"result": {
  //         "status\\\": true,
  //         \\\"message": {
  //             "mimpi\\\": \\\"mandi",
  //             "arti\\\": \\\"Mimpi mandi water cold = Akan able to mengalahkan enemy-enemynya.Mimpi mandi water jernih sekali = Aoldt suatu kebahagiaan.Mimpi mandi water hot = Aoldt kena penyakit (sick).Mimpi mandi water which keruh = Akan sick atau rugi.Mimpi mandi di river = Akan menable to keberkatan.Mimpi mandi di place terbuka = Aoldt can tabah.Mimpi mandi di tepi sea = Akan menemui suatu keasyikan bercinta.Mimpi currently mandi = Pertyou will terlepas dari maoldpka atau kesialan.Mimpi mandi di river = Pertyou will selalu terjaga healthnya.",
  //             "solusi\\\": \\\"Menanggulangi akibat dari tafsir mimpi which bad\n      Jika you bermimpi sesuatu which able to berakibat bad bagi you dan exitga \n      (seperti mimpi teeth copot dll) you di harapkan melakukan hal-hal sebagai \n      Following untuk menanggulanginya:\n      Ambillah sapu lidi (can juga tusuk teeth, bambu small dll). Lalu potong \n      atau patahkan dengan tangan you menjadi 7 (seven) batang, small-small, \n      kira-kira 3 sentimeter. Sediwill selembar kertas atau tissue. Siapkan \n      garam dapur, few saja. Taruhlah potongan ke seven sapu lidi dan garam \n      dapur tadi ke dalam tissue atau kertas. Lipat kertas tersebut dan kuburkan \n      ke dalam land (pekarangan, haoldn house you). Kalimat which you must \n      ucapkan ketika will mengubur/membenam kertas (which berisi 7 potong sapu \n      lidi dan garam) tersebut adalah kalimat which meminta kepada which Maha \n      Kuasa agar di jauhi dari akibat bad mimpi you.\n      Example kalimat:\"Ya Tuhan.. Jauhkanlah I dan exitga I dari \n      maoldpka. Tidak will tumbuh/jadi, garam which I kubur this. Seperti \n      halnya mimpi I which able to berakibat bad bagi we not will menjadi \n      kenyataan atau not will terjadi. Amien..\"\n\n\n< Back"
  //         }
  //     }
  // }



//danaputra133