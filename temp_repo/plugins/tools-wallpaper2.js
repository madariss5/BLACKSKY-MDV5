const { getMessage } = require('../lib/languages');

let handler = async (m, { conn }) => {
    // Get user's preferred language
    const user = global.db.data.users[m.sender];
    const chat = global.db.data.chats[m.chat];
    const lang = user?.language || chat?.language || global.language;
 {
    try {
        
        let apiUrl = `https://api.betabotz.eu.org/fire/wallpaper/wallhp2?apikey=${lann}`;

      

        await conn.sendMessage(m.chat, {
            image: { url: apiUrl }, 
            caption: `Following adalah wallpaper random (versi 2) untuk Anda!`,
        }, { quoted: m });
    } catch (error) {
        console.error(error);
        throw `An error occurred: ${error.message || error}`;
    }
};

handler.tags = ['image', 'internet'];
handler.help = ['wallpaper2']; 
handler.command = /^(wallpaper2)$/i; 
handler.limit = true;

}

module.exports = handler;