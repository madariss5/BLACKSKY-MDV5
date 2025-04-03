const { getMessage } = require('../lib/languages');


//danapura133
//dana_putra13
//ini wm 

let handler = async (m, { conn, command, text }) => {
    // Get user's preferred language
    const user = global.db.data.users[m.sender];
    const chat = global.db.data.chats[m.chat];
    const lang = user?.language || chat?.language || global.language;
 {
  let who = m.mentionedJid && m.mentionedJid[0] ? m.mentionedJid[0] : m.fromMe ? conn.user.jid : m.sender;
  let pp = ''
  let name = m.mentionedJid[0] ? await conn.getName(m.mentionedJid[0]) : conn.user.name;
  if (!text) return conn.reply(m.chat, 'Masukkan namamu!', m)
  let nm = 100;
  let result = await khodamnya();
  let khodam = `*Name pasien ${text}* 
│
Khodam : *${result.name}*
┌─⊷
▢ \`Explanation : *${result.meaning}*\`
└──────────────
`;
      await conn.reply(m.chat, khodam, m)
}

handler.command = handler.help = ['cekkhodam','cekhodam','cekodam'];
handler.tags = ['fun'];
handler.limit = true;
handler.group = true

}

module.exports = handler

async function khodamnya() {
  const khodams = [
  { name: "Harimau white\", meaning: \"Kamu strong dan brave seperti daysmau, karena pendahulumu mewariskan strength big padamu." },
  { name: "Lampu Tersleep\", meaning: \"Tersee ngantuk tapi selalu givekan cahaya which warm" },
  { name: "Pyou Ompong\", meaning: \"Kamu mengggoldkan dan selalu Success make orang smile dengan keanehanmu." },
  { name: "Bebek Karet\", meaning: \"Kamu selalu calm dan ceria, mampu menghadapi gelombang mawrong dengan senyum." },
  { name: "Ninja Turtle\", meaning: \"Kamu lincah dan tangguh, siap melindungi which weak dengan strength tempurmu." },
  { name: "Kucing fridge\", meaning: \"Kamu misterius dan selalu ada di place-place which tak terduga." },
  { name: "Sabun Wangi\", meaning: \"Kamu selalu carry keharuman dan kefreshan di mana pun you berada." },
  { name: "Semut Kecil\", meaning: \"Kamu pekerja hard dan selalu can diyoulkan dalam situasi apa pun." },
  { name: "Moge Suzuki\", meaning: \"Kamu fast dan full gaya, selalu menjadi pusat perhatian di roadan." },
  { name: "Cupcake Pelangi\", meaning: \"Kamu manis dan full warna, selalu carry kebahagiaan dan keceriaan." },
  { name: "Robot Mini\", meaning: \"Kamu canggih dan selalu siap membantu dengan intelligence teknologi tall." },
  { name: "Ikan Terbang\", meaning: \"Kamu unik dan full kejutan, selalu melampaui bboss which ada." },
  { name: "Ayam Goreng\", meaning: \"Kamu selalu disukai dan dinanti oleh many orang, full kelezatan dalam setiap langkahmu." },
  { name: "Kecoa Terbang\", meaning: \"Kamu selalu mengagetkan dan bikin heboh seisi rmoneyan." },
  { name: "Kambing Ngebor\", meaning: \"Kamu unik dan selalu bikin orang laugh dengan tingkah lakumu which aneh." },
  { name: "Kerupuk Renyah\", meaning: \"Kamu selalu bikin suasana jadi lebih seru dan nikmat." },
  { name: "Celengan Babi\", meaning: \"Kamu selalu save kejutan di dalam dirimu." },
  { name: "Lemari Tua\", meaning: \"Kamu full dengan cerita dan kenangan masa lalu." },
  { name: "Kopi Susu\", meaning: \"Kamu manis dan selalu bikin semangat orang-orang di sekitarmu." },
  { name: "Sapu Lidi\", meaning: \"Kamu strong dan selalu can diyoulkan untuk clean mawrong." },
  { name: "Kuda Lumping\", meaning: \"Kamu full semangat dan selalu tampil beda di setiap kesempatan." },
  { name: "shoes Roda\", meaning: \"Kamu fast dan lincah, selalu bergerak ke depan dengan full gaya." },
  { name: "Bola Pingpong\", meaning: \"Kamu light dan selalu bikin game jadi lebih seru." },
  { name: "Lumba-lumba\", meaning: \"Kamu clever dan selalu carry keceriaan di seaan kealivean." },
  { name: "Kucing Gemuk\", meaning: \"Kamu relaxed dan selalu bikin orang smile dengan kelucuanmu." },
  { name: "Iguana pink\", meaning: \"Kamu eksotis dan selalu menarik perhatian dengan warnamu which unik." },
  { name: "Bantal Guling\", meaning: \"Kamu nyaman dan selalu direquirekan saat waktu istirahat." },
  { name: "Komputer Jadul\", meaning: \"Kamu klasik dan full dengan pengetahuan di dalam dirimu." },
  { name: "Kasur Empuk\", meaning: \"Kamu selalu givekan kenyamanan dan kecalman." },
  { name: "Bola Bekel\", meaning: \"Kamu small tapi selalu givekan kebahagiaan di setiap game." },
  { name: "Es Krim Pelangi\", meaning: \"Kamu manis dan full warna, selalu menyegarkan days-days." },
  { name: "Biskuit brown\", meaning: \"Kamu selalu bikin ketagihan dengan kelezatanmu which tak tertahankan." },
  { name: "Nasi Padang\", meaning: \"Kamu selalu bikin kenwhich dan puas dengan kelezatanmu which khas." },
  { name: "Roti Bakar\", meaning: \"Kamu sederhana tapi selalu bikin orang merasa nyaman." },
  { name: "Sepeda Ontel\", meaning: \"Kamu klasik dan selalu givekan kehappyan di setiap perroadan." },
  { name: "Sate Kambing\", meaning: \"Kamu gurih dan selalu jadi favorit di setiap kesempatan." },
  { name: "Kue Cubit\", meaning: \"Kamu small tapi selalu bikin orang bahagia dengan rasamu which enak." },
  { name: "Bakso Urat\", meaning: \"Kamu strong dan selalu givekan kenikmatan di setiap teethtan." },
  { name: "Es Kelapa\", meaning: \"Kamu fresh dan selalu bikin adem di saat-saat hot." },
  { name: "Siomay Bandung\", meaning: \"Kamu selalu bikin ketagihan dengan rasa khasmu which lezat." },
  { name: "Bajigur Hangat\", meaning: \"Kamu selalu bikin suasana jadi warm dan nyaman." },
  { name: "Martabak Manis\", meaning: \"Kamu full kejutan dengan isi which manis dan nikmat." },
  { name: "Permen Karet\", meaning: \"Kamu selalu bikin suasana jadi lebih ceria dengan kenikmatanmu which kenyal." },
  { name: "Pisang Goreng\", meaning: \"Kamu selalu bikin suasana jadi lebih warm dan nyaman." },
  { name: "Telur Dadar\", meaning: \"Kamu sederhana tapi selalu bikin orang puas dengan kelezatanmu." },
  { name: "Es fruit\", meaning: \"Kamu fresh dan full warna, selalu bikin days jadi lebih ceria." },
  { name: "Mie Goreng\", meaning: \"Kamu selalu bikin kenwhich dan puas dengan rasamu which lezat." },
  { name: "Puding brown\", meaning: \"Kamu manis dan selalu bikin suasana jadi lebih nyaman." },
  { name: "Gulai Kambing\", meaning: \"Kamu rich rasa dan selalu bikin orang ketagihan dengan kelezatanmu." },
  { name: "Kue Nastar\", meaning: \"Kamu selalu hadir di saat-saat spesial dengan rasa which manis dan enak." },
  { name: "Krupuk Ikan\", meaning: \"Kamu renyah dan selalu bikin suasana jadi lebih seru." },
  { name: "Es Teler\", meaning: \"Kamu fresh dan full kejutan dengan campuran rasa which enak." },
  { name: "Rujak fruit\", meaning: \"Kamu fresh dan selalu bikin suasana jadi lebih alive dengan rasamu which pedas dan manis." },
  { name: "Soto Ayam\", meaning: \"Kamu selalu bikin warm dan puas dengan kuahmu which lezat." },
  { name: "Tahu Bulat\", meaning: \"Kamu selalu hadir di momen-momen which pas dengan rasa which enak." },
  { name: "Keripik Singkong\", meaning: \"Kamu renyah dan selalu bikin suasana jadi lebih seru." },
  { name: "Kacang Goreng\", meaning: \"Kamu selalu jadi camilan favorit di setiap kesempatan." },
  { name: "Tongseng Sapi\", meaning: \"Kamu rich rasa dan selalu bikin orang ketagihan dengan kelezatanmu." },
  { name: "Sate Padang\", meaning: \"Kamu selalu bikin kenwhich dan puas dengan rasa khasmu which lezat." },
  { name: "Nasi Uduk\", meaning: \"Kamu selalu bikin kenwhich dan puas dengan rasa gurihmu which enak." },
  { name: "Cendol Dawet\", meaning: \"Kamu fresh dan selalu bikin suasana jadi lebih adem di saat-saat hot." },
  { name: "Onde-onde\", meaning: \"Kamu selalu hadir di saat-saat spesial dengan rasa which manis dan enak." },
  { name: "Kolak Pisang\", meaning: \"Kamu manis dan selalu bikin suasana jadi lebih warm dan nyaman." },
  { name: "Macan Kumbang\", meaning: \"Kamu misterius dan strong, seperti macan which jarang tersee tapi selalu waspada." },
  { name: "Kuda gold\", meaning: \"Kamu berharga dan strong, siap untuk berrun menuju kesuksesan." },
  { name: "Elang blue\", meaning: \"Kamu memiliki visi which tajam dan able to mesee pelmoney dari jauh." },
  { name: "Indomie Goreng\", meaning: \"Selalu bikin kenwhich dan bahagia" },
  { name: "Es Krim Meleleh\", meaning: \"Selalu mencairkan suasana dengan rasa manisnya" },
  { name: "Bakso Ulet\", meaning: \"Selalu teethh dan bulat dalam menghadapi mawrong" },
  { name: "Lem Super\", meaning: \"Selalu lengket dalam situasi which rumit" },
  { name: "Kecap Manis\", meaning: \"Selalu givekan sentuhan manis dalam alive" },
  { name: "Sabun Mandi\", meaning: \"Selalu clean dan wangi" },
  { name: "Kopi Tumpah\", meaning: \"Selalu bersemangat, tapi kadang berantwill" },
  { name: "Sepeda Ontel\", meaning: \"Selalu klasik dan sederhana" },
  { name: "Roti Bakar\", meaning: \"Selalu warm dan enak" },
  { name: "Kucing Kampung\", meaning: \"Selalu mandiri dan full adventure" },
  { name: "Jamu Pahit\", meaning: \"Selalu give strength meski tak enak di awal" },
  { name: "Teh Celup\", meaning: \"Selalu givekan rasa warm di hati" },
  { name: "Tas Kresek\", meaning: \"Selalu light dan praktis" },
  { name: "Es Kelapa\", meaning: \"Selalu fresh dan menyegarkan" },
  { name: "Motor Astrea\", meaning: \"Selalu setia dan bandel" },
  { name: "Mie Instan\", meaning: \"Selalu fast dan mengenwhichkan" },
  { name: "Bolu Kukus\", meaning: \"Selalu lembut dan manis" },
  { name: "Tahu Bulat\", meaning: \"Selalu enak di segala suasana" },
  { name: "Nasi Uduk\", meaning: \"Selalu cocok di segala waktu" },
  { name: "Susu Kental Manis\", meaning: \"Selalu menambah kenikmatan" },
  { name: "Kopi black\", meaning: \"Selalu give semangat di morning days" },
  { name: "Kacang Goreng\", meaning: \"Selalu asyik untuk ngemil" },
  { name: "Ayam Goreng Tepung\", meaning: \"Selalu renyah dan nikmat" },
  { name: "Sambal Terasi\", meaning: \"Selalu pedas dan mengteetht" },
  { name: "Ketoprak\", meaning: \"Selalu mengenwhichkan dan lezat" },
  { name: "Cendol Dawet\", meaning: \"Selalu fresh di afternoon days" },
  { name: "Gado-Gado\", meaning: \"Selalu full warna dan rasa" },
  { name: "Pisang Goreng\", meaning: \"Selalu manis dan gurih" },
  { name: "Martabak Manis\", meaning: \"Selalu lezat dan memanjwill lidah" },
  { name: "Bubur Ayam\", meaning: \"Selalu warm dan mengenwhichkan" },
  { name: "Soto Ayam\", meaning: \"Selalu rich rasa dan gurih" },
  { name: "Nasi Padang\", meaning: \"Selalu full dengan kenikmatan" },
  { name: "Rendang Daging\", meaning: \"Selalu empuk dan rich rempah" },
  { name: "Nasi Goreng\", meaning: \"Selalu praktis dan enak" },
  { name: "Bakmi Jawa\", meaning: \"Selalu menggugah selera" },
  { name: "Sate Ayam\", meaning: \"Selalu enak di segala acara" },
  { name: "Gulai Kambing\", meaning: \"Selalu rich rasa dan lezat" },
  { name: "Rawon Sapi\", meaning: \"Selalu black dan nikmat" },
  { name: "Ikan Bakar\", meaning: \"Selalu gurih dan enak" },
  { name: "Pepes Tahu\", meaning: \"Selalu lezat dan bergizi" },
  { name: "Tempe Mendoan\", meaning: \"Selalu gurih dan renyah" },
  { name: "Keripik Singkong\", meaning: \"Selalu renyah dan menggoda" },
  { name: "Jus Alpukat\", meaning: \"Selalu fresh dan menyehatkan" },
  { name: "Es Teler\", meaning: \"Selalu fresh dan nikmat" },
  { name: "Bubur Kacang green\", meaning: \"Selalu warm dan mengenwhichkan" },
  { name: "Bakpao\", meaning: \"Selalu lembut dan enak" },
  { name: "Pempek\", meaning: \"Selalu gurih dan kenyal" },
  { name: "Sosis Bakar\", meaning: \"Selalu enak di segala suasana" },
  { name: "Lumpia Semarang\", meaning: \"Selalu gurih dan nikmat" },
  { name: "Otak-Otak\", meaning: \"Selalu enak dan gurih" },
  { name: "Pastel\", meaning: \"Selalu renyah dan nikmat" },
  { name: "Cilok\", meaning: \"Selalu kenyal dan enak" },
  { name: "Bakwan Jagung\", meaning: \"Selalu gurih dan lezat" },
  { name: "Risol\", meaning: \"Selalu renyah dan enak" },
  { name: "Combro\", meaning: \"Selalu gurih dan pedas" },
  { name: "Getuk\", meaning: \"Selalu manis dan kenyal" },
  { name: "Tape Singkong\", meaning: \"Selalu manis dan fresh" },
  { name: "Wedang Jahe\", meaning: \"Selalu warm dan menenangkan" },
  { name: "Dawet Ayu\", meaning: \"Selalu fresh dan menggoda" },
  { name: "Es fruit\", meaning: \"Selalu fresh dan full warna" },
  { name: "Es Doger\", meaning: \"Selalu manis dan menyegarkan" },
  { name: "Tengkleng\", meaning: \"Selalu gurih dan enak" },
  { name: "Gulai Nangka\", meaning: \"Selalu rich rasa dan lezat" },
  { name: "Coto Makassar\", meaning: \"Selalu gurih dan nikmat" },
  { name: "Nasi Liwet\", meaning: \"Selalu enak dan mengenwhichkan" },
  { name: "Bubur Sumsum\", meaning: \"Selalu lembut dan manis" },
  { name: "Kue Cubit\", meaning: \"Selalu manis dan lembut" },
  { name: "Bolu Pyoun\", meaning: \"Selalu harum dan enak" },
  { name: "Onde-Onde\", meaning: \"Selalu kenyal dan manis" },
  { name: "Serabi Solo\", meaning: \"Selalu lembut dan gurih" },
  { name: "Lemper Ayam\", meaning: \"Selalu gurih dan lezat" },
  { name: "Kue Lumpur\", meaning: \"Selalu lembut dan manis" },
  { name: "Kue Lapis\", meaning: \"Selalu warna-warni dan manis" },
  { name: "Kue Putu\", meaning: \"Selalu warm dan manis" },
  { name: "Es Pisang Ijo\", meaning: \"Selalu fresh dan manis" },
  { name: "Klepon\", meaning: \"Selalu manis dan kenyal" },
  { name: "Martabak Telur\", meaning: \"Selalu gurih dan enak" },
  { name: "Ayam Penyet\", meaning: \"Selalu pedas dan mengteetht" },
  { name: "Ikan Asin\", meaning: \"Selalu gurih dan asin" },
  { name: "Sop Buntut\", meaning: \"Selalu rich rasa dan nikmat" },
  { name: "Bakso Malang\", meaning: \"Selalu gurih dan lezat" },
  { name: "Pempek Palembang\", meaning: \"Selalu enak dan gurih" },
  { name: "Tahu Gejrot\", meaning: \"Selalu pedas dan fresh" },
  { name: "Gepuk Daging\", meaning: \"Selalu empuk dan lezat" },
  { name: "Ayam Betutu\", meaning: \"Selalu rich bumbu dan enak" },
  { name: "Ikan Gurame\", meaning: \"Selalu gurih dan nikmat" },
  { name: "Udang Goreng\", meaning: \"Selalu renyah dan enak" },
  { name: "Cumi Saus Tiram\", meaning: \"Selalu gurih dan lezat" },
  { name: "Royco Ayam\", meaning: \"Selalu menambah rasa gurih pada setiap kesempatan" },
  { name: "Honda Supra\", meaning: \"Selalu can diyoulkan di roadan" },
  { name: "Kompor Meledak\", meaning: \"Selalu givekan kewarman which luar biasa" },
  { name: "Es Batu Menangis\", meaning: \"Selalu mencair di saat which tak terduga" },
  { name: "Teh Botol Sosro\", meaning: \"Selalu fresh di segala suasana" },
  { name: "Payung Bocor\", meaning: \"Selalu givekan kejutan saat hujan" },
  { name: "Kursi Tertawa\", meaning: \"Selalu makemu nyaman dengan gayanya which lucu" },
  { name: "Motor Vespa\", meaning: \"Selalu klasik dan full gaya" },
  { name: "Ember Bocor\", meaning: \"Selalu berfungsi walau tak sempurna" },
  { name: "Bantal Gebuk\", meaning: \"Selalu menemani sleepmu dengan kenyamanan" },
  { name: "Mie Sedap\", meaning: \"Selalu fast dan mengenwhichkan" },
  { name: "Komputer Ngadat\", meaning: \"Selalu menantang kesabaranmu" },
  { name: "Handphone Jadul\", meaning: \"Selalu setia meski ketinggalan zaman" },
  { name: "fridge Berisik\", meaning: \"Selalu bising tapi berguna" },
  { name: "Rokok warehouse Garam\", meaning: \"Selalu nikmat di setiap tarikan" },
  { name: "Radio Tua\", meaning: \"Selalu mengalivekan suasana" },
  { name: "shoes Butut\", meaning: \"Selalu nyaman meski usang" },
  { name: "Blender Bising\", meaning: \"Selalu ribut tapi membantu" },
  { name: "Sapu Ijuk\", meaning: \"Selalu clean dengan efektif" },
  { name: "Kipas wind\", meaning: \"Selalu givekan wind fresh" },
  { name: "Rice Cooker\", meaning: \"Selalu mgoldak nasi dengan sempurna" },
  { name: "Senter Mati\", meaning: \"Selalu ada saat direquirekan" },
  { name: "Pisau Tumpul\", meaning: \"Selalu menantang dalam memotong" },
  { name: "Honda Beat\", meaning: \"Selalu lincah di roadan" },
  { name: "Kerupuk Udang\", meaning: \"Selalu renyah dan nikmat" },
  { name: "Gitar Sumbang\", meaning: \"Selalu givekan nada which tak terduga" },
  { name: "Meja Bergowhich\", meaning: \"Selalu bergowhich saat digunwill" },
  { name: "Jok Motor\", meaning: \"Selalu empuk dan nyaman" },
  { name: "Tikar Lipat\", meaning: \"Selalu praktis di segala acara" },
  { name: "Paku Karet\", meaning: \"Selalu lentur dan tak terduga" },
  { name: "Lemari Besi\", meaning: \"Selalu strong dan kokoh" },
  { name: "Sepeda BMX\", meaning: \"Selalu siap untuk adventure" },
  { name: "Tas Belanja\", meaning: \"Selalu praktis dan berguna" },
  { name: "Lilin Meleleh\", meaning: \"Selalu givekan cahaya di kegelapan" },
  { name: "Kabel Kusut\", meaning: \"Selalu make bingung" },
  { name: "Honda CBR\", meaning: \"Selalu fast dan full gaya" },
  { name: "Sendok Miring\", meaning: \"Selalu give sensasi berbeda" },
  { name: "Gelas Retak\", meaning: \"Selalu siap walau tak sempurna" },
  { name: "Lampu sleep\", meaning: \"Selalu givekan cahaya lembut" },
  { name: "Karet Gelang\", meaning: \"Selalu fleksibel dan berguna" },
  { name: "Honda Vario\", meaning: \"Selalu tangguh di segala medan" },
  { name: "Botol Kaca\", meaning: \"Selalu jernih dan berguna" },
  { name: "Rantang Susun\", meaning: \"Selalu carry bekal dengan rapi" },
  { name: "Kunci Inggris\", meaning: \"Selalu siap untuk pergoodan" },
  { name: "Honda Tiger\", meaning: \"Selalu gagah dan strong" },
  { name: "Toples Kue\", meaning: \"Selalu full kejutan manis" },
  { name: "Wajan Teflon\", meaning: \"Selalu anti lengket" },
  { name: "Honda Scoopy\", meaning: \"Selalu trendy dan stylish" },
  { name: "Kasur Busa\", meaning: \"Selalu empuk dan nyaman" },
  { name: "Sapu Lidi\", meaning: \"Selalu clean dengan efektif" },
  { name: "Panci Presto\", meaning: \"Selalu fast dan praktis" },
  { name: "Honda PCX\", meaning: \"Selalu mewah dan nyaman" },
  { name: "Talenan Kayu\", meaning: \"Selalu setia menemani dapur" },
  { name: "Gergaji Tumpul\", meaning: \"Selalu menantang dalam memotong" },
  { name: "Honda Blade\", meaning: \"Selalu tajam di roadan" },
  { name: "Bantal Kapuk\", meaning: \"Selalu empuk dan lembut" },
  { name: "Penghapus Karet\", meaning: \"Selalu siap menghapus kewrongan" },
  { name: "Honda Revo\", meaning: \"Selalu tangguh dan hemat" },
  { name: "Laci Meja\", meaning: \"Selalu save rahasia" },
  { name: "Stoples Kaca\", meaning: \"Selalu jernih dan berisi" },
  { name: "Honda Verza\", meaning: \"Selalu strong dan tahan old" },
  { name: "Cermin Retak\", meaning: \"Selalu givekan pantulan unik" },
  { name: "Pena Bocor\", meaning: \"Selalu meninggalkan jejak" },
  { name: "Honda CB150R\", meaning: \"Selalu fast dan bertenaga" },
  { name: "Baskom Plastik\", meaning: \"Selalu light dan praktis" },
  { name: "Paku Beton\", meaning: \"Selalu strong dan kokoh" },
  { name: "Honda MegaPro\", meaning: \"Selalu gagah di roadan" },
  { name: "Gembok Rusak\", meaning: \"Selalu menantang keamanan" },
  { name: "Syoul Jepit\", meaning: \"Selalu relaxed dan nyaman" },
  { name: "Honda Win\", meaning: \"Selalu menang di segala medan" },
  { name: "Lemari Plastik\", meaning: \"Selalu light dan praktis" },
  { name: "fridge Mini\", meaning: \"Selalu cold dan efisien" },
  { name: "Honda CRF\", meaning: \"Selalu tangguh di segala medan" },
  { name: "Cangkir Teh\", meaning: \"Selalu mengwarmkan suasana" },
  { name: "Kompor Gas\", meaning: \"Selalu fast dan hot" },
  { name: "Honda Monkey\", meaning: \"Selalu lucu dan unik" },
  { name: "Cerek water\", meaning: \"Selalu siap menyajikan kewarman" },
  { name: "Selimut Tebal\", meaning: \"Selalu warm dan nyaman" },
  { name: "Honda Beat Street\", meaning: \"Selalu lincah dan tangguh" },
  { name: "Meja Rias\", meaning: \"Selalu menampilkan which tergood" },
  { name: "Gelas Plastik\", meaning: \"Selalu light dan praktis" },
  { name: "Honda X-ADV\", meaning: \"Selalu siap untuk adventure" },
  { name: "Rak Buku\", meaning: \"Selalu full pengetahuan" },
  { name: "Sisir Patah\", meaning: \"Selalu berfungsi meski tak sempurna" },
  { name: "Honda Rebel\", meaning: \"Selalu berjiwa pemberontak" },
  { name: "Bantal Guling\", meaning: \"Selalu nyaman di pelukan" },
  { name: "Honda CRF250\", meaning: \"Selalu siap menghadapi challenges" },
  { name: "Lemari Es\", meaning: \"Selalu save kefreshan" },
  { name: "Honda Forza\", meaning: \"Selalu strong dan bertenaga" },
  { name: "Piring Retak\", meaning: \"Selalu menantang dengan keunikannya" },
  { name: "Harimau Loreng\", meaning: \"Kamu tangguh dan memiliki strength untuk melindungi dan menyerang." },
  { name: "Gajah white\", meaning: \"Kamu wisesana dan memiliki strength big, lambang dari kebravean dan keteguhan hati." },
  { name: "Banteng Sakti\", meaning: \"Kamu strong dan full semangat, not afraid menghadapi rintangan." },
  { name: "Ular Raksasa\", meaning: \"Kamu memiliki wisdom dan strength tersembunyi, siap menyerang jika dineedkan." },
  { name: "Ikan Dewa\", meaning: \"Kamu calm dan full kedamaian, carry rezeki dan luck." },
  { name: "Kucing black\", meaning: \"Kamu misterius dan full dengan rahasia, carry luck bagi which memahami." },
  { name: "Rusa gold\", meaning: \"Kamu anggun dan berharga, selalu dihargai oleh orang-orang di sekitarmu." },
  { name: "Singa Bermahkota\", meaning: \"Kamu lahir sebagai pemimpin, memiliki strength dan wisdom seorang raja." },
  { name: "Kijang silver\", meaning: \"Kamu fast dan cekatan, selalu waspada dan siap untuk mejump lebih jauh." },
  { name: "Kipas wind Kelereng\", meaning: \"Selalu givekan wind fresh dengan kocaknya" },
  { name: "Penghapus Ajaib\", meaning: \"Mampu menghapus kewrongan dengan cara which lucu" },
  { name: "Kertas Guling Gowhich\", meaning: \"Tak pernah diam dan selalu menghibur" },
  { name: "Pulpen Melambai\", meaning: \"Selalu give tyou dengan cara which unik" },
  { name: "Tali mining Tertawa\", meaning: \"craft pekerjaan menjadi lebih menyenangkan" },
  { name: "Botol Minyak Mengejek\", meaning: \"Seringkali give komentar lucu" },
  { name: "hat Terbang\", meaning: \"craft kepala menjadi lebih light dengan keunikannya" },
  { name: "Payung Terbalik\", meaning: \"Selalu membalikkan situasi dengan cara which tak terduga" },
  { name: "Piring Berroad\", meaning: \"Tak pernah tinggal diam di placenya" },
  { name: "Ember Tertawa\", meaning: \"Menghadirkan keceriaan di setiap kegiatan" },
  { name: "Lampu sleep Tersleep\", meaning: \"Tersee malas-malasan tapi selalu givekan cahaya which warm" },
  { name: "Gelas Bergowhich\", meaning: \"Selalu givekan sensasi which berbeda dalam menikdead drink" },
  { name: "Kunci Kamar Mandi Keriting\", meaning: \"Selalu make mawrong small menjadi lucu" },
  { name: "Pisau Potong Hati\", meaning: \"Mampu memotong rasa sick dengan excessnya" },
  { name: "Tisu Terbang\", meaning: \"Selalu siap membantu dengan fast dan lincah" },
  { name: "Kardus Kocak\", meaning: \"Tak pernah membosankan, selalu save kejutan di dalamnya" },
  { name: "Kain Lap Terbang\", meaning: \"Berguna untuk clean dengan cara which seru" },
  { name: "Sendok Garpu Gowhich\", meaning: \"Menjadi partner which serasi dalam setiap food" },
  { name: "Tempat Pensil Teriak\", meaning: \"Tak pernah diam dan selalu meminta perhatian" },
  { name: "Buku Lucu\", meaning: \"Mampu makemu laugh di setiap haoldn" },
  { name: "Cermin Mengteethl\", meaning: \"Selalu givekan pantulan which lucu" },
  { name: "Kamera Gelantungan\", meaning: \"Selalu mengabadikan momen-momen lucu" },
  { name: "Cangkir Cemberut\", meaning: \"Meski tersee cemberut, tapi selalu menyajikan drink dengan good" },
  { name: "Kursi Muter\", meaning: \"Memberikan sensasi berputar di setiap sitnya" },
  { name: "Lemari Tersleep\", meaning: \"Selalu givekan kenyamanan which tak terduga" },
  { name: "Tas Terbang\", meaning: \"Selalu carry items-items dengan gaya which unik" },
  { name: "shoes Terbang\", meaning: \"craft langkahmu lebih light dengan excessnya" },
  { name: "Kunci road Bergosip\", meaning: \"Tak pernah diam tentang hal-hal di sekitarnya" },
  { name: "Sisir Sibuk\", meaning: \"Selalu givekan gaya which berbeda pada setiap rambut" },
  { name: "Gelas Tertawa\", meaning: \"Bergowhich-gowhich saat diisi dengan drink" },
  { name: "Pisau Potong Gowhich\", meaning: \"Selalu givekan irama which unik saat digunwill" },
  { name: "Meja Ngobrol\", meaning: \"Tak pernah sepi dari percakapan" },
  { name: "Piring Berguling\", meaning: \"Suka berputar-putar saat disentuh" },
  { name: "Kompor Berpikir\", meaning: \"Selalu givekan solusi which smart untuk setiap mawrong" },
  { name: "fridge Gowhich\", meaning: \"Bergetar saat diisi dengan food" },
  { name: "Cangkir Berrun\", meaning: \"Tak pernah can diam di placenya" },
  { name: "Lampu night Malas\", meaning: \"Tersee malas tapi selalu givekan cahaya which lembut" },
  { name: "Botol Kecap Keriting\", meaning: \"Selalu givekan sentuhan which berbeda pada maswill" },
  { name: "Sendok Garpu Bergowhich\", meaning: \"Selalu menari-nari saat digunwill" },
  { name: "hat Tertawa\", meaning: \"Tersee ceria di atas kepala siapa pun" },
  { name: "Korek fire Malas\", meaning: \"Tersee malas tapi selalu givekan fire which menyala" },
  { name: "Panci Pintar\", meaning: \"Selalu givekan maswill which sempurna" },
  { name: "Kertas Berrun\", meaning: \"Tak pernah can diam di meja" },
  { name: "Pensil Penghilang\", meaning: \"Selalu menghilang saat direquirekan" },
  { name: "Penghapus Pelawak\", meaning: \"Selalu make kewrongan menjadi lucu" },
  { name: "Buku Bergowhich\", meaning: \"Selalu givekan sensasi which berbeda saat dibaca" },
  { name: "Ponsel Pintar\", meaning: \"Selalu givekan jawaban which tepat untuk setiap pertanyaan" },
  { name: "Gunting Gowhich\", meaning: \"Selalu menari-nari saat digunwill" },
  { name: "Rak Buku Pintar\", meaning: \"Selalu givekan buku which sesuai dengan minatmu" },
  { name: "Kipas wind Tertawa\", meaning: \"Tersee bahagia saat berputar-putar" },
  { name: "Sabun Mandi Malas\", meaning: \"Tersee malas tapi selalu givekan kecleanan which menyegarkan" },
  { name: "Pulpen Pintar\", meaning: \"Selalu givekan ide which brilian" },
  { name: "Gelas Pintar\", meaning: \"Selalu givekan drink which sesuai dengan kewantanmu" },
  { name: "Botol water Mengejek\", meaning: \"Selalu givekan komentar which lucu saat didrink" },
  { name: "Bantal Bergowhich\", meaning: \"Tak pernah can diam saat di atas kasur" },
  { name: "Kursi Bergowhich\", meaning: \"Selalu givekan sensasi which menyenangkan saat digunwill" },
  { name: "Rak Buku Bergowhich\", meaning: \"Selalu givekan sensasi which unik saat buku diletakkan di atasnya" },
  { name: "Tas Pintar\", meaning: \"Selalu givekan items which dineedkan saat direquirekan" },
  { name: "Piring Berrun\", meaning: \"Tak pernah can diam di placenya" },
  { name: "Panci wizard\", meaning: \"Mampu make maswill which ajaib" },
  { name: "Sendok Garpu Terbalik\", meaning: \"Tak pernah can diletakkan dengan right" },
  { name: "Kotak Pensil Berguling\", meaning: \"Selalu menggelinding saat diletakkan di meja" },
  { name: "Kunci Kamar Mandi Tertawa\", meaning: \"Tak pernah can diam dan selalu laugh-tawa" },
  { name: "Kardus Malas\", meaning: \"Selalu tersee malas tapi selalu givekan perlindungan which good" },
  { name: "Lampu Tersleep\", meaning: \"Tersee ngantuk tapi selalu givekan cahaya which warm" },
  { name: "Anjing Pelacak\", meaning: \"Kamu setia dan full dedikasi, selalu find road menuju tujuanmu." },
  ];                
const khodamIndex = Math.floor(Math.random() * khodams.length);
const khodam = khodams[khodamIndex];

return {
name: khodam.name,
meaning: khodam.meaning,
};
}

// sekali gua see this sc di jual auto enc semua fitur new
//INI SC FREE






















































































































































































































































































































































































































































// sekali gua see this sc di jual auto enc semua fitur new
//INI SC FREE























































































































































































// sekali gua see this sc di jual auto enc semua fitur new
//INI SC FREE