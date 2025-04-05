const { getMessage } = require('../lib/languages');

// Thanks To Kasan

const util = require('util');

let handler = m => m
handler.before = async function (m) {
try {
let id = m.sender;
let timeout = 180000;
let reward = randomInt(100, 800);
let users = global.db.data.users[m.sender];
let body = (typeof m.text == 'string' ? m.text : '');
conn.bomb = conn.bomb ? conn.bomb : {};

let isSurrender = /^(suren)$/i.test(body);
if (isSurrender) {
await conn.reply(m.chat, `🚩 Menyerah`, m);
clearTimeout(conn.bomb[id][2]);
delete conn.bomb[id];
}

if ((id in conn.bomb) && !isNaN(body)) {
let json = conn.bomb[id][1].find(v => v.position == body);
if (!json) return conn.reply(m.chat, `🚩 Untuk open box kirim angka 1 - 9`, m);

if (json.emot == '💥') {
json.state = true;
let bomb = conn.bomb[id][1];
let text = `乂  *B O M B*\n\n`;
text += bomb.slice(0, 3).map(v => v.state ? v.emot : v.number).join('') + '\n';
text += bomb.slice(3, 6).map(v => v.state ? v.emot : v.number).join('') + '\n';
text += bomb.slice(6).map(v => v.state ? v.emot : v.number).join('') + '\n\n';
text += `Timeout : [ *${((Timeout / 1000) / 60)} minutes* ]\n`;
text += `*Permainan Completed!*, box berisi bom terbuka : (- *${formatNumber(reward)}*)`;

conn.reply(m.chat, text, m).then(() => {
users.exp < reward ? users.exp = 0 : users.exp -= reward;
clearTimeout(conn.bomb[id][2]);
delete conn.bomb[id];
});
} else if (json.state) {
return conn.reply(m.chat, `🚩 Kotak ${json.number} already di buka Please pilih box which lain.`, m);
} else {
json.state = true;
let changes = conn.bomb[id][1];
let open = changes.filter(v => v.state && v.emot != '💥').length;

if (open >= 8) {
let text = `乂  *B O M B*\n\n`;
text += `Kirim angka *1* - *9* untuk open *9* box nomor di bawah this :\n\n`;
text += changes.slice(0, 3).map(v => v.state ? v.emot : v.number).join('') + '\n';
text += changes.slice(3, 6).map(v => v.state ? v.emot : v.number).join('') + '\n';
text += changes.slice(6).map(v => v.state ? v.emot : v.number).join('') + '\n\n';
text += `Timeout : [ *${((Timeout / 1000) / 60)} minutes* ]\n`;
text += `*Permainan Completed!* box berisi bom not terbuka : (+ *${formatNumber(reward)}*)`;

conn.reply(m.chat, text, m).then(() => {
users.exp += reward;
clearTimeout(conn.bomb[id][2]);
delete conn.bomb[id];
});
} else {
let text = `乂  *B O M B*\n\n`;
text += `Kirim angka *1* - *9* untuk open *9* box nomor di bawah this :\n\n`;
text += changes.slice(0, 3).map(v => v.state ? v.emot : v.number).join('') + '\n';
text += changes.slice(3, 6).map(v => v.state ? v.emot : v.number).join('') + '\n';
text += changes.slice(6).map(v => v.state ? v.emot : v.number).join('') + '\n\n';
text += `Timeout : [ *${((Timeout / 1000) / 60)} minutes* ]\n`;
text += `Kotak berisi bom not terbuka : (+ *${formatNumber(reward)}*)`;
conn.reply(m.chat, text, m).then(() => {
users.exp += reward;
});
}
}
}
} catch (e) {
return conn.reply(m.chat, util.format(e), m);
}
return !0;
}

handler.exp = 0

function randomInt(min, max) {
return Math.floor(Math.random() * (max - min + 1)) + min;
}

function formatNumber(number) {
return number.toLocaleString();
}

module.exports = handler
