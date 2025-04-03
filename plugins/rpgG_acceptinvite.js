const { getMessage } = require('../lib/languages');

let handler = async (m, { conn, args }) => {
    // Get user's preferred language
    const user = global.db.data.users[m.sender];
    const chat = global.db.data.chats[m.chat];
    const lang = user?.language || chat?.language || global.language;
 {
    let userId = m.sender;
    let user = global.db.data.users[userId];
    let target = m.mentionedJid[0] || args[0];

    if (!user.guild) return conn.reply(m.chat, 'Kamu not yet tergabung dalam guild.', m);

    let guildId = user.guild;
    let guild = global.db.data.guilds[guildId];
    if (!guild) return conn.reply(m.chat, 'guild not ditemukan.', m);

    if (!args[0]) return conn.reply(m.chat, 'Tag user which want you accept inviteannya ke guild.', m);

    if (guild.owner !== userId) return conn.reply(m.chat, 'Hanya pemilik guild which can accept invitean.', m);

    if (!guild.waitingRoom.includes(target)) return conn.reply(m.chat, 'User not ada di dalam List invitean.', m);

    guild.members.push(target);
    guild.waitingRoom = guild.waitingRoom.filter(room => room !== target);

    conn.reply(m.chat, `@${target.split('@')[0]} has resmi join dengan guild ${guild.name}.`, m, { mentions: [target] });
};

handler.help = ['guildinviteacc <@user>'];
handler.tags = ['rpgG'];
handler.command = /^(guildinviteacc)$/i;
handler.rpg = true
}

module.exports = handler;