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

    if (!args[0]) return conn.reply(m.chat, `Tag user which want you invite ke guild ${guild.name}.`, m);

    if (guild.owner !== userId) return conn.reply(m.chat, 'Hanya pemilik guild which can menginvite.', m);

    if (global.db.data.users[target].guild === guildId) return conn.reply(m.chat, 'User already tergabung dalam guild.', m);

    guild.waitingRoom.push(target);
    
    conn.reply(m.chat, `@${target.split('@')[0]} you has diinvite ke guild ${guild.name}. Silwill tunggu konfirmasi dari pemilik guild.`, m, { mentions: [target] });
};

handler.help = ['guildinvite <@user>'];
handler.tags = ['rpgG'];
handler.command = /^(guildinvite)$/i;
handler.rpg = true;
}

module.exports = handler;