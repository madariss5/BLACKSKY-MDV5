
const { getMessage } = require('../lib/languages');
let levelling = require('../lib/levelling');

let handler = async (m) => {
  let user = global.db.data.users[m.sender];
  const chat = global.db.data.chats[m.chat];
  const lang = user?.language || chat?.language || global.language;
  
  if (!levelling.canLevelUp(user.level, user.exp, global.multiplier)) {
    let { min, xp, max } = levelling.xpRange(user.level, global.multiplier)
    throw getMessage('levelup_not_enough', lang, {
      level: user.level,
      current_xp: user.exp - min,
      required_xp: xp,
      remaining_xp: max - user.exp
    });
  }
  
  let before = user.level * 1
  while (levelling.canLevelUp(user.level, user.exp, global.multiplier)) user.level++
  
  if (before !== user.level) {
    let mentionedJid = [m.sender]
    let { progress, remainingXP } = levelling.getLevelDetails(user.level, user.exp, global.multiplier)
    
    // Create progress bar
    const progressBar = '█'.repeat(Math.floor(progress/10)) + '░'.repeat(10 - Math.floor(progress/10))
    
    const levelupMessage = `*🎉 LEVEL UP! 🎉*\n\n` +
      `@${m.sender.split('@')[0]}\n` +
      `Level Up: ${before} ➠ ${user.level}\n` +
      `Progress: ${progressBar} ${Math.floor(progress)}%\n` + 
      `Need ${remainingXP} XP more for next level\n`

    // Send the enhanced levelup message
    await conn.sendMessage(m.chat, {
      text: levelupMessage,
      mentions: mentionedJid
    })
  }
}

// Export levelup check function for use in other files
handler.checkLevelUp = async function(m) {
  let user = global.db.data.users[m.sender]
  let before = user.level * 1
  while (levelling.canLevelUp(user.level, user.exp, global.multiplier)) user.level++
  if (before !== user.level) {
    // Call the levelup handler directly
    await handler(m)
    return true
  }
  return false
}

handler.help = ['levelup']
handler.tags = ['xp']
handler.command = /^level(|up)$/i

module.exports = handler
