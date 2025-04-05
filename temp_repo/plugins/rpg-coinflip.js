const axios = require('axios');
const { Sticker, StickerTypes } = require('wa-sticker-formatter');
const { getMessage } = require('../lib/languages');

const handler = async (m, { conn, args, text, usedPrefix }) => {
    // Get user's preferred language
    const user = global.db.data.users[m.sender];
    const chat = global.db.data.chats[m.chat];
    const lang = user?.language || chat?.language || global.language || 'en';
    
    var arr = ["heads", "tails"];
    if (!arr.includes(args[0])) {
        throw getMessage('rpg_coinflip_invalid_choice', lang, { prefix: usedPrefix  || {}});
    }
    
    var terbang = arr[Math.floor(Math.random() * arr.length)];
    var res;
    var message;
    var sticker;
    var MiliSecond = 3000; //3 seconds

    let coins = parseInt(Math.floor(Math.random() * 100000));
    let exp = parseInt(Math.floor(Math.random() * 10000));
    let player = global.db.data.users[m.sender];

    if (terbang == "heads") {
        res = "https://cdn-icons-png.flaticon.com/512/1490/1490832.png";
        sticker = await createSticker(false, res, wm, author, 30);
        conn.sendFile(m.chat, sticker, 'sticker.webp', text);
    
        message = getMessage('rpg_coinflip_win', lang, {
            coins: new Intl.NumberFormat('en-US').format(coins),
            exp: new Intl.NumberFormat('en-US').format(exp)
         || {}});

        setTimeout(function() {
            conn.reply(m.chat, message, m);
        }, MiliSecond);

        player.money += coins * 1;
        player.exp += exp * 1;
        global.db.data.users[m.sender].tiketcoin += 1;
    } else if (terbang == "tails") {
        res = "https://cdn-icons-png.flaticon.com/512/4315/4315581.png";
        sticker = await createSticker(false, res, wm, author, 30);
        conn.sendFile(m.chat, sticker, 'sticker.webp', text);
    
        message = getMessage('rpg_coinflip_lose', lang, {
            coins: new Intl.NumberFormat('en-US').format(coins),
            exp: new Intl.NumberFormat('en-US').format(exp)
         || {}});

        setTimeout(function() {
            conn.reply(m.chat, message, m);
        }, MiliSecond);

        player.money -= coins * 1;
        player.exp -= exp * 1;
        global.db.data.users[m.sender].tiketcoin -= 1;
    }
}
handler.help = ["coinflip"];
handler.tags = ["rpg"];
handler.command = /^(coinflip|putarkoin)$/i;
handler.rpg = true
module.exports = handler;

async function createSticker(img, url, wm, author, quality) {
    let stickerMetadata = {
        Type: 'full',
        pack: wm,
        author: author,
        quality
    };
    return (new Sticker(img ? img : url, stickerMetadata)).toBuffer();
}