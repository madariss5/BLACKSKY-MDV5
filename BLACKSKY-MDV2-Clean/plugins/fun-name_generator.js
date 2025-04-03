const { getMessage } = require('../lib/languages');
function handler(m, { text }) {
    text = text ? text : m.quoted && m.quoted.text ? m.quoted.text : m.text
    m.reply(text.replace(/[a-z]/gi, v => {
        return {
            'a': 'ka',
            'b': 'tu',
            'c': 'mi',
            'd': 'te',
            'e': 'ku',
            'f': 'lu',
            'g': 'ji',
            'h': 'ri',
            'i': 'ki',
            'j': 'zu',
            'k': 'me',
            'l': 'ta',
            'm': 'rin',
            'n': 'to',
            'o': 'mo',
            'p': 'no',
            'q': 'ke',
            'r': 'shi',
            's': 'ari',
            't': 'ci',
            'u': 'do',
            'v': 'ru',
            'w': 'May',
            'x': 'na',
            'y': 'fu',
            'z': 'zi'
        }[v.toLowerCase()] || v
    }))
}
handler.help = ['namaninja <teks>']
handler.tags = ['fun']
handler.command =  /^(namaninja|namae)$/i

module.exports = handler