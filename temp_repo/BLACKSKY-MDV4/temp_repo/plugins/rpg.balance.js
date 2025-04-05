const { getMessage } = require('../lib/languages');


let handler = async (m, {conn, usedPrefix}) => {
        
    let who = m.quoted ? m.quoted.sender : m.mentionedJid && m.mentionedJid[0] ? m.mentionedJid[0] : m.fromMe ? conn.user.jid : m.sender
    let user = global.db.data.users[who]
    if (!(who in global.db.data.users)) throw `✳️ User is missing from my database`
    conn.reply(m.chat, `
┌───⊷ *BALANCE* ⊶
▢ *📌Name* : _@${who.split('@')[0]}_
▢ *💎Diamonds* : _${user.diamond}_
▢ *⬆️XP* : _Total ${user.exp}_
▢ *money* : _Total ${user.money}_
└──────────────

*NOTE :* 
You can buy 💎 diamonds using the commands
❏ *${usedPrefix}buydm <amount>*
❏ *${usedPrefix}buyalldm*`, m, { mentions: [who] })
}
handler.help = ['balance']
handler.tags = ['econ']
handler.command = ['bal', 'balance'] 
handler.rpg = true
module.exports = handler;