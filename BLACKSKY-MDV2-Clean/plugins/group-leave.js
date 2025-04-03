const { getMessage } = require('../lib/languages');

let handler = async (m, { conn, args, command }) => {
    // Get user's preferred language
    const user = global.db.data.users[m.sender];
    const chat = global.db.data.chats[m.chat];
    const lang = user?.language || chat?.language || global.language;
 {
	let group = m.chat
        await m.reply('Bot will exit dari group', m.chat) 
        await sleep(1000)
        await conn.groupLeave(group)
        }
handler.command = handler.help = ['out', 'leavegc']
handler.tags = ['group']

handler.owner = true

}

module.exports = handler

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
