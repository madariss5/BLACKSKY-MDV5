const { getMessage } = require('../lib/languages');

const xpperdiamond = 1000000 
let handler = async (m, { conn, command, args }) => {
    // Get user's preferred language
    const user = global.db.data.users[m.sender];
    const chat = global.db.data.chats[m.chat];
    const lang = user?.language || chat?.language || global.language;
 {
  let count = command.replace(/^buydm/i, '')
  count = count ? /all/i.test(count) ? Math.floor(global.db.data.users[m.sender].exp / xpperdiamond) : parseInt(count) : args[0] ? parseInt(args[0]) : 1
  count = Math.max(1, count)
  if (global.db.data.users[m.sender].exp >= xpperdiamond * count) {
    global.db.data.users[m.sender].exp -= xpperdiamond * count
    global.db.data.users[m.sender].diamond += count
    conn.reply(m.chat, `
┌─「 *PAYMENT RECEIPT* 」
‣ *Purchase amount* : + ${count}💎 
‣ *Cost* : -${xpperdiamond * count} XP
└──────────────`, m)
  } else conn.reply(m.chat, `❎ Sorry, you don't have enough *XP* to buy *${count}* Diamonds. You need 1,000,000 XP per diamond.\n\nYou can get *XP* with .daily, playing games, or check in *.balance* \n\nOr you can top up via *.DONATE* and send proof to *.OWNER*`, m)
}
handler.help = ['buydm', 'buyalldm']
handler.tags = ['econ']
handler.command = ['buydm', 'buyalldm'] 
handler.group = true
handler.rpg = true
}

module.exports = handler;