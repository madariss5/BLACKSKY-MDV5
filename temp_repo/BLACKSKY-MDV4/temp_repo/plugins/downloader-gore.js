const { getMessage } = require('../lib/languages');

let fetch = require('node-fetch');
let handler = async (m, { conn } ) => {   
// Get user's preferred language
const user = global.db.data.users[m.sender];
const chat = global.db.data.chats[m.chat];
const lang = user?.language || chat?.language || global.language;

// Define translation keys
const title = getMessage('gore_title', lang) || 'GORE';
const judul = getMessage('gore_content_title', lang) || 'TITLE';
const author = getMessage('gore_author', lang) || 'AUTHOR';
const views = getMessage('gore_views', lang) || 'VIEWS';
const comments = getMessage('gore_comments', lang) || 'COMMENTS';
const link = getMessage('gore_link', lang) || 'LINK';
const vpnNote = getMessage('gore_vpn_note', lang) || 'use vpn if you want to watch';

// You may need to provide an actual fire key or get it from config
const apiKey = global.betabotzkey || 'YOURAPIKEY';
let res = await fetch(`https://api.betabotz.eu.org/fire/webzone/gore?apikey=${apiKey}`).then(result => result.json())
let anu =`
─────> *${title}* <─────

*${judul}*:
${res.result.title}\n
*${author}*: ${res.result.author}
*${views}*: ${res.result.views}
*${comments}*: ${res.result.comments}
*${link}*: ${res.result.url}\n
\`${vpnNote}\`
`
conn.sendMessage(m.chat, {
                    text: anu, 
                    contextInfo: {
                         externalAdReply: {
                            title: "RANDOM GORE",
                            body: '',
                            renderLargerThumbnail: true,
                            thumbnailUrl: 'https://telegra.ph/file/13912a80a67472cad91c3.jpg',
                            sourceUrl: null,
                            mediaType: 1,
                        }
                    }, mentions: [m.sender]
    }, {})
}
handler.help = ['gore']
handler.tags = ['internet', 'downloader'];
handler.command = /^(gore)$/i
handler.owner = false
handler.mods = false
handler.premium = false
handler.group = true
handler.private = false

handler.admin = false
handler.botAdmin = false

handler.fail = null

module.exports = handler


//danapurta133