const { getMessage } = require('../lib/languages');

/* 
    Made by https://github.com/syahrularranger 
    Jangan di delete credit nya :)
*/
let timeout = 60000
let poin = 500
let poin_lose = -100
let handler = async (m, { conn, usedPrefix }) => {
    // Get user's preferred language
    const user = global.db.data.users[m.sender];
    const chat = global.db.data.chats[m.chat];
    const lang = user?.language || chat?.language || global.language;
 {
  conn.suit = conn.suit ? conn.suit : {}
  if (Object.values(conn.suit).find(room => room.id.startsWith('suit') && [room.p, room.p2].includes(m.sender))) throw 'Completedkan suit mu which senot yetnya'
  if (!m.mentionedJid[0]) return m.reply(`_Siapa which want you tantang?_\nTag orangnya.. Example\n\n${usedPrefix}suit @${owner[1]}`, m.chat, { contextInfo: { mentionedJid: [owner[1] + '@s.whatsapp.net'] } })
  if (Object.values(conn.suit).find(room => room.id.startsWith('suit') && [room.p, room.p2].includes(m.mentionedJid[0]))) throw `Orang which you tantang currently play suit bersama orang lain :(`
  let id = 'suit_' + new Date() * 1
  let caption = `
_*SUIT PvP*_

@${m.sender.split`@`[0]} menantang @${m.mentionedJid[0].split`@`[0]} untuk play suit

Please @${m.mentionedJid[0].split`@`[0]} 
`.trim()
  let footer = `Type "accept/ok/gas\\\" untuk start suit\nType \\\"reject/gacan/later" untuk reject`
  conn.suit[id] = {
    chat: await conn.send2But(m.chat, caption, footer, 'accept', 'ok', 'reject', 'reject', m, { contextInfo: { mentionedJid: conn.parseMention(caption) } }),
    id: id,
    p: m.sender,
    p2: m.mentionedJid[0],
    status: 'wait',
    time: setTimeout(() => {
      if (conn.suit[id]) conn.reply(m.chat, `_Waktu suit habis_`, m)
      delete conn.suit[id]
    }, timeout), poin, poin_lose, timeout
  }
}
handler.tags = ['game']
handler.help = ['suitpvp', 'suit2'].map(v => v + ' @tag')
handler.command = /^suit(pvp|2)$/i
handler.limit = false
handler.group = true

}

module.exports = handler
