const { getMessage } = require('../lib/languages');

//import db from '../lib/database.js'

let handler = async (m, { conn, text }) => {
    // Get user's preferred language
    const userData = global.db.data.users[m.sender];
    const chat = global.db.data.chats[m.chat];
    const lang = userData?.language || chat?.language || global.language;
    
    function no(number){
        return number.replace(/\s/g,'').replace(/([@+-])/g,'')
    }

    text = no(text)

    if(isNaN(text)) {
        var number = text.split`@`[1]
    } else if(!isNaN(text)) {
        var number = text
    }

    if(!text && !m.quoted) return conn.reply(m.chat, getMessage('reset_provide_target', lang), m)
    //let exists = await conn.isOnWhatsApp(number)
    // if (exists) return conn.reply(m.chat, `*El número no está registrado en WhatsApp*`, m)
    if(isNaN(number)) return conn.reply(m.chat, getMessage('reset_invalid_number', lang), m)
    // if(number.length > 8) return conn.reply(m.chat, `*❏ USUARIO REINICIADO*\n\n¡El número que ingresó no es válido!`, m)
    
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
        let number = targetUser.split('@')[0]
  
        delete global.global.db.data.users[targetUser]
        
        conn.reply(
            m.chat, 
            getMessage('reset_success', lang, {
                number: number
            }), 
            null, 
            { 
                mentions: [targetUser] 
            }
        )
    }
};

handler.help = ['reset <62xxx>'];
handler.tags = ['owner'];
handler.command = ['reset']; 
handler.admin = false;
handler.rowner = true;

module.exports = handler;