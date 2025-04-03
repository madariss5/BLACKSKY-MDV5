const { getMessage } = require('../lib/languages');
function handler(m, { text }) {
    let inputText = text ? text : m.quoted && m.quoted.text ? m.quoted.text : m.text
    m.reply(inputText.replace(/[aiueo]/gi, '$&ve'))
}
handler.help = ['purba <teks>']
handler.tags = ['fun']
handler.command =  /^(purba)$/i

module.exports = handler