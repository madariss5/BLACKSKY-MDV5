const { getMessage } = require('../lib/languages');

let handler = async (m, { conn, command, args }) => {
    // Get user's preferred language
    const user = global.db.data.users[m.sender];
    const chat = global.db.data.chats[m.chat];
    const lang = user?.language || chat?.language || global.language;
 {
    let user = global.db.data.users[m.sender];
    const tag = `@${m.sender.replace(/@.+/, '')}`;
    try {
        if (command === 'ytlive') {
            if (!user.youtube_account) {
                return conn.reply(m.chat, `Hey Kamu Iya Kamu ${tag}\nCreate an account first\nType: .createakunyt`, m);
            }
            let title = args.join(' ');
            if (!title || title.length > 50) {
                return conn.reply(m.chat, `${tag} Please provide a title for your live stream (maximum 50 characters).`, m);
            }
            const cooldownTime = 600000; // 10 minutes in milliseconds (10 * 60 * 1000)
            const lastLiveTime = user.lastLiveTime || 0;
            const timeSinceLastLive = new Date() - lastLiveTime;
            if (timeSinceLastLive < cooldownTime) {
                const remainingCooldown = cooldownTime - timeSinceLastLive;
                const formattedCooldown = msToTime(remainingCooldown);
                throw `You are already tired. Wait for\n${formattedCooldown}`;
            }
            setTimeout(() => {
                conn.reply(m.chat, `👋 Hello ${tag}, Your subscribers are waiting,\nit's time to stream again!`, m);
            }, cooldownTime);
            const randomSubscribers = Math.floor(Math.random() * (3000 - 10 + 1)) + 1;
            const randomLike = Math.floor(Math.random() * (1000 - 20 + 1)) + 10;
            const randomViewers = Math.floor(Math.random() * (1000000 - 100 + 1)) + 1;
            const randomDonation = Math.floor(Math.random() * (200000 - 10000 + 1)) + 10000;
            user.subscribers += randomSubscribers;
            user.like += randomLike;
            user.viewers += randomViewers;
            user.money += randomDonation;
            user.lastLiveTime = new Date();
            if (user.subscribers >= 1000000 && user.playButton < 3) {
                user.playButton += 1;
                user.eris += Math.floor(Math.random() * (1000000 - 500000 + 1)) + 500000; // Eris reward
                user.exp += 5000; // EXP reward
                conn.reply(m.chat, `📢 Congratulations! You have reached a subscriber milestone and received a *🥇 Diamond PlayButton* along with Money and exp rewards! 🎉\n\n📢 Check your progress by typing *.akunyt*`, m);
            } else if (user.subscribers >= 100000 && user.playButton < 2) {
                user.playButton += 1;
                user.eris += Math.floor(Math.random() * (500000 - 300000 + 1)) + 300000; // Eris reward
                user.exp += 2500; // EXP reward
                conn.reply(m.chat, `📢 Congratulations! You have reached a subscriber milestone and received a *🥈 Gold PlayButton* along with Money and exp rewards! 🎉\n\n📢 Check your progress by typing *.akunyt*`, m);
            } else if (user.subscribers >= 10000 && user.playButton < 1) {
                user.playButton += 1;
                user.money += Math.floor(Math.random() * (250000 - 10000 + 1)) + 10000; // Money reward
                user.exp += 500; // EXP reward
                conn.reply(m.chat, `📢 Congratulations! ${tag}, you have reached a subscriber milestone and received a *🥉 Silver PlayButton* along with Money and exp rewards! 🎉\n\n📢 Check your progress by typing *.akunyt*`, m);
            };
            const formattedSubscribers = formatNumber(user.subscribers);
            const formattedLike = formatNumber(user.like);
            const formattedViewers = formatNumber(user.viewers);
            const formattedDonation = formatCurrency(randomDonation);

            conn.reply(m.chat, `
[ 🎦 ] Live Streaming Results

🧑🏻‍💻 *Streamer:* ${tag}
📹 *Live Title:* ${title}
📈 *New Subscribers:* +${formatNumber(randomSubscribers)}
👍🏻 *New Likessss:* +${formatNumber(randomLike)}
🪬 *New Viewers:* +${formatNumber(randomViewers)}
💵 *Donations:* ${formattedDonation}

📊 *Total Likessss:* ${formattedLike}
📊 *Total Viewers:* ${formattedViewers}
📊 *Total Subscribers:* ${formattedSubscribers}

> Check your YouTube account
> Type:  .akunyt`, m);
        }
    } catch (err) {
        m.reply("📢: " + err);
    }
};

// Function to convert large numbers to K, M, B, T format
function formatNumber(num) {
    if (num >= 1e12) return (num / 1e12).toFixed(1) + 'T';
    if (num >= 1e9) return (num / 1e9).toFixed(1) + 'B';
    if (num >= 1e6) return (num / 1e6).toFixed(1) + 'M';
    if (num >= 1e3) return (num / 1e3).toFixed(1) + 'K';
    return num.toString();
}

// Function to convert numbers to Indonesian Rupiah (IDR) currency format
function formatCurrency(num) {
    return 'Rp' + new Intl.NumberFormat('id-ID').format(num);
}

// Function to convert milliseconds to a readable time format
function msToTime(duration) {
    const seconds = Math.floor((duration / 1000) % 60);
    const minutes = Math.floor((duration / (1000 * 60)) % 60);
    const hours = Math.floor((duration / (1000 * 60 * 60)) % 24);

    const formattedTime = [];
    if (hours > 0) {
        formattedTime.push(`${hours} hours`);
    }
    if (minutes > 0) {
        formattedTime.push(`${minutes} minutes`);
    }
    if (seconds > 0 || (hours === 0 && minutes === 0)) {
        formattedTime.push(`${seconds} seconds`);
    }

    return formattedTime.join(' ');
}

// Define help, tags, command, and registration for RPG command handler
handler.help = ['ytlive'];
handler.tags = ['rpg'];
handler.command = /^(ytlive|ytstreaming)/i;
handler.register = true;
handler.rpg = true;
handler.group = true;

// Export RPG command handler
}

module.exports = handler;