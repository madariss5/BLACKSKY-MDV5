const { getMessage } = require('../lib/languages');

let handler = async (m, { conn }) => {
    // Get user's preferred language
    const user = global.db.data.users[m.sender];
    const chat = global.db.data.chats[m.chat];
    const lang = user?.language || chat?.language || global.language;
    
    try {
        const groupName = await conn.getName(m.chat);
        const inviteCode = await conn.groupInviteCode(m.chat);
        
        const linkMessage = getMessage('group_link', lang, {
            group_name: groupName,
            invite_code: inviteCode,
            bot_name: conn.user.name
        }, { chat: m.chat }, m);
        
        conn.reply(m.chat, linkMessage, m);
    } catch {
        const errorMessage = getMessage('group_link_error', lang, {
            bot_username: conn.user.jid.split('@')[0]
        }, { chat: m.chat }, m);
        
        conn.reply(m.chat, errorMessage, m, { mentions: [conn.user.jid] });
    }
}

handler.help = ['linkgroup']
handler.tags = ['group']
handler.command = /^link(g(c)?ro?up)?$/i

handler.group = true
handler.admin = true

module.exports = handler;