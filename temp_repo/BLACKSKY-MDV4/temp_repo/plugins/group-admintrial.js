const { getMessage } = require('../lib/languages');

/*
*<>JADIADMIN & DEMOTE PAKAI WAKTU, JADI JIKA Time's up MISAL YANG JADIADMIN, MAKA KALO Time's up AKAN TERDEMOTE OTOMATIS, BEGITUPUN YANG DEMOTE, MAKA AKAN KEDEMOTE DAN AKAN MENJADI ADMIN Back SESUAI WAKTU TERSEBUT!!<>*
SOURCE: https://whatsapp.com/channel/0029VaJYWMb7oQhareT7F40V
DON'T DELETE THIS WM!
delete WM MANDUL 7 TURUNAN 
delete WM=SDM RENDAH 
*KALO LU CONVERT APAPUN FITUR INI,WM JANGAN DIHAPUS!*
"aku janji not will delete wm ini\\\"
Thursday, 28 November 2024 09:35
*/
let schedule = require ('node-schedule')
//wm https://whatsapp.com/channel/0029VaJYWMb7oQhareT7F40V
let handler = async (m, { conn, args, command, participants }) => {
    // Get user's preferred language
    const user = global.db.data.users[m.sender];
    const chat = global.db.data.chats[m.chat];
    const lang = user?.language || chat?.language || global.language;
 {
    if (!m.isGroup) throw 'This command can only be used in groups!';

    //wm https://whatsapp.com/channel/0029VaJYWMb7oQhareT7F40V
    let target = m.mentionedJid ? m.mentionedJid[0] : args[0];
    if (!target) throw 'Tag User atau masukkan nomor target!';
    let time = args[1];
    if (!time) throw 'Masukkan waktu dengan format which right! (misal: 10s, 5m, 2h, 1d, atau 2024-12-31 23:59:59)';

    //wm https://whatsapp.com/channel/0029VaJYWMb7oQhareT7F40V
    let executeTime;
    if (/^\d+[smhd]$/.test(time)) {
        
        let value = parseInt(time);
        let unit = time.slice(-1);
        let multiplier = { s: 1000, m: 60000, h: 3600000, d: 86400000 };
        executeTime = new Date(Date.now() + value * multiplier[unit]);
    } else if (/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(time)) {
        
        executeTime = new Date(time);
        if (isNaN(executeTime)) throw 'Format waktu not valid!';
    } else {
        throw 'Format waktu not valid! Use format seperti 10s, 5m, 2h, 1d, atau 2024-12-31 23:59:59';
    }
   //wm https://whatsapp.com/channel/0029VaJYWMb7oQhareT7F40V
    let targetName = participants.find(p => p.id === target)?.id || target;
    let action;
    let timerName;

    if (command === 'jadiadmin') {
        await conn.groupParticipantsUpdate(m.chat, [target], 'promote');
        action = 'promote';
        timerName = 'unadmin';
    } else if (command === 'unadmin') {
        await conn.groupParticipantsUpdate(m.chat, [target], 'demote');
        action = 'demote';
        timerName = 'jadiadmin';
    } else if (command === 'kick') {
        await conn.groupParticipantsUpdate(m.chat, [target], 'remove');
        action = 'kick';
    } else {
        throw 'Command not recognized!';
    }

    m.reply(`Command \\\"${command}" Success. Target: @${target.split('@')[0]}\nDurasi: ${time}.\nCommand will diroadkan pada ${executeTime.toLocaleString()}.`, null, {
        mentions: [target],
    });

    //wm https://whatsapp.com/channel/0029VaJYWMb7oQhareT7F40V
    if (command !== 'kick') {
        schedule.scheduleJob(executeTime, async () => {
            if (timerName === 'unadmin') {
                await conn.groupParticipantsUpdate(m.chat, [target], 'demote');
                m.reply(`Target @${target.split('@')[0]} has di *demote* karena Time's up.`, null, { mentions: [target] });
            } else if (timerName === 'jadiadmin') {
                await conn.groupParticipantsUpdate(m.chat, [target], 'promote');
                m.reply(`Target @${target.split('@')[0]} has di *promote* again karena Time's up.`, null, { mentions: [target] });
            }
        });
    }
};

handler.help = ['jadiadmin @user <waktu>', 'unadmin @user <waktu>', 'kick2 @user <waktu>'];
handler.command = /^(jadiadmin|unadmin|kick2)$/i;
handler.tags = ['group'];
handler.group = true;
handler.admin = true; 
handler.botAdmin = true; 
}

module.exports = handler;
/*
*<>JADIADMIN & DEMOTE PAKAI WAKTU, JADI JIKA Time's up MISAL YANG JADIADMIN, MAKA KALO Time's up AKAN TERDEMOTE OTOMATIS, BEGITUPUN YANG DEMOTE, MAKA AKAN KEDEMOTE DAN AKAN MENJADI ADMIN Back SESUAI WAKTU TERSEBUT!!<>*
SOURCE: https://whatsapp.com/channel/0029VaJYWMb7oQhareT7F40V
DON'T DELETE THIS WM!
delete WM MANDUL 7 TURUNAN 
delete WM=SDM RENDAH 
*KALO LU CONVERT APAPUN FITUR INI,WM JANGAN DIHAPUS!*
"aku janji not will delete wm ini"
Thursday, 28 November 2024 09:35
*/