const { getMessage } = require('../lib/languages');

const similarity = require('similarity');
const threshold = 0.72
let handler = m => m
handler.before = async function (m)  {
    // Get user's preferred language
    const user = global.db.data.users[m.sender];
    const chat = global.db.data.chats[m.chat];
    const lang = user?.language || chat?.language || global.language;
    
    let id = m.chat
    if (!m.quoted || !m.quoted.fromMe || !m.quoted.isBaileys || !m.text || !/Type.*hhew/i.test(m.quoted.text) || /.*hhew/i.test(m.text))
        return !0
    this.tebakhewan = this.tebakhewan ? this.tebakhewan : {}
    if (!(id in this.tebakhewan))
        return this.reply(m.chat, getMessage('guess_animal_ended', lang), m)
    if (m.quoted.id == this.tebakhewan[id][0].id) {
        let isSurrender = /^((me)?nyerah|surr?ender)$/i.test(m.text)
        if (isSurrender) {
            clearTimeout(this.tebakhewan[id][3])
            delete this.tebakhewan[id]
            return this.reply(m.chat, getMessage('guess_animal_surrender', lang), m)
        }
        let json = JSON.parse(JSON.stringify(this.tebakhewan[id][1]))
        // m.reply(JSON.stringify(json, null, '\t'))
        if (m.text.toLowerCase() == json.title.toLowerCase().trim()) {
            global.db.data.users[m.sender].exp += this.tebakhewan[id][2]
            this.reply(m.chat, getMessage('guess_animal_correct', lang, {
                points: this.tebakhewan[id][2]
            }), m)
            clearTimeout(this.tebakhewan[id][3])
            delete this.tebakhewan[id]
        } else if (similarity(m.text.toLowerCase(), json.title.toLowerCase().trim()) >= threshold)
            m.reply(getMessage('guess_animal_almost', lang))
        else
            this.reply(m.chat, getMessage('guess_animal_wrong', lang), m)
    }
    return !0
}
module.exports = handler

//danaputra133