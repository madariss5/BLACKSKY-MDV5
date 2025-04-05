const { getMessage } = require('../lib/languages');

let handler = async (m, { conn, args }) => {
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

    if (!args[0]) return conn.reply(m.chat, 'Masukkan guild opponent which want diwar.', m);

    let enemyGuildName = args.join(' ');
    let enemyGuild = Object.values(global.db.data.guilds).find(guild => guild.name === enemyGuildName);
    if (!enemyGuild) return conn.reply(m.chat, 'guild opponent not ditemukan.', m);

    if (guild.owner !== userId) return conn.reply(m.chat, 'Hanya pemilik guild which can start war.', m);

    // Logika war able to ditambahkan di sini

    conn.reply(m.chat, `battles dengan guild ${enemyguild.name} dalam pengembangan.`, m);
};

handler.help = ['guildwaracc <nama_guild>'];
handler.tags = ['rpgG'];
handler.command = /^(guildwaracc)$/i;
handler.rpg = true;
}

module.exports = handler;