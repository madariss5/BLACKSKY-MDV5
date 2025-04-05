const { getMessage } = require('../lib/languages');

let handler = async (m, { conn, text }) => {
        if(isNaN(text)) {
        var number = text.split`@`[1]
  } else if(!isNaN(text)) {
        var number = text
  }

  const format = num => {
    const n = String(num),
          p = n.indexOf('.')
    return n.replace(
        /\d(?=(?:\d{3})+(?:\.|$))/g,
        (m, i) => p < 0 || i < p ? `${m},` : m
    )
  }

  if(!text && !m.quoted) return conn.reply(m.chat, `*${getMessage('provide_number_tag_or_reply', m.lang)}*`, m)
  // let exists = await conn.isOnWhatsApp(number)
  // if (exists) return conn.reply(m.chat, `*${getMessage('target_number_not_registered', m.lang)}*`, m)
  if(isNaN(number)) return conn.reply(m.chat, `*${getMessage('invalid_number', m.lang)}*`, m)
  if(number.length > 15) return conn.reply(m.chat, `*${getMessage('invalid_format', m.lang)}*`, m)
  try {
                if(text) {
                        var user = number + '@s.whatsapp.net'
                } else if(m.quoted.sender) {
                        var user = m.quoted.sender
                } else if(m.mentionedJid) {
                  var user = number + '@s.whatsapp.net'
                        }  
                } catch (e) {
  } finally {
    let groupMetadata = m.isGroup ? await conn.groupMetadata(m.chat) : {}
    let participants = m.isGroup ? groupMetadata.participants : []
    let users = m.isGroup ? participants.find(u => u.jid == user) : {}
    if(!user) return conn.reply(m.chat, `*${getMessage('target_not_found', m.lang)}, ${getMessage('may_have_left_or_not_member', m.lang)}*`, m)
    if(user === m.sender) return conn.reply(m.chat, `*${getMessage('cannot_date_yourself', m.lang)}*`, m)
    if(user === conn.user.jid) return conn.reply(m.chat, `*${getMessage('cannot_date_bot', m.lang)}*`, m)
    
    if(global.db.data.users[user].pasangan != m.sender){
      conn.reply(m.chat,`*${getMessage('sorry', m.lang)} @${user.split('@')[0]} ${getMessage('not_sending_date_request', m.lang)}*`,m,{contextInfo: {
        mentionedJid: [user]
      }})
    }else{
      global.db.data.users[user].pasangan = ""
      conn.reply(m.chat,`*${getMessage('you_just_rejected', m.lang)} @${user.split('@')[0]} ${getMessage('poor_thing', m.lang)}*`,m,{contextInfo: {
        mentionedJid: [user]
      }})
    }
        }       
}
handler.help = ['tolak *@tag*']
handler.tags = ['fun']
handler.command = /^(tolak)$/i
handler.mods = false
handler.premium = false
handler.group = true
handler.limit = false
handler.fail = null
module.exports = handler
