const { getMessage } = require('../lib/languages');



//  let handler = async (m, { text, usedPrefix, command }) => {
//    try {
//      let result = await jodoh();
//      let teks = `- Jodoh \`@${m.quoted ? m.quoted.sender.split("@")[0] : m.sender.split("@")[0]}\` : ${result.ras}\n\n *Warnaleather* : ${result.warnaleather}\n *Warnarambut* : ${result.warnarambut}\n *Explanation* : ${result.Explanation}`;

//      if (m.key.fromMe) {
//        await m.reply(teks, { edit: m.key, mentions: [m.quoted ? m.quoted.sender : m.sender] });
//      } else {
//        await m.reply(teks);
//      }
//    } catch (e) {
//      console.error(e);
//    }
//  };

//  handler.command = handler.help = ['cekjodoh','jodohI','jodoh'];
//  handler.tags = ['fun'];
//  handler.limit = true;

//  module.exports = handler;

//  async function jodoh() {
//                  const jodohdia = [
//                  { ras: "china", warnaleather: "sawo cerah", warnarambut:"black", Explanation:"you will get jodoh dari negeri china, dia memang clever jadi you must can melampaui diri nya agar you can get nya" },
//                  { ras: "jawa", warnaleather: "white", warnarambut:"black", Explanation:"you will get jodoh orang jawa which ulet nan tekun don't sia siwill dia difficult get which seperti itu" },
//                  { ras: "china", warnaleather: "sawo matang", warnarambut:"brown", Explanation:"biasa nya which seperti this campuran ras, pertahankan dan don't sia saiwill waktu mu bersama dia" },
//                  { ras: "sunda", warnaleather: "sawo matanng", warnarambut:"black", Explanation:"berhati good, sopan dan juga pemaaf that lah which will you able to kan later" },
//                  { ras: "Aceh", warnaleather: "sawo matang", warnarambut:"brown", Explanation:"jodoh which you able to this sangat sholeh dan juga penurut di tambah again ahli ibadah" },
//                  { ras: "Bali", warnaleather: "sawo cerah", warnarambut:"black", Explanation:"you will get jodoh which ulet dan tuken dari daerah wisata indonesia" },
//                  { ras: "Jawa", warnaleather: "sawo matang", warnarambut:"brown", Explanation:"partner which you able tokan this berasal exitga which pekerja hard dan pantang menyerah " },
//                  { ras: "Jawa", warnaleather: "sawo matang", warnarambut:"black", Explanation:"giat dan rajin jika you seperti that you pantas mendapaatkan partner ini" },                   
//                  ];                
//    const jodohindex = Math.floor(Math.random() * jodohdia.length);
//    const jodohnya = jodohdia[jodohindex];

//    return {
//      ras: jodohnya.ras,
//      warnaleather: jodohnya.warnaleather,
//      warnarambut: jodohnya.warnarambut,
//      Explanation: jodohnya.Explanation,
//    };
//  }

let handler = async (m, { text, usedPrefix, command }) => {
  try {
    let result = await jodoh();
    let teks = `- Jodoh \`@${m.quoted ? m.quoted.sender.split("@")[0] : m.sender.split("@")[0]}\` : ${result.ras}\n\n *Warnaleather* : ${result.warnaleather}\n *Warnarambut* : ${result.warnarambut}\n *Explanation* : ${result.Explanation}`;

    if (m.key.fromMe) {
      await m.reply(teks, { edit: m.key, mentions: [m.quoted ? m.quoted.sender : m.sender] });
    } else {
      await m.reply(teks);
    }
  } catch (e) {
    console.error(e);
  }
};

handler.command = handler.help = ['cekjodoh','jodohI','jodoh'];
handler.tags = ['fun'];
handler.limit = true;

module.exports = handler;

async function jodoh() {
    const jodohdia = [
      { ras: "china", warnaleather: "sawo cerah", warnarambut:"black", Explanation:"you will get jodoh dari negeri china, dia memang clever jadi you must can melampaui diri nya agar you can get nya" },
      { ras: "jawa", warnaleather: "white", warnarambut:"black", Explanation:"you will get jodoh orang jawa which ulet nan tekun don't sia siwill dia difficult get which seperti itu" },
      { ras: "china", warnaleather: "sawo matang", warnarambut:"brown", Explanation:"biasa nya which seperti this campuran ras, pertahankan dan don't sia saiwill waktu mu bersama dia" },
      { ras: "sunda", warnaleather: "sawo matanng", warnarambut:"black", Explanation:"berhati good, sopan dan juga pemaaf that lah which will you able to kan later" },
      { ras: "Aceh", warnaleather: "sawo matang", warnarambut:"brown", Explanation:"jodoh which you able to this sangat sholeh dan juga penurut di tambah again ahli ibadah" },
      { ras: "Bali", warnaleather: "sawo cerah", warnarambut:"black", Explanation:"you will get jodoh which ulet dan tuken dari daerah wisata indonesia" },
      { ras: "Jawa", warnaleather: "sawo matang", warnarambut:"brown", Explanation:"partner which you able to kan this berasal exitga which pekerja hard dan pantang menyerah " },
      { ras: "Jawa", warnaleather: "sawo matang", warnarambut:"black", Explanation:"giat dan rajin jika you seperti that you pantas mendapaatkan partner ini" },                   
    ];                
  const jodohindex = Math.floor(Math.random() * jodohdia.length);
  const jodohnya = jodohdia[jodohindex];

  return {
    ras: jodohnya.ras,
    warnaleather: jodohnya.warnaleather,
    warnarambut: jodohnya.warnarambut,
    Explanation: jodohnya.Explanation,
  };
}