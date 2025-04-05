const { getMessage } = require('../lib/languages');

const { createHash } = require('crypto');
let Reg = /\|?(.*)([.|] *?)([0-9]*)$/i

// Initial rewards for new users
const STARTER_MONEY = 2000;
const STARTER_XP = 500;

let handler = async function (m, { text, usedPrefix }) {
  // Get user's preferred language
  const user = global.db.data.users[m.sender]
  const chat = global.db.data.chats[m.chat]
  const lang = user?.language || chat?.language || global.language
  
  if (user.registered === true) throw getMessage('user_already_registered', lang) + `\n${getMessage('register_again', lang) || 'Want to register again?'} ${usedPrefix}unreg <SN|SERIAL NUMBER>`
  if (!Reg.test(text)) throw `${getMessage('format_error', lang) || 'Format wrong'}\n*${usedPrefix}register ${getMessage('name_age_format', lang) || 'name.age'}*`
  let [_, name, splitter, age] = text.match(Reg)
  if (!name) throw getMessage('name_empty', lang) || 'Name cannot be empty (Alphanumeric)'
  if (!age) throw getMessage('age_empty', lang) || 'Age cannot be empty (Numbers only)'
  age = parseInt(age)
  if (age > 120) throw getMessage('age_too_old', lang) || 'Age too old 😂'
  if (age < 5) throw getMessage('age_too_young', lang) || 'Too young to type in this format 😅'
  
  // Set user information
  user.name = name.trim()
  user.age = age
  user.regTime = + new Date
  user.registered = true
  
  // Give starter rewards
  user.money = (user.money || 0) + STARTER_MONEY;
  user.exp = (user.exp || 0) + STARTER_XP;
  
  let sn = createHash('md5').update(m.sender).digest('hex')
  m.reply(`
${getMessage('register_success', lang) || 'Registration Success!'}

╭─「 ${getMessage('info', lang) || 'Info'} 」
│ ${getMessage('name', lang) || 'Name'}: ${name}
│ ${getMessage('age', lang) || 'Age'}: ${age} ${getMessage('years', lang) || 'years'} 
╰────
${getMessage('serial_number', lang) || 'Serial Number'}: 
${sn}

🎁 *Welcome Bonus Received!*
💰 Money: +${STARTER_MONEY}
🆙 XP: +${STARTER_XP}

💡 Try these commands:
• .daily - Get daily rewards
• .slot - Play slot machine game
• .balance - Check your balance
`.trim())
}
handler.help = ['List', 'reg', 'register'].map(v => v + ' <nama>.<umur>')
handler.tags = ['xp']

handler.command = /^(List|reg(ister)?)$/i

module.exports = handler
