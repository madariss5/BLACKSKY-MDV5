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

    if (guild.owner !== userId) return conn.reply(m.chat, 'Hanya pemilik guild which can mesee Information guild lain.', m);

    let targetUser = global.db.data.users[target];
    if (!targetUser || !targetUser.guild || targetUser.guild !== guildId) return conn.reply(m.chat, 'User not tergabung dalam guild you.', m);

    let membersList = guild.members.map((member, idx) => `• ${idx + 1}. @${member.split('@')[0]}`).join('\n');
    let guildInfo = `
Name guild: ${guild.name}
level: ${guild.level}
Pemilik: @${guild.owner.split('@')[0]}
Anggota:
${membersList}
Eksperience guild: ${guild.exp} / 1000
Eliksir: ${guild.eliksir}
Harta: ${guild.harta}
Guardian: ${guild.guardian || '-'}
Attack: ${guild.attack}
Staff: ${guild.staff.length > 0 ? guild.staff.map(staff => `• @${staff.split('@')[0]}`).join('\n') : '-'}
Waiting Room: ${guild.waitingRoom.length > 0 ? guild.waitingRoom.map(room => `• @${room.split('@')[0]}`).join('\n') : '-' }
Dibuat Pada: ${guild.createdAt}`;

    conn.reply(m.chat, guildInfo, m, { mentions: [guild.owner, ...guild.members] });
};

handler.help = ['guildinfoacc <@user>'];
handler.tags = ['rpgG'];
handler.command = /^(guildinfoacc)$/i;
handler.rpg = true
}

module.exports = handler;