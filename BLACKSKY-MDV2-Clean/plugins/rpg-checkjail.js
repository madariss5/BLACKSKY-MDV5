const { getMessage } = require('../lib/languages');

let handler = async (m, { isPrems, conn, text, usedPrefix, command }) => {
  const user = global.db.data.users[m.sender];
  
  if (user.jail && (!user.perkerjaandua || user.pekerjaandua > Date.now())) {
    if (user.pekerjaandua) {
      let remainingTime = user.pekerjaandua - Date.now();
      let minutes = Math.floor((remainingTime / (1000 * 60)) % 60);
      let seconds = Math.floor((remainingTime / 1000) % 60);
      
      if (m.sender === text) {
        return m.reply(`_Kamu still berada di prison_\n*Sisa waktu jail:* ${minutes} minutes ${seconds} seconds`);
      } else {
        return m.reply(`_you still berada di prison_\n*Sisa waktu jail*: ${minutes} minutes ${seconds} seconds`, null, { mentions: [m.sender] });
      }
    }
  } else if (user.jail === true) {
    if (m.sender === text) {
      return m.reply('*Kamu diprison seumur alive!*');
    } else {
      return m.reply(`_you has diprison seumur alive_`, null, { mentions: [m.sender] });
    }
  } else {
    if (m.sender === text) {
      return m.reply('*Kamu not currently diprison*');
    } else {
      return m.reply(`_you not currently dalam prison_`, null, { mentions: [m.sender] });
    }
  }
}

handler.help = ['checkjail', 'cj', 'statusprison', 'jailstatus']
handler.tags = ['rpg']
handler.command = /^(checkjail|cj|statuspenjara|jailstatus)$/i
handler.rpg = true

module.exports = handler