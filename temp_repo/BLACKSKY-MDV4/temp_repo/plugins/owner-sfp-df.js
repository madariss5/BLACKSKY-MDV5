const { getMessage } = require('../lib/languages');

let fs = require('fs');
let handler = async (m, { text, usedPrefix, command }) => {
  if (!text) throw `uhm.. teksnya mana?\n\nUseran:\n${usedPrefix + command} <teks>\n\nExample:\n${usedPrefix + command} menu`;

  if (command === 'sfp') {
    if (!m.quoted.text) throw `reply message nya!`;
    let path = `plugins/${text}.js`;
    await fs.writeFileSync(path, m.quoted.text);
    m.reply(`tersimpan di ${path}`);
  } else if (command === 'df') {
    let path = `plugins/${text}.js`;
    if (!fs.existsSync(path)) throw `file plugin ${text}.js not ditemukan`;
    fs.unlinkSync(path);
    m.reply(`file plugin ${text}.js Success deleted`);
  }
};

handler.help = ['sfp', 'df'].map(v => v + ' <teks>');
handler.tags = ['owner'];
handler.command = /^(sf|df)$/i;
handler.rowner = true;

module.exports = handler;
