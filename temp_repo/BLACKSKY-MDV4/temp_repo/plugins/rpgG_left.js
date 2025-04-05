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

    guild.members = guild.members.filter(member => member !== userId);
    user.guild = null;

    conn.reply(m.chat, 'Kamu has exit dari guild.', m);
};

handler.help = ['guildleave'];
handler.tags = ['rpgG'];
handler.command = /^(guildleave)$/i;
handler.rpg = true;
}

module.exports = handler;