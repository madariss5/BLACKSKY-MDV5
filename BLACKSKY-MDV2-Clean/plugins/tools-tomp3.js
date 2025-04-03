const { getMessage } = require('../lib/languages');

const { toPTT, toAudio } = require('../lib/converter');

let handler = async (m, { conn, usedPrefix, command }) => {
    // Get user's preferred language
    const user = global.db.data.users[m.sender];
    const chat = global.db.data.chats[m.chat];
    const lang = user?.language || chat?.language || global.language;
 {
  let q = m.quoted ? m.quoted : m
  let mime = (m.quoted ? m.quoted : m.msg).mimetype || ''
    if (!/video|audio/.test(mime)) throw `Balas video/audio dengan Command *${usedPrefix + command}*`
    let media = await q.download()
    if (!media) throw 'Media not able to diunduh'
    let audio = await toAudio(media, 'mp4')
    if (!audio.data) throw 'Failed melakukan konversi.'
    conn.sendMessage(m.chat, { audio: audio.data, mimetype: 'audio/mpeg' }, { quoted: m })
}
handler.help = ['toaudio (reply)']
handler.tags = ['tools']
handler.command = /^to(a(udio)?)$/i

}

module.exports = handler
