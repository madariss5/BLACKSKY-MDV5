const { getMessage } = require('../lib/languages');

let fetch = require('node-fetch');

let handler = async (m, { text, conn, usedPrefix, command }) => {
    if (!text) throw `*🚩 Example:* ${usedPrefix + command} https://anichin.site/perfect-world/`;
    try {
        const fire = await fetch(`https://api.betabotz.eu.org/fire/webzone/anichin-detail?url=${text}&apikey=${lann}`);
        let json = await fire.json();
        let res = json.result;

        let capt = '';
        let episodeNumber = 1;

        for (let item of res) {
            capt = `乂*A N I C H I  L I N K  D O W N L O A D E R*乂`
            capt += `\n\n ◦  *Episode ${episodeNumber}:* ${item.episodeRange}\n`;
            for (let download of item.downloadLinks) {
                capt += `\n  *Resolution:* ${download.resolution}\n`;
                for (let link of download.links) {
                    capt += `  ◦  ${link.text}: ${link.href}\n`;
                }
            }
            episodeNumber++;
        }
        await m.reply(capt);

    } catch (e) {
        throw eror;
    }
};

handler.command = handler.help = ['anichindetail'];
handler.tags = ['internet'];
handler.premium = false;
handler.group = false;
handler.limit = true;

module.exports = handler;