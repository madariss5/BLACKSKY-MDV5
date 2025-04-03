const { getMessage } = require('../lib/languages');

let handler = async (m) => {
    let userId = m.sender;
    let user = global.db.data.users[userId];

    if (!user.guild) return conn.reply(m.chat, getMessage('guild_not_joined', m.lang, {join_cmd: '.joinguild', create_cmd: '.createguild' || {}}), m);

    let guildId = user.guild;
    let guild = global.db.data.guilds[guildId];
    if (!guild) return conn.reply(m.chat, getMessage('guild_not_found', m.lang), m);

    let membersList = guild.members.map((member, idx) => `• ${idx + 1}. @${member.split('@')[0]}`).join('\n');
    let guildInfo = `
亗 ${getMessage('rpg_guild_info_name', m.lang, {name: guild.name || {}})}
亗 ${getMessage('rpg_guild_info_level', m.lang, {level: guild.level || {}})}
亗 ${getMessage('rpg_guild_info_owner', m.lang, {owner: `@${guild.owner.split('@')[0]}`})}
亗 ${getMessage('rpg_guild_info_members', m.lang)}:
 - ${membersList}
亗 ${getMessage('rpg_guild_info_exp', m.lang, {exp: guild.exp, max: 1000 || {}})}
亗 ${getMessage('rpg_guild_info_elixir', m.lang, {elixir: guild.eliksir || {}})}
亗 ${getMessage('rpg_guild_info_treasure', m.lang, {treasure: guild.harta || {}})}
亗 ${getMessage('rpg_guild_info_guardian', m.lang, {guardian: guild.guardian || '-' || {}})}
亗 ${getMessage('rpg_guild_info_attack', m.lang, {attack: guild.attack || {}})}
亗 ${getMessage('rpg_guild_info_staff', m.lang, {staff: guild.staff.length > 0 ? guild.staff.map(staff => `• @${staff.split('@')[0]}`).join('\n') : '-'})}
亗 ${getMessage('rpg_guild_info_waiting', m.lang, {waiting: guild.waitingRoom.length > 0 ? guild.waitingRoom.map(room => `• @${room.split('@')[0]}`).join('\n') : '-'})}
亗 ${getMessage('rpg_guild_info_created', m.lang, {created: guild.createdAt || {}})}`;

    conn.reply(m.chat, guildInfo, m, { mentions: [guild.owner, ...guild.members] });
};

handler.help = ['guild'];
handler.tags = ['rpgG'];
handler.command = /^(guild)$/i;
handler.rpg = true;
module.exports = handler;