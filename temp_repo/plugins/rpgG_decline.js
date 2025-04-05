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

    if (guild.owner === userId) return conn.reply(m.chat, 'Pemilik guild not can reject permintaan.', m);

    guild.waitingRoom = guild.waitingRoom.filter(room => room !== userId);

    conn.reply(m.chat, 'Permintaan you untuk join dengan guild has ditolak.', m);
};

handler.help = ['guilddecline'];
handler.tags = ['rpgG'];
handler.command = /^(guilddecline)$/i;
handler.rpg = true;
}

module.exports = handler;