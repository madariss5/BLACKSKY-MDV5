const { getMessage } = require('../lib/languages');

const fetch = require("node-fetch");
let handler = async (m, { text, usedPrefix, command }) => {
  if (!text) throw `Masukkan Domain!\n\n*Example:* botcahx.eu.org`;
  if (text.includes('https://') || text.includes('http://')) throw `Tolong masukkan tanpa domain *https/http!*. Example: botcahx.eu.org`;  

  try {
    const waiting = `_Currently search Information Subdomain untuk ${text}..._`;
    m.reply(waiting);    
    let data = await fetch(`https://api.betabotz.eu.org/fire/tools/subdomain-finder?query=${text}&apikey=${lann}`)
    .then(result => result.json())
    .then(response => {
      if (response.status && response.code === 200) {
        let subdomains = response.result;
        let message = `Subdomain untuk ${text}:\n\n` + subdomains.map((sub, i) => `${i + 1}. ${sub}`).join('\n');
        m.reply(message);
      } else {
        m.reply('An error occurred saat take data subdomain. Please try again later.');
      }
    })
    .catch(error => {
      m.reply('Terjadi error saat search Information Subdomain, silwill coba again later');
    });
  } catch (error) {
    m.reply('Terjadi error saat search Information Subdomain, silwill coba again later');
  }
};

handler.command = ['subdomainfinder', 'subfinder'];
handler.help = ['subdomainfinder', 'subfinder'];
handler.tags = ['tools'];
handler.premium = false;
handler.limit = true;
module.exports = handler;
