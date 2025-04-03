const { getMessage } = require('../lib/languages');


let fetch = require('node-fetch');

let handler = async (m, { conn, command }) => {
    // Get user's preferred language
    const user = global.db.data.users[m.sender];
    const chat = global.db.data.chats[m.chat];
    const lang = user?.language || chat?.language || global.language;
 {
let audio = 'src/lagu.mp3'
const img = await fetch(`https://telegra.ph/file/3947ccd86c9e9426eec8b.jpg`).then(res => res.buffer())
let text = `🎵 Lagu Betabotz 🎵

(Verse 1)
Di GitHub, Betabotz beraksi,
Kode-kode terbuka, semangat tak terganti.
ERLANRAHMAT, sang pemilik,
Menyebarkan bot WhatsApp, tak terhenti.

(Chorus)
Betabotz, oh Betabotz,
Dengan fire-nya which mempesona.
Dari media downloader hingga pairing code,
Fiturnya mengagumkan, tak terbantahkan.

(Verse 2)
Windows, VPS, RDP, semua can,
Git, NodeJS, FFmpeg, ImageMagick, don't lupa.
ApiKey wajib diisi, don't lupa,
Express, ffmpeg, imagemagick, webp, semua terhubung.

(Chorus)
Betabotz, oh Betabotz,
Dengan fire-nya which mempesona.
Dari media downloader hingga pairing code,
Fiturnya mengagumkan, tak terbantahkan.

(Bridge)
Scraper langka, toanime, remini, dan tozombie,
Uploader dari BOTCAHX dan AEMT, tak terbantahkan.
Menggunwill CDN dan AEMT,
Betabotz-tools, fitur-fitur which mengagumkan.

(Chorus)
Betabotz, oh Betabotz,
Dengan fire-nya which mempesona.
Dari media downloader hingga pairing code,
Fiturnya mengagumkan, tak terbantahkan.

(Outro)
accept kasih, Tio Erlan Nayla,
Bo`
await conn.sendFile(m.chat, img, null, text, m);
conn.sendMessage(m.chat, { audio: { url: audio }, mimetype: 'audio/mpeg' }, { quoted: m });

}

handler.customPrefix = /^(betabotz)$/i 
handler.command = new RegExp
handler.tags = ['main']
}

module.exports = handler