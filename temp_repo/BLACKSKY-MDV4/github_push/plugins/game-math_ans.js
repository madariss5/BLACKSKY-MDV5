const { getMessage } = require('../lib/languages');

let poin = 10000
let handler = m => m
handler.before = async function (m) {
  if (!/^-?[0-9]+(\.[0-9]+)?$/.test(m.text)) return !0
  let id = m.chat
  let users = global.db.data.users[m.sender]
  
  // Get user's preferred language
  const user = global.db.data.users[m.sender];
  const chat = global.db.data.chats[m.chat];
  const lang = user?.language || chat?.language || global.language;
  
  // We need to check for math questions in any language
  if (!m.quoted || m.quoted.sender != this.user.jid) return !0
  this.math = this.math ? this.math : {}
  if (!(id in this.math)) return m.reply(getMessage('math_ended', lang))
  
  if (m.quoted.id == this.math[id][0].id) {
    let math = JSON.parse(JSON.stringify(this.math[id][1]))
    if (m.text == math.result) {
      global.db.data.users[m.sender].exp += math.bonus
      clearTimeout(this.math[id][3])
      delete this.math[id]
      users.money += poin
      m.reply(getMessage('math_correct', lang, { bonus: math.bonus }))
    } else {
      if (--this.math[id][2] == 0) {
        clearTimeout(this.math[id][3])
        delete this.math[id]
        m.reply(getMessage('math_no_more_attempts', lang, { result: math.result }))
      } else m.reply(getMessage('math_wrong', lang, { attempts: this.math[id][2] }))
    }
  }
  return !0
}

module.exports = handler
