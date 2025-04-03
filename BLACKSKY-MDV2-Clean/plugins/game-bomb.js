const { getMessage } = require('../lib/languages');

// Thanks To Kasan

let handler = async (m, { conn }) => {
    // Get user's preferred language
    const user = global.db.data.users[m.sender];
    const chat = global.db.data.chats[m.chat];
    const lang = user?.language || chat?.language || global.language;
 {
conn.bomb = conn.bomb ? conn.bomb : {};
let id = m.sender,
timeout = 180000;
if (id in conn.bomb) return conn.reply(m.chat, '*^ sesi this not yet Completed!*', conn.bomb[id][0]);
const bom = ['💥', '✅', '✅', '✅', '✅', '✅', '✅', '✅', '✅'].sort(() => Math.random() - 0.5);
const number = ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣'];
const array = bom.map((v, i) => ({
emot: v,
number: number[i],
position: i + 1,
state: false
}));
let text = `乂  *B O M B*\n\nKirim angka *1* - *9* untuk open *9* box nomor di bawah this :\n\n`;
for (let i = 0; i < array.length; i += 3) text += array.slice(i, i + 3).map(v => v.state ? v.emot : v.number).join('') + '\n';
text += `\nTimeout : [ *${((Timeout / 1000) / 60)} minutes* ]\nApabila menable to box which berisi bom maka point will di lackingi. Type suren untuk menyerah.`;
let msg = await conn.sendMessage(m.chat, {
text: text,
contextInfo: {
externalAdReply: {
title: "",
body: 'Bomb',
thumbnailUrl: "https://telegra.ph/file/b3138928493e78b55526f.jpg",
sourceUrl: "",
mediaType: 1,
renderLargerThumbnail: true
}}},
{ quoted: m })
let { key } = msg

let v;
conn.bomb[id] = [
msg,
array,
setTimeout(() => {
v = array.find(v => v.emot == '💥');
if (conn.bomb[id]) conn.reply(m.chat, `*Time's up!*, Bom berada di box nomor ${v.number}.`, conn.bomb[id][0].key);
delete conn.bomb[id];
}, timeout),
key
];

}

handler.help = ["bomb"];
handler.tags = ["game"];
handler.command = /^(bomb)$/i;

}

module.exports = handler;
