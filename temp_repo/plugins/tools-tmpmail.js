const { getMessage } = require('../lib/languages');

let axios = require('axios');
let cheerio = require('cheerio');

let handler = async (m, { conn, command, usedPrefix }) => {
    // Get user's preferred language
    const user = global.db.data.users[m.sender];
    const chat = global.db.data.chats[m.chat];
    const lang = user?.language || chat?.language || global.language;
 {
    conn.sessionsMail = conn.sessionsMail || {};

    for (let user in conn.sessionsMail) {
        let { lastCheckedAt } = conn.sessionsMail[user];
        if (Date.now() - lastCheckedAt > 30 * 60 * 1000) {
            delete conn.sessionsMail[user];
        }
    }

    if (command === "tempmail") {
        if (conn.sessionsMail[m.sender]) {
            return m.reply(`🚀 Anda sudah memiliki Temp Mail!\n📩 *Email:* ${conn.sessionsMail[m.sender].email}\n⏳ *Tunggu sekitar 5-10 minutes sebelum check.*`);
        }

        try {
            let res = await axios.get(`https://api.betabotz.eu.org/fire/tools/create-temp-mail?apikey=${lann}`);
            if (!res.data.status) throw "❌ Failed craft email sementara!";

            let email = res.data.result;
            conn.sessionsMail[m.sender] = {
                email,
                createdAt: Date.now(),
                lastCheckedAt: Date.now()
            };

            m.reply(`✅ *Temp Mail Anda:*\n📩 *Email:* ${email}\n⏳ *Tunggu sekitar 5-10 minutes sebelum check.*`);
        } catch (e) {
            console.error(e);
            m.reply(getMessage('error_generic', lang, { error: 'An error occurred saat craft email sementara!' }));
        }
    } else if (command === "cekmail" || command === "checkmail") {
        if (!conn.sessionsMail[m.sender]) {
            return m.reply("⚠️ Anda belum memiliki Temp Mail!\nuse `${usedPrefix + command}` untuk craftnya.");
        }

        let { email } = conn.sessionsMail[m.sender];

        conn.sessionsMail[m.sender].lastCheckedAt = Date.now();

        try {
            let res = await axios.get(`https://api.betabotz.eu.org/fire/tools/check-msg-tmp-mail?email=${email}&apikey=${lann}`);
            if (!res.data.status) throw "❌ Failed mengambil message email!";
            
            let messages = res.data.result;
            if (messages.length === 0) {
                return m.reply(`📭 *Belum ada message masuk di ${email}.*\n⏳ *Coba check lagi later.*`);
            }

            let pesan = messages.map((msg) => {
                let cleanText = extractText(msg.html || msg.text);
                return `📬 *message Baru!*\n💌 *Dari:* ${msg.sf}\n📢 *Subjek:* ${msg.s}\n🕒 *Waktu:* ${msg.rr}\n\n📝 *Isi message:*\n${cleanText}`;
            }).join("\n\n");

            m.reply(pesan);
        } catch (e) {
            console.error(e);
            m.reply(getMessage('error_generic', lang, { error: 'An error occurred saat mengecek email!' }));
        }
    }
};

handler.command = ['tempmail', 'cekmail', 'checkmail'];
handler.tags = ['tools'];
handler.help = ['tempmail', 'cekmail', 'checkmail'];
handler.limit = true;

}

module.exports = handler;

function extractText(html) {
    let $ = cheerio.load(html);
    return $.text().trim();
}