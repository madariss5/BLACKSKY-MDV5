const { getMessage } = require('../lib/languages');

/*
wa.me/6282285357346
github: https://github.com/sadxzyq
Instagram: https://instagram.com/tulisan.ku.id
*/

let cheerio = require('cheerio');
let fetch = require('node-fetch');
let path = require('path');

let timeout = 120000
let poin = 1000
let handler = async (m, { conn, command, usedPrefix }) => {
    // Get user's preferred language
    const user = global.db.data.users[m.sender];
    const chat = global.db.data.chats[m.chat];
    const lang = user?.language || chat?.language || global.language;
 {
    conn.tebakhewan = conn.tebakhewan ? conn.tebakhewan : {}
    let id = m.chat
    if (id in conn.tebakhewan) {
        conn.reply(m.chat, getMessage('guess_animal_ongoing', lang), conn.tebakhewan[id][0])
        throw false
    }
    
  let src = await tebakHewan()
  let json = src[Math.floor(Math.random() * src.length)]
  let caption = getMessage('guess_animal_caption', lang, {
    command: command.toUpperCase(),
    time: (timeout / 1000).toFixed(2),
    prefix: usedPrefix,
    points: poin
  }).trim()
  
    conn.tebakhewan[id] = [
        await conn.sendFile(m.chat, json.url, '', caption, m),
        json, poin,
        setTimeout(() => {
            if (conn.tebakhewan[id]) conn.reply(m.chat, getMessage('guess_animal_timeout', lang, {
              answer: json.title
            }), conn.tebakhewan[id][0])
            delete conn.tebakhewan[id]
        }, timeout)
    ]
}
handler.help = ['tebakhewan']
handler.tags = ['game']
handler.command = /^tebakhewan/i
handler.group = true


}

module.exports = handler



async function tebakHewan() {
const randomPageNumber = Math.floor(Math.random() * 20) + 1;
const url = `https://rimbakita.com/List-nama-hewan-lengkap/${randomPageNumber}/`;
  try {
    const response = await fetch(url);
    const html = await response.text();
    const $ = cheerio.load(html);

    return $('div.entry-content.entry-content-single img[class*=wp-image-][data-src]').map((_, element) => {
      const src = $(element).attr('data-src');
      const alt = path.basename(src, path.extname(src)).replace(/-/g, ' ');
      const capitalizedAlt = alt.charAt(0).toUpperCase() + alt.slice(1);
      return { title: capitalizedAlt, url: src };
    }).get();
  } catch (error) {
    console.error('Error:', error);
    return [];
  }
};

//danaputra133
