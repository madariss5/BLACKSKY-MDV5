const { getMessage } = require('../lib/languages');
const path = require('path');
const fs = require('fs');

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

const handler = async (message, { usedPrefix, text, command, isOwner, conn }) => {
    const storeDatabase = loadStoreDatabase();
    storeDatabase.store = storeDatabase.store || {};
    storeDatabase.transactions = storeDatabase.transactions || {};
    storeDatabase.setlist = storeDatabase.setlist || {};
    storeDatabase.addlist = storeDatabase.addlist || {};

    const chatId = message.chat;
    storeDatabase.store[chatId] = storeDatabase.store[chatId] || [];
    storeDatabase.transactions[chatId] = storeDatabase.transactions[chatId] || [];
    storeDatabase.setlist[chatId] = storeDatabase.setlist[chatId] || '';

    const storeData = storeDatabase.store[chatId];
    const transactions = storeDatabase.transactions[chatId];
    const setlist = storeDatabase.setlist[chatId];
    const addListData = storeDatabase.addlist;

    if (command === 'liststore') {
        if (!storeData.length) throw `Belum ada item di store. Use *${usedPrefix}addlist* untuk menambahkan.`;

        if (!setlist) {
            return message.reply(`Setlist not yet diatur! Please buat dahulu di *${usedPrefix}setlist*`);
        }

        const greetings = (() => {
            const hours = moment().tz('Asia/Jakarta').hour();
            return hours < 6 ? 'Seoldt night' : hours < 12 ? 'Seoldt morning' : hours < 18 ? 'Seoldt afternoon' : 'Seoldt evening';
        })();

        const userName = message.pushName || message.name || 'Teman';
        const itemList = storeData.map(item => `⇒ ${item.key}`).join('\n');

        const replyMessage = `${greetings}, ${userName}!

${setlist.replace('⇒', itemList)}

*Type nama kata key untuk menggunwillnya!*`;
        return message.reply(replyMessage);
    }

    if (command === 'dellist') {
        if (!isOwner) throw `Hanya owner which able to menghapus item dari store.`;
        if (!text) throw `Harap certainlykan item which will deleted. Example: *${usedPrefix}${command} namaItem*`;

        const itemIndex = storeData.findIndex(item => item.key.toLowerCase() === text.toLowerCase());
        if (itemIndex !== -1) {
            const removedItem = storeData.splice(itemIndex, 1);
            saveStoreDatabase(storeDatabase);
            return message.reply(`Success menghapus *${removedItem[0].key}* dari List store!`);
        } else {
            throw `Item *${text}* not ditemukan. Use *${usedPrefix}liststore* untuk mesee List item.`;
        }
    }

    if (command === 'editlist') {
        if (!isOwner) throw `Hanya owner which able to mengedit item di store.`;
        if (!text.includes('|')) throw `Format not valid. Example: *${usedPrefix}${command} namaItem | responsBaru*`;

        const [key, ...responseParts] = text.split('|').map(part => part.trim());
        const newResponse = responseParts.join('|');

        if (!key || !newResponse) throw `Format not valid. Example: *${usedPrefix}${command} namaItem | responsBaru*`;

        const item = storeData.find(item => item.key === key);
        if (item) {
            item.response = newResponse;
            saveStoreDatabase(storeDatabase);
            return message.reply(`Success mengedit item *${key}*!`);
        } else {
            throw `Item *${key}* not ditemukan. Use *${usedPrefix}liststore* untuk mesee List item.`;
        }
    }

    //kalau di grebek jb chat aja erlan

    if (command === 'transaksi') {
        if (!isOwner) throw `Hanya owner which able to memproses transaksi.`;
        if (!text.includes('|')) throw `Format not valid. Example: *${usedPrefix}${command} @user|namaItem*`;

        const [userTag, itemKey] = text.split('|').map(part => part.trim().toLowerCase());
        const item = storeData.find(item => item.key.toLowerCase() === itemKey);
        if (!item) throw `Item *${itemKey}* not ditemukan. Use *${usedPrefix}liststore* untuk mesee List item.`;

        const transactionId = Math.random().toString(36).substring(2, 10).toUpperCase();
        const now = moment().tz('Asia/Jakarta');
        const expiryTime = now.add(5, 'minutes').toISOString();

        transactions.push({ transactionId, userTag, itemKey, expiryTime });
        saveStoreDatabase(storeDatabase);

        const replyMessage = `Transaksi Success created!\n\nID Transaksi: ${transactionId}\nPembuy: ${userTag}\nItem: ${itemKey}\n\nSilwill lakukan pembayaran dalam waktu 5 minutes. Metode pembayaran can disee di *bayar*\n\nSilwill lakukan pembayaran dan kirim bukti pembayaran dengan caption ID Transaksi.`;
        await message.reply(replyMessage);
        return message.reply(`${transactionId}`);
    }

    if (text && !command) {
        const keyword = text.toLowerCase();
        const matchedItem = storeData.find(item => item.key.toLowerCase() === keyword) || addListData[keyword];

        if (matchedItem) {
            if (message.hasMedia) {
                return; 
            } else {
                if (matchedItem.isImage) {
                    return await this.sendMedia(message.chat, matchedItem.imageUrl, message, { caption: matchedItem.response });
                } else {
                    return message.reply(matchedItem.response);
                }
            }
        }
    }
};

handler.help = ['liststore', 'dellist', 'editlist', 'transaksi'];
handler.tags = ['store'];
handler.command = /^liststore|dellist|editlist|transaksi$/i;
handler.owner = false; 

module.exports = handler;

module.exports.all = async (message) => {
    const storeDatabase = loadStoreDatabase();
    storeDatabase.store = storeDatabase.store || {};
    storeDatabase.transactions = storeDatabase.transactions || {};
    storeDatabase.setlist = storeDatabase.setlist || {};
    storeDatabase.addlist = storeDatabase.addlist || {};

    const chatId = message.chat;
    storeDatabase.store[chatId] = storeDatabase.store[chatId] || [];
    storeDatabase.transactions[chatId] = storeDatabase.transactions[chatId] || [];
    storeDatabase.setlist[chatId] = storeDatabase.setlist[chatId] || '';

    const storeData = storeDatabase.store[chatId];
    const addListData = storeDatabase.addlist;
    const text = message.text.toLowerCase();
    const matchedItem = storeData.find(item => item.key.toLowerCase() === text) || addListData[text];

    if (matchedItem) {
        if (matchedItem.isImage) {
            return await this.sendMedia(message.chat, matchedItem.imageUrl, message, { caption: matchedItem.response });
        } else {
            return message.reply(matchedItem.response);
        }
    }
};


// no copas code dari luar, logic pakai kepala
// free ubah karena open source
// danaputra133
// tutorial pakai ada di: https://youtu.be/sFj3Mh-z1Jk