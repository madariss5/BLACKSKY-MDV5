const { getMessage } = require('../lib/languages');

const moneymins = 1
let handler = async (m, { conn, command, args }) => {
    // Get user's preferred language
    const user = global.db.data.users[m.sender];
    const chat = global.db.data.chats[m.chat];
    const lang = user?.language || chat?.language || global.language;
 {
  let count = command.replace(/^pull/i, '')
  count = count ? /all/i.test(count) ? Math.floor(global.db.data.users[m.sender].bank / moneymins) : parseInt(count) : args[0] ? parseInt(args[0]) : 1
  count = Math.max(1, count)
  if (global.db.data.users[m.sender].bank >= moneymins * count) {
    global.db.data.users[m.sender].bank -= moneymins * count
    global.db.data.users[m.sender].money += count
    conn.reply(m.chat, `🚩 -${moneymins * count} ATM\n+ ${count} money`, m)
  } else conn.reply(m.chat, `🚩 ATM you are left ${count} !!`, m)
}
handler.help = ['pull *<amount>*', 'pullall']
handler.tags = ['rpg']
handler.command = /^pull([0-9]+)|pull|pullall$/i
handler.owner = false
handler.mods = false
handler.premium = false
handler.group = false
handler.private = false
handler.limit = true
handler.admin = false
handler.botAdmin = false
handler.rpg = true

handler.fail = null
handler.exp = 0

}

module.exports = handler