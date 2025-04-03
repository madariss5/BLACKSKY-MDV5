const { getMessage } = require('../lib/languages');

let handler = async (m, { conn }) => {
    // Get user's preferred language
    const user = global.db.data.users[m.sender];
    const chat = global.db.data.chats[m.chat];
    const lang = user?.language || chat?.language || global.language;
 {
	let q = m.quoted ? m.quoted : m
	try {
	let media = await q.download?.()
	await conn.sendFile(m.chat, media, null, '', m)
	} catch (e) {
      m.reply('Media Failed dimuat!')
	}
}

handler.help = ['readviewonce']
handler.tags = ['tools']
handler.command = ['readviewonce', 'read', 'rvo', 'liat', 'readvo']
handler.premium = false
handler.register = false
handler.fail = null

}

module.exports = handler
