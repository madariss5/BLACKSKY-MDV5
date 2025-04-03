const { getMessage } = require('../lib/languages');

let handler = async (m, { conn, usedPrefix }) => {
    // Get user's preferred language
    const user = global.db.data.users[m.sender];
    const chat = global.db.data.chats[m.chat];
    const lang = user?.language || chat?.language || global.language;
    
    let id = m.chat
    conn.absen = conn.absen ? conn.absen : {}
    if (!(id in conn.absen)) {
        throw getMessage('attendance_none', lang) + '\n\n' + 
              getMessage('attendance_start_command', lang, { prefix: usedPrefix });
    }

    let absen = conn.absen[id][1]
    const wasVote = absen.includes(m.sender)
    if (wasVote) throw getMessage('attendance_already_taken', lang);
    
    absen.push(m.sender)
    m.reply(getMessage('done', lang))
    
    let d = new Date
    let date = d.toLocaleDateString('id', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    })
    let list = absen.map((v, i) => `├ ${i + 1}. @${v.split`@`[0]}`).join('\n')
    
    let caption = `
${getMessage('attendance_date', lang, { date })}
${conn.absen[id][2]}
┌「 *${getMessage('attendance', lang)}* 」  
├ ${getMessage('attendance_total', lang, { count: absen.length })}
${list} 
└────
${getMessage('attendance_command', lang, { prefix: usedPrefix })}
${getMessage('attendance_check', lang)}: ${usedPrefix}cekabsen`.trim()
    
    await conn.reply(m.chat, caption, m, { contextInfo: { mentionedJid: absen } })
}
handler.help = ['absen']
handler.tags = ['group']
handler.command = /^(absen|hadir)$/i
handler.group = true

module.exports = handler;