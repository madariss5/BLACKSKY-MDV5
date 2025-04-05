const { getMessage } = require('../lib/languages');

let fetch = require('node-fetch');

let handler = async (m, { text, usedPrefix, command }) => {
  if (!text) throw `Masukkan URL which want diperiksa!\n\n*Example:* ${usedPrefix + command} https://tinyurl.com/bdtf7se9`;

  try {
    await m.reply(wait);
    let res = await (await fetch(`https://api.betabotz.eu.org/fire/tools/cekredirect?url=${text}&apikey=${lann}`)).json();

    if (!res.status || !res.result) throw 'Failed get data!';

    let message = res.result.map((item, index) => 
      `🔗 *URL*: ${item.url}\n🚦 *status*: ${item.status || 'Tidak ada status'}`
    ).join('\n\n');

    await m.reply(message);
  } catch (e) {
    console.error(e);
    throw 'An error occurred saat memproses permintaan!';
  }
};

handler.command = handler.help = ['checkredirect', 'cekredirect'];
handler.tags = ['tools'];
handler.limit = true;

module.exports = handler;