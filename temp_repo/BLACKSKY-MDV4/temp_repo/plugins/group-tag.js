const { getMessage } = require('../lib/languages');

let handler = async (m, { conn, text, isAdmin, participants}) => {
    // Get user's preferred language
    const user = global.db.data.users[m.sender];
    const chat = global.db.data.chats[m.chat];
    const lang = user?.language || chat?.language || global.language;
 {
        
    let users = participants.map(u => u.id).filter(v => v !== conn.user.jid)
    if (!m.quoted) throw getMessage('tag_reply_required', lang)
    conn.sendMessage(m.chat, { forward: m.quoted.fakeObj, mentions: users } )
}

handler.help = ['totag']
handler.tags = ['group']
handler.command = /^(totag|tag)$/i

handler.admin = true
handler.group = true

}

module.exports = handler
