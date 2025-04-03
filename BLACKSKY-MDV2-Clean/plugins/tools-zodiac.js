const { getMessage } = require('../lib/languages');

let handler = (m, { usedPrefix, command, text: inputText }) => {
    if (!inputText) throw `Example:\n${usedPrefix + command} 2002 02 25`

    const date = new Date(inputText)
    if (date == 'Invalid Date') throw date
    const d = new Date()
    const [years, months, day] = [d.getFullYear(), d.getMonth() + 1, d.getDate()]
    const birth = [date.getFullYear(), date.getMonth() + 1, date.getDate()]
    
    const zodiac = getZodiac(birth[1], birth[2])
    const ageD = new Date(d - date)
    const age = ageD.getFullYear() - new Date(1970, 0, 1).getFullYear()

    const birthday = [years + (+ new Date(1970, months - 1, day) > + new Date(1970, birth[1] - 1, birth[2])), ...birth.slice(1)]
    const cekusia = months === birth[1] && day === birth[2] ? `Happy ${age}th birthday 🥳` : age

    const text = `
Birth Date: ${birth.join('-')}
Next Birthday: ${birthday.join('-')}
Age: ${cekusia}
Zodiac: ${zodiac}
`.trim()
    m.reply(text)
}
handler.help = ['zodiac *2002 02 25*']
handler.tags = ['tools', 'internet', 'fun']

handler.command = /^zodia[kc]$/i

module.exports = handler

const zodiak = [
    ["Capricorn", new Date(1970, 0, 1)],
    ["Aquarius", new Date(1970, 0, 20)],
    ["Pisces", new Date(1970, 1, 19)],
    ["Aries", new Date(1970, 2, 21)],
    ["Taurus", new Date(1970, 3, 21)],
    ["Gemini", new Date(1970, 4, 21)],
    ["Cancer", new Date(1970, 5, 22)],
    ["Leo", new Date(1970, 6, 23)],
    ["Virgo", new Date(1970, 7, 23)],
    ["Libra", new Date(1970, 8, 23)],
    ["Scorpio", new Date(1970, 9, 23)],
    ["Sagittarius", new Date(1970, 10, 22)],
    ["Capricorn", new Date(1970, 11, 22)]
].reverse()

function getZodiac(month, day) {
    let d = new Date(1970, month - 1, day)
    return zodiak.find(([_,_d]) => d >= _d)[0]
}
