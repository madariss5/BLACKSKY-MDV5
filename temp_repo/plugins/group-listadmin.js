const { getMessage } = require('../lib/languages');

let handler = async (m, { conn, args, participants }) => {
    // Get user's preferred language
    const user = global.db.data.users[m.sender];
    const chat = global.db.data.chats[m.chat];
    const lang = user?.language || chat?.language || global.language;

    let group = await conn.getName(m.key.remoteJid)
    let mimin = m.isGroup ? getAdmin(participants) : ''
    
    // Using translations for the list header
    let txt = getMessage('admin_list_header', lang, {
        group_name: group,
        total: mimin.length
    }) + '\n\n';
    
    for (let min of mimin) {
        txt += `• @${min.split('@')[0]}\n`
    }
    
    conn.reply(m.chat, txt, m, { mentions: await conn.parseMention(txt) })
}

handler.help = ['listadmin']
handler.tags = ['group']
handler.command = /^(adminlist|listadmin)$/i
handler.group = true
handler.register = false

module.exports = handler

const getAdmin = (participants) => {
    getAdminAll = []
    for (let b of participants) {
        b.admin === "admin" ? getAdminAll.push(b.id) : ''
        b.admin === "superadmin" ? getAdminAll.push(b.id) : ''
    }
    return getAdminAll
}
