const { getMessage } = require('../lib/languages');

let poin = 10000

const similarity = require('similarity');
const threshold = 0.72
let handler = m => m
handler.before = async function (m) {
    // Get user's preferred language
    const user = global.db.data.users[m.sender];
    const chat = global.db.data.chats[m.chat];
    const lang = user?.language || chat?.language || global.language;
    
    let id = m.chat
    let users = global.db.data.users[m.sender]
    if (!m.quoted || !m.quoted.fromMe || !m.quoted.isBaileys || !/Type.*teii/i.test(m.quoted.text)) return !0
    this.tebakbendera2 = this.tebakbendera2 ? this.tebakbendera2 : {}
    if (!(id in this.tebakbendera2)) return m.reply(getMessage('guess_flag_ended', lang))
    if (m.quoted.id == this.tebakbendera2[id][0].id) {
        let json = JSON.parse(JSON.stringify(this.tebakbendera2[id][1]))
        if (m.text.toLowerCase() == json.nama.toLowerCase().trim()) {
            global.db.data.users[m.sender].exp += this.tebakbendera2[id][2]
            users.money += poin
            m.reply(getMessage('guess_flag_correct', lang, {
                points: this.tebakbendera2[id][2]
            }))
            clearTimeout(this.tebakbendera2[id][3])
            delete this.tebakbendera2[id]
        } else if (similarity(m.text.toLowerCase(), json.nama.toLowerCase().trim()) >= threshold) {
            m.reply(getMessage('guess_flag_almost', lang))
        } else {
            m.reply(getMessage('guess_flag_wrong', lang))
        }
    }
    return !0
}
handler.exp = 0

module.exports = handler