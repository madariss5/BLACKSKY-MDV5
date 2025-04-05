const { getMessage } = require('../lib/languages.js');
let handler = async (m, {
    conn,
    groupMetadata,
    usedPrefix,
    text,
    command
}) => {
if (!text && !m.quoted) return m.reply("Input text\nReply message")
    let get = await groupMetadata.participants.filter(v => v.id.endsWith('.net')).map(v => v.id)
    let count = get.length;
    let sentCount = 0;
    m.reply(wait);
    for (let i = 0; i < get.length; i++) {
        setTimeout(function() {
            if (text) {
                conn.sendMessage(get[i], {
                    text: text
                });
            } else if (m.quoted) {
                conn.copyNForward(get[i], m.getQuotedObj(), false);
            } else if (text && m.quoted) {
                conn.sendMessage(get[i], {
                    text: text + "\n" + m.quoted.text
                });
            }
            count--;
            sentCount++;
            if (count === 0) {
                m.reply(`Success Push contact:\nJumlah message Terkirim: *${sentCount}*`);
            }
        }, i * 1000); // delay setiap senderan seold 1 seconds
    }
}
handler.command = handler.help = ['pushcontact']
handler.tags = ['owner']
handler.owner = true
handler.group = true
module.exports = handler
