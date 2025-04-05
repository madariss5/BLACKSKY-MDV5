const { getMessage } = require('../lib/languages');

let handler = async (m, { conn, text }) => {
    // Get user's preferred language
    const userData = global.db.data.users[m.sender];
    const chat = global.db.data.chats[m.chat];
    const lang = userData?.language || chat?.language || global.language;
    
    if(isNaN(text)) {
        var number = text.split`@`[1]
    } else if(!isNaN(text)) {
        var number = text
    }

    const format = num => {
        const n = String(num),
              p = n.indexOf('.')
        return n.replace(
            /\d(?=(?:\d{3})+(?:\.|$))/g,
            (m, i) => p < 0 || i < p ? `${m},` : m
        )
    }

    if(!text && !m.quoted) return conn.reply(m.chat, getMessage('terima_provide_target', lang), m);
    if(isNaN(number)) return conn.reply(m.chat, getMessage('terima_invalid_number', lang), m);
    if(number.length > 15) return conn.reply(m.chat, getMessage('terima_invalid_format', lang), m);
    
    try {
        if(text) {
            var targetUser = number + '@s.whatsapp.net'
        } else if(m.quoted.sender) {
            var targetUser = m.quoted.sender
        } else if(m.mentionedJid) {
            var targetUser = number + '@s.whatsapp.net'
        }  
    } catch (e) {
    } finally {
        let groupMetadata = m.isGroup ? await conn.groupMetadata(m.chat) : {}
        let participants = m.isGroup ? groupMetadata.participants : []
        let users = m.isGroup ? participants.find(u => u.jid == targetUser) : {}
        
        if(!targetUser) return conn.reply(m.chat, getMessage('terima_target_not_found', lang), m);
        if(targetUser === m.sender) return conn.reply(m.chat, getMessage('terima_self_dating', lang), m);
        if(targetUser === conn.user.jid) return conn.reply(m.chat, getMessage('terima_bot_dating', lang), m);
        
        if(global.db.data.users[targetUser].pasangan != m.sender){
            const target = targetUser.split('@')[0];
            
            conn.reply(
                m.chat,
                getMessage('terima_not_proposed', lang, {
                    target: target
                }),
                m,
                {
                    contextInfo: {
                        mentionedJid: [targetUser]
                    }
                }
            );
        } else {
            global.db.data.users[m.sender].pasangan = targetUser;
            const target = targetUser.split('@')[0];
            const sender = m.sender.split('@')[0];
            
            conn.reply(
                m.chat,
                getMessage('terima_success', lang, {
                    target: target,
                    sender: sender
                }),
                m,
                {
                    contextInfo: {
                        mentionedJid: [m.sender, targetUser]
                    }
                }
            );
        }
    }       
};

handler.help = ['accept *@tag*'];
handler.tags = ['fun'];
handler.command = /^(accept)$/i;
handler.group = true;
handler.limit = false;
handler.fail = null;

module.exports = handler;