const { getMessage } = require('../lib/languages');

const fs = require('fs');
const sharp = require('sharp'); 

let handler = async (m, { conn, command, usedPrefix }) => {
    // Get user's preferred language
    const user = global.db.data.users[m.sender];
    const chat = global.db.data.chats[m.chat];
    const lang = user?.language || chat?.language || global.language;
 {
  let q = m.quoted ? m.quoted : m
  let mime = (q.msg || q).mimetype || ''
  if (/image/.test(mime)) {
    let media = await q.download()


    let processedMedia = await sharp(media)
      .resize(512, 512, { 
        fit: 'contain',
        background: { r: 255, g: 255, b: 255, alpha: 0 } 
      })
      .png() 
      .toBuffer()

    let encmedia = await conn.sendImageAsSticker(m.chat, processedMedia, m, { packname: global.packname, author: global.author })
    await fs.unlinkSync(encmedia)
  } else if (/video/.test(mime)) {
    if ((q.msg || q).seconds > 7) return m.reply('Maksimal 6 seconds!')
    let media = await q.download()

    let encmedia = await conn.sendVideoAsSticker(m.chat, media, m, { packname: global.packname, author: global.author })
    await fs.unlinkSync(encmedia)
  } else {
    throw `Kirim image/video dengan caption ${usedPrefix + command}\nDurasi video 1-6 seconds.`
  }
}

handler.help = ['sticker']
handler.tags = ['sticker']
handler.command = /^(sticker|s|sticker)$/i
handler.limit = true
}

module.exports = handler
