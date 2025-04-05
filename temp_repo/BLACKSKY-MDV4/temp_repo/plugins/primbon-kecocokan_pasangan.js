const { getMessage } = require('../lib/languages');

const fetch = require('node-fetch');

let handler = async (m, { conn, text, usedPrefix, command }) => {
    // Get user's preferred language
    const user = global.db.data.users[m.sender];
    const chat = global.db.data.chats[m.chat];
    const lang = user?.language || chat?.language || global.language;
 {
    if (!text) throw `Masukkan Name dan Tanggal Lahir!\n\nExample: ${usedPrefix + command} cowo|cewe`;

    try {
        let [part1, part2] = text.split('|');
        let [nama1] = part1.split(',');
        let [nama2] = part2.split(',');
        
        await m.reply(wait);

        let res = await fetch(`https://api.betabotz.eu.org/fire/primbon/kecocokanpartner?cowo=${nama1}&cewe=${nama2}&apikey=${lann}`);
        let json = await res.json();
        let anu = [
          `―-KECOCOKAN partner-―\n\nName you: ${json.result.message.Name_you}\n\nName partner you: ${json.result.message.Name_partner}\n\nSisi positif:${json.result.message.sisi_positif}\n\nSisi negatif:${json.result.message.sisi_negatif}\n\nCatatan:${json.result.message.note}`, 
       ]
       
    //    var logos= [ `${json.result.message.image}`

    //    ]
       
        if (json.status) {
            conn.reply(m.chat,`${(anu)}`);;

        //  conn.reply(m.chat,`${(anu)}`);;
        // conn.relayMessage(m.chat, {
        //     extendedTextMessage:{
        //                     text: `${(anu)}`, 
        //                     contextInfo: {
        //                          externalAdReply: {
        //                             mediaType: 1,
        //                             previewType: 1,
        //                             renderLargerThumbnail: true,
        //                             thumbnailUrl: `${(anu1)}`,
        //                             sourceUrl: ''
        //                         }
        //                     }, mentions: [m.sender]
        //     }}, {})
         
            //conn.reply(m.chat, `―-Results RAMALAN JODOH-―\n\nName 1: ${Name1}\nTanggal Lahir 1: ${tanggal1}-${months1}-${years1}\n\nName 2: ${Name2}\nTanggal Lahir 2: ${tanggal2}-${months2}-${years2}\n\nResults: ${json.result.kecocokan}`, m);
        } else {
            conn.reply(m.chat, `Sorry, terjadi kewrongan: ${json.message}`, m);
        }
    } catch (e) {
    throw e
        //throw `Internal server error!\n\nUlangi again Command.`;
    }
}

handler.help = ['kecocokanpartner']
handler.tags = ['fun']
handler.command = /^(kecocokanpasangan)$/i
handler.group = true

}

module.exports = handler;

//danaputra133
//di bantu erlan aka