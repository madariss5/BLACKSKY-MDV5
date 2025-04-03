const { getMessage } = require('../lib/languages');

let fetch = require('node-fetch');
let fs = require('fs');

let Timeout = 3600000 // 1 hour in milliseconds

let handler = async (m, { conn, args, usedPrefix, DevMode }) => {
    // Get user's preferred language
    const user = global.db.data.users[m.sender];
    const chat = global.db.data.chats[m.chat];
    const lang = user?.language || chat?.language || global.language;
 {
  
    let u = global.db.data.users[m.sender];
    let time = u.lastclaim + 3600000; // 1 hour in milliseconds
    if (new Date - u.lastclaim < 3600000) throw `*You've already searched for an Airdrop!* 🪙\nYou must wait ${clockString(time - new Date())} before searching for an Airdrop again.`;
    let Aku = `${Math.floor(Math.random() * 101)}`.trim();
    let Kamu = `${Math.floor(Math.random() * 81)}`.trim(); 
    let A = (Aku * 1);
    let K = (Kamu * 1);

    if (A > K) {
      let _sampah = Array.from({length: 50}, (_, i) => (i + 1).toString());
      let sampah = _sampah[Math.floor(Math.random() * _sampah.length)];
      let kayu = _sampah[Math.floor(Math.random() * _sampah.length)];
      let batu = _sampah[Math.floor(Math.random() * _sampah.length)];
      conn.sendFile(m.chat, 'https://telegra.ph/file/60437ce6d807b605adf5e.jpg', 'zonk.jpg', `*Mediocre Airdrop!* The contents are not what you expected\n\n*Rewards*\n• *Trash:* ${sampah}\n• *Wood:* ${wood}\n• *Stone:* ${stone}`, m);
      u.sampah += parseInt(sampah);
      u.kayu += parseInt(kayu);
      u.batu += parseInt(batu);
      u.lastclaim = new Date * 1;
    } else if (A < K) {
      let _limit = ['10', '20', '30'];
      let limit = _limit[Math.floor(Math.random() * _limit.length)];
      let _money = ['10000', '100000', '500000'];
      let money = _money[Math.floor(Math.random() * _money.length)];
      let _point = ['10000', '100000', '500000'];
      let point = _point[Math.floor(Math.random() * _point.length)];
      conn.sendFile(m.chat, 'https://telegra.ph/file/d3bc1d7a97c62d3baaf73.jpg', 'rare.jpg', `*Rare Airdrop!* You got a *Rare* Airdrop Box\n\nCongratulations! You received *Rewards*\n• *Limit:* ${limit}\n• *Money:* ${money}\n• *Point:* ${point}`, m);
      u.limit += parseInt(limit);
      u.money += parseInt(money);
      u.points += parseInt(point);
      u.lastclaim = new Date * 1;
    } else {
      conn.sendFile(m.chat, 'https://telegra.ph/file/5d71027ecbcf771b299fb.jpg', 'zonk.jpg', `*Empty Airdrop!* You got a *Zonk (Empty)* Airdrop Box\n\nYour *Rewards*\n• *Money:* -1,000,000\n• *Contents:* water`, m);
      u.money -= 1000000;
      u.lastclaim = new Date * 1;
    }

    /*setTimeout(() => {
      conn.reply(m.chat, `Waktunya hunt *Airdrop!*`, m);
    }, Timeout);*/
};

handler.help = ['airdrop'];
handler.tags = ['rpg'];
handler.command = /^(airdrop)$/i;
handler.group = true;
handler.rpg = true
}

module.exports = handler;

function pickRandom(list) {
  return list[Math.floor(Math.random() * list.length)];
}

function clockString(ms) {
  let d = isNaN(ms) ? '--' : Math.floor(ms / 86400000);
  let h = isNaN(ms) ? '--' : Math.floor(ms / 3600000) % 24;
  let m = isNaN(ms) ? '--' : Math.floor(ms / 60000) % 60;
  let s = isNaN(ms) ? '--' : Math.floor(ms / 1000) % 60;
  return ['\n*' + d + '* _Days_ ☀️\n ', '*' + h + '* _Hours_ 🕐\n ', '*' + m + '* _Minutes_ ⏰\n ', '*' + s + '* _Seconds_ ⏱️ '].map(v => v.toString().padStart(2, 0)).join('');
}