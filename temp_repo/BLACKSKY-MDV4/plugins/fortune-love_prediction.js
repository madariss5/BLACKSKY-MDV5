const { getMessage } = require('../lib/languages');

const fetch = require('node-fetch');

let handler = async (m, { conn, text, usedPrefix, command }) => {
    // Get user's preferred language
    const user = global.db.data.users[m.sender];
    const chat = global.db.data.chats[m.chat];
    const lang = user?.language || chat?.language || global.language;
 {
    if (!text) throw `Masukkan Name dan Tanggal Lahir!\n\nExample: ${usedPrefix + command} dani,14,05,2006|dini,12,09,2008`;

    try {
        let [part1, part2] = text.split('|');
        let [nama1, tanggal1, bulan1, tahun1] = part1.split(',');
        let [nama2, tanggal2, bulan2, tahun2] = part2.split(',');
        
        await m.reply(wait);

        let res = await fetch(`https://api.betabotz.eu.org/fire/primbon/ramalanjodoh?nama1=${nama1}&tanggal1=${tanggal1}&months1=${months1}&years1=${years1}&nama2=${nama2}&tanggal2=${tanggal2}&months2=${months2}&years2=${years2}&apikey=${lann}`);
        let json = await res.json();
        let anu = [
          `―-RAMALAN JODOH-―\n\nName you: ${json.result.message.Name_you.Name}\n\nTanggal lahir you:${json.result.message.Name_you.tgl_lahir}\n\npartner you:${json.result.message.Name_partner.Name}Tanggal lahir partner you:\n\n${json.result.message.Name_partner.tgl_lahir}\n\nExplanation:${json.result.message.result}`, 
       ]
        if (json.status) {
      //  await m.reply(json.result.message.nama_you.nama);
         conn.reply(m.chat,`${(anu)}`);;
            //conn.reply(m.chat, `―-Results RAMALAN JODOH-―\n\nName 1: ${Name1}\nTanggal Lahir 1: ${tanggal1}-${months1}-${years1}\n\nName 2: ${Name2}\nTanggal Lahir 2: ${tanggal2}-${months2}-${years2}\n\nResults: ${json.result.kecocokan}`, m);
        } else {
            conn.reply(m.chat, `Sorry, terjadi kewrongan: ${json.message}`, m);
        }
    } catch (e) {
    throw e
        //throw `Internal server error!\n\nUlangi again Command.`;
    }
}

handler.help = ['ramalanjodoh']
handler.tags = ['fun']
handler.command = /^(ramalanjodoh)$/i
handler.group = true

}

module.exports = handler;

//danaputra133
//di bantu erlan aka