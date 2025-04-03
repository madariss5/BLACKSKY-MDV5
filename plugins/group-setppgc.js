const { getMessage } = require('../lib/languages');

let handler = async (m, { conn, usedPrefix, command }) => {
    // Get user's preferred language
    const user = global.db.data.users[m.sender];
    const chat = global.db.data.chats[m.chat];
    const lang = user?.language || chat?.language || global.language;
 {
  let q = m.quoted ? m.quoted : m
  let mime = (q.msg || q).mimetype || ''
  if (/image/.test(mime)) {
      let img = await q.download()
      if (!img) throw 'image not ditemukan'
      await conn.updateProfilePicture(m.chat, img)
      m.reply('ppbot group Success di ganti')
  } else throw `kirim/reply image dengan caption *${usedPrefix + command}*`
}
handler.help = ['setppgc'].map(v => v + ' <caption / reply image>')
handler.tags = ['adminry']
handler.command = /^(setppgc|setppgrup|setppgroup)$/i

handler.group = true
handler.admin = true
handler.botAdmin = true
}

module.exports = handler

//don't lupa install $ npm install @adiwajshing/baileys@Akkun3704/Baileys#profile-picture