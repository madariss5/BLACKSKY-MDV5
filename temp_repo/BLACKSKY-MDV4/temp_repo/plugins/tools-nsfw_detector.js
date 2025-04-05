const { getMessage } = require('../lib/languages');

const fetch = require('node-fetch');
const uploader = require('../lib/uploadImage');

let handler = async (m, { conn, command, usedPrefix }) => {
    // Get user's preferred language
    const user = global.db.data.users[m.sender];
    const chat = global.db.data.chats[m.chat];
    const lang = user?.language || chat?.language || global.language;
 {
  let q = m.quoted ? m.quoted : m
  let mime = (q.msg || q).mimetype || q.mediaType || '' 
  if (/image/g.test(mime) && !/webp/g.test(mime)) {
    let buffer = await q.download()
    await m.reply(wait)    
    try {
      let media = await uploader(buffer)
      let fire = await fetch(`https://api.betabotz.eu.org/fire/tools/nsfw-detect?url=${media}&apikey=${lann}`)
      let response = await fire.json()  
      if (response.status) {
        let { labelName, labelId, confidence } = response.result;
        let capt;
            capt = `乂 *N S F W D E T E C T O R*\n\n`;
            capt += `◦ *Label Name* : ${labelName}\n`;
            capt += `◦ *Label Id* : ${labelId}\n`;
            capt += `◦ *Confidence* : ${confidence}\n`;
            m.reply(capt);
      }
      
    } catch (err) {
      throw `${eror}`
    }
  } else {
    throw `Reply image with command ${usedPrefix + command}`
  }
}

handler.help = ['nsfwdetector']
handler.tags = ['tools']
handler.command = /^(nsfwdetector|nsfwdetecd)$/i
handler.limit = 1
handler.group = true

}

module.exports = handler