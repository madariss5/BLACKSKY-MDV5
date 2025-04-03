const { getMessage } = require('../lib/languages');

const fetch = require('node-fetch');

let handler = async (m, { text, usedPrefix, command }) => {
    if (!text) throw `Useran:\n${usedPrefix + command} <nama daerah>\n\nExample:\n${usedPrefix + command} Cilacap`;
    try {
        let res = await fetch(`https://api.betabotz.eu.org/fire/search/kodepos?query=${encodeURIComponent(text)}&apikey=${lann}`);
        if (!res.ok) throw 'Data not ditemukan';
        let json = await res.json();
        if (!json.status || json.code !== 200) throw eror;
        let result = json.result;
        if (result.length === 0) throw 'Kode post not ditemukan';
        
        let message = result.map((item, index) => 
            `${index + 1}. Provinsi: ${item.province}\nKota: ${item.city}\nKecamatan: ${item.district}\nDesa: ${item.village}\nKode Pos: ${item.postalCode}`
        ).join('\n\n');
        
        m.reply(message);
    } catch (error) {
        m.reply('Terjadi error saat search kode post, silwill coba again later');
    }
};

handler.help = ['kodepos'];
handler.tags = ['internet'];
handler.command = /^(kodepos)$/i;

module.exports = handler;
