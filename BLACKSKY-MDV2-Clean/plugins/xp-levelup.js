const { getMessage } = require('../lib/languages');

let levelling = require('../lib/levelling');

let handler = m => {
  // Get user's preferred language
  const user = global.db.data.users[m.sender];
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
    m.reply(getMessage('levelup_success', lang, {
      old_level: before,
      new_level: user.level
    }));
  }
}

handler.help = ['levelup']
handler.tags = ['xp']

handler.command = /^level(|up)$/i

module.exports = handler
