const { getMessage } = require('../lib/languages');

let handler = async (m, { conn, usedPrefix }) => {
    // Get user's preferred language
    const user = global.db.data.users[m.sender];
    const chat = global.db.data.chats[m.chat];
    const lang = user?.language || chat?.language || global.language;
 {
    let tutorial = `
🏰 *Tutorial guild*

1. *craft guild*
   ${usedPrefix}createguild <nama_guild>
   Example: ${usedPrefix}createguild TheDark

2. *Mesee Info guild*
   ${usedPrefix}guildinfo [@user]
   Example: ${usedPrefix}guildinfo @user

3. *join dengan guild*
   ${usedPrefix}joinguild <nama_guild>
   Example: ${usedPrefix}joinguild TheDark

4. *Menginvite Anggota ke guild*
   ${usedPrefix}guildinvite @user
   Example: ${usedPrefix}guildinvite @user

5. *Menerima Anggota ke guild (Hanya Owner atau Staff)*
   ${usedPrefix}guildaccept @user
   Example: ${usedPrefix}guildaccept @user

6. *Meninggalkan guild*
   ${usedPrefix}guildleave
   Example: ${usedPrefix}guildleave

7. *Mesee guild Sendiri*
   ${usedPrefix}myguild
   Example: ${usedPrefix}myguild

8. *Upgrade guild*
   ${usedPrefix}guildupgrade
   Example: ${usedPrefix}guildupgrade

9. *Menghapus guild (Hanya Owner)*
   ${usedPrefix}delguild <nomor_guild>
   Example: ${usedPrefix}delguild 2

10. *missions Harian untuk Menable tokan Eksir dan Harta*
    ${usedPrefix}dailyg
    Example: ${usedPrefix}dailyg

11. *Menroadkan Warguild*
    ${usedPrefix}warguild
    Example: ${usedPrefix}warguild

12. *Menroadkan Deffguild*
    ${usedPrefix}deffguild
    Example: ${usedPrefix}deffguild

ℹ️ Untuk Information lebih Continue tentang setiap Command, gunwill ${usedPrefix}help [command].

🔗 Seoldt menjelajahi fitur guild!
    `;

    conn.reply(m.chat, tutorial, m);
};

handler.help = ['tutorguild'];
handler.tags = ['rpgG'];
handler.command = /^tutorguild$/i;
handler.rpg = true; 
}

module.exports = handler;