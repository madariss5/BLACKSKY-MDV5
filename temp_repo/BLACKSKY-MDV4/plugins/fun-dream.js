const { getMessage } = require('../lib/languages');

const moment = require('moment-timezone');

let handler = async (m, { text, conn, usedPrefix, command }) => {
    try {
        if (!text) {
            return m.reply(`╭═══❯ *DREAM EXPLORER* ❮═══
│
│ 🌙 Jelajahi Dunia Mimpimu!
│ 
│ 📝 *Format:*
│ ${usedPrefix}${command} [nama/kata key]
│
│ 📌 *Example:*
│ ${usedPrefix}${command} Raiden
│ ${usedPrefix}${command} sea
│
╰═════════════════════`);
        }

        await m.reply("🌙 *Mgolduki alam mimpi...*");
        await new Promise(resolve => setTimeout(resolve, 1500));
        await m.reply("✨ *Mengumpulkan esensi mimpi...*");
        await new Promise(resolve => setTimeout(resolve, 1500));

        const dreamData = generateDreamWorld(text);
        const dreamInterpretation = interpretDream(dreamData);

        const caption = `╭═══❯ *DREAM WORLD* ❮═══
│
│ 👤 *Explorer:* ${text}
│ 🌙 *Dream level:* ${dreamData.level}
│ 🎭 *Dream Core:*
│ ${dreamData.core}
│ 🌈 *Dream Elements:*
│ ${dreamData.elements.join('\n│ ')}
│ 🎪 *Dream Events:*
│ ${dreamData.events.join('\n│ ')}
│ 🌟 *Special Encounters:*
│ ${dreamData.encounters.join('\n│ ')}
│ 💫 *Dream Powers:*
│ ${dreamData.powers.join('\n│ ')}
│ 🔮 *Dream Message:*
│ ${dreamData.message}
│ 📝 *Dream Interpretation:*
│ ${dreamInterpretation}
│
╰═════════════════════

🎯 *Dream Quality:* ${dreamData.quality}
⏰ *Dream Time:* ${moment().tz('Asia/Jakarta').format('HH:mm:ss')}`;

        return m.reply(caption);

    } catch (error) {
        console.error('Error in dreamworld command:', error);
        return m.reply(`╭══════════════════════
│ ❌ *Terjadi Kewrongan*
│ Mohon coba beberapa saat again
╰══════════════════════`);
    }
};

function generateDreamWorld(seed) {
    const dreamLevels = ['Lucid ✨', 'Mystic 🌟', 'Ethereal 💫', 'Divine 🌙', 'Legendary 🎇'];
    const dreamQualities = ['Peaceful Dreams 😌', 'Adventure Dreams 🚀', 'Mystical Vision 🔮', 'Prophecy Dreams 📖', 'Epic Journey 🗺️'];

    const elementsList = [
        '🌊 Lautan Kristal Bercahaya',
        '🌈 Pelangi Mengambang',
        '🌺 Taman Melawhich',
        '⭐ Konstelasi Hidup',
        '🌙 months Kembar',
        '🎪 Sirkus Dimensi',
        '🏰 Kastil Awan',
        '🌋 mountain Prisma',
        '🎭 Theater Bawhichan',
        '🎪 Portal Waktu'
    ];

    const eventsList = [
        '🦋 Kupu-kupu carry message rahasia',
        '🎭 Topeng menari sendiri',
        '🌊 Hujan bintang jatuh ke sea',
        '🎪 Parade makhluk ajaib',
        '🌺 Bunga bernyanyi lagu kuno',
        '🎨 Lukisan menjadi alive',
        '🎵 Musik tersee sebagai warna',
        '⚡ Petir membentuk tangga ke langit',
        '🌈 Pelangi berubah menjadi bridge',
        '🕰️ Waktu berputar mundur'
    ];

    const encountersList = [
        '🐉 Naga Pelangi Bijaksana',
        '🧙‍♂️ wizard Bintang',
        '🦊 Rubah Spirit nine Ekor',
        '🧝‍♀️ Peri Pembawa Mimpi',
        '🦁 Singa Kristal',
        '🐋 Paus Terbang Mistis',
        '🦅 Burung Phoenix Waktu',
        '🐢 Kura-kura Pembawa Dunia',
        '🦄 Unicorn Dimensi',
        '👻 Spirit Pelindung'
    ];

    const powersList = [
        '✨ Mengendalikan Waktu',
        '🌊 Bertalk dengan Elemen',
        '🎭 Shapeshifting',
        '🌈 Manipulasi Realitas',
        '👁️ Pengseean Masa Depan',
        '🎪 Teleportasi Dimensi',
        '🌙 Penyembuhan Spiritual',
        '⚡ energy Kosmik',
        '🎨 Kreasi Instant',
        '💫 Telepati Universal'
    ];

    const messagesList = [
        'Perroadanmu will carry perumaterial big',
        'Rahasia kuno will terungkap dalam waktu dekat',
        'Kestrongan tersembunyi will segera bangkit',
        'Takdir new menanti di horizon',
        'Koneksi spiritual will menguat',
        'Transformasi big will terjadi',
        'Pencerahan will come dari arah tak terduga',
        'missions penting will segera dimulai',
        'Pertyou good dalam perroadan alivemu',
        'Kewisesanaan new will ditemukan'
    ];

    // Generate random but consistent results based on seed
    const seedNum = Array.from(seed).reduce((acc, char) => acc + char.charCodeAt(0), 0);
    
    const randomize = (arr) => arr[Math.floor((seedNum * arr.length) / 1000) % arr.length];
    const randomMultiple = (arr, count) => {
        const shuffled = [...arr].sort(() => (seedNum * 0.5) - 0.5);
        return shuffled.slice(0, count);
    };

    return {
        level: randomize(dreamLevels),
        quality: randomize(dreamQualities),
        core: generateDreamCore(seed),
        elements: randomMultiple(elementsList, 3),
        events: randomMultiple(eventsList, 3),
        encounters: randomMultiple(encountersList, 2),
        powers: randomMultiple(powersList, 2),
        message: randomize(messagesList)
    };
}

function generateDreamCore(seed) {
    const cores = [
        '🌌 Dunia Paralel Mistis',
        '🎪 Realm Keajaiban Antara',
        '🌙 Dimensi Cahaya silver',
        '✨ Negeri Kristal Mengambang',
        '🌈 Alam Pelangi Abadi',
        '🎭 Theater Realitas Mimpi',
        '⚡ Zona Waktu Misteri',
        '🌺 Taman Eden Ajaib',
        '🌊 Samudra Bintang Mistis',
        '🏰 Istana Awan Berkilau'
    ];
    
    return cores[Math.floor((Array.from(seed).reduce((acc, char) => acc + char.charCodeAt(0), 0) * cores.length) / 1000) % cores.length];
}

function interpretDream(dreamData) {
    const interpretations = [
        'Mimpi this show potensi kreatif which luar biasa dalam dirimu',
        'Perroadan spiritual which berarti will segera dimulai',
        'Kestrongan tersembunyi dalam dirimu will terungkap',
        'Waktu transformasi big currently mendekat',
        'Hubungan spesial will terbentuk dalam waktu dekat',
        'adventure new which menakjubkan menanti',
        'Kewisesanaan kuno will open road newmu',
        'Takdir istimewa currently menuju ke arahmu',
        'missions kealivean which penting will segera terungkap',
        'Pencerahan spiritual will come dalam bentuk tak terduga'
    ];

    const seedValue = dreamData.level + dreamData.core;
    return interpretations[Math.floor((Array.from(seedValue).reduce((acc, char) => acc + char.charCodeAt(0), 0) * interpretations.length) / 1000) % interpretations.length];
}

// Metadata command
handler.help = ['dreamworld', 'dream', 'mimpi', 'dreamexp'];
handler.tags = ['fun'];
handler.command = /^dreamworld|dream|mimpi$/i;
handler.group = true;
handler.limit = 1;

module.exports = handler;

//base by DEVOLUTION-MD1
//recode by danaputra133