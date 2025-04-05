const { getMessage } = require('../lib/languages');

let gtts = require('node-gtts');
let fs = require('fs');
let path = require('path');
let { spawn } = require('child_process');

const defaultLang = 'id';
let handler = async (m, { conn, args }) => {
    // Get user's preferred language
    const user = global.db.data.users[m.sender];
    const chat = global.db.data.chats[m.chat];
    const lang = user?.language || chat?.language || global.language;
 {
  try {
    let lang = args[0];
    let text = args.slice(1).join(' ');
    if ((args[0] || '').length !== 2) {
      lang = defaultLang;
      text = args.join(' ');
    }
    if (!text && m.quoted && m.quoted.text) text = m.quoted.text;

    let res = await tts(text, lang);
    conn.sendFile(m.chat, res, 'tts.opus', null, m, true);
  } catch (e) {
    m.reply('*Example:* .tts hello world');
  }
};
handler.help = ['tts <teks>'];
handler.tags = ['tools'];
handler.command = /^tts$/i;
}

module.exports = handler;

function tts(text, lang = 'id') {
  console.log(lang, text);
  return new Promise((resolve, reject) => {
    let tts = gtts(lang);
    let filePath = path.join(__dirname, '../tmp', (1 * new Date) + '.wav');
    tts.save(filePath, text, (err, result) => {
      if (err) reject(err);
      else {
        fs.readFile(filePath, (err, data) => {
          if (err) reject(err);
          else {
            fs.unlink(filePath, err => {
              if (err) console.log(err);
            });
            resolve(data);
          }
        });
      }
    });
  });
}
