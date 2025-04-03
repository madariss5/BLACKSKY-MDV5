const { getMessage } = require('../lib/languages');

const {
        getBinaryNodeChild,
        getBinaryNodeChildren
} = require('@adiwajshing/baileys');

const fetch = require('node-fetch');

let handler = async (m, { conn, text, participants, usedPrefix, command }) => {
    // Get user's preferred language
    const user = global.db.data.users[m.sender];
    const chat = global.db.data.chats[m.chat];
    const lang = user?.language || chat?.language || global.language;

    if (!text) throw getMessage('add_number_required', { 
        prefix: usedPrefix, 
        command: command, 
        owner: global.owner[0] 
    }, lang);
    
    m.reply(getMessage('wait', lang));
    
    let _participants = participants.map(user => user.id)
    let users = (await Promise.all(
        text.split(',')
            .map(v => v.replace(/[^0-9]/g, ''))
            .filter(v => v.length > 4 && v.length < 20 && !_participants.includes(v + '@s.whatsapp.net'))
            .map(async v => [
                v,
                await conn.onWhatsApp(v + '@s.whatsapp.net')
            ])
    )).filter(v => v[1][0]?.exists).map(v => v[0] + '@c.us')
    
    const response = await conn.query({
        tag: 'iq',
        attrs: {
            Type: 'set',
            xmlns: 'w:g2',
            to: m.chat,
        },
        content: users.map(jid => ({
            tag: 'add',
            attrs: {},
            content: [{ tag: 'participant', attrs: { jid } }]
        }))
    })
    const pp = await conn.profilePictureUrl(m.chat, 'image').catch(_ => null)
    const jpegThumbnail = pp ? await (await fetch(pp)).buffer() : Buffer.alloc(0)
    const add = getBinaryNodeChild(response, 'add')
    const participant = getBinaryNodeChildren(response, 'add')
    let anu = participant[0].content.filter(v => v)
    if (anu[0].attrs.error == 408) {
        const errorMessage = getMessage('add_recently_left', { 
            user: anu[0].attrs.jid.split('@')[0] 
        }, lang);
        
        conn.sendButton(m.chat, errorMessage, wm, 'link', usedPrefix + `link`, m);
    }
    
    for (const user of participant[0].content.filter(item => item.attrs.error == 403)) {
        const jid = user.attrs.jid
        const content = getBinaryNodeChild(user, 'add_request')
        const invite_code = content.attrs.code
        const invite_code_exp = content.attrs.expiration
        const txt = getMessage('add_sending_invite', { 
            user: jid.split('@')[0] 
        }, lang);
        
        await m.reply(txt, null, {
                mentions: await conn.parseMention(txt)
        })
        
        const groupName = await conn.getName(m.chat);
        const inviteMessage = getMessage('add_invite_message', lang);
        
        await conn.sendGroupV4Invite(m.chat, jid, invite_code, invite_code_exp, groupName, inviteMessage, jpegThumbnail)
    }
}

handler.help = ['add', '+'].map(v => v + ' @user')
handler.tags = ['group']
handler.command = /^(add|\+)$/i

handler.admin = true
handler.group = true
handler.botAdmin = true
handler.fail = null

module.exports = handler