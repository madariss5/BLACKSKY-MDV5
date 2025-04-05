const { getMessage } = require('../lib/languages');

let handler = async (m, { conn, usedPrefix }) => {
    // Get user's preferred language
    const user = global.db.data.users[m.sender];
    const chat = global.db.data.chats[m.chat];
    const lang = user?.language || chat?.language || global.language;
 {
    let id = m.chat
    conn.giveway = conn.giveway ? conn.giveway : {}
    if (!(id in conn.giveway)) throw `_*Tidak ada GIVEAWAY berlangsung digroup this!*_\n\n*${usedPrefix}mulaigiveaway* - untuk start giveaway`

    let d = new Date
    let date = d.toLocaleDateString('id', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    })
    let absen = conn.giveway[id][1]
    let cita = absen[Math.floor(Math.random() * absen.length)]
    let tag = `@${cita.split`@`[0]}`
    let loadd = [
 '■□ 10%',
 '□■ 20%',
 '■□ 30%',
 '□■ 40%',
 '■□ 50%',
 '□■ 60%',
 '■□ 70%',
 '□■ 80%',
 '■□ 90%',
 '*Menable tokan Pemenangnya*'
 ]

let { key } = await conn.sendMessage(m.chat, {text: '*Mencari Pemenangnya*'})

for (let i = 0; i < loadd.length; i++) {
await sleep(1000)
await conn.sendMessage(m.chat, {text: loadd[i], edit: key })} return conn.reply(m.chat, `🎊 *CONGRATULATIONS* 🎉
${tag} Kamu Pemenang Giveawaynya🎉

Tanggal: ${date}
————————————————————————
_*Note:* delete giveaway sehas Completed dengan write *.hapusgiveaway*_`, m, { contextInfo: { mentionedJid: absen } })
}
handler.help = ['rollgiveaway']
handler.tags = ['adminry', 'group']
handler.command = /^(rolling|rollgiveaway|rollinggiveaway)$/i
handler.admin = true
}

module.exports = handler

const sleep = (ms) => {
return new Promise(resolve => setTimeout(resolve, ms));
}