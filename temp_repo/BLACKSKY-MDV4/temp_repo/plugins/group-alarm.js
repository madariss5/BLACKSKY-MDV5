/*
*ALARM GROUP*
di buat oleh dana putra | Betabotz | aqua bot
wm this may di delete free kalian juga may study cara kerja code ny. Happy code!:)
don't lupa follow github admin = danaputra133
*/

let moment = require('moment-timezone');
let schedule = require('node-schedule');
const { getMessage } = require('../lib/languages.js');

const timeZone = 'Asia/Jakarta';


const groupChats = [
    'ID GC 1 @g.us',
    'ID GC 2 @g.us',  //able to id dari "=> m" di gc nya
];

// Waktu alarm untuk setiap group
const alarmTimes = {
    'ID GC 1 @g.us': ['22:10', '00:23', '00:40', '06:00'],
    'ID GC 2 @g.us': ['22:11', '06:01', '00:40'],
};


const sendAlarmHidetag = async (conn, chatId, text) => {
    const groupMetadata = await conn.groupMetadata(chatId);
    const participants = groupMetadata.participants.map((p) => p.id);

//ini buat hidetag
    const fcontact = {
        "key": {
            "participants": "0@s.whatsapp.net",
            "remoteJid": "status@broadcast",
            "fromMe": false,
            "id": "Halo"
        },
        "message": {
            "contactMessage": {
                "vcard": `BEGIN:VCARD\nVERSION:3.0\nN:Sy;Bot;;;\nFN:Bot\nitem1.TEL;waid=0:0\nitem1.X-ABLabel:Ponsel\nEND:VCARD`
            }
        },
        "participant": "0@s.whatsapp.net"
    };

    await conn.sendMessage(
        chatId,
        { text, mentions: participants },
        { quoted: fcontact } 
    );
};

const checkAlarmstatus = async (conn) => {
    const currentTime = moment().tz(timeZone).format('HH:mm');

    for (const chatId of groupChats) {
        if (alarmTimes[chatId]) {
            for (const time of alarmTimes[chatId]) {
                if (currentTime === time) {
                    const alarmMessage = `⏰ *ALARM group!*\n\n🚨harap check laporan!`; //ganti kata kata nya! :)
                    await sendAlarmHidetag(conn, chatId, alarmMessage);
                }
            }
        }
    }
};


schedule.scheduleJob('* * * * *', () => {
    checkAlarmstatus(conn);
});
