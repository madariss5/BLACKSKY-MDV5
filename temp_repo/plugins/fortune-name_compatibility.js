const { getMessage } = require('../lib/languages');

const fetch = require('node-fetch');

let handler = async (m, { conn, text, usedPrefix, command }) => {
    // Get user's preferred language
    const user = global.db.data.users[m.sender];
    const chat = global.db.data.chats[m.chat];
    const lang = user?.language || chat?.language || global.language;
 {
    if (!text) throw `Masukkan Name dan Tanggal Lahir!\n\nExample: ${usedPrefix + command} dani,14,05,2006`;

    try {
        //sengaja ada split gak ngaruh ke program kok
        let [part1] = text.split('|');
        let [nama1, tanggal1, bulan1, tahun1] = part1.split(',');        
        await m.reply(wait);

        let res = await fetch(`https://api.betabotz.eu.org/fire/primbon/kecocokannama?nama=${nama1}&tanggal=${tanggal1}&months=${months1}&years=${years1}&apikey=${lann}`);
        let json = await res.json();
        let anu = [
          `―-KECOCOKAN Name-―\n\nName you:${json.result.message.Name}\n\nTanggal lahir you:${json.result.message.tgl_lahir}\n\nDaya alive:${json.result.message.life_path}\n\nDestiny:${json.result.message.destiny}\n\nPersonality:${json.result.message.persentase_kecocokan}\n\nPersentase kecocokan:${json.result.message.personality}\n\nCatatan:${json.result.message.note}`, 
       ]
       //thorw data when this buffer end
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

handler.help = ['kecocokannama']
handler.tags = ['fun']
handler.command = /^(kecocokannama)$/i
handler.group = true

}

module.exports = handler;

//danaputra133
//di bantu erlan aka