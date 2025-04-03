const { getMessage } = require('../lib/languages');

let handler = async (m, { conn, args }) => {
    // Get user's preferred language
    const user = global.db.data.users[m.sender];
    const chat = global.db.data.chats[m.chat];
    const lang = user?.language || chat?.language || global.language;
 {
    let userId = m.sender;
    let user = global.db.data.users[userId];
    let upgradeType = args[0];

    if (!user.guild) return conn.reply(m.chat, 'Kamu not yet tergabung dalam guild.', m);

    let guildId = user.guild;
    let guild = global.db.data.guilds[guildId];
    if (!guild) return conn.reply(m.chat, 'guild not ditemukan.', m);

    if (!upgradeType) return conn.reply(m.chat, 'Pilih jenis upgrade which want you lakukan (level, eliksir, harta, guardian, attack).', m);

    switch (upgradeType.toLowerCase()) {
        case 'level':
            if (user.money < 5000000000) return conn.reply(m.chat, 'Kamu not memiliki enough money untuk upgrade level guild. Butuh 5.000.000.000 money.', m);

            guild.level++;
            user.money -= 5000000000;
            conn.reply(m.chat, `level guild ${guild.name} has ditingkatkan menjadi ${guild.level}.`, m);
            break;
        case 'eliksir':
            if (user.money < 1000000000) return conn.reply(m.chat, 'Kamu not memiliki enough money untuk upgrade eliksir guild. Butuh 1.000.000.000 money.', m);

            guild.eliksir++;
            user.money -= 1000000000;
            conn.reply(m.chat, `Eliksir guild ${guild.name} has ditingkatkan menjadi ${guild.eliksir}.`, m);
            break;
        case 'harta':
            if (user.money < 2000000000) return conn.reply(m.chat, 'Kamu not memiliki enough money untuk upgrade harta guild. Butuh 2.000.000.000 money.', m);

            guild.harta++;
            user.money -= 2000000000;
            conn.reply(m.chat, `Harta guild ${guild.name} has ditingkatkan menjadi ${guild.harta}.`, m);
            break;
        case 'guardian':
            if (user.money < 3000000000) return conn.reply(m.chat, 'Kamu not memiliki enough money untuk upgrade guardian guild. Butuh 3.000.000.000 money.', m);

            guild.guardian++;
            user.money -= 3000000000;
            conn.reply(m.chat, `Guardian guild ${guild.name} has ditingkatkan menjadi ${guild.guardian}.`, m);
            break;
        case 'attack':
            if (user.money < 4000000000) return conn.reply(m.chat, 'Kamu not memiliki enough money untuk upgrade attack guild. Butuh 4.000.000.000 money.', m);

            guild.attack++;
            user.money -= 4000000000;
            conn.reply(m.chat, `Attack guild ${guild.name} has ditingkatkan menjadi ${guild.attack}.`, m);
            break;
        default:
            conn.reply(m.chat, 'Pilih jenis upgrade which valid: level, eliksir, harta, guardian, attack.', m);
            break;
    }

    fs.writeFileSync(dbPath, JSON.stringify(global.db.data, null, 2));
};

handler.help = ['guildupgrade <level/eliksir/harta/guardian/attack>'];
handler.tags = ['rpgG'];
handler.command = /^(guildupgrade)$/i;
handler.rpg = true;
}

module.exports = handler;