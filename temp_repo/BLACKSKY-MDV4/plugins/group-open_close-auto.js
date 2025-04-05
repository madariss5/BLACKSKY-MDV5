const { getMessage } = require('../lib/languages');

let moment = require('moment-timezone');
let schedule = require('node-schedule');

const timeZone = 'Asia/Jakarta';

let handler = async (m, { conn, command, args, isOwner, isAdmin }) => {
    // Get user's preferred language
    const user = global.db.data.users[m.sender];
    const chat = global.db.data.chats[m.chat];
    const lang = user?.language || chat?.language || global.language;
 
    let groupChat = global.db.data.chats[m.chat];
    
    if (!m.isGroup) {
        return m.reply(getMessage('group_only', lang, {}, { chat: m.chat }, m));
    }
    
    if (!(isAdmin || isOwner)) {
        return m.reply(getMessage('admin_only', lang, {}, { chat: m.chat }, m));
    }

    if (command === 'aktif' && args[0] === 'autogc') {
        if (args.length < 2) {
            return m.reply(getMessage('autogc_format_error', lang, {
                prefix: global.prefix
            }, { chat: m.chat }, m));
        }
        
        let [closeTime, openTime] = args[1].split('|').map(Number);
        
        if (isNaN(closeTime) || isNaN(openTime)) {
            return m.reply(getMessage('autogc_time_error', lang, {}, { chat: m.chat }, m));
        }
        
        groupChat.autoGc = { closeTime, openTime };
        
        return m.reply(getMessage('autogc_enabled', lang, {
            close_time: closeTime,
            open_time: openTime
        }, { chat: m.chat }, m));
    } else if (command === 'dead' && args[0] === 'autogc') {
        delete groupChat.autoGc;
        return m.reply(getMessage('autogc_disabled', lang, {}, { chat: m.chat }, m));
    }
};

handler.command = /^(aktif|mati)$/i;
handler.help = ['aktif autogc hours tutup|hours buka', 'dead autogc'];
handler.tags = ['group'];
handler.admin = true;
handler.group = true;

module.exports = handler;

const checkGroupsstatus = async (conn) => {
    const currentTime = moment().tz(timeZone).format('HH:mm');

    for (const chatId of Object.keys(global.db.data.chats)) {
        const chat = global.db.data.chats[chatId];
        if (!chat.autoGc) continue;

        // Get group's preferred language
        const lang = chat?.language || global.language;
        
        const { closeTime, openTime } = chat.autoGc;
        const currentHour = moment().tz(timeZone).hour();

        if (currentHour === closeTime && chat.groupstatus !== 'closed') {
            await conn.groupSettingUpdate(chatId, 'announcement');
            
            const closeMessage = getMessage('autogc_close_notification', lang, {
                open_time: openTime
            }, { chat: chatId });
            
            await conn.sendMessage(chatId, { text: closeMessage });
            chat.groupstatus = 'closed';
        }

        if (currentHour === openTime && chat.groupstatus !== 'opened') {
            await conn.groupSettingUpdate(chatId, 'not_announcement');
            
            const openMessage = getMessage('autogc_open_notification', lang, {
                close_time: closeTime
            }, { chat: chatId });
            
            await conn.sendMessage(chatId, { text: openMessage });
            chat.groupstatus = 'opened';
        }
    }
};

schedule.scheduleJob('* * * * *', () => {
    checkGroupsstatus(conn);
});