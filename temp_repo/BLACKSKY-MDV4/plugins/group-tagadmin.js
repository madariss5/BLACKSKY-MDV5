const { getMessage } = require('../lib/languages');

let handler = async (m, { conn, participants, groupMetadata }) => {
    // Get user's preferred language
    const user = global.db.data.users[m.sender];
    const chat = global.db.data.chats[m.chat];
    const lang = user?.language || chat?.language || global.language;
 {

    const getGroupAdmins = (participants) => {
        admins = []
        for (let i of participants) {
            i.admin === "admin" ? admins.push(i.id) : ''
        }
        return admins
    }

    let pp = './src/avatar_contact.png'
    try {
        pp = await conn.profilePictureUrl(m.chat, 'image')
    } catch (e) {
    } finally {
        let { isBanned, welcome, detect, sWelcome, sBye, sPromote, sDemote, antiLink } = global.db.data.chats[m.chat]
        const groupAdmins = getGroupAdmins(participants)
        let listAdmin = groupAdmins.map((v, i) => `${i + 1}. @${v.split('@')[0]}`).join('\n')
        let text = `*「 ${getMessage('tagadmin_title', lang)} 」*\n

*${getMessage('tagadmin_group_name', lang)}* 
${groupMetadata.subject}

*${getMessage('tagadmin_group_owner', lang)}* 
@${m.chat.split`-`[0]}

*${getMessage('tagadmin_group_admins', lang)}*
${listAdmin}
`.trim()
        ownernya = [`${m.chat.split`-`[0]}@s.whatsapp.net`]
        let mentionedJid = groupAdmins.concat(ownernya)
        conn.sendFile(m.key.remoteJid, pp, 'pp.jpg', text, m, false, { contextInfo: { mentionedJid } })
    }
}
handler.help = ['tagadmin']
handler.tags = ['group']
handler.command = /^(tagadmin)$/i

handler.group = true

}

module.exports = handler
