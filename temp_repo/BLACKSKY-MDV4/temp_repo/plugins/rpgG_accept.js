const { getMessage } = require('../lib/languages');

let handler = async (m, { conn }) => {
    // Get user's preferred language
    const user = global.db.data.users[m.sender];
    const chat = global.db.data.chats[m.chat];
    const lang = user?.language || chat?.language || global.language;
 {
    let user = global.db.data.users[m.sender];

    // check apakah User adalah pemilik guild atau memiliki peran staff
    if (!isGuildOwner(user) && !isGuildStaff(user)) {
        return conn.reply(m.chat, 'Anda not memiliki izin untuk melakukan this.', m);
    }

    let target = m.mentionedJid[0];
    if (!target) return conn.reply(m.chat, 'Tag user which want Anda accept di guild.', m);

    let targetUser = global.db.data.users[target];
    if (!targetUser.guildRequest) return conn.reply(m.chat, 'Tidak ada permintaan join which tertunda dari User this.', m);

    let guildName = targetUser.guildRequest;
    let guild = global.db.data.guilds[guildName];

    guild.members.push(target);
    targetUser.guild = guildName;
    delete targetUser.guildRequest;

    conn.reply(m.chat, `Permintaan join dari @${target.split('@')[0]} has diterima.`, m);
};

handler.help = ['guildaccept @user'];
handler.tags = ['rpgG'];
handler.command = /^(guildaccept)$/i;
handler.rpg = true;
}

module.exports = handler;


// Fungsi untuk mengecek apakah User adalah pemilik guild
function isGuildOwner(user) {
    // Implementasi logika untuk mengecek apakah user adalah pemilik guild
    return user.role === 'owner'; // Misalnya, jika role 'owner' show pemilik guild
}

// Fungsi untuk mengecek apakah User memiliki peran staff di guild
function isGuildStaff(user) {
    // Implementasi logika untuk mengecek apakah user memiliki peran staff di guild
    return user.role === 'staff'; // Misalnya, jika role 'staff' show staff guild
}