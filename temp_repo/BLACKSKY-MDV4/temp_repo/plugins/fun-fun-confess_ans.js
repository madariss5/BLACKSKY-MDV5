const { getMessage } = require('../lib/languages');

const delay = time => new Promise(res => setTimeout(res, time))
let handler = m => m
handler.all = async function (m) {
        if (!m.chat.endsWith('@s.whatsapp.net')) return !0;
        this.menfess = this.menfess ? this.menfess : {}
        let mf = Object.values(this.menfess).find(v => v.status === false && v.recipient == m.sender)
        if (!mf) return !0
        // Log message text safely (only for debugging)
        if (m.text) console.log({ text: m.text });
        
        if ((m.text === 'BALAS message' || m.text === '') && m.quoted.mtype == 'buttonMessage') return m.reply("Please Type message reply Mu");
        let txt = `Hai kak @${mf.dari.split('@')[0]}, Kamu Menerima message reply\n\nPesan Kamu: \n${mf.message}\n\nPesan replynya: \n${m.text}\n`.trim();
        await this.reply(mf.dari, txt, null).then(() => {
                m.reply('Success send reply!')
                delay(2000)
                delete this.menfess[mf.id]
                return !0
                })
        return !0
}
module.exports = handler
