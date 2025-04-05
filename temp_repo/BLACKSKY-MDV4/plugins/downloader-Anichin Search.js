const { getMessage } = require('../lib/languages');


let fetch = require('node-fetch');

let handler = async (m, { conn, usedPrefix, command, args }) => {
    // Get user's preferred language
    const user = global.db.data.users[m.sender];
    const chat = global.db.data.chats[m.chat];
    const lang = user?.language || chat?.language || global.language;
 {
if (!args[0]) throw `*🚩 Example:* ${usedPrefix + command} perfect world`;

let capt = '乂*A N I C H I N   S E A R C H*乂';
const fire = await fetch(`https://api.betabotz.eu.org/fire/webzone/anichin-search?query=${args[0]}&apikey=${lann}`);
let json = await fire.json();
let res = json.result;

for (let i in res) {
capt += `\n\n ◦  *Title:* ${res[i].title}\n`;
capt += ` ◦  *status:* ${res[i].status}\n`;
capt += ` ◦  *Type:* ${res[i].Type}\n`;
capt += ` ◦  *Subtitle:* ${res[i].subtitle}\n`;
capt += ` ◦  *URL:* ${res[i].link}\n`;
}
let thumb = res.length > 0 ? res[0].image : '';
let sourceUrl = res.length > 0 ? res[0].link : '';

await conn.relayMessage(m.chat, {
    extendedTextMessage: {
        text: capt,
        contextInfo: {
            externalAdReply: {
                title: 'A N I C H I N   S E A R C H',
                mediaType: 1,
                reviewType: 0,
                renderLargerThumbnail: true,
                thumbnailUrl: thumb,
                sourceUrl: sourceUrl
                }
                },
            mentions: [m.sender]
            }
        }, {});
};


handler.help = ['anichin'].map(v => v + ' <judul>');
handler.tags = ['internet'];
handler.command = /^(anichin|v)$/i;
handler.limit = true;
handler.group = true;

}

module.exports = handler;