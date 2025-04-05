const { getMessage } = require('../lib/languages');
const fs = require('fs');
const path = require('path');

const storeDatabaseFilePath = path.join(__dirname, 'store-database.json');

const loadStoreDatabase = () => {
    if (fs.existsSync(storeDatabaseFilePath)) {
        const data = fs.readFileSync(storeDatabaseFilePath);
        return JSON.parse(data);
    }
    return { store: {}, transactions: {}, setlist: {}, addlist: {} };
};

const saveStoreDatabase = (data) => {
    fs.writeFileSync(storeDatabaseFilePath, JSON.stringify(data, null, 2));
};

const handler = async (message, { text, isOwner, usedPrefix }) => {
    // Get user's preferred language
    const user = global.db.data.users[message.sender];
    const chat = global.db.data.chats[message.chat];
    const lang = user?.language || chat?.language || 'en'; // Default to English

    const storeDatabase = loadStoreDatabase();
    storeDatabase.setlist = storeDatabase.setlist || {};

    const chatId = message.chat;

    if (!isOwner) {
        const errorMsg = getMessage('owner_only', lang);
        throw errorMsg;
    }
    
    if (!text) {
        const template = `🔥 BetaBotz Hosting 🔥  

––––––––––––––––––––––––––  
📌 List Paket Panel:  
╭──────────────────────────╮  
⇒

╰──────────────────────────╯  
––––––––––––––––––––––––––  


ℹ️ Rules:
•⁠  ⁠No mining
•⁠  ⁠No DDOS activities
•⁠  ⁠No scripts with proxy files or ddos capabilities
•⁠  ⁠No sharing panel links or user data
•⁠  ⁠Violation of ToS will result in account deletion

✅ Pre-installed Buildpacks 🛠️  
•⁠  ⁠FFMPEG, IMAGEMAGICK, PYTHON3, PYTHON3-PIP  
•⁠  ⁠PUPPETEER, CHROMIUM, PM2, NPM, YARN  
•⁠  ⁠SPEEDTEST-NET, etc.  

🍄 Benefits:
•⁠  ⁠Premium account features for free users
•⁠  ⁠Website hosting capabilities (using Cloudflare Tunnel etc.)
•⁠  ⁠Access to management website for purchases, billing, and server information

📆 Active Period: 30 days  
🔄 Warranty: 30 days  
🗓️ Contact us for extensions

📩 Contact Us:  
📱 WhatsApp: 

Type a keyword to see details!`;

        const helpMsg = getMessage('store_setlist_help', lang, {
            prefix: usedPrefix,
            command: 'setlist',
            template: template
        });
        
        throw helpMsg;
    }

    storeDatabase.setlist[chatId] = text.trim();
    saveStoreDatabase(storeDatabase);
    
    const successMsg = getMessage('store_setlist_success', lang);
    return message.reply(successMsg);
};

handler.help = ['setlist'];
handler.tags = ['store'];
handler.command = /^setlist$/i;
handler.owner = true;
module.exports = handler;


// no copas code dari luar, logic pakai kepala
// free ubah karena open source
// danaputra133
// tutorial pakai ada di: https://youtu.be/sFj3Mh-z1Jk