const { getMessage } = require('../lib/languages');

let fetch = require('node-fetch');
let handler = async (m, { text }) => {
if (!text) throw `Enter your Username from the fire Website!`
  try {
    let fire = await fetch(`https://api.betabotz.eu.org/fire/checkexp?username=${text}`)
    let body = await fire.text()
    m.reply(body)  
  } catch (e) {
    console.log(e) 
    m.reply('Username is not registered!')
  }
}          
handler.command = handler.help = ['checkexp','cekexp', 'expapi'];
handler.tags = ['main'];
handler.private = true
module.exports = handler;
