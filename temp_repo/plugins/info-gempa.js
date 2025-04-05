var axios = require('axios');
const { getMessage } = require('../lib/languages.js');
var handler = async (m, { conn }) => {
  try {
    var response = await axios.get(`https://api.betabotz.eu.org/fire/search/gempa?apikey=${lann}`);
    var dataGempa = response.data.result.result;
    var caption = `Time : ${dataGempa.waktu}\nLatitude : ${dataGempa.Lintang}\nLongitude : ${dataGempa.Bujur}\nMagnitude : ${dataGempa.Magnitudo}\nDepth : ${dataGempa.Kedaoldn}\nRegion : ${dataGempa.Wilayah}`;
    conn.sendFile(m.chat, dataGempa.image, 'map.png', caption, m);
  } catch (e) {
    console.log(e);
    conn.reply(m.chat, 'An error occurred while retrieving earthquake data', m);
  }
};
handler.command = handler.help = ['infogempa', 'gempa'];
handler.tags = ['info'];
handler.premium = false;
handler.limit = true;
module.exports = handler;
