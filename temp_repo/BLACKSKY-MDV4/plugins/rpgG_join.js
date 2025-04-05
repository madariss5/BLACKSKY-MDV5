const { getMessage } = require('../lib/languages');

let handler = async (m, { conn, args }) => {
    // Get user's preferred language
    const user = global.db.data.users[m.sender];
    const chat = global.db.data.chats[m.chat];
    const lang = user?.language || chat?.language || global.language;
 {
    let user = global.db.data.users[m.sender];
    let guildIndex = parseInt(args[0]) - 1; // Ambil nomor guild dari argumen

    if (!args[0] || isNaN(guildIndex)) return conn.reply(m.chat, 'Masukkan nomor guild which valid.', m);
    if (user.guild) return conn.reply(m.chat, 'You have already join dalam guild.', m);

    let guildKeys = Object.keys(global.db.data.guilds);
    if (guildIndex < 0 || guildIndex >= guildKeys.length) return conn.reply(m.chat, 'guild not ditemukan.', m);

    let guildName = guildKeys[guildIndex];
    let guild = global.db.data.guilds[guildName];

    guild.members.push(m.sender);
    user.guild = guildName;

    conn.reply(m.chat, `Anda Success join dengan guild ${guild.name}.`, m);
};

handler.help = ['joinguild <nomor_guild>'];
handler.tags = ['rpgG'];
handler.command = /^(joinguild)$/i;
handler.rpg = true;
}

module.exports = handler;