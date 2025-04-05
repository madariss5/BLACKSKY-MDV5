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

    let guilds = Object.values(global.db.data.guilds);

    if (guilds.length === 0) {
        return conn.reply(m.chat, 'Belum ada guild which terList.', m);
    }

    let guildList = guilds.map((guild, idx) => `${idx + 1}. ${guild.name} (${guild.members.length} anggota)`).join('\n');

    conn.reply(m.chat, `List guild:\n${guildList}`, m);
};

handler.help = ['guildlistacc'];
handler.tags = ['rpgG'];
handler.command = /^(guildlistacc)$/i;
handler.rpg = true;
}

module.exports = handler;