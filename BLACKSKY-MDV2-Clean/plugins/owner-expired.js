const { getMessage } = require('../lib/languages');

let handler = async (m, { conn, args, usedPrefix, command }) => {
    // Get user's preferred language
    const user = global.db.data.users[m.sender];
    const chat = global.db.data.chats[m.chat];
    const lang = user?.language || chat?.language || global.language;
 {
    if (!args[0] || isNaN(args[0])) throw `Masukkan angka mewakili amount days !\n*Misal : ${usedPrefix + command} 30*`

    let who
    if (m.isGroup) who = args[1] ? args[1] : m.chat
    else who = args[1]

    var amountHari = 86400000 * args[0]
    var now = new Date() * 1
    if (now < global.db.data.chats[who].expired) global.db.data.chats[who].expired += amountHari
    else global.db.data.chats[who].expired = now + amountHari
    m.reply(`Success menetapkan days kadaluarsa untuk group this seold ${args[0]} days.\n\nHitung Mundur : ${msToDate(global.db.data.chats[who].expired - now)}`)
}
handler.help = ['addsewa <days>']
handler.tags = ['owner']
handler.command = /^(expired|addsewa)$/i
handler.owner = true
}

module.exports = handler

function msToDate(ms) {
    temp = ms
    days = Math.floor(ms / (24 * 60 * 60 * 1000));
    daysms = ms % (24 * 60 * 60 * 1000);
    hours = Math.floor((daysms) / (60 * 60 * 1000));
    hoursms = ms % (60 * 60 * 1000);
    minutes = Math.floor((hoursms) / (60 * 1000));
    minutesms = ms % (60 * 1000);
    sec = Math.floor((minutesms) / (1000));
    return days + " days " + hours + " hours " + minutes + " minutes";
    // +minutes+":"+sec;
}
