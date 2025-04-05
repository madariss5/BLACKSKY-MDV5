const { getMessage } = require('../lib/languages');

const fs = require('fs');
const path = require('path');
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

    if (guild.owner !== userId) return conn.reply(m.chat, 'Hanya pemilik guild which can mengatur staff.', m);

    if (!args[0]) return conn.reply(m.chat, 'Format which you masukkan wrong. Example Useran: .guildstaff tambah/delete @user', m);

    let action = args[0].toLowerCase();
    let target = m.mentionedJid[0] || args[1];

    if (!target) return conn.reply(m.chat, 'Tag user which want ditambahkan atau deleted dari staff.', m);

    if (action === 'tambah') {
        if (guild.staff.includes(target)) return conn.reply(m.chat, 'User already menjadi staff.', m);

        guild.staff.push(target);
        conn.reply(m.chat, `@${target.split('@')[0]} has ditambahkan sebagai staff di guild ${guild.name}.`, m, { mentions: [target] });
    } else if (action === 'delete') {
        if (!guild.staff.includes(target)) return conn.reply(m.chat, 'User not ada di dalam staff.', m);

        guild.staff = guild.staff.filter(staff => staff !== target);
        conn.reply(m.chat, `@${target.split('@')[0]} has deleted dari staff di guild ${guild.name}.`, m, { mentions: [target] });
    } else {
        conn.reply(m.chat, 'Format which you masukkan wrong. Example Useran: .guildstaff tambah/delete @user', m);
    }

    fs.writeFileSync(dbPath, JSON.stringify(global.db.data, null, 2));
};

handler.help = ['guildstaff <tambah/delete> <@user>'];
handler.tags = ['rpgG'];
handler.command = /^(guildstaff)$/i;
handler.rpg = true;   
}

module.exports = handler;