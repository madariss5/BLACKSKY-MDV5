const { getMessage } = require('../lib/languages');

let handler = async (m, { conn }) => {
    // Get user's preferred language
    const user = global.db.data.users[m.sender];
    const chat = global.db.data.chats[m.chat];
    const lang = user?.language || chat?.language || global.language;
 {
    let guilds = Object.values(global.db.data.guilds);

    if (guilds.length === 0) {
        return conn.reply(m.chat, 'Belum ada guild which terList.', m);
    }

    let guildList = guilds.map((guild, idx) => `${idx + 1}. ${guild.name} ${guild.members.length} Member`).join('\n');

    conn.reply(m.chat, `亗 PUBLIC guild 亗\n${guildList}`, m);
};

handler.help = ['guildlist'];
handler.tags = ['rpgG'];
handler.command = /^(guildlist)$/i;
handler.rpg = true;
}

module.exports = handler;