const { getMessage } = require('../lib/languages');

 const fetch = require('node-fetch');

let handler = async (m, { conn }) => {
    // Get user's preferred language
    const user = global.db.data.users[m.sender];
    const chat = global.db.data.chats[m.chat];
    const lang = user?.language || chat?.language || global.language;
 {
  let res = await fetch(`https://api.betabotz.eu.org/fire/random/taugasih?apikey=${lann}`).then(result => result.json());
  conn.reply(m.chat, `“${res.taugasih}”`, m);
};

handler.help = ['taugasih'];
handler.tags = ['fun'];
handler.command = /^(taugasih)$/i;
handler.limit = true;
handler.admin = false;
handler.fail = null;

}

module.exports = handler;
