const { getMessage } = require('../lib/languages');
const fs = require('fs');
const path = require('path');
const moment = require('moment-timezone');

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

const handler = async (message, { isOwner }) => {
    const storeDatabase = loadStoreDatabase();
    storeDatabase.store = storeDatabase.store || {};
    storeDatabase.transactions = storeDatabase.transactions || {};

    const chatId = message.chat;
    storeDatabase.store[chatId] = storeDatabase.store[chatId] || [];
    storeDatabase.transactions[chatId] = storeDatabase.transactions[chatId] || [];

    const storeData = storeDatabase.store[chatId];
    const transactions = storeDatabase.transactions[chatId];

    if (!isOwner) throw `Hanya owner which able to memproses transaksi.`;
    if (!message.quoted) throw `Harap reply ke message which berisi bukti image.`;
    const quotedMessage = message.quoted;
    const transactionId = quotedMessage.text.trim().toUpperCase();
    const transaction = transactions.find(t => t.transactionId === transactionId);

    if (!transaction) throw `ID Transaksi not valid atau already kadaluarsa.`;

    const now = moment().tz('Asia/Jakarta');
    if (now.isAfter(moment(transaction.expiryTime))) {
        throw `ID Transaksi not valid atau already kadaluarsa.`;
    }

    const item = storeData.find(item => item.key.toLowerCase() === transaction.itemKey);
    if (item) {
        const replyMessage = `「 PROSES ADMIN AQUA 」\n\n📆 TANGGAL : ${now.format('YYYY-MM-DD')}\n⌚ hours     : ${now.format('HH:mm')}\n✨ status  : proses\n📝 note : ${item.response}\n\nPesanan @${quotedMessage.sender.split('@')[0]} currently di proses!\n\nMohon ditunggu ya`;
        message.reply(replyMessage, null, { mentions: [quotedMessage.sender] });

        // Remove the transaction after 5 minutes
        setTimeout(() => {
            const transactionIndex = transactions.findIndex(t => t.transactionId === transactionId);
            if (transactionIndex !== -1) {
                transactions.splice(transactionIndex, 1);
                saveStoreDatabase(storeDatabase);
            }
        }, 5 * 60 * 1000);
    } else {
        throw `Item *${transaction.itemKey}* not ditemukan.`;
    }
};

handler.customPrefix = /^proses$/i;
handler.command = new RegExp;
module.exports = handler;


// no copas code dari luar, logic pakai kepala
// free ubah karena open source
// danaputra133
// tutorial pakai ada di: https://youtu.be/sFj3Mh-z1Jk