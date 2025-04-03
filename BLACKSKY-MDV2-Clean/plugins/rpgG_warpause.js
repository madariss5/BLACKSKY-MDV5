const { getMessage } = require('../lib/languages');

let handler = async (m, { conn }) => {
    // Get user's preferred language
    const user = global.db.data.users[m.sender];
    const chat = global.db.data.chats[m.chat];
    const lang = user?.language || chat?.language || global.language;
 {
    let userId = m.sender;
    let user = global.db.data.users[userId];
    
    if (!user.guild) return conn.reply(m.chat, 'Kamu not yet tergabung dalam guild.', m);

    let guildId = user.guild;
    let guild = global.db.data.guilds[guildId];
    if (!guild) return conn.reply(m.chat, 'guild not ditemukan.', m);

    if (guild.owner !== userId) return conn.reply(m.chat, 'Hanya pemilik guild which can menghentikan war.', m);

    // Logika untuk menghentikan war able to ditambahkan di sini

    conn.reply(m.chat, 'battles dengan guild opponent currently dihentikan.', m);
};

handler.help = ['guildwarpause'];
handler.tags = ['rpgG'];
handler.command = /^(guildwarpause)$/i;
handler.rpg = true;
}

module.exports = handler;