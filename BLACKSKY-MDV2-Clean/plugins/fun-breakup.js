const { getMessage } = require('../lib/languages');

let handler = async (m, { conn }) => {
    // Get user's preferred language
    const user = global.db.data.users[m.sender];
    const chat = global.db.data.chats[m.chat];
    const lang = user?.language || chat?.language || global.language;
 {
  ayg = global.db.data.users[m.sender]

  if(ayg.partner == ""){
    return conn.reply(m.chat,`Anda not memiliki partner.`,m)
  }
  
  beb = global.db.data.users[global.db.data.users[m.sender].partner]

  if (typeof beb == "undefined"){
    conn.reply(m.chat,`Success putus hubungan dengan @${global.db.data.users[m.sender].partner.split('@')[0]}`,m,{contextInfo: {
      mentionedJid: [global.db.data.users[m.sender].partner]
    }})
    ayg.partner = ""
  }

  if (m.sender == beb.partner){
    conn.reply(m.chat,`Success putus hubungan dengan @${global.db.data.users[m.sender].partner.split('@')[0]}`,m,{contextInfo: {
      mentionedJid: [global.db.data.users[m.sender].partner]
    }})
    ayg.partner = ""
    beb.partner = ""
  }else {
    conn.reply(m.chat,`Anda not memiliki partner.`,m)
  }
}
handler.help = ['putus']
handler.tags = ['fun']
handler.command = /^(putus)$/i
handler.group = true
handler.limit = true
handler.fail = null
}

module.exports = handler
