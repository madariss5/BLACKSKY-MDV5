const { getMessage } = require('../lib/languages');

let handler = async (m, { conn, text }) => {
    // Get user's preferred language
    const user = global.db.data.users[m.sender];
    const chat = global.db.data.chats[m.chat];
    const lang = user?.language || chat?.language || global.language;
 {
  let groups = Object.entries(conn.chats).filter(([jid, chat]) => jid.endsWith('@g.us') && chat.isChats && !chat.metadata?.read_only && !chat.metadata?.announce).map(v => v[0])
  let cc = text ? m : m.quoted ? await m.getQuotedObj() : false || m
  let text = text ? text : cc.text
  conn.reply(m.chat, `_Mengirim message broadcast ke ${groups.length} group_`, m)
  for (let id of groups) await conn.copyNForward(id, conn.cMods(m.chat, cc, /bc|broadcast/i.test(text) ? text : text + '\n' + readMore + '「 All Group Broadcast 」\n' + randomID(32)), true).catch(_ => _)
  m.reply('Completed Broadcast All Group :)')
}
handler.help = ['broadcastgroup', 'bcgc'].map(v => v + ' <teks>')
handler.tags = ['owner']
handler.command = /^(broadcast|bc)(group|group|gc)$/i

handler.owner = true

}

module.exports = handler

const more = String.fromCharCode(8206)
const readMore = more.repeat(4001)

const randomID = length => require('crypto').randomBytes(Math.ceil(length * .5)).toString('hex').slice(0, length)
