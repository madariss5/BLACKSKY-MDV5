const { getMessage } = require('../lib/languages');

const fs = require('fs');
const dbPath = './database.json'; // Path ke database file

let handler = async (m, { conn, args }) => {
    // Get user's preferred language
    const user = global.db.data.users[m.sender];
    const chat = global.db.data.chats[m.chat];
    const lang = user?.language || chat?.language || global.language;
 {
    if (args.length < 1) return conn.reply(m.chat, 'Example Useran: .createguild <nama_guild>', m);
    
    let userId = m.sender;
    let guildName = args.join(' ');

    // Memeriksa apakah user memiliki enough money untuk make guild
    let user = global.db.data.users[userId];
    if (!user) return conn.reply(m.chat, 'Kamu not yet terList di dalam database.', m);
    
    if (user.money < 20000000000) {
        return conn.reply(m.chat, 'Kamu not memiliki enough money untuk make guild. Butuh 20.000.000.000 money.', m);
    }

    // Inisialisasi basis data User jika not yet ada
    if (!global.db.data.users) global.db.data.users = {};
    if (!global.db.data.users[userId]) {
        global.db.data.users[userId] = {
            guild: null,
            money: 0,
            exp: 0,
            // Menambahkan field untuk exp guild
            guild_exp: 0,
            // Inisialisasi data User lainnya jika dineedkan
        };
    }
    
    if (user.guild) return conn.reply(m.chat, 'Kamu already tergabung dalam guild.', m);
    
    let guildId = 'guild_' + new Date().getTime(); // craft ID guild unik
    if (!global.db.data.guilds) global.db.data.guilds = {};
    if (!global.db.data.guilds[guildId]) {
        global.db.data.guilds[guildId] = {
            name: guildName,
            owner: userId,
            members: [userId],
            createdAt: new Date().toISOString(),
            level: 1, // Menambahkan level guild
            exp: 0, // Menambahkan exp guild
            eliksir: 0, // Menambahkan eliksir guild
            harta: 0, // Menambahkan harta guild
            guardian: null, // Menambahkan guardian guild
            attack: 0, // Menambahkan attack guild
            staff: [], // Menambahkan staff guild
            waitingRoom: [], // Menambahkan waiting room guild
        };
        user.guild = guildId;
        user.money -= 20000000000; // Mengurangi money user sehas make guild
        fs.writeFileSync(dbPath, JSON.stringify(global.db.data, null, 2));
        conn.reply(m.chat, `guild ${guildName} Success created.`, m);
    } else {
        conn.reply(m.chat, 'An error occurred saat make guild. Coba again.', m);
    }
};

handler.help = ['createguild <nama_guild>'];
handler.tags = ['rpgG'];
handler.command = /^(createguild)$/i;
handler.owner = false;
handler.rpg = true;
}

module.exports = handler;