const { getMessage } = require('../lib/languages');

const { sticker } = require('../lib/sticker');
const uploadFile = require('../lib/uploadFile');
const uploadImage = require('../lib/uploadImage');
let { webp2png } = require('../lib/webp2mp4');
let fetch = require("node-fetch");
let handler = async (m, { conn, text, usedPrefix, command }) => {
    // Get user's preferred language
    const user = global.db.data.users[m.sender];
    const chat = global.db.data.chats[m.chat];
    const lang = user?.language || chat?.language || global.language;
 {
    let q = m.quoted ? m.quoted : m
    let mime = (q.msg || q).mimetype || ''
if (/video/g.test(mime)) if ((q.msg || q).seconds > 11) return m.reply('Maksimal 10 seconds!')
try {
      let img = await q.download()
   
if(!img) throw `reply image/video/sticker dengan Command .sticker` 
conn.sendImageAsSticker(m.chat , img, m, {packname: text, author: ''})
    } catch { throw 'Failed!, Balas image/video dengan caption *.sticker*'}
}
handler.help = ['wm', 'watermark']
handler.tags = ['sticker']
handler.command = /^wm|watermark?$/i

}

module.exports = handler

const isUrl = (text) => {
  return text.match(new RegExp(/https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&/=]*)(jpe?g|gif|png)/, 'gi'))
}
