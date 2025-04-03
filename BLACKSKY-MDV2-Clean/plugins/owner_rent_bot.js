const { getMessage } = require('../lib/languages');

let handler = async (m, { conn, command, usedPrefix, text, participants }) => {
    // Get user's preferred language
    const user = global.db.data.users[m.sender];
    const chat = global.db.data.chats[m.chat];
    const lang = user?.language || chat?.language || global.language;
 {
    const groups = Object.keys(conn.chats)
    .filter(key => key.endsWith('@g.us'))
    .map(key => conn.chats[key]);
    let [id, expired] = text.split('|');
    if (!text) {
    const list = groups.map((group, index) => `*${index + 1}.* ${group.subject}`).join('\n');
    const text = '`L I S T - G R O U P - J O I N I N G`\n\n'
    conn.reply(m.chat, `${teks}`+`${list}`, m);
    } else if (text.length === 1 && /^\d+$/.test(text)) {
    const index = parseInt(id) - 1;
    if (index >= 0 && index < groups.length) {
        let d = new Date(new Date + 3600000)
        let locale = 'id'
        let date = d.toLocaleDateString(locale, {
                 day: 'numeric',
                 month: 'long',
                 year: 'numeric' 
                })
        let amountHari = 86400000 * expired[expired.length - 0];
        let now = new Date() * 1;
        let group = groups[index];
        let who = group.id
        let namegc = await conn.getName(who);
        switch(command) {
            case "addsewa":
                if (!expired) throw "masukan angka untuk menambah jangka waktu jangka waktu *Example:* .addsewa <nomor group>|<days> "
                if (!global.db.data.chats[who]) global.db.data.chats[who] = {};
    
                if (global.db.data.chats[who].expired && now < global.db.data.chats[who].expired) {
                    global.db.data.chats[who].expired += amountHari;
                } else {
                    global.db.data.chats[who].expired = now + amountHari;
                }
                let capt = `[ *Groups Notifikasi* ]
                
                *Menambahkan jangka waktu sewa group bot.*
                *Name group:* ${namegc}
                *Id group:* ${who}
                *Tanggal: ${date}
                *Jangka waktu:* ${amountHari}
                hai all member, terimakasih has sewa bot we`
                await conn.sendMessage(who, { text: capt, 
   //                   contextInfo: {
   //                   isForwarded: true, 
   //                   forwardedNewsletterMessageInfo: {
   //                   newsletterJid: '120363337047230103@newsletter',
   //                   newsletterName: `[ *Groups Notifikasi* ]`, 
   //                   serverMessageId: -1
   //                   }, 
   //               }
            })
                conn.reply(m.chat, `Success menetapkan days kadaluarsa untuk group this seold ${expired} days.\n\nHitung Mundur: ${msToDate(global.db.data.chats[who].expired - now)}`, m);
                break;
            case 'delsewa':
                if (!global.db.data.chats[who]) throw `group not ditemukan di database.`;
                global.db.data.chats[who].expired = false;
                await conn.groupLeave(who)
                m.reply(`Success menghapus days kadaluarsa untuk group this, dan exit dari group this`);
                break;
            case 'setsewa':
                if (!global.db.data.chats[who]) throw `group not ditemukan di database.`;
                if (!expired) throw "masukan angka untuk mengubah jangka waktu *Example:* .addsewa <nomor group>|<days>"
                global.db.data.chats[who].expired = false;
                let caption = `[ *Groups Notifikasi* ]
                
                *Perumaterial jangka waktu sewa group bot.*
                *Name group:* ${namegc}
                *Id group:* ${who}
                *Tanggal: ${date}
                *Jangka waktu:* ${amountHari}
                hai all member, owner bot ku has mengubah waktu sewa gc bot`
                await conn.sendMessage(who, { text: caption, 
   //                   contextInfo: {
   //                   isForwarded: true, 
   //                   forwardedNewsletterMessageInfo: {
   //                   newsletterJid: '120363337047230103@newsletter',
   //                   newsletterName: `[ *Groups Notifikasi* ]`, 
   //                   serverMessageId: -1
   //                   }, 
   //               }
                });
                global.db.data.chats[who].expired += amountHari;
                conn.reply(m.chat, `Success menetapkan days kadaluarsa untuk group this seold ${expired} days.\n\nHitung Mundur: ${msToDate(global.db.data.chats[who].expired - now)}`, m);
            }
            } else {
            conn.reply(m.chat, 'group dengan urutan tersebut not ditemukan.', m);
            }
        } else {
        conn.reply(m.chat, `â€¢ *Example :* .out nomer`, m);
        }
     };
  handler.help = ['addsewa','dellsewa','setsewa']
  handler.tags = ['owner']
  handler.command = /^(addsewa|dellsewa|setsewa)$/i
     
  handler.owner = true
     
  }

module.exports = handler
