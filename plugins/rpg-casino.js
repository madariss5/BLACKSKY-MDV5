const { getMessage } = require('../lib/languages');

let buatall = 1;
let handler = async (m, { conn, args, usedPrefix, DevMode }) => {
    // Get user's preferred language
    const user = global.db.data.users[m.sender];
    const chat = global.db.data.chats[m.chat];
    const lang = user?.language || chat?.language || global.language;
 {
  conn.casino = conn.casino ? conn.casino : {};
  if (m.chat in conn.casino)
    return m.reply(
      "Someone is still playing casino here, Please wait until they finish!!"
    );
  else conn.casino[m.chat] = true;
  try {
    let randomaku = `${Math.floor(Math.random() * 150)}`.trim();
    let randomkamu = `${Math.floor(Math.random() * 80)}`.trim(); //hehe Biar Susah Menang :v
    let Aku = randomaku * 1;
    let Kamu = randomkamu * 1;
    let count = args[0];
    count = count
      ? /all/i.test(count)
        ? Math.floor(global.db.data.users[m.sender].money / buatall)
        : parseInt(count)
      : args[0]
      ? parseInt(args[0])
      : 1;
    count = Math.max(1, count);
    if (args.length < 1)
      return conn.reply(
        m.chat,
        usedPrefix + "casino <amount>\n " + usedPrefix + "casino 1000",
        m
      );
    if (global.db.data.users[m.sender].money >= count * 1) {
      global.db.data.users[m.sender].money -= count * 1;
      //await m.reply('') //Kwkwwkkwlwlw
      if (Aku > Kamu) {
        conn.reply(
          m.chat,
          `💰 Casino 💰\n*You:* ${Kamu} Point\n*Computer:* ${Aku} Point\n\n*You LOSE*\nYou lost ${count} money`.trim(),
          m
        );
      } else if (Aku < Kamu) {
        global.db.data.users[m.sender].money += count * 2;
        conn.reply(
          m.chat,
          `💰 Casino 💰\n*You:* ${Kamu} Point\n*Computer:* ${Aku} Point\n\n*You Win*\nYou received ${
            count * 2
          } money`.trim(),
          m
        );
      } else {
        global.db.data.users[m.sender].money += count * 1;
        conn.reply(
          m.chat,
          `💰 Casino 💰\n*You:* ${Kamu} Point\n*Computer:* ${Aku} Point\n\n*DRAW*\nYou received ${
            count * 1
          } money`.trim(),
          m
        );
      }
    } else
      conn.reply(
        m.chat,
        `You don't have enough money for Casino. Please use *#work* first!`.trim(),
        m
      );
  } catch (e) {
    console.log(e);
    m.reply("Error!!");
    if (DevMode) {
      for (let jid of global.owner
        .map((v) => v.replace(/[^0-9]/g, "") + "@s.whatsapp.net")
        .filter((v) => v != conn.user.jid)) {
        conn.sendMessage(
          jid,
          "casino.js error\nNo: *" +
            m.sender.split`@`[0] +
            "*\nCommand: *" +
            m.text +
            "*\n\n*" +
            e +
            "*",
          MessageType.text
        );
      }
    }
  } finally {
    delete conn.casino[m.chat];
  }
};

handler.help = ["casino <amount>"];
handler.tags = ["rpg"];
handler.command = /^(casino)$/i;
handler.register = true;
handler.group = true;
handler.rpg = true
handler.limit = 10;
}

module.exports = handler;

function pickRandom(list) {
  return list[Math.floor(Math.random() * list.length)];
}