let fs = require('fs');
const { getMessage } = require('../lib/languages.js');
let handler = m => m

handler.all = async function (m, { isBlocked }) {
    if (isBlocked) return
    if ((m.mtype === 'groupInviteMessage' || m.text.startsWith('invitean untuk join') || m.text.startsWith('Invitation to join') || m.text.startsWith('Buka tautan this')) && !m.isBaileys && !m.isGroup) {
    let text = `Invite Group
• 30 Day / Rp 10k
Jika berminat hubungi: @${global.owner[0]} untuk order:)
`
    this.reply(m.chat, text, m)
    const data = global.owner.filter(([id, isCreator]) => id && isCreator)
    this.sendContact(m.chat, data.map(([id, name]) => [id, name]), m)
    }
}

module.exports = handler