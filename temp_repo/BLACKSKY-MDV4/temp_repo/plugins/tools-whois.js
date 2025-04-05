const { getMessage } = require('../lib/languages');

const fetch = require("node-fetch");
let handler = async (m, { text, usedPrefix, command }) => {
  if (!text) throw `Masukkan Domain!\n\n*Example:* betabotz.eu.org`;
  if (text.includes('https://') || text.includes('http://')) throw `Tolong masukkan tanpa domain *https/http!*. Example: betabotz.eu.org`;  
  try {
    const waiting = `_Currently search Information WHOIS untuk ${text}..._`;
    m.reply(waiting);    
    let data = fetch(`https://api.betabotz.eu.org/fire/webzone/whois?query=${text}&apikey=${lann}`)
    .then(result => result.json())
    .then(response => {
      m.reply(response.result);
    })
    .catch(error => {
      console.error(error);
      m.reply('Terjadi error saat search Information WHOIS, silwill coba again later');
    });
  } catch (error) {
    console.error(error);
    m.reply('Terjadi error saat search Information WHOIS, silwill coba again later');
  }
};

handler.command = ['whois', 'whoislookup'];
handler.help = ['whois', 'whoislookup'];
handler.tags = ['tools'];
handler.premium = false;
handler.limit = true
module.exports = handler;
