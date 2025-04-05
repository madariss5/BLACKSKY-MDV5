const { getMessage } = require('../lib/languages');

let handler = async (m, { conn, command, args, usedPrefix }) => {
    // Get user's preferred language
    const user = global.db.data.users[m.sender];
    const chat = global.db.data.chats[m.chat];
    const lang = user?.language || chat?.language || global.language;
 {
    try {
        const user = global.db.data.users[m.sender];
        const tag = '@' + m.sender.split('@')[0]; 
        let playButton = user.playButton || 0; 
        function formatNumber(number) {
            if (number >= 1000000) {
                return (number / 1000000).toFixed(1) + 'Jt';
            } else if (number >= 1000) {
                return (number / 1000).toFixed(1) + 'K';
            } else {
                return number;
            }
        }
        if (command === 'akunyt') {
            let targetNumber = m.sender;
            let targetTag = tag; 
            if (args.length > 0) {
                targetNumber = formatNumber(args[0]);
                targetTag = '@' + args[0].split('@')[0]; 
            }
            if (!global.db.data.users[targetNumber]?.youtube_account) {
                return conn.sendMessage(m.chat, { text: `Hey ${targetTag}, buat akun terlebih dahulu\nType: ${usedPrefix}createakunyt`, contextInfo: { mentionedJid: [m.sender] }}, { quoted: m });
            }
            const targetUser = global.db.data.users[targetNumber];
            const formattedSubscribers = formatNumber(targetUser.subscribers || 0);
            const formattedViewers = formatNumber(targetUser.viewers || 0);
            const formattedLike = formatNumber(targetUser.like || 0);
            const silverButton = targetUser.playButton >= 1 ? '✅' : '❎';
            const goldButton = targetUser.playButton >= 2 ? '✅' : '❎';
            const diamondButton = targetUser.playButton >= 3 ? '✅' : '❎';
            return conn.sendMessage(m.chat, { text: `📈 Akun YouTube ${targetTag} 📉\n
🧑🏻‍💻 *Streamer:* ${targetUser.registered ? targetTag : conn.getName(targetNumber)}
🌐 *Channel:* ${targetUser.youtube_account}
👥 *Subscribers:* ${formattedSubscribers}
🪬 *Viewers:* ${formattedViewers}
👍🏻 *Like:* ${formattedLike}

⬜ *Silver PlayButton:* ${silverButton}
🟧 *Gold PlayButton:* ${goldButton}
💎 *Diamond PlayButton:* ${diamondButton}`, contextInfo: { mentionedJid: [m.sender] }}, { quoted: m });
        } else if (/^live youtuber/i.test(command)) {
        } else {
            return await conn.reply("Command not recognized.\n*.akunyt*\n> Untuk mengecek akun YouTube Anda\n*.live youtuber [judul live]*\n> Untuk start aktivitas live streaming.");
        }
    } catch (err) {
        console.error(err);
        return m.reply("An error occurred dalam memproses Command.");
    }
};
handler.help = ['akunyt [nomor]'];
handler.tags = ['rpg'];
handler.command = /^(akunyt)$/i;
handler.register = true;
handler.group = true;
handler.rpg = true;
}

module.exports = handler;