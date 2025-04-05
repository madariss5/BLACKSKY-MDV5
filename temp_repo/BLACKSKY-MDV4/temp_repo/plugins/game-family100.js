let fs = require('fs');
let fetch = require('node-fetch');
const { getMessage } = require('../lib/languages.js');
let winScore = 500
let rewardAmount = 100 

async function handler(m) {
    conn.family = conn.family ? conn.family : {}
    let id = m.chat
    if (id in conn.family) {
        if (conn.family[id].id !== undefined) return conn.reply(m.chat, 'Masih ada kuis which not yet answered in this chat' + '\nWait 3 minutes untuk end', conn.family[id].msg)
        delete conn.family[id]
        throw false
    }
    conn.family[id] = {}
    let src = await (await fetch(`https://api.betabotz.eu.org/fire/game/family100-2?apikey=${lann}`)).json()
    let json = src[Math.floor(Math.random() * src.length)]

    let caption = `

 ┌─⊷ *SOAL*
▢ *Soal:* ${json.soal}
▢ Terable to *${json.jawaban.length}* jawaban${json.jawaban.find(v => v.includes(' ')) ? `
▢ (beberapa jawaban terdapat spasi)
▢ wait 3 menit untuk mengakhiri
▢ ketik *nyerah* untuk menyelesaikan permainan
└──────────────
`: ''}

+${rewardAmount} credits sosial! tiap jawaban right
    `.trim()
    conn.family[id] = {
        id,
        msg: await m.reply(caption),
        ...json,
        terjawab: Array.from(json.jawaban, () => false),
        winScore,
        rewardAmount, 
        timeout: setTimeout(() => {
            if (conn.family[id]) {
                let allAnswers = conn.family[id].jawaban.map((jawaban, index) => `(${index + 1}) ${jawaban}`).join('\n')
                conn.reply(m.chat, `Time's up! Game berakhir.\n\nJawaban which right:\n${allAnswers}`, conn.family[id].msg)
                delete conn.family[id]
            }
        }, 180000) // 3 minutes
    }
}
handler.help = ['family100']
handler.tags = ['game']
handler.group = true
handler.command = /^family100$/i

handler.nyerah = async function (m) {
    let id = m.chat
    if (id in conn.family) {
        conn.reply(m.chat, 'Permainan berakhir karena menyerah.', conn.family[id].msg)
        clearTimeout(conn.family[id].timeout)
        delete conn.family[id]
    } else {
        conn.reply(m.chat, 'Tidak ada game which currently berlangsung.', m)
    }
}

module.exports = handler

//danaputra_133