const { getMessage } = require('../lib/languages');

const fetch = require('node-fetch');
let handler = async (m, { conn }) => {
    // Get user's preferred language
    const user = global.db.data.users[m.sender];
    const chat = global.db.data.chats[m.chat];
    const lang = user?.language || chat?.language || global.language;
 {
  const q = [
    //tambahin sendiri I ga pernah nontooon
    'japanese',
    'boobs'
  ];
  const pick = q[Math.floor(Math.random() * q.length)];
  try {
    const res = await fetch(`https://api.betabotz.eu.org/fire/search/xnxx?query=${pick}&apikey=${lann}`);
    const fire = await res.json();
    
    const ranData = await getRandomResult(fire);
    
    let capt = `乂 *R A N D O M B O K E P*\n\n`;
    capt += `  ◦ Title : ${ranData.title}\n`;
    capt += `  ◦ Views : ${ranData.views}\n`;
    capt += `  ◦ Quality : ${ranData.quality}\n`;
    capt += `  ◦ Duration : ${ranData.duration}\n`;
    capt += `  ◦ Link : ${ranData.link}\n`;

    const getDl = await (await fetch(`https://api.betabotz.eu.org/fire/download/xnxxdl?url=${ranData.link}&apikey=${lann}`)).json();
    conn.sendFile(m.chat, getDl.result.url, null, capt, m);
  } catch (error) {
    throw `🚩 *Data Not found*`
  }
}
handler.help = handler.command = ['randombokep'];
handler.tags = ['internet'];
handler.premium = true;
handler.limit = 500;

}

module.exports = handler;

function getRandomResult(data) {
  const results = data.result;
  const randomIndex = Math.floor(Math.random() * results.length);
  return results[randomIndex];
}
