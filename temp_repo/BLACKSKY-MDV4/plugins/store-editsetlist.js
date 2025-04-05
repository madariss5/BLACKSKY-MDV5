const { getMessage } = require('../lib/languages');
const path = require('path');
const fs = require('fs');

const storeDatabaseFilePath = path.join(__dirname, 'store-database.json');

const loadStoreDatabase = () => {
    if (fs.existsSync(storeDatabaseFilePath)) {
        const data = fs.readFileSync(storeDatabaseFilePath);
        return JSON.parse(data);
    }
    return { store: {}, transactions: {}, setlist: {} };
};

const saveStoreDatabase = (data) => {
    fs.writeFileSync(storeDatabaseFilePath, JSON.stringify(data, null, 2));
};

const handler = async (message, { text, isOwner, usedPrefix }) => {
    const storeDatabase = loadStoreDatabase();
    storeDatabase.setlist = storeDatabase.setlist || {};

    const chatId = message.chat;

    if (!isOwner) throw `Hanya owner which able to mengedit setlist.`;
    if (!text) throw `Harap certainlykan setlist which will diatur. Example: ${usedPrefix}editsetlist teksSetlist\n\nPetunjuk: Use teks custom Anda untuk mengatur layout setlist. Example Template:\n🔥 BetaBotz Hosting 🔥  

––––––––––––––––––––––––––  
📌 List Paket Panel:  
╭──────────────────────────╮  
⇒

╰──────────────────────────╯  
––––––––––––––––––––––––––  


ℹ️ Rules:
•⁠  ⁠Dilarang untuk mining
•⁠  ⁠Dilarang untuk digunwill DDOS
•⁠  ⁠Dilarang untuk menggunwill script which ada file proxy atau bahkan file ddos
•⁠  ⁠Dilarang untuk menyebarkan link panel atau menyebarkan data user
•⁠  ⁠Jika melanggar tos will I delete akunnya sebab I galak 😹🗿

✅ Buildpack which already di install 🛠️  
•⁠  ⁠FFMPEG, IMAGEMAGICK, PYTHON3, PYTHON3-PIP  
•⁠  ⁠PUPPETEER, CHROMIUM, PM2, NPM, YARN  
•⁠  ⁠SPEEDTEST-NET, DLL  

🍄 Benefits:
•⁠  ⁠Menable tokan akun premium di fire secara gratis untuk free user,jika non free user can pilih expired atau limit
•⁠  ⁠Bisa Untuk Run Website ( Menggunwill Cloudflare Tunnel / Sejenis nya )
•⁠  ⁠Menable tokan akses ke website untuk management pembuyan,tagihan,expired server, dan Information mengenai panel

📆 Masa Aktif: 30 days  
🔄 Garansi: 30 days  
🗓️ Jika nak perlong pm saye

📩 Hubungi Kami:  
📱 WhatsApp: 

Type nama kata key untuk mesee isi nya!`;

    storeDatabase.setlist[chatId] = text.trim();
    saveStoreDatabase(storeDatabase);
    return message.reply(`Success mengedit setlist untuk group this!`);
};

handler.help = ['editsetlist'];
handler.tags = ['store'];
handler.command = /^editsetlist$/i;
handler.owner = true;
module.exports = handler;


// no copas code dari luar, logic pakai kepala
// free ubah karena open source
// danaputra133
// tutorial pakai ada di: https://youtu.be/sFj3Mh-z1Jk