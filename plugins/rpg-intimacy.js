const { getMessage } = require('../lib/languages');

let handler = async (m, { conn, usedPrefix }) => {
    // Get user's preferred language
    const user = global.db.data.users[m.sender];
    const chat = global.db.data.chats[m.chat];
    const lang = user?.language || chat?.language || global.language;
 {
  let __timers = new Date() - global.db.data.users[m.sender].lastngewe;
  let _timers = 3600000 - __timers;
  let order = global.db.data.users[m.sender].intimate
  let user = global.db.data.users[m.sender];
  let timers = clockString(_timers);
  let name = user.registered ? user.name : conn.getName(m.sender);
  let id = m.sender;
  let kerja = "openbo";
  conn.missions = conn.missions ? conn.missions : {};
  if (id in conn.missions) {
    conn.reply(
      m.chat,
      `Completedkan missions ${conn.missions[id][0]} Terlebih Dahulu`,
      m
    );
    throw false;
  }
  if (user.healt < 80) return m.reply(`Anda Harus Memiliki Minimum 80Healt`);
  if (user.stamina < 50)
    return m.reply(
      `stamina Mu Tidak enough Cobalah Mwill / drink Sesuatu .`.trim()
    );
  //if (user.kondom == 0)
    //return m.reply("Kamu Tidak Memiliki Kondom Beli Lah Terlebih Dahulu");
  if (new Date() - global.db.data.users[m.sender].lastngewe > 3600000) {
    let ngerok4 = Math.floor(Math.random() * 10);
    let ngerok5 = Math.floor(Math.random() * 10);

    let ngrk4 = ngerok4 * 100000;
    let ngrk5 = ngerok5 * 1000;

    let rokit = `📲 Orderan Masuk dari [ Om Teguh ]

ᴋᴀᴍᴜ ᴅᴀɴ ᴏᴍ ᴛᴇɢᴜʜ ᴍᴇᴍʙᴏᴏᴋɪɴɢ ʜᴏᴛᴇʟ
▒▒[ᴏʏᴏ]▒▒
▒▒▄▄▄▒▒ Kalian Berdua Masuk Ke kamar
▒█▀█▀█▒ you Membuka bh mu
░█▀█▀█░ Tete Mu dirgold oleh om tgh
░█▀█▀█░  ( . )( . )
███████.  | 🤚 |


Om Teguh Start Mgoldukan Kelamin nya ke dalam vagina mu....
`.trim();

    let rokit2 = `Kamu Kesickan ...

(_)(_)=====D \()/  

Rahim mu terasa warm
`.trim();

    let rokit3 = `Om teguh pun crott 

()()=====D 💦💦💦   


✅ Orderan Completed
`.trim();

    let rokit4 = `Om Teguh Memberimu money Lebih karena Gowhichanmu Sangat unik 😝
`.trim();

    let hsl = `
*—[ Results intimacy ${name} ]—*
➕ 💹 money = [ ${ngrk4} ]
➕ ✨ Exp = [ ${ngrk5} ]
➕ 😍 Order BO Completed = +1
➕ 📥Total Bookingan : ${order}
`.trim();

    user.money += ngrk4;
    user.exp += ngrk5;
    user.warn += 1;
    user.intimate += 1;
    user.healt -= 80;
    user.stamina -= 40;

    conn.missions[id] = [
      kerja,
      setTimeout(() => {
        delete conn.missions[id];
      }, 27000),
    ];

    setTimeout(() => {
      conn.reply(m.chat, hsl, m);
    }, 27000);

    setTimeout(() => {
      conn.reply(m.chat, rokit4, m);
    }, 25000);

    setTimeout(() => {
      conn.reply(m.chat, rokit3, m);
    }, 20000);

    setTimeout(() => {
      conn.reply(m.chat, rokit2, m);
    }, 15000);

    setTimeout(() => {
      conn.reply(m.chat, rokit, m);
    }, 10000);

    setTimeout(() => {
      conn.reply(m.chat, `🔍 ${name} Mencari Om Om.....`, m);
    }, 0);
    user.lastngewe = new Date() * 1;
  } else
    m.reply(
      `Please Menunggu Seold ${timers}, Untuk Melakukan intimacy again`
    );
};
handler.help = ["intimacy"];
handler.tags = ["rpg"];
handler.command = /^(intimacy)$/i;
handler.register = true;
handler.group = true;
handler.level = 70;
handler.rpg = true;
}

module.exports = handler;

function clockString(ms) {
  let h = Math.floor(ms / 3600000);
  let m = Math.floor(ms / 60000) % 60;
  let s = Math.floor(ms / 1000) % 60;
  return [h, m, s].map((v) => v.toString().padStart(2, 0)).join(":");
}