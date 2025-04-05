const { getMessage } = require('../lib/languages');

let { groupsSettingUpdate } = require('@adiwajshing/baileys');
let handler = async (m, { isAdmin, isOwner, isBotAdmin, conn, args, usedPrefix, command }) => {
    // Get user's preferred language
    const user = global.db.data.users[m.sender];
    const chat = global.db.data.chats[m.chat];
    const lang = user?.language || chat?.language || global.language;
    
    if (!(isAdmin || isOwner)) {
        global.dfail('admin', m, conn)
        throw false
    }
    if (!isBotAdmin) {
        global.dfail('botAdmin', m, conn)
        throw false
    }
    
    let prefix = usedPrefix
    
    let isClose = {
        'open': 'not_announcement',
        'buka': 'not_announcement',
        'on': 'not_announcement',
        '1': 'not_announcement',
        'close': 'announcement',
        'tutup': 'announcement',
        'off': 'announcement',
        '0': 'announcement',
    }[(args[0] || '')]
    
    if (isClose === undefined) {
        const usage = getMessage('group_setting_usage', lang, {
            prefix: usedPrefix,
            command: command
        }, { chat: m.chat }, m);
        
        m.reply(usage)
        throw false
    } else if (isClose === 'announcement') {
        await conn.groupSettingUpdate(m.chat, isClose)
        
        const closedMessage = getMessage('group_closed', lang, {
            user: m.sender.split`@`[0],
            prefix: usedPrefix
        }, { chat: m.chat }, m);
        
        await m.reply(closedMessage)
    } else if (isClose === 'not_announcement') {
        await conn.groupSettingUpdate(m.chat, isClose)
        
        const openedMessage = getMessage('group_opened', lang, {
            user: m.sender.split`@`[0],
            prefix: usedPrefix
        }, { chat: m.chat }, m);
        
        await m.reply(openedMessage)
    }
}

handler.help = ['group <open/close>']
handler.tags = ['group']
handler.command = /^(g(ro?up|c?)?)$/i
handler.group = true
handler.botAdmin = false

module.exports = handler
