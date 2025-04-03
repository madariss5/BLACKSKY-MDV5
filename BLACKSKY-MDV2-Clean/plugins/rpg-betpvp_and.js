const { getMessage } = require('../lib/languages');

const delay = (time) => new Promise((res) => setTimeout(res, time));

function random(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

module.exports.before = async function (m) {
    this.judipvp = this.judipvp ? this.judipvp : {};
    let room = Object.values(this.judipvp).find(room => room.id.startsWith('judipvp') && room.status && [room.p, room.p2].includes(m.sender));
    let user = db.data.users;
    let score = Math.ceil(Math.random() * 100) * 1;
    let score2 = Math.ceil(Math.random() * 100) * 1;

    if (room) {
        if (m.sender === room.p2 && /y(a|es)?/i.test(m.text.toLowerCase()) && m.isGroup && room.status === 'wait') {
            if (/n(o)?|tidak/i.test(m.text.toLowerCase())) {
                this.reply(m.chat, `@${room.p2.split`@`[0]} declined the PVP bet, bet canceled`, m, { contextInfo: { mentionedJid: [room.p2] } });
                delete this.judipvp[room.id];
            }
            if (user[room.p2][room.Type] < room.taruhan) return m.reply(`You don't have enough money! You need ${room.taruhan} ${room.Type}`);
            if (user[room.p][room.Type] < room.taruhan) return m.reply(`Your opponent doesn't have enough money! They need ${room.taruhan} ${room.Type}`);
            clearTimeout(room.waktu);
            room.status = 'spin';
            room.asal = m.chat;
            room.spin = room.p;
            await this.reply(room.asal, `Please Spin @${room.p.split('@')[0]}\n\nSpin by typing *Spin/gamble*`, m, { contextInfo: { mentionedJid: [room.p] } });
            room.waktu = setTimeout(() => {
                this.reply(m.chat, `Time\'s up @${room.spin.split('@')[0]} did not respond`, m, { contextInfo: { mentionedJid: [room.spin] } });
                delete this.judipvp[room.id];
            }, 60000);
        } else if (room.status === 'spin' && /spin|gamble/i.test(m.text)) {
            if (m.sender !== room.spin) return m.reply("It is not your turn now!");
            if (user[room.spin][room.Type] < room.taruhan) return m.reply(`You don't have enough money! You need ${room.taruhan} ${room.Type}`);
            if (user[room.p2][room.Type] < room.taruhan) return m.reply(`Your opponent doesn't have enough money! They need ${room.taruhan} ${room.Type}`);
            clearTimeout(room.waktu);
            room.score = score;
            room.status = 'spinp';
            room.spin = room.p2;
            room.waktu = setTimeout(() => {
                this.reply(m.chat, `Time\'s up @${room.spin.split('@')[0]} did not respond`, m, { contextInfo: { mentionedJid: [room.spin] } });
                delete this.judipvp[room.id];
            }, 60000);
            this.reply(room.asal, `@${m.sender.split('@')[0]} successfully got a score of ${score}\nNow it's @${room.p2.split('@')[0]}'s turn to spin\n\nPlease type *Spin/gamble* to spin`, m, { contextInfo: { mentionedJid: [room.p, room.p2] } });
        } else if (room.status === 'spinp' && /spin|gamble/i.test(m.text)) {
            if (m.sender !== room.spin) return m.reply(room.asal, 'It is not your turn now!', m);
            if (user[room.spin][room.Type] < room.taruhan) return m.reply(`You don't have enough money! You need ${room.taruhan} ${room.Type}`);
            if (user[room.p][room.Type] < room.taruhan) return m.reply(`Your opponent doesn't have enough money! They need ${room.taruhan} ${room.Type}`);
            clearTimeout(room.waktu);
            if (room.score < score2) {
                user[room.p2][room.Type] += room.taruhan * 1;
                user[room.p][room.Type] -= room.taruhan * 1;
                room.win = room.p2;
            } else if (room.score > score2) {
                user[room.p2][room.Type] -= room.taruhan * 1;
                user[room.p][room.Type] += room.taruhan * 1;
                room.win = room.p;
            } else {
                room.win = 'draw';
            }
            this.reply(room.asal, `
| *PLAYERS* | *POINT* |
*👤 @${room.p.split('@')[0]} :*      ${room.score}
*👤 @${room.p2.split('@')[0]} :*    ${score2}

${room.win !== 'draw' ? `The winner is @${room.win.split('@')[0]} and gets ${room.taruhan * 1} ${room.Type}` : `It's a draw! Both players keep their ${room.taruhan} ${room.Type}`}
`.trim(), m, { contextInfo: { mentionedJid: [room.p, room.p2] } });
            delete this.judipvp[room.id];
        }
        return true;
    }
    return true;
};