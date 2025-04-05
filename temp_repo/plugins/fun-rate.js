const { getMessage } = require('../lib/languages');

let handler = async (m, { args, conn }) => {
    if (!args.length) return conn.reply(m.chat, "Masukkan sesuatu untuk dirate!\nExample: *.rate seberapa cocok aku dan dia*", m);

    // Menghasilkan angka random antara 1 - 100
    let rating = Math.floor(Math.random() * 100) + 1;

    // Format message
    let text = `✨ *Pertanyaan:* ${args.join(" ")}\n📊 *Jawaban:* ${rating}%`;

    // Kirim reply
    conn.reply(m.chat, text, m);
}

handler.help = ['rate']
handler.tags = ['fun']
handler.command = /^(rate|seberapa|cocok|kece)$/i
handler.group = true
handler.limit = true
handler.fail = null

module.exports = handler
