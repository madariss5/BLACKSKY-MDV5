const { getMessage } = require('../lib/languages');

let handler = async (m, { conn, args, text, usedPrefix, command }) => {
    // Get user's preferred language
    const user = global.db.data.users[m.sender];
    const chat = global.db.data.chats[m.chat];
    const lang = user?.language || chat?.language || global.language;
 {
 const JAIL_TIME = 60 * 60 * 1000
 let who = (m.mentionedJid && m.mentionedJid[0]) ? m.mentionedJid[0] : args[0] ? ((args.join('').replace(/[@ .+-]/g, '')).replace(/^\+/, '').replace(/-/g, '') + '@s.whatsapp.net') : '';
 const user = global.db.data.users[who]
 const usar = global.db.data.users[m.sender]
 if (usar.job == 'police') {
    if (!text) throw '*Siapa which mau di jail?*'
    if (!who) return m.reply('*Tag target atau ketik nomornya*')
    if (!user) return m.reply(`*User ${who} not ada dalam database*`)
    
    user.jail = true
    user.perkerjaandua = Date.now() + JAIL_TIME
    
    setTimeout(() => {
    conn.reply(who, `*Kamu has di jail oleh ${usar.name}*`, fverif)
    }, 5000)
    conn.reply(m.chat, `Success jail *@${(who || '').replace(/@s\.whatsapp\.net/g, '')}*\n🧤 +1 level Kerja Keras\n\n_Jika police diketahui memenjarai seseorang tanpa alasan tercertainly, maka will langsung diban oleh pihak boss._`, m, { mentions: [who] })
    return
   }
   await conn.reply(m.chat, '*Fitur this hanya dikhususkan untuk orang which work sebagai police*', m)
}

handler.help = ['jail']
handler.tags = ['rpg']
handler.command = /^jail$/i
handler.register = true
handler.rpg = true

}

module.exports = handler