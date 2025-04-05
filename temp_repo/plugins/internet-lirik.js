const { getMessage } = require('../lib/languages');

let fetch = require("node-fetch");
let handler = async (m, {
    conn,
    text,
    usedPrefix,
    command
}) => {
    if (!text) throw `Ex: ${usedPrefix}${command} Bring Me Back To Life`
    try {
        let data = await (await fetch(`https://api.betabotz.eu.org/fire/search/lirik?lirik=${text}&apikey=${lann}`)).json()
        let caption = `
${data.result.lyrics}

ℹ️ More info:
🔗 ${data.result.image}
🎤 Artist: ${data.result.artist}`
        await conn.relayMessage(m.chat, {
            extendedTextMessage:{
                text: caption, 
                contextInfo: {
                     externalAdReply: {
                        title: `🎵 ${data.result.title} - ${data.result.artist} 🎵`,
                        mediaType: 1,
                        previewType: 0,
                        renderLargerThumbnail: true,
                        thumbnailUrl: data.result.image,
                        sourceUrl: ''
                    }
                }, mentions: [m.sender]
}}, {})
    } catch (e) {
        console.log(e)
        m.reply('An error occurred, please try again later')
    }
}

handler.help = ['lirik'].map(v => v + ' <Title>')
handler.tags = ['internet']
handler.command = /^(lirik|lyrics|lyric)$/i

module.exports = handler
