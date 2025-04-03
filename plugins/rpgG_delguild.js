const { getMessage } = require('../lib/languages');

const fs = require('fs');
const dbPath = './database.json'; // Path ke database file

let handler = async (m, { conn, args }) => {
    // Get user's preferred language
    const user = global.db.data.users[m.sender];
    const chat = global.db.data.chats[m.chat];
    const lang = user?.language || chat?.language || global.language;
 {
    let userId = m.sender;
    let user = global.db.data.users[userId];

    if (!user.guild) return conn.reply(m.chat, 'Kamu not yet tergabung dalam guild mana pun.', m);

    let guilds = Object.values(global.db.data.guilds);

    if (guilds.length === 0) return conn.reply(m.chat, 'Tidak ada guild which tersedia untuk deleted.', m);

    let guildList = guilds.map((guild, index) => `${index + 1}. ${guild.name}`).join('\n');
    let responseText = `Pilih guild which want deleted dengan mengetik nomor guild:\n\n${guildList}`;

    if (args.length < 1) return conn.reply(m.chat, responseText, m);

    let guildIndex = parseInt(args[0]) - 1;

    if (isNaN(guildIndex) || guildIndex < 0 || guildIndex >= guilds.length) {
        return conn.reply(m.chat, 'Nomor guild not valid.', m);
    }

    let selectedGuild = guilds[guildIndex];

    if (selectedGuild.owner !== userId) return conn.reply(m.chat, 'Hanya owner guild which can menghapus guild.', m);

    // delete guild dari database
    delete global.db.data.guilds[selectedGuild.name];

    // delete referensi guild dari setiap anggota
    selectedGuild.members.forEach(memberId => {
        if (global.db.data.users[memberId]) {
            global.db.data.users[memberId].guild = null;
        }
    });

    fs.writeFileSync(dbPath, JSON.stringify(global.db.data, null, 2));

    conn.reply(m.chat, `guild ${selectedGuild.name} Success deleted.`, m);
};

handler.help = ['delguild <nomor_guild>'];
handler.tags = ['rpgG'];
handler.command = /^(delguild)$/i;
handler.owner = false;
handler.rpg = true
}

module.exports = handler;