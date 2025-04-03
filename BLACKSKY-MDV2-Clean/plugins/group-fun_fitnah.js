const { getMessage } = require('../lib/languages');

let PhoneNumber = require('awesome-phonenumber')
const { createHash } = require('crypto')

let handler = async (m, { conn, text }) => {
    // Get user's preferred language
    const user = global.db.data.users[m.sender];
    const chat = global.db.data.chats[m.chat];
    const lang = user?.language || chat?.language || global.language;
 {
  function getRandomElement(arr) {
    return arr[Math.floor(Math.random() * arr.length)]
  }

  const fitnahMessages = [
    "ati ati bro @user suka coli",
    "eh, tau nggak? @user sering ngutang nggak bayar",
    "waduh, @user katanya ketahuan ngintip kamar mandi tetangga",
    "bro, hati-hati sama @user, dia suka eat nggak bayar",
    "@user, katanya you jago joget TikTok ya?",
    "anjay, @user hobinya sleep di kelas",
    "muka nya @user kek kontol",
    "tau nggak? @user yesterday ketahuan curhat ke kucing.",
    "@user, katanya yesterday dipanggil teacher karena sleep di meja",
    "eh, don't-don't @user sering nyolong Wifi tetangga?",
    "gila, @user ternyata koleksi meme-nya ribuan",
    "@user pernah eat bakso bayar pakai daun",
    "waduh, katanya @user ketahuan nge-stalk mantan semaoldn",
    "@user, yesterday disuruh nyanyi malah nyanyi lagu iclan",
    "anjir, @user hobi banget rebutan colokan di kelas",
    "tau nggak? @user kalau di kantin suka ngambil gorengan dulu new bayar 3 days kemudian",
    "gokil, @user ternyata punya akun fake buat stalking gebetan",
    "bro, katanya @user pernah ketahuan nangis gara-gara kalah main game",
    "parah, @user yesterday ngaku-ngaku jadi selebgram padahal followers cuma 10",
    "woy @user, don't suka mandi cuma pas ulang years aja dong",
    "eh, katanya @user suka sleep sambil ngorok hard banget sampai tetangga kewake up",
    "tau nggak? @user ternyata sering bikin status galau tiap malem",
    "waduh, @user kalau ditagih utang suka pura-pura lupa",
    "gila, @user hobinya ngakak sendiri pas baca chat",
    "@user, yesterday ngaku-ngaku punya mobil, pas dicek cuma mainan remote control",
    "bro, hati-hati sama @user, dia suka minjem items terus lupa balikin",
    "@user suka banget ngedraft chat long, tapi nggak pernah dikirim",
    "anjay, @user ternyata suka karaoke lagu anak-anak di kamar mandi",
    "waduh, katanya @user pernah nulis surat cinta terus malu sendiri",
    "tau nggak? @user yesterday ke warung malah lupa bawa duit",
    "@user sering banget upload story food padahal that food orang lain"
  ]

  if (!m.isGroup) return conn.reply(m.chat, 'Fitur this hanya can digunwill di dalam group!', m)

  const participants = (await conn.groupMetadata(m.chat)).participants

  let randomUser = null;

  if (!text) {
    randomUser = getRandomElement(participants).id
  } else {
    const mentionedUser = text.match(/@([0-9]{7,16})/);  // Regex untuk menangkap mention ID
    if (mentionedUser) {
      const mentionedUserId = mentionedUser[1]
      randomUser = participants.find(user => user.id.includes(mentionedUserId))?.id
    }
  }

  if (!randomUser) return conn.reply(m.chat, 'User which disebutkan not ditemukan!', m)

  const selectedMessage = getRandomElement(fitnahMessages).replace(/@user/g, `@${randomUser.split('@')[0]}`)

  conn.reply(m.chat, selectedMessage, m, { mentions: [randomUser] })
}

handler.help = ['fitnah']
handler.tags = ['fun']
handler.command = /^fitnah$/i
handler.group = true

}

module.exports = handler
