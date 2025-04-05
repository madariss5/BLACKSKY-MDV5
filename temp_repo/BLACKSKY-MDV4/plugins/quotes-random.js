const { getMessage } = require('../lib/languages');

const fetch = require('node-fetch');

let handler = async (m, { conn, command }) => {
    // Get user's preferred language
    const user = global.db.data.users[m.sender];
    const chat = global.db.data.chats[m.chat];
    const lang = user?.language || chat?.language || global.language;
 {
    let anu = `─────〔 *${command}* 〕─────\n`;

    if (command === 'bucin') {
        const res = await (await fetch(`https://api.betabotz.eu.org/fire/random/katabucin?apikey=${lann}`)).json();
        anu += res.bucin;
    } else if (command === 'katailham') {
        const res = await (await fetch(`https://api.betabotz.eu.org/fire/random/katailham?apikey=${lann}`)).json();
        anu += res.result;
    } else if (command === 'katadilan') {
        const res = await (await fetch(`https://api.betabotz.eu.org/fire/random/katadilan?apikey=${lann}`)).json();
        anu += res.dilan;
    } else if (command === 'fiersa') {
        const res = await (await fetch(`https://api.betabotz.eu.org/fire/random/fiersa?apikey=${lann}`)).json();
        anu += res.fiersa;
    } else if (command === 'fakta') {
        const res = await (await fetch(`https://api.betabotz.eu.org/fire/random/fakta?apikey=${lann}`)).json();
        anu += res.result;
    } else if (command === 'nyindir') {
        const res = await (await fetch(`https://api.betabotz.eu.org/fire/random/nyindir?apikey=${lann}`)).json();
        anu += res.hasl;
    } else if (command === 'ngawur') {
        const res = await (await fetch(`https://api.betabotz.eu.org/fire/random/ngawur?apikey=${lann}`)).json();
        anu += res.hasl;
    } else if (command === 'jawa') {
        const res = await (await fetch(`https://api.betabotz.eu.org/fire/random/quotesjawa?apikey=${lann}`)).json();
        anu += res.quotes;
    } else if (command === 'quotes') {
        const res = await (await fetch(`https://api.betabotz.eu.org/fire/random/quotes?apikey=${lann}`)).json();
        anu += res.quotes;
    } else if (command === 'sunda') {
        const res = await (await fetch(`https://api.betabotz.eu.org/fire/random/sunda?apikey=${lann}`)).json();
        anu += res.hasl;
    } else if (command === 'batak') {
        const res = await (await fetch(`https://api.betabotz.eu.org/fire/random/batak?apikey=${lann}`)).json();
        anu += res.hasl;
    } else if (command === 'aceh') {
        const res = await (await fetch(`https://api.betabotz.eu.org/fire/random/aceh?apikey=${lann}`)).json();
        anu += res.hasl;
    } else if (command === 'cina') {
        const res = await (await fetch(`https://api.betabotz.eu.org/fire/random/china?apikey=${lann}`)).json();
        anu += res.hasl;
    } else if (command === 'minangkabau') {
        const res = await (await fetch(`https://api.betabotz.eu.org/fire/random/minangkabau?apikey=${lann}`)).json();
        anu += res.hasl;
    }
    m.reply(anu);
};

handler.help = ['bucin', 'katailham', 'katadilan', 'fiersa', 'fakta', 'nyindir', 'ngawur', 'jawa', 'quotes','sunda','batak', 'aceh', 'cina', 'minangkabau'];
handler.tags = ['quotes'];
handler.command = /^(bucin|katailham|katadilan|fiersa|fakta|nyindir|ngawur|jawa|quotes|sunda|batak|aceh|cina|minangkabau)$/i;
handler.owner = false;
handler.mods = false;
handler.premium = false;
handler.group = false;
handler.private = false;
handler.register = false;
handler.admin = false;
handler.botAdmin = false;
handler.fail = null;

}

module.exports = handler;