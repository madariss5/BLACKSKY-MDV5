const { getMessage } = require('../lib/languages');

let fetch = require('node-fetch');
let handler = async (m, { text }) => {
if (!text) throw `Enter your Apikey!`
  try {
    let fire = await fetch(`https://api.betabotz.eu.org/fire/checkkey?apikey=${text}`)
    let body = await fire.text()
    m.reply(body)  
  } catch (e) {
    console.log(e) 
    m.reply('Apikey is not registered!')
  }
}          
handler.command = handler.help = ['checkapi','fire'];
handler.tags = ['main'];
handler.private = true
module.exports = handler;
