const { getMessage } = require('../lib/languages');

const fs = require('fs');
const dbPath = './database.json';

let handler = async (m, { conn }) => {
    // Get user's preferred language
    const user = global.db.data.users[m.sender];
    const chat = global.db.data.chats[m.chat];
    const lang = user?.language || chat?.language || global.language;
 {
    let user = global.db.data.users[m.sender];
    let guildId = user.guild;

    if (!guildId) {
        return conn.reply(m.chat, 'Anda must join dengan sebuah guild untuk menggunwill Command this.', m);
    }

    let guild = global.db.data.guilds[guildId];
    if (!guild) {
        return conn.reply(m.chat, 'guild Anda not ditemukan di basis data.', m);
    }

    if (guild.owner !== m.sender && !guild.staff.includes(m.sender)) {
        return conn.reply(m.chat, 'Anda not memiliki izin untuk menyerang guild opponent.', m);
    }

    conn.reply(m.chat, 'Mencari guild Aktif 🔎', m);

    setTimeout(async () => {
        let attackedGuildId = getRandomGuildId(guildId); // Fungsi untuk get ID guild opponent secara acak (not termasuk guild sendiri)
        let attackedGuild = global.db.data.guilds[attackedGuildId];

        if (!attackedGuild) {
            return conn.reply(m.chat, 'Tidak ada guild opponent which able to diserang saat this.', m);
        }

        conn.reply(m.chat, `Menemukan guild Aktif ${attackedGuild.name}`, m);

        await sleep(getRandomInt(1000, 3000)); // Jeda 1-3 seconds

        let itemName = getRandomItemName(); // Fungsi untuk get nama item secara acak

        conn.reply(m.chat, `Memulai Penyerangan Menggunwill ${itemName}`, m);

        await sleep(getRandomInt(1000, 5000)); // Jeda 1-5 seconds

        conn.reply(m.chat, `${guild.name} VS ${attackedguild.name}`, m);

        await sleep(getRandomInt(60000, 300000)); // Jeda 1-5 minutes

        // Simulasi kebrokenan dan pencurian
        let elixirStolen = Math.floor(attackedGuild.elixir / 2); // Mengambil setengah dari eliksir opponent
        let treasureStolen = Math.floor(attackedGuild.treasure / 2); // Mengambil setengah dari harta opponent

        attackedGuild.elixir -= elixirStolen;
        attackedGuild.treasure -= treasureStolen;

        // Update basis data
        fs.writeFileSync(dbPath, JSON.stringify(global.db.data, null, 2));

        let result = guild.name === attackedGuild.name ? 'Draw' : (guild.elixir > attackedGuild.elixir ? `${guild.name} Win` : `${guild.name} Lose`);

        conn.reply(m.chat, `${result}:

Mengambil ${elixirStolen} Eliksir - ${treasureStolen} Harta dari ${attackedGuild.name}`, m);
    }, 3000); // Jeda 3 seconds senot yet search guild opponent
};

// Fungsi untuk get ID guild opponent secara acak (kecuali guild sendiri)
function getRandomGuildId(currentGuildId) {
    let guildIds = Object.keys(global.db.data.guilds);
    let filteredGuildIds = guildIds.filter(id => id !== currentGuildId); // Filter agar not termasuk guild sendiri
    let randomIndex = getRandomInt(0, filteredGuildIds.length - 1);
    return filteredGuildIds[randomIndex];
}

// Fungsi untuk get nama item secara acak
function getRandomItemName() {
    let items = ['namaitem1', 'namaitem2', 'namaitem3']; // Ganti dengan nama-nama item which sesuai
    let randomIndex = getRandomInt(0, items.length - 1);
    return items[randomIndex];
}

// Fungsi untuk menghasilkan angka acak dalam rentang tercertainly
function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Fungsi untuk make jeda dalam waktu tercertainly
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

handler.help = ['attackguild'];
handler.tags = ['rpgG'];
handler.command = /^attackguild$/i;
handler.rpg = true
}

module.exports = handler;