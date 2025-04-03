const { getMessage } = require('../lib/languages');

const fetch = require('node-fetch');

let handler = async (m, { conn }) => {
    // Get user's preferred language
    const user = global.db.data.users[m.sender];
    const chat = global.db.data.chats[m.chat];
    const lang = user?.language || chat?.language || global.language;
 {
  let ip = await fetch(`https://api.betabotz.eu.org/ip`).then(response => response.text());
  let message = `your ip: ${ip}`
m.reply(message)
};

handler.help = ['getip']
handler.tags = ['inownerfo']
handler.command = /^(getip)$/i;

}

module.exports = handler;