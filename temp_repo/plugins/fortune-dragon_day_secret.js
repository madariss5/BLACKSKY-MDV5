const { getMessage } = require('../lib/languages');

const fetch = require('node-fetch');

let handler = async (m, { conn, text, usedPrefix, command }) => {
    // Get user's preferred language
    const user = global.db.data.users[m.sender];
    const chat = global.db.data.chats[m.chat];
    const lang = user?.language || chat?.language || global.language;
 {
    if (!text) throw `Masukkan Tanggal Lahir!\n\nExample: ${usedPrefix + command} 14,05,2006`;

    try {
        let [part1] = text.split('|');
        let [tanggal1, bulan1, tahun1] = part1.split(',');

        
        await m.reply(wait);

        let res = await fetch(`https://api.betabotz.eu.org/fire/primbon/nagadays?tanggal=${tanggal1}&months=${months1}&years=${years1}&apikey=${lann}`);
        let json = await res.json();
        let anu = [
          `―-RAHASIA NAGA days-―\n\nTanggal lahir: ${json.result.message.tgl_lahir}\n\nArah naga days: ${json.result.message.arah_naga_days}\n\nCatatan: ${json.result.message.note}`, 
       ]
        if (json.status) {
         conn.reply(m.chat,`${(anu)}`);;
        } else {
            conn.reply(m.chat, `Sorry, terjadi kewrongan: ${json.message}`, m);
        }
    } catch (e) {
    throw e
        //throw `Internal server error!\n\nUlangi again Command.`;
    }
}

handler.help = ['nagadays']
handler.tags = ['fun']
handler.command = /^(nagahari)$/i
handler.group = true

}

module.exports = handler;

//danaputra133
//di bantu erlan aka