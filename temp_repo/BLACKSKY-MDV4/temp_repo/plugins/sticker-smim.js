const { getMessage } = require('../lib/languages');

const uploadImage = require('../lib/uploadImage');
const { MessageType } = require('@adiwajshing/baileys');
const { sticker } = require('../lib/sticker');
let handler = async (m, { conn, text, usedPrefix, command }) => {
    // Get user's preferred language
    const user = global.db.data.users[m.sender];
    const chat = global.db.data.chats[m.chat];
    const lang = user?.language || chat?.language || global.language;
 {

    let [atas, bawah] = text.split`|`
    let q = m.quoted ? m.quoted : m
    let mime = (q.msg || q).mimetype || ''
    if (!mime) throw `reply image dengan Command\n\n${usedPrefix + command} <${atas ? atas : 'teks atas'}>|<${bawah ? bawah : 'teks bawah'}>`
    if (!/image\/(jpe?g|png)/.test(mime)) throw `_*Mime ${mime} not didukung!*_`
    let img = await q.download()
    let url = await uploadImage(img)
    meme = `https://fire.memegen.link/images/custom/${encodeURIComponent(atas ? atas : '')}/${encodeURIComponent(bawah ? bawah : '')}.png?background=${url}`
try {
    let sticker = await sticker(null, meme, global.packname, global.author)
    await conn.sendFile(m.chat, sticker, {
      quoted: m
    })
  } catch (e) {
    m.reply('Failed make sticker, Mencoba Mengirim image')
    await conn.sendFile(m.chat, meme, 'image.png', 'JADIKAN sticker SECARA MANUAL DENGAN MENGETIK .S', m)
  }
}
handler.help = ['smim <teks atas>|<teks bawah>']
handler.tags = ['sticker']
handler.command = /^(smim)$/i

handler.limit = false

}

module.exports = handler
