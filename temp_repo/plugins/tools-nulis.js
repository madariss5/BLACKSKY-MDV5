const { getMessage } = require('../lib/languages');

 const { format } = require('util');
// let path = require('path');
const { spawn } = require('child_process');

// Font By MFarelS:V
let fontPath = 'src/font/Zahraaa.ttf'
let handler = async (m, { conn, args }) => {
    // Get user's preferred language
    const user = global.db.data.users[m.sender];
    const chat = global.db.data.chats[m.chat];
    const lang = user?.language || chat?.language || global.language;
 {
    if (!global.support.convert &&
        !global.support.magick &&
        !global.support.gm) return handler.disabled = true // Disable if doesnt support
    let inputPath = 'src/kertas/magernulis1.jpg'
    let d = new Date()
    let tgl = d.toLocaleDateString('id-Id')
    let days = d.toLocaleDateString('id-Id', { weekday: 'long' })
    let text = args.join` `
    // conn.reply(m.chat, util.format({fontPath, inputPath, outputPath, tgl, days, teks}), m)
    let bufs = []
    const [_spawnprocess, ..._spawnargs] = [...(global.support.gm ? ['gm'] : global.support.magick ? ['magick'] : []),
        'convert',
        inputPath,
        '-font',
        fontPath,
        '-size',
        '1024x784',
        '-pointsize',
        '20',
        '-interline-spacing',
        '1',
        '-annotate',
        '+806+78',
        days,
        '-font',
        fontPath,
        '-size',
        '1024x784',
        '-pointsize',
        '18',
        '-interline-spacing',
        '1',
        '-annotate',
        '+806+102',
        tgl,
        '-font',
        fontPath,
        '-size',
        '1024x784',
        '-pointsize',
        '20',
        '-interline-spacing',
        '-7.5',
        '-annotate',
        '+344+142',
        text,
        'jpg:-'
    ]
    spawn(_spawnprocess, _spawnargs)
        .on('error', e => m.reply(format(e)))
        .on('close', () => {
            conn.sendFile(m.chat, Buffer.concat(bufs), 'nulis.jpg', 'Hati² ketahuan:v', m)
        })
        .stdout.on('data', chunk => bufs.push(chunk))
}
handler.help = ['n'].map(v => v + 'ulis <teks>')
handler.tags = ['tools']
handler.command = /^nulis$/i


}

module.exports = handler

// BY MFARELS NJEENK
// https://GitHub.com/MFarelS/
