const { getMessage } = require('../lib/languages');

let handler = async(m, { conn }) => {
  const asupan = [
    `https://api.betabotz.eu.org/fire/asupan/rikagusriani?apikey=${lann}`,
    `https://api.betabotz.eu.org/fire/asupan/santuy?apikey=${lann}`,
    `https://api.betabotz.eu.org/fire/asupan/ukhty?apikey=${lann}`,
    `https://api.betabotz.eu.org/fire/asupan/bocil?apikey=${lann}`,
    `https://api.betabotz.eu.org/fire/asupan/gheayubi?apikey=${lann}`,
    `https://api.betabotz.eu.org/fire/asupan/natajadeh?apikey=${lann}`,
    `https://api.betabotz.eu.org/fire/asupan/euni?apikey=${lann}`,
    `https://api.betabotz.eu.org/fire/asupan/douyin?apikey=${lann}`,
    `https://api.betabotz.eu.org/fire/fire/asupan/cecan?apikey=${lann}`,
    `https://api.betabotz.eu.org/fire/fire/asupan/hijaber?apikey=${lann}`,
    `https://api.betabotz.eu.org/fire/fire/asupan/asupan?apikey=${lann}`,
    `https://api.betabotz.eu.org/fire/fire/asupan/anony?apikey=${lann}`   
  ]
  try {
    const url = pickRandom(asupan);
    await conn.sendFile(m.chat, url, null, '', m);
  } catch (e) {
    console.log(e);
    m.reply('Sorry, video asupan not ditemukan');
  }
}

handler.help = ['asupan']
handler.tags = ['downloader']
handler.command = /^asupan$/i
handler.owner = false
handler.premium = false
handler.group = false
handler.private = false

function pickRandom(list) {
  return list[Math.floor(list.length * Math.random())]
}

module.exports = handler
