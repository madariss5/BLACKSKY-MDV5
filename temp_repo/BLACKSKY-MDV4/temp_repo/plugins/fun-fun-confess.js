const { getMessage } = require('../lib/languages');

let handler = async (m, { conn, text, usedPrefix, command }) => {
    // Get user's preferred language
    const user = global.db.data.users[m.sender];
    const chat = global.db.data.chats[m.chat];
    const lang = user?.language || chat?.language || global.language;
 {
    conn.menfess = conn.menfess ? conn.menfess : {}
    if (!text) throw `*Cara Useran :*\n\n${usedPrefix + command} nomor|nama sender|message\n\n*Note:* nama sender may nama samaran atau anonymous.\n\n*Example:* ${usedPrefix + command} ${m.sender.split`@`[0]}|Anonymous|Hai.`;
    let [jid, name, message] = text.split('|');
    if ((!jid || !name || !message)) throw `*Cara Useran :*\n\n${usedPrefix + command} nomor|nama sender|message\n\n*Note:* nama sender may nama samaran atau anonymous.\n\n*Example:* ${usedPrefix + command} ${m.sender.split`@`[0]}|Anonymous|Hai.`;
    jid = jid.replace(/[^0-9]/g, '') + '@s.whatsapp.net';
    let data = (await conn.onWhatsApp(jid))[0] || {};
    if (!data.exists) throw 'Nomer not terList di whatsapp.';
    if (jid == m.sender) throw 'not can send message menfess ke diri sendiri.'
    let mf = Object.values(conn.menfess).find(mf => mf.status === true)
    if (mf) return !0
    	let id = + new Date
        let text = `Hai @${data.jid.split("@")[0]}, you accept message Menfess nih.\n\nDari: *${name}*\nPesan: \n${message}\n\nMau reply message this kak? can kok kak. tinggal ketik message kakak lalu kirim, later I sampaikan ke *${name}*.`.trim();
        await conn.relayMessage(data.jid, {
                extendedTextMessage:{
                text: text, 
                contextInfo: {
                mentionedJid: [data.jid],
                     externalAdReply: {
                        title: 'M E N F E S S',
                        mediaType: 1,
                        previewType: 0,
                        renderLargerThumbnail: true,
                        thumbnailUrl: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRIyz1dMPkZuNleUyfXPMsltHwKKdVddTf4-A&usqp=CAU',
                        sourceUrl: ''
                    }
                }
          }}, {}).then(() => {
            m.reply('Success send message menfess.')
            conn.menfess[id] = {
                id,
                dari: m.sender,
                nama: name,
                recipient: data.jid,
                message: message,
                status: false
            }
            return !0
        })
}
handler.tags = ['fun']
handler.help = ['menfess']
handler.command = /^(menfess|menfes)$/i
handler.private = true

}

module.exports = handler
