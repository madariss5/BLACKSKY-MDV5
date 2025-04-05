const { getMessage } = require('../lib/languages');

let handler = async (m, { conn, text }) => {
    // Get user's preferred language
    const user = global.db.data.users[m.sender];
    const chat = global.db.data.chats[m.chat];
    const lang = user?.language || chat?.language || global.language;
 {
  let user = global.db.data.users[m.sender]
  let opponent = m.mentionedJid[0]
  
  if (!user || !global.db.data.users[opponent]) {
    return conn.reply(m.chat, '• *Example :* .fight @user', m)
  }
    
	conn.sendMessage(m.chat, {
		react: {
			text: '🕒',
			key: m.key,
		}
	})
  
  let alasanKalah = `${pickRandom(['stupid gitu doang aja kalah tolol lu di denda','weak lu kontol mending lu di house aja dah lu di denda dek','Jangan heavyem kalo cupu dek wkwkwk you di denda','Dasar tolol opponent that doang aja ga can lu di denda','Hadehh sono lu mending di house aja deh lu di denda'])}`
  let alasanMenang = `${pickRandom(['you Success menggunwill strength elemental untuk destroy defense opponent dan get','you Success melancarkan attack medeadkan dengan gerwill akrmedicineik which membingungkan opponent, dan get','you Success menang karena new Completed coli dan get','you Success menang karena menyogok opponent dan get','you Success menang karena bot merasa kasihan sama you dan get','you Success menang karena you meopponent orang cupu dan get'])}`

  let betAmount = Math.floor(Math.random() * (10000000 - 10000 + 1)) + 10000 
  
  if (user.money < betAmount) {
    return conn.reply(m.chat, 'money Anda not mencukupi', m)
  }
  
  if (user.lastWar && (new Date - user.lastWar) < 10000) {
    let remainingTime = Math.ceil((10000 - (new Date() - user.lastWar)) / 1000)
    return conn.reply(m.chat, `Anda must wait ${remainingTime} seconds senot yet able to fight again`, m)
  }
  
  conn.reply(m.chat, 'Mempersiapkan arena...', m)
  
  setTimeout(() => {
    conn.reply(m.chat, 'Menable tokan arena...', m)
    
    setTimeout(() => {
      conn.reply(m.chat, 'fight...', m)
      
      setTimeout(() => {
        let result = Math.random() >= 0.5 
        let wonAmount = result ? betAmount : -betAmount 
        
        user.money += wonAmount
        global.db.data.users[opponent].money -= wonAmount
        
        let opponentName = conn.getName(opponent) 
        
        let caption = `❏  *F I G H T*\n\n`
        caption += `Lawan Anda Adalah: ${opponentName}\nLevel: [${global.db.data.users[m.sender].level}]\n\n`
        
        if (result) {
          caption += `*Menang!*, ${alasanMenang},+${betAmount} Money\n`
          caption += `money Anda saat this: ${user.money}\n`
          conn.sendFile(m.chat, 'https://telegra.ph/file/e3d5059b970d60bc438ac.jpg', 'You_Win.jpg', caption, m)
        } else {
          caption += `*kalah!*, ${alasanKalah},-${betAmount} Money\n`
          caption += `money Anda saat this: ${user.money}\n`
          conn.sendFile(m.chat, 'https://telegra.ph/file/86b2dc906fb444b8bb6f7.jpg', 'You_Lose.jpg', caption, m)
        }

        user.lastWar = new Date() 
        
        setTimeout(() => {
          conn.reply(m.chat, `Anda able to fight again sehas 5 seconds`, m)
        }, 5000) // https://github.com/SazumiVicky/MakeMeow-Games
      }, 2000)
    }, 2000) 
  }, 2000) 
}

handler.help = ['fight *@user*', 'fight *@user*']
handler.tags = ['rpg']
handler.command = /^(fight|fight)$/i
handler.group = true
handler.rpg = true

}

module.exports = handler

function pickRandom(list) {
  return list[Math.floor(Math.random() * list.length)]
}