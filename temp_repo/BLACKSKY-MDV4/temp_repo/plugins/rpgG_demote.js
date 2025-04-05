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

    if (guild.owner !== userId) return conn.reply(m.chat, 'Hanya pemilik guild which can menurunkan pangkat anggota.', m);

    let target = m.mentionedJid[0] || args[0];

    if (!target) return conn.reply(m.chat, 'Tag user which want you turunkan pangkatnya.', m);

    if (!guild.staff.includes(target)) return conn.reply(m.chat, 'User not ada di dalam staff.', m);

    guild.staff = guild.staff.filter(staff => staff !== target);

    conn.reply(m.chat, `@${target.split('@')[0]} has diturunkan pangkatnya di guild ${guild.name}.`, m, { mentions: [target] });
};

handler.help = ['guilddemote <@user>'];
handler.tags = ['rpgG'];
handler.command = /^(guilddemote)$/i;
handler.rpg = true
}

module.exports = handler;