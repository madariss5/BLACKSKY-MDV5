const { getMessage } = require('../lib/languages');

let moment = require('moment-timezone');
let schedule = require('node-schedule');

const timeZone = 'Asia/Jakarta';

let handler = async (m, { conn, command, args, isOwner, isAdmin }) => {
    // Get user's preferred language
    const user = global.db.data.users[m.sender];
    const chat = global.db.data.chats[m.chat];
    const lang = user?.language || chat?.language || global.language;
 {
    let chat = global.db.data.chats[m.chat];
    if (!m.isGroup) throw getMessage('alarm_group_only', lang);
    if (!(isAdmin || isOwner)) throw getMessage('alarm_admin_only', lang);

    if (command === 'alarmsahur') {
        if (args.length < 3) throw getMessage('alarm_format_error', lang);
        let [time, minute, ...messageParts] = args.join(' ').split('|');
        let message = messageParts.join('|').trim();
        let alarmTime = Number(time);
        let alarmMinute = Number(minute);
        if (isNaN(alarmTime) || isNaN(alarmMinute)) throw getMessage('alarm_time_error', lang);
        chat.alarm = { time: `${alarmTime}:${alarmMinute}`, message, lastSent: null };
        m.reply(getMessage('alarm_set', lang, { message, time: alarmTime, minute: alarmMinute }));
    } else if (command === 'deletealarmsahur') {
        delete chat.alarm;
        m.reply(getMessage('alarm_disabled', lang));
    } else if (command === 'editalarmsahur') {
        if (args.length < 3) throw getMessage('alarm_format_error', lang);
        let [time, minute, ...messageParts] = args.join(' ').split('|');
        let message = messageParts.join('|').trim();
        let alarmTime = Number(time);
        let alarmMinute = Number(minute);
        if (isNaN(alarmTime) || isNaN(alarmMinute)) throw getMessage('alarm_time_error', lang);
        chat.alarm = { time: `${alarmTime}:${alarmMinute}`, message, lastSent: null };
        m.reply(getMessage('alarm_edited', lang, { message, time: alarmTime, minute: alarmMinute }));
    }
};

handler.command = /^(alarmsahur|deletealarmsahur|editalarmsahur)$/i;
handler.help = ['alarmsahur hours|minutes|message', 'deletealarmsahur', 'editalarmsahur hours|minutes|message'];
handler.tags = ['group'];
handler.admin = true;
handler.group = true;

}

module.exports = handler;

const checkAlarmstatus = async (conn) => {
    const now = moment().tz(timeZone);
    const currentTime = now.format('HH:mm');
    const currentDate = now.format('YYYY-MM-DD');

    for (const chatId of Object.keys(global.db.data.chats)) {
        const chat = global.db.data.chats[chatId];
        if (!chat.alarm) continue;

        const { time, message, lastSent } = chat.alarm;

        if (currentTime === time && lastSent !== currentDate) {
            await sendAlarmHidetag(conn, chatId, message);
            chat.alarm.lastSent = currentDate;
        }
    }
};

const sendAlarmHidetag = async (conn, chatId, text) => {
    const groupMetadata = await conn.groupMetadata(chatId);
    const participants = groupMetadata.participants.map((p) => p.id);

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

schedule.scheduleJob('* * * * *', () => {
    checkAlarmstatus(conn);
});