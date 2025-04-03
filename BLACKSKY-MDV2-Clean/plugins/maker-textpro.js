const { getMessage } = require('../lib/languages');

let handler = async (m, { conn, command, text, usedPrefix }) => {
    // Get user's preferred language
    const user = global.db.data.users[m.sender];
    const chat = global.db.data.chats[m.chat];
    const lang = user?.language || chat?.language || global.language;
 {
  if (!text) throw `🚩 *Example:* ${usedPrefix + command} botcahx`
    const dates = new Date(); 
    const timestamp = dates.getTime();     
    const date = new Date(timestamp);
    const hour = date.getHours().toString().padStart(2, "0");
    const minutes = date.getMinutes().toString().padStart(2, "0");
    const seconds = date.getSeconds().toString().padStart(2, "0");
    const formattedTime = hour + ":" + minutes + ":" + seconds;
 await conn.reply(m.chat, wait, m)
  try {
    if (command == 'giraffe') {
      const res = `https://api.betabotz.eu.org/fire/textpro/giraffe?text=${encodeURIComponent(text)}&apikey=${lann}`;
      await conn.sendFile(m.chat, res, 'textpro.jpeg', '', m);
    }
    if (command == 'magma') {
      const res = `https://api.betabotz.eu.org/fire/textpro/magma?text=${encodeURIComponent(text)}&apikey=${lann}`;
      await conn.sendFile(m.chat, res, 'textpro.jpeg', '', m);
    }
    if (command == 'hallowen') {
      const res = `https://api.betabotz.eu.org/fire/textpro/hallowen-text?text=${encodeURIComponent(text)}&apikey=${lann}`;
      await conn.sendFile(m.chat, res, 'textpro.jpeg', '', m);
    }
    if (command == 'valentine') {
      const res = `https://api.betabotz.eu.org/fire/textpro/valentine?text=${encodeURIComponent(text)}&apikey=${lann}`;
      await conn.sendFile(m.chat, res, 'textpro.jpeg', '', m);
    }
    if (command == 'valentine2') {
      const res = `https://api.betabotz.eu.org/fire/textpro/valentine2?text=${encodeURIComponent(text)}&apikey=${lann}`;
      await conn.sendFile(m.chat, res, 'textpro.jpeg', '', m);
    }
     if (command == 'neonlight') {
      const res = `https://api.betabotz.eu.org/fire/textpro/neon-light?text=${encodeURIComponent(text)}&apikey=${lann}`;
      await conn.sendFile(m.chat, res, 'textpro.jpeg', '', m);
    }
     if (command == 'neongalaxy') {
      const res = `https://api.betabotz.eu.org/fire/textpro/neon-galaxy?text=?text=${encodeURIComponent(text)}&apikey=${lann}`;
      await conn.sendFile(m.chat, res, 'textpro.jpeg', '', m);
    }
     if (command == 'neongreen') {
      const res = `https://api.betabotz.eu.org/fire/textpro/neon-green?text=${encodeURIComponent(text)}&apikey=${lann}`;
      await conn.sendFile(m.chat, res, 'textpro.jpeg', '', m);
    }
    if (command == 'brokenglass') {
      const res = `https://api.betabotz.eu.org/fire/textpro/broken-glass?text=${encodeURIComponent(text)}&apikey=${lann}`;
      await conn.sendFile(m.chat, res, 'textpro.jpeg', '', m);
    }
    if (command == 'artpapper') {
      const res = `https://api.betabotz.eu.org/fire/textpro/art-papper?text=${encodeURIComponent(text)}&apikey=${lann}`;
      await conn.sendFile(m.chat, res, 'textpro.jpeg', '', m);
    }
    if (command == 'glossy') {
      const res = `https://api.betabotz.eu.org/fire/textpro/glossy?text=${encodeURIComponent(text)}&apikey=${lann}`;
      await conn.sendFile(m.chat, res, 'textpro.jpeg', '', m);
    }
    if (command == 'watercolor') {
      const res = `https://api.betabotz.eu.org/fire/textpro/water-color?text=${encodeURIComponent(text)}&apikey=${lann}`;
      await conn.sendFile(m.chat, res, 'textpro.jpeg', '', m);
    }
    if (command == 'multicolor') {
      const res = `https://api.betabotz.eu.org/fire/textpro/multi-color?text=${encodeURIComponent(text)}&apikey=${lann}`;
      await conn.sendFile(m.chat, res, 'textpro.jpeg', '', m);
    }
    if (command == 'robot') {
      const res = `https://api.betabotz.eu.org/fire/textpro/robot?text=${encodeURIComponent(text)}&apikey=${lann}`;
      await conn.sendFile(m.chat, res, 'textpro.jpeg', '', m);
    }
    if (command == 'scifi') {
      const res = `https://api.betabotz.eu.org/fire/textpro/scifi?text=${encodeURIComponent(text)}&apikey=${lann}`;
      await conn.sendFile(m.chat, res, 'textpro.jpeg', '', m);
    }
    if (command == 'neondevil') {
      const res = `https://api.betabotz.eu.org/fire/textpro/neon-devil?text=${encodeURIComponent(text)}&apikey=${lann}`;
      await conn.sendFile(m.chat, res, 'textpro.jpeg', '', m);
    }
    if (command == 'skytext') {
      const res = `https://api.betabotz.eu.org/fire/textpro/sky-text?text=${encodeURIComponent(text)}&apikey=${lann}`;
      await conn.sendFile(m.chat, res, 'textpro.jpeg', '', m);
    }
    if (command == 'vintage') {
      const res = `https://api.betabotz.eu.org/fire/textpro/vintage?text=${encodeURIComponent(text)}&apikey=${lann}`;
      await conn.sendFile(m.chat, res, 'textpro.jpeg', '', m);
    }
    if (command == 'writing') {
      const res = `https://api.betabotz.eu.org/fire/textpro/writing?text=${encodeURIComponent(text)}&apikey=${lann}`;
      await conn.sendFile(m.chat, res, 'textpro.jpeg', '', m);
    }
    if (command == 'engraved') {
      const res = `https://api.betabotz.eu.org/fire/textpro/engraved?text=${encodeURIComponent(text)}&apikey=${lann}`;
      await conn.sendFile(m.chat, res, 'textpro.jpeg', '', m);
    }
    if (command == 'gluetext') {
      const res = `https://api.betabotz.eu.org/fire/textpro/glue-text?text=${encodeURIComponent(text)}&apikey=${lann}`;
      await conn.sendFile(m.chat, res, 'textpro.jpeg', '', m);
    }
    if (command == 'pornhub') {
      const res = `https://api.betabotz.eu.org/fire/textpro/pornhub?text=${encodeURIComponent(text)}&text2=hub&apikey=${lann}`;
      await conn.sendFile(m.chat, res, 'textpro.jpeg', '', m);
    }
    if (command == 'holograpic') {
      const res = `https://api.betabotz.eu.org/fire/textpro/holograpic?text=${encodeURIComponent(text)}&apikey=${lann}`;
      await conn.sendFile(m.chat, res, 'textpro.jpeg', '', m);
    }
    if (command == 'deluxesilver') {
      const res = `https://api.betabotz.eu.org/fire/textpro/deluxe-silver?text=${encodeURIComponent(text)}&apikey=${lann}`;
      await conn.sendFile(m.chat, res, 'textpro.jpeg', '', m);
    }
    if (command == 'fabric') {
      const res = `https://api.betabotz.eu.org/fire/textpro/fabric?text=${encodeURIComponent(text)}&apikey=${lann}`;
      await conn.sendFile(m.chat, res, 'textpro.jpeg', '', m);
    }
    if (command == 'wicker') {
      const res = `https://api.betabotz.eu.org/fire/textpro/wicker?text=${encodeURIComponent(text)}&apikey=${lann}`;
      await conn.sendFile(m.chat, res, 'textpro.jpeg', '', m);
    }
    if (command == 'toxic') {
      const res = `https://api.betabotz.eu.org/fire/textpro/toxic-bokeh?text=${encodeURIComponent(text)}&apikey=${lann}`;
      await conn.sendFile(m.chat, res, 'textpro.jpeg', '', m);
    }
    if (command == 'strawberry') {
      const res = `https://api.betabotz.eu.org/fire/textpro/stroberi?text=${encodeURIComponent(text)}&apikey=${lann}`;
      await conn.sendFile(m.chat, res, 'textpro.jpeg', '', m);
    }
    if (command == 'bread') {
      const res = `https://api.betabotz.eu.org/fire/textpro/bread?text=${encodeURIComponent(text)}&apikey=${lann}`;
      await conn.sendFile(m.chat, res, 'textpro.jpeg', '', m);
    }
    if (command == 'lava') {
      const res = `https://api.betabotz.eu.org/fire/textpro/larva?text=${encodeURIComponent(text)}&apikey=${lann}`;
      await conn.sendFile(m.chat, res, 'textpro.jpeg', '', m);
    }
    if (command == 'koi') {
      const res = `https://api.betabotz.eu.org/fire/textpro/koi?text=${encodeURIComponent(text)}&apikey=${lann}`;
      await conn.sendFile(m.chat, res, 'textpro.jpeg', '', m);
    }
    if (command == 'blood') {
      const res = `https://api.betabotz.eu.org/fire/textpro/horor-blood?text=${encodeURIComponent(text)}&apikey=${lann}`;
      await conn.sendFile(m.chat, res, 'textpro.jpeg', '', m);
    }
    if (command == 'honey') {
      const res = `https://api.betabotz.eu.org/fire/textpro/honey?text=${encodeURIComponent(text)}&apikey=${lann}`;
      await conn.sendFile(m.chat, res, 'textpro.jpeg', '', m);
    }
    if (command == 'ice') {
      const res = `https://api.betabotz.eu.org/fire/textpro/ice?text=${encodeURIComponent(text)}&apikey=${lann}`;
      await conn.sendFile(m.chat, res, 'textpro.jpeg', '', m);
    }
    if (command == 'rusty') {
      const res = `https://api.betabotz.eu.org/fire/textpro/rusty?text=${encodeURIComponent(text)}&apikey=${lann}`;
      await conn.sendFile(m.chat, res, 'textpro.jpeg', '', m);
    }
    if (command == 'captainamerica') {
      const res = `https://api.betabotz.eu.org/fire/textpro/captain?text=${encodeURIComponent(text)}&apikey=${lann}`;
      await conn.sendFile(m.chat, res, 'textpro.jpeg', '', m);
    }
    if (command == 'gradient') {
      const res = `https://api.betabotz.eu.org/fire/textpro/3d-gradient?text=${encodeURIComponent(text)}&apikey=${lann}`;
      await conn.sendFile(m.chat, res, 'textpro.jpeg', '', m);
    }
    if (command == 'christmas') {
      const res = `https://api.betabotz.eu.org/fire/textpro/christmas?text=${encodeURIComponent(text)}&apikey=${lann}`;
      await conn.sendFile(m.chat, res, 'textpro.jpeg', '', m);
    }
    if (command == 'dropwater') {
      const res = `https://api.betabotz.eu.org/fire/textpro/drop-water?text=${encodeURIComponent(text)}&apikey=${lann}`;
      await conn.sendFile(m.chat, res, 'textpro.jpeg', '', m);
    }
    if (command == 'blackpink') {
      const res = `https://api.betabotz.eu.org/fire/textpro/black-pink?text=${encodeURIComponent(text)}&apikey=${lann}`;
      await conn.sendFile(m.chat, res, 'textpro.jpeg', '', m);
    }
    if (command == 'blackpink2') {
      const res = `https://api.betabotz.eu.org/fire/textpro/black-pink2?text=${encodeURIComponent(text)}&apikey=${lann}`;
      await conn.sendFile(m.chat, res, 'textpro.jpeg', '', m);
    }
    if (command == 'wolflogo') {
      const res = `https://api.betabotz.eu.org/fire/textpro/logo-wolf?text=${formattedTime}&text2=${encodeURIComponent(text)}&apikey=${lann}`;
      await conn.sendFile(m.chat, res, 'textpro.jpeg', '', m);
    }
    if (command == 'naturalleaves') {
      const res = `https://api.betabotz.eu.org/fire/textpro/natural-leaves?text=${encodeURIComponent(text)}&apikey=${lann}`;
      await conn.sendFile(m.chat, res, 'textpro.jpeg', '', m);
    }
    if (command == 'harrypotter') {
      const res = `https://api.betabotz.eu.org/fire/textpro/logo-wolf2?text=${formattedTime}&text2=${encodeURIComponent(text)}&apikey=${lann}`;
      await conn.sendFile(m.chat, res, 'textpro.jpeg', '', m);
    }
    if (command == '3dstone') {
      const res = `https://api.betabotz.eu.org/fire/textpro/3dstone?text=${encodeURIComponent(text)}&apikey=${lann}`;
      await conn.sendFile(m.chat, res, 'textpro.jpeg', '', m);
    }
    if (command == '1917') {
      const res = `https://api.betabotz.eu.org/fire/textpro/1917?text=${encodeURIComponent(text)}&apikey=${lann}`;
      await conn.sendFile(m.chat, res, 'textpro.jpeg', '', m);
    }
    if (command == 'thunder2') {
      const res = `https://api.betabotz.eu.org/fire/textpro/thunder2?text=${encodeURIComponent(text)}&apikey=${lann}`;
      await conn.sendFile(m.chat, res, 'textpro.jpeg', '', m);
    }
    if (command == 'space') {
      const res = `https://api.betabotz.eu.org/fire/textpro/space?text=${encodeURIComponent(text)}&text2=${formattedTime}&&apikey=${lann}`;
      await conn.sendFile(m.chat, res, 'textpro.jpeg', '', m);
    }
    if (command == 'hallowen2') {
      const res = `https://api.betabotz.eu.org/fire/textpro/hallowen?text=${encodeURIComponent(text)}&apikey=${lann}`;
      await conn.sendFile(m.chat, res, 'textpro.jpeg', '', m);
    }
    if (command == 'jokerlogo') {
      const res = `https://api.betabotz.eu.org/fire/textpro/joker-logo?text=${encodeURIComponent(text)}&apikey=${lann}`;
      await conn.sendFile(m.chat, res, 'textpro.jpeg', '', m);
    }
    if (command == 'blood') {
      const res = `https://api.betabotz.eu.org/fire/textpro/blood?text=${encodeURIComponent(text)}&apikey=${lann}`;
      await conn.sendFile(m.chat, res, 'textpro.jpeg', '', m);
    }
    if (command == 'grafity') {
      const res = `https://api.betabotz.eu.org/fire/textpro/grafity-text?text=${encodeURIComponent(text)}&apikey=${lann}`;
      await conn.sendFile(m.chat, res, 'textpro.jpeg', '', m);
    }
    if (command == 'grafity2') {
      const res = `https://api.betabotz.eu.org/fire/textpro/grafity-text2?text=${encodeURIComponent(text)}&text2=&apikey=${lann}`;
      await conn.sendFile(m.chat, res, 'textpro.jpeg', '', m);
    }
    if (command == 'glitch') {
      const res = `https://api.betabotz.eu.org/fire/textpro/glitch?text=${encodeURIComponent(text)}&text2=${formattedTime}&apikey=${lann}`;
      await conn.sendFile(m.chat, res, 'textpro.jpeg', '', m);
    }
    if (command == 'glitch2') {
      const res = `https://api.betabotz.eu.org/fire/textpro/glitch2?text=${encodeURIComponent(text)}&text2=${formattedTime}&apikey=${lann}`;
      await conn.sendFile(m.chat, res, 'textpro.jpeg', '', m);
    }
    if (command == 'glitch3') {
      const res = `https://api.betabotz.eu.org/fire/textpro/glitch3?text=${encodeURIComponent(text)}&apikey=${lann}`;
      await conn.sendFile(m.chat, res, 'textpro.jpeg', '', m);
    }
    if (command == 'ninjalogo') {
      const res = `https://api.betabotz.eu.org/fire/textpro/ninja-logo?text=${encodeURIComponent(text)}&text2=${formattedTime}&apikey=${lann}`;
      await conn.sendFile(m.chat, res, 'textpro.jpeg', '', m);
    }
    if (command == 'avengers') {
      const res = `https://api.betabotz.eu.org/fire/textpro/avengers-logo?text=${encodeURIComponent(text)}&text2=Avengers&apikey=${lann}`;
      await conn.sendFile(m.chat, res, 'textpro.jpeg', '', m);
    }
    if (command == 'marvelstudio') {
      const res = `https://api.betabotz.eu.org/fire/textpro/marvel-logo2?text=${encodeURIComponent(text)}&text2=Studio&apikey=${lann}`;
      await conn.sendFile(m.chat, res, 'textpro.jpeg', '', m);
    }
    if (command == 'marvelstudio2') {
      const res = `https://api.betabotz.eu.org/fire/textpro/marvel-logo3?text=${encodeURIComponent(text)}&text2=Studio&apikey=${lann}`;
      await conn.sendFile(m.chat, res, 'textpro.jpeg', '', m);
    }
    if (command == 'batman') {
      const res = `https://api.betabotz.eu.org/fire/textpro/batman-logo?text=${encodeURIComponent(text)}&apikey=${lann}`;
      await conn.sendFile(m.chat, res, 'textpro.jpeg', '', m);
   } 
   } catch (err) {
  console.error(err)
  throw "🚩 An error occurred"
   };
};
handler.command = handler.help = ['giraffe','magma','batman','marvelstudio2','marvelstudio','avengers','ninjalogo','glitch3','glitch2','glitch','grafity','grafity2','blood','jokerlogo','hallowen2','space','thunder2','1917','3dstone','harrypotter','wolflogo','naturalleaves','blackpink','blackpink2','dropwater','christmas','gradient','captainamerica','rusty','ice','honey','blood','koi','lava','bread','strawberry','toxic','wicker','fabric','pornhub','holograpic','deluxesilver','writing','engraved','gluetext','neondevil','skytext','vintage','multicolor','robot','scifi','artpapper','glossy','watercolor','neongreen','brokenglass','artpapper','valentine2','neonlight','neongalaxy','magma','hallowen','valentine']
handler.tags = ['maker'];
handler.limit = true;
}

module.exports = handler;
