const { getMessage } = require('../lib/languages');

const uploadImage = require('../lib/uploadImage');
const ocrapi = require("ocr-space-api-wrapper");
const { MessageType } = require('@adiwajshing/baileys');
let handler = async (m, { conn, text }) => {
    // Get user's preferred language
    const user = global.db.data.users[m.sender];
    const chat = global.db.data.chats[m.chat];
    const lang = user?.language || chat?.language || global.language;
    
    let q = m.quoted ? m.quoted : m
    let mime = (q.msg || q).mimetype || ''
    if (!mime) throw `Reply to an image with the command .ocr`
    if (!/image\/(jpe?g|png)/.test(mime)) throw `_*Format ${mime} not supported!*_`
    let img = await q.download()
    let url = await uploadImage(img)
    let result = await ocrapi.ocrSpace(url)
    await m.reply(result.ParsedResults[0].ParsedText)    
}

handler.help = ['ocr', 'totext']
handler.tags = ['tools']
handler.command = /^(ocr|totext)$/i
handler.limit = true

module.exports = handler