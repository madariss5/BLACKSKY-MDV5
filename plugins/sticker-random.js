const { getMessage } = require('../lib/languages');

var { 
sticker5 
} = require('../lib/sticker');
var handler = async (m, {
 conn, 
 command
 }) => {
    var error = (`https://telegra.ph/file/12141dd462ecabeed1347.png`)
    try {
        if (command == 'dinoyellow' || command == 'sdino') {
        const res = `https://api.betabotz.eu.org/fire/sticker/dinoyellow?apikey=${lann}`
            var sticker = await sticker5(res, { packname })
            await conn.sendFile(m.chat, sticker, 'emror.webp', '', m)
        }
        else if (command == 'patrick' || command == 'spatrick') {
        const res = `https://api.betabotz.eu.org/fire/sticker/patrick?apikey=${lann}`
            var sticker = await sticker5(res, { packname })
            await conn.sendFile(m.chat, sticker, 'emror.webp', '', m)
        }
        else if (command == 'spongebob' || command == 'sspongebob') {
        const res = `https://api.betabotz.eu.org/fire/sticker/spongebob?apikey=${lann}`
            var sticker = await sticker5(res, { packname })
            await conn.sendFile(m.chat, sticker, 'emror.webp', '', m)
        }
        else if (command == 'doge' || command == 'sdoge') {
        const res = `https://api.betabotz.eu.org/fire/sticker/doge?apikey=${lann}`
            var sticker = await sticker5(res, { packname })
            await conn.sendFile(m.chat, sticker, 'emror.webp', '', m)
        }
        else if (command == 'manusialidi' || command == 'smanusialidi') {
        const res = `https://api.betabotz.eu.org/fire/sticker/manusialidi?apikey=${lann}`
            var sticker = await sticker5(res, { packname })
            await conn.sendFile(m.chat, sticker, 'emror.webp', '', m)
        }
    } catch (e) {
        console.log(e)
        await conn.sendFile(m.chat, error, 'error.webp', '', m)
    }
}

handler.command = handler.help = ['dinoyellow', 'patrick', 'spongebob', 'doge', 'manusialidi', 'sdino', 'spatrick', 'sspongebob', 'sdoge', 'smanusialidi']
handler.tags = ['sticker']
handler.limit = true
module.exports = handler
