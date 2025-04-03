const { getMessage } = require('../lib/languages');

let handler = async m => {

let intro = `╭─── *「 Kartu Intro 」*
│       
│ *Name     :* 
│ *Gender   :* 
│ *Umur      :* 
│ *Hobby    :* 
│ *Kelas      :* 
│ *Asal         :* 
│ *Agama    :* 
│ *status     :* 
╰──────────────`
m.reply(intro)
}
handler.command = /^(intro)$/i

module.exports = handler
