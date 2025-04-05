const { getMessage } = require('../lib/languages');

let handler = async(m, { conn, text, participants }) => {
    // Get user's preferred language
    const user = global.db.data.users[m.sender];
    const chat = global.db.data.chats[m.chat];
    const lang = user?.language || chat?.language || global.language;
    
    if (!text) {
        return m.reply(getMessage('hidetag_no_message', lang, { chat: m.chat }, m));
    }
    
    const fcontact = {
        "key": {
            "participants":"0@s.whatsapp.net",
            "remoteJid": "status@broadcast",
            "fromMe": false,
            "id": "Halo"
        },
        "message": {
            "contactMessage": {
                "vcard": `BEGIN:VCARD\nVERSION:3.0\nN:Sy;Bot;;;\nFN:y\nitem1.TEL;waid=${m.sender.split('@')[0]}:${m.sender.split('@')[0]}\nitem1.X-ABLabel:Ponsel\nEND:VCARD`
            }
        },
        "participant": "0@s.whatsapp.net"
    }
    
    conn.sendMessage(m.chat, { 
        text: text, 
        mentions: participants.map(a => a.id) 
    }, {quoted:m});
}
handler.help = ['hidetag <message>']
handler.tags = ['group']
handler.command = /^(hidetag)$/i

handler.group = true
handler.admin = true

module.exports = handler