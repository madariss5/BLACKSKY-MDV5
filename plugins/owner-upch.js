const { getMessage } = require('../lib/languages');

const { proto } = require('@adiwajshing/baileys'); 

let handler = async (m, { conn, text }) => {
    // Get user's preferred language
    const user = global.db.data.users[m.sender];
    const chat = global.db.data.chats[m.chat];
    const lang = user?.language || chat?.language || global.language;
 {
    try {

        let text = text 
            ? text 
            : m.quoted && m.quoted.text 
            ? m.quoted.text 
            : m.quoted && m.quoted.caption 
            ? m.quoted.caption 
            : m.quoted && m.quoted.description 
            ? m.quoted.description 
            : '';
        if (!text) {
            return m.reply('Harap masukkan teks untuk dikirim ke channel!');
        }

        await sendMessage(conn, text);
        m.reply('Sukses send message ke channel');
    } catch (e) {
        console.error(e);
        m.reply('Failed send message');
    }
};


handler.command = /^(ch)$/i; 
handler.owner = true; 
}

module.exports = handler; 


function sendMessage(conn, teks) {
    const msg = {
        conversation: text,
    };
    const plaintext = proto.Message.encode(msg).finish();
    const plaintextNode = {
        tag: 'plaintext',
        attrs: {},
        content: plaintext,
    };
    const node = {
        tag: 'message',
        attrs: {
            to: '', //isi dengan id kalian! untuk cara get id nya can see di https://youtu.be/L3hDISOjO7k
            Type: 'text',
        },
        content: [plaintextNode],
    };

    return conn.query(node); 
}
