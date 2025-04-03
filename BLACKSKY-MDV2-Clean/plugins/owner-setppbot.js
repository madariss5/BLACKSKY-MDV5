const { getMessage } = require('../lib/languages');

/*di bawah this buat pp biasa non long pilih wrong one*/
let handler = async (m, { conn, usedPrefix, command }) => {
    // Get user's preferred language
    const user = global.db.data.users[m.sender];
    const chat = global.db.data.chats[m.chat];
    const lang = user?.language || chat?.language || global.language;
 {
    let q = m.quoted ? m.quoted : m
    let mime = (q.msg || q).mimetype || ''
    if (/image/.test(mime)) {
        try {
            let img = await q.download()
            let noBot = conn.user.jid
            if (!img) throw 'Image not found'
            await conn.updateProfilePicture(noBot, img)
            m.reply(getMessage('setppbot_success', lang))
        } catch (e) {
            console.log(e)
            m.reply(getMessage('setppbot_error', lang))
        }
    } else throw getMessage('setppbot_usage', lang, { prefix: usedPrefix, command: command })
}
handler.help = ['setppbot'].map(v => v + ' <caption / reply image>')
handler.tags = ['adminry']
handler.command = /^(setppbot)$/i

handler.rowner = true
}

module.exports = handler

/*di bawah this buat pp long aktifin aja pilih wrong one*/
// const { S_WHATSAPP_NET } = require('@adiwajshing/baileys');
// const jimp = require('jimp');

// let handler = async (m, { conn, command, usedPrefix }) => {
//     let q = m.quoted ? m.quoted : m;
//     let mime = (q.msg || q).mimetype || q.mediaType || '';
//     if (/image/g.test(mime) && !/webp/g.test(mime)) {
//         try {
//             let media = await q.download();
//             let botNumber = await conn.user.jid;
//             let { img } = await pepe(media);
//             await conn.query({
//                 tag: 'iq',
//                 attrs: {
//                     target: undefined,
//                     to: S_WHATSAPP_NET,
//                     Type: 'set',
//                     xmlns: 'w:profile:picture'
//                 },
//                 content: [
//                     {
//                         tag: 'picture',
//                         attrs: { Type: 'image' },
//                         content: img
//                     }
//                 ]
//             });
//             m.reply(`Sukses mengganti PP Bot`);
//         } catch (e) {
//             console.log(e);
//             m.reply(`An error occurred, coba again later.`);
//         }
//     } else {
//         m.reply(`Kirim image dengan caption *${usedPrefix + command}* atau tag image which already dikirim`);
//     }
// };

// handler.help = ['setbotpp'];
// handler.tags = ['owner'];
// handler.command = /^(set(botpp|ppbot))$/i;

// handler.owner = true;

// module.exports = handler;

// async function pepe(media) {
//     const image = await jimp.read(media);
//     const min = image.getWidth();
//     const max = image.getHeight();
//     const cropped = image.crop(0, 0, min, max);
//     return {
//         img: await cropped.scaleToFit(720, 720).getBufferAsync(jimp.MIME_JPEG),
//         preview: await cropped.normalize().getBufferAsync(jimp.MIME_JPEG)
//     };
// }
