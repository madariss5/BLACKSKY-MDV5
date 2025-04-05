const { getMessage } = require('../lib/languages');

let fetch = require('node-fetch');

let handler = async (m, { text, usedPrefix, command }) => {
    if (!text) throw `Enter a Pastebin URL!\n\n*Example:* ${usedPrefix + command} https://pastebin.com/eQLV4GfE`;

    try {
        await m.reply(wait);
        let res = await fetch(`https://api.betabotz.eu.org/fire/download/pastebin?url=${text}&apikey=${lann}`);
        let json = await res.json();

        if (!json.status) throw "❌ Failed to retrieve data from Pastebin!";

        await m.reply(`📄 *Results Pastebin:*\n\n${json.result}`);
    } catch (e) {
        console.error(e);
        throw "❌ An error occurred while retrieving data from Pastebin!";
    }
};

handler.command = ['pastebindl', 'pastebin'];
handler.tags = ['downloader'];
handler.help = ['pastebindl', 'pastebin'].map(a => a + ' <url>');
handler.limit = true;

module.exports = handler;