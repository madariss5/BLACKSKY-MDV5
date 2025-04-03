const { getMessage } = require('../lib/languages');

let handler = async (m, { conn, isROwner, text }) => {
    // Get user's preferred language
    const user = global.db.data.users[m.sender];
    const chat = global.db.data.chats[m.chat];
    const lang = user?.language || chat?.language || global.language;
 {
    const delay = time => new Promise(res => setTimeout(res, time))
    let getGroups = await conn.groupFetchAllParticipating()
    let groups = Object.entries(getGroups).slice(0).map(entry => entry[1])
    let anu = groups.map(v => v.id)
    var message = m.quoted && m.quoted.text ? m.quoted.text : text
    if(!message) throw 'teksnya?'
    m.reply(`Mengirim Broadcast Ke ${anu.length} Chat, Waktu Completed ${anu.length * 0.5 } seconds`)
    for (let i of anu) {
    await delay(500)
    conn.relayMessage(i, {
extendedTextMessage:{
                text: message, 
                contextInfo: {
                     externalAdReply: {
                        title: wm,
                        mediaType: 1,
                        previewType: 0,
                        renderLargerThumbnail: true,
                        thumbnailUrl: 'https://telegra.ph/file/aa76cce9a61dc6f91f55a.jpg',
                        sourceUrl: ''
                    }
                }, mentions: [m.sender]
}}, {}).catch(_ => _)
    }
  m.reply(`Sukses Mengirim Broadcast Ke ${anu.length} Group`)
}
handler.help = ['bcgcbot <teks>']
handler.tags = ['owner']
handler.command = /^((broadcastgc|bcgc)bot)$/i

handler.owner = true

}

module.exports = handler
