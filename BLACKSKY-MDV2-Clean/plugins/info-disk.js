const { getMessage } = require('../lib/languages');

let cp = require ('child_process')
let { promisify } = require ('util')
let exec = promisify(cp.exec).bind(cp)
let handler = async (m, { conn}) => {
    // Get user's preferred language
    const user = global.db.data.users[m.sender];
    const chat = global.db.data.chats[m.chat];
    const lang = user?.language || chat?.language || global.language;
 {
	await conn.reply(m.chat, `Please wait`, m)
    let o
    try {
        o = await exec('cd && du -h --max-depth=1')
    } catch (e) {
        o = e
    } finally {
        let { stdout, stderr } = o
        if (stdout.trim())
        m.reply(stdout)
        if (stderr.trim()) m.reply(stderr)
    }
}
handler.help = ['disk']
handler.tags = ['info']
handler.command = /^(disk)$/i
handler.premium = false
}

module.exports = handler
