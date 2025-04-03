const { getMessage } = require('../lib/languages');

//tq: hafizdexe

let handler = async (m, { conn, args, usedPrefix, DevMode }) => {
    // Get user's preferred language
    const user = global.db.data.users[m.sender];
    const chat = global.db.data.chats[m.chat];
    const lang = user?.language || chat?.language || global.language;
 {
    if (args.length < 3) {
        return conn.reply(m.chat, `Use format .tf <Type> <amount> <@tag>\n📍Example Useran: *.tf money 100 @tag*\n\n*List which can di transfer :*\n💹Money\n🏷 Limit\n💳 Tabungan\n🥤Potion\n🗑️Sampah\n💎Diamond\n📦Common\n🛍️Uncommon\n🎁Mythic\n🧰Legendary\n🕸️string\n🪵wood\n🪨stone\n⛓iron`.trim(), m)
    } else try {
        let Type = (args[0] || '').toLowerCase()
        let count = args[1] && args[1].length > 0 ? Math.min(9999999, Math.max(parseInt(args[1]), 1)) : Math.min(1)
        let who = m.mentionedJid ? m.mentionedJid[0] : (args[2].replace(/[@ .+-]/g, '').replace(' ', '') + '@s.whatsapp.net')
        if(!m.mentionedJid || !args[2]) throw 'Tag wrong one, atau ketik Nomernya!!'
        let users = global.db.data.users
        switch (Type) {
        	case 'limit':
                if (global.db.data.users[m.sender].limit >= count * 1) {
                    try {
                        global.db.data.users[m.sender].limit -= count * 1
                        global.db.data.users[who].limit += count * 1
                        conn.reply(m.chat, `Success mentransfer limit sebig ${count}`.trim(), m)
                    } catch (e) {
                        global.db.data.users[m.sender].money += count * 1
                        m.reply('Failed Menstransfer')
                        console.log(e)
                        if (DevMode) {
                            for (let jid of global.owner.map(v => v.replace(/[^0-9]/g, '') + '@s.whatsapp.net').filter(v => v != conn.user.jid)) {
                                conn.reply(jid, 'Transfer.js error\nNo: *' + m.sender.split`@`[0] + '*\nCommand: *' + m.text + '*\n\n*' + e + '*', m)
                            }
                        }
                    }
                } else conn.reply(m.chat, `Limit you not mencukupi untuk mentransfer Limit sebig ${count}`.trim(), m)
                break
            case 'money':
                if (global.db.data.users[m.sender].money >= count * 1) {
                    try {
                        global.db.data.users[m.sender].money -= count * 1
                        global.db.data.users[who].money += count * 1
                        conn.reply(m.chat, `Success mentransfer money sebig ${count}`.trim(), m)
                    } catch (e) {
                        global.db.data.users[m.sender].money += count * 1
                        m.reply('Failed Menstransfer')
                        console.log(e)
                        if (DevMode) {
                            for (let jid of global.owner.map(v => v.replace(/[^0-9]/g, '') + '@s.whatsapp.net').filter(v => v != conn.user.jid)) {
                                conn.reply(jid, 'Transfer.js error\nNo: *' + m.sender.split`@`[0] + '*\nCommand: *' + m.text + '*\n\n*' + e + '*', m)
                            }
                        }
                    }
                } else conn.reply(m.chat, `money you not mencukupi untuk mentransfer Money sebig ${count}`.trim(), m)
                break
            case 'tabungan':
                if (global.db.data.users[m.sender].atm >= count * 1) {
                   try {
                       global.db.data.users[m.sender].atm -= count * 1
                       global.db.data.users[who].atm += count * 1
                       conn.reply(m.chat, `Success mentransfer money dari bank sebig ${count}`.trim(), m)
                    } catch (e) {
                        global.db.data.users[m.sender].atm += count * 1
                        m.reply('Failed Menstransfer')
                        console.log(e)
                        if (DevMode) {
                            for (let jid of global.owner.map(v => v.replace(/[^0-9]/g, '') + '@s.whatsapp.net').filter(v => v != conn.user.jid)) {
                               conn.reply(jid, 'Transfer.js error\nNo: *' + m.sender.split`@`[0] + '*\nCommand: *' + m.text + '*\n\n*' + e + '*', m)
                            }
                        }
                    }
                } else conn.reply(m.chat, `Limit you not mencukupi untuk mentransfer money dari Bank sebig ${count}`.trim(), m)
                break
            case 'limit':
                if (global.db.data.users[m.sender].limit >= count * 1) {
                    try {
                        global.db.data.users[m.sender].limit -= count * 1
                        global.db.data.users[who].limit += count * 1
                        conn.reply(m.chat, `Success mentransfer limit sebig ${count}`.trim(), m)
                    } catch (e) {
                        global.db.data.users[m.sender].limit += count * 1
                        m.reply('Failed Menstransfer')
                        console.log(e)
                        if (DevMode) {
                            for (let jid of global.owner.map(v => v.replace(/[^0-9]/g, '') + '@s.whatsapp.net').filter(v => v != conn.user.jid)) {
                                conn.reply(jid, 'Transfer.js error\nNo: *' + m.sender.split`@`[0] + '*\nCommand: *' + m.text + '*\n\n*' + e + '*', m)
                            }
                        }
                    }
                } else conn.reply(m.chat, `Limit you not mencukupi untuk mentransfer Limit sebig ${count}`.trim(), m)
                break
            case 'potion':
                if (global.db.data.users[m.sender].potion >= count * 1) {
                    try {
                        global.db.data.users[m.sender].potion -= count * 1
                        global.db.data.users[who].potion += count * 1
                        conn.reply(m.chat, `Success mentransfer ${count} Potion`.trim(), m)
                    } catch (e) {
                        global.db.data.users[m.sender].potion += count * 1
                        m.reply('Failed Menstransfer')
                        console.log(e)
                        if (DevMode) {
                            for (let jid of global.owner.map(v => v.replace(/[^0-9]/g, '') + '@s.whatsapp.net').filter(v => v != conn.user.jid)) {
                                conn.reply(jid, 'Transfer.js error\nNo: *' + m.sender.split`@`[0] + '*\nCommand: *' + m.text + '*\n\n*' + e + '*', m)
                            }
                        }
                    }
                } else conn.reply(m.chat, `Potion you not enough`.trim(), m)
                break
            case 'sampah':
                if (global.db.data.users[m.sender].sampah >= count * 1) {
                    try {
                        global.db.data.users[m.sender].sampah -= count * 1
                        global.db.data.users[who].sampah += count * 1
                        conn.reply(m.chat, `Success mentransfer ${count} Sampah`.trim(), m)
                    } catch (e) {
                        global.db.data.users[m.sender].sampah += count * 1
                        m.reply('Failed Menstransfer')
                        console.log(e)
                        if (DevMode) {
                            for (let jid of global.owner.map(v => v.replace(/[^0-9]/g, '') + '@s.whatsapp.net').filter(v => v != conn.user.jid)) {
                                conn.reply(jid, 'Transfer.js error\nNo: *' + m.sender.split`@`[0] + '*\nCommand: *' + m.text + '*\n\n*' + e + '*', m)
                            }
                        }
                    }
                } else conn.reply(m.chat, `Sampah you not enough`.trim(), m)
                break
            case 'diamond':
                if (global.db.data.users[m.sender].diamond >= count * 1) {
                    try {
                        global.db.data.users[m.sender].diamond -= count * 1
                        global.db.data.users[who].diamond += count * 1
                        conn.reply(m.chat, `Success mentransfer ${count} Diamond`.trim(), m)
                    } catch (e) {
                        global.db.data.users[m.sender].diamond += count * 1
                        m.reply('Failed Menstransfer')
                        console.log(e)
                        if (DevMode) {
                            for (let jid of global.owner.map(v => v.replace(/[^0-9]/g, '') + '@s.whatsapp.net').filter(v => v != conn.user.jid)) {
                                conn.reply(jid, 'Transfer.js error\nNo: *' + m.sender.split`@`[0] + '*\nCommand: *' + m.text + '*\n\n*' + e + '*', m)
                            }
                        }
                    }
                } else conn.reply(m.chat, `Diamond you you not enough`.trim(), m)
                break
            case 'common':
                if (global.db.data.users[m.sender].common >= count * 1) {
                    try {
                        global.db.data.users[m.sender].common -= count * 1
                        global.db.data.users[who].common += count * 1
                        conn.reply(m.chat, `Success mentransfer ${count} Common Crate`.trim(), m)
                    } catch (e) {
                        global.db.data.users[m.sender].common += count * 1
                        m.reply('Failed Menstransfer')
                        console.log(e)
                        if (DevMode) {
                            for (let jid of global.owner.map(v => v.replace(/[^0-9]/g, '') + '@s.whatsapp.net').filter(v => v != conn.user.jid)) {
                                conn.reply(jid, 'Transfer.js error\nNo: *' + m.sender.split`@`[0] + '*\nCommand: *' + m.text + '*\n\n*' + e + '*', m)
                            }
                        }
                    }
                } else conn.reply(m.chat, `Common crate you you not enough`.trim(), m)
                break
            case 'uncommon':
                if (global.db.data.users[m.sender].uncommon >= count * 1) {
                    try {
                        global.db.data.users[m.sender].uncommon -= count * 1
                        global.db.data.users[who].uncommon += count * 1
                        conn.reply(m.chat, `Success mentransfer ${count} Uncommon Crate`.trim(), m)
                    } catch (e) {
                        global.db.data.users[m.sender].uncommon += count * 1
                        m.reply('Failed Menstransfer')
                        console.log(e)
                        if (DevMode) {
                            for (let jid of global.owner.map(v => v.replace(/[^0-9]/g, '') + '@s.whatsapp.net').filter(v => v != conn.user.jid)) {
                                conn.reply(jid, 'Transfer.js error\nNo: *' + m.sender.split`@`[0] + '*\nCommand: *' + m.text + '*\n\n*' + e + '*', m)
                            }
                        }
                    }
                } else conn.reply(m.chat, `Uncommon crate you you not enough`.trim(), m)
                break
            case 'mythic':
                if (global.db.data.users[m.sender].mythic >= count * 1) {
                    try {
                        global.db.data.users[m.sender].mythic -= count * 1
                        global.db.data.users[who].mythic += count * 1
                        conn.reply(m.chat, `Success mentransfer ${count} Mythic crate`.trim(), m)
                    } catch (e) {
                        global.db.data.users[m.sender].mythic += count * 1
                        m.reply('Failed Menstransfer')
                        console.log(e)
                        if (DevMode) {
                            for (let jid of global.owner.map(v => v.replace(/[^0-9]/g, '') + '@s.whatsapp.net').filter(v => v != conn.user.jid)) {
                                conn.reply(jid, 'Transfer.js error\nNo: *' + m.sender.split`@`[0] + '*\nCommand: *' + m.text + '*\n\n*' + e + '*', m)
                            }
                        }
                    }
                } else conn.reply(m.chat, `Mythic crate you you not enough`.trim(), m)
                break
            case 'legendary':
                if (global.db.data.users[m.sender].legendary >= count * 1) {
                    try {
                        global.db.data.users[m.sender].legendary -= count * 1
                        global.db.data.users[who].legendary += count * 1
                        conn.reply(m.chat, `Success mentransfer ${count} Legendary crate`.trim(), m)
                    } catch (e) {
                        global.db.data.users[m.sender].legendary += count * 1
                        m.reply('Failed Menstransfer')
                        console.log(e)
                        if (DevMode) {
                            for (let jid of global.owner.map(v => v.replace(/[^0-9]/g, '') + '@s.whatsapp.net').filter(v => v != conn.user.jid)) {
                                conn.reply(jid, 'Transfer.js error\nNo: *' + m.sender.split`@`[0] + '*\nCommand: *' + m.text + '*\n\n*' + e + '*', m)
                            }
                        }
                    }
                } else conn.reply(m.chat, `Legendary crate you you not enough`.trim(), m)
                break
            case 'string':
                if (global.db.data.users[m.sender].string >= count * 1) {
                    try {
                        global.db.data.users[m.sender].string -= count * 1
                        global.db.data.users[who].string += count * 1
                        conn.reply(m.chat, `Success mentransfer string sebig ${count}`.trim(), m)
                    } catch (e) {
                        global.db.data.users[m.sender].string += count * 1
                        m.reply('Failed Menstransfer')
                        console.log(e)
                        if (DevMode) {
                            for (let jid of global.owner.map(v => v.replace(/[^0-9]/g, '') + '@s.whatsapp.net').filter(v => v != conn.user.jid)) {
                                conn.reply(jid, 'Transfer.js error\nNo: *' + m.sender.split`@`[0] + '*\nCommand: *' + m.text + '*\n\n*' + e + '*', m)
                            }
                        }
                    }
                } else conn.reply(m.chat, `money you not mencukupi untuk mentransfer String sebig ${count}`.trim(), m)
                break
            case 'stone':
                if (global.db.data.users[m.sender].stone >= count * 1) {
                    try {
                        global.db.data.users[m.sender].stone -= count * 1
                        global.db.data.users[who].stone += count * 1
                        conn.reply(m.chat, `Success mentransfer Batu sebig ${count}`.trim(), m)
                    } catch (e) {
                        global.db.data.users[m.sender].stone += count * 1
                        m.reply('Failed Menstransfer')
                        console.log(e)
                        if (DevMode) {
                            for (let jid of global.owner.map(v => v.replace(/[^0-9]/g, '') + '@s.whatsapp.net').filter(v => v != conn.user.jid)) {
                                conn.reply(jid, 'Transfer.js error\nNo: *' + m.sender.split`@`[0] + '*\nCommand: *' + m.text + '*\n\n*' + e + '*', m)
                            }
                        }
                    }
                } else conn.reply(m.chat, `money you not mencukupi untuk mentransfer Batu sebig ${count}`.trim(), m)
                break
            case 'wood':
                if (global.db.data.users[m.sender].wood >= count * 1) {
                    try {
                        global.db.data.users[m.sender].wood -= count * 1
                        global.db.data.users[who].wood += count * 1
                        conn.reply(m.chat, `Success mentransfer wood sebig ${count}`.trim(), m)
                    } catch (e) {
                        global.db.data.users[m.sender].wood += count * 1
                        m.reply('Failed Menstransfer')
                        console.log(e)
                        if (DevMode) {
                            for (let jid of global.owner.map(v => v.replace(/[^0-9]/g, '') + '@s.whatsapp.net').filter(v => v != conn.user.jid)) {
                                conn.reply(jid, 'Transfer.js error\nNo: *' + m.sender.split`@`[0] + '*\nCommand: *' + m.text + '*\n\n*' + e + '*', m)
                            }
                        }
                    }
                } else conn.reply(m.chat, `money you not mencukupi untuk mentransfer Kayu sebig ${count}`.trim(), m)
                break
            case 'iron':
                if (global.db.data.users[m.sender].iron >= count * 1) {
                    try {
                        global.db.data.users[m.sender].iron -= count * 1
                        global.db.data.users[who].iron += count * 1
                        conn.reply(m.chat, `Success mentransfer iron sebig ${count}`.trim(), m)
                    } catch (e) {
                        global.db.data.users[m.sender].iron += count * 1
                        m.reply('Failed Menstransfer')
                        console.log(e)
                        if (DevMode) {
                            for (let jid of global.owner.map(v => v.replace(/[^0-9]/g, '') + '@s.whatsapp.net').filter(v => v != conn.user.jid)) {
                                conn.reply(jid, 'Transfer.js error\nNo: *' + m.sender.split`@`[0] + '*\nCommand: *' + m.text + '*\n\n*' + e + '*', m)
                            }
                        }
                    }
                } else conn.reply(m.chat, `money you not mencukupi untuk mentransfer Iron sebig ${count}`.trim(), m)
                break
            default:
                return conn.reply(m.chat, `Use format ${usedPrefix}transfer <Type> <amount> <@tag>\n📍 Example Useran: *${usedPrefix}transfer money 100 @tag*\n\n*List which can di transfer*\n💹 Money\n🏷 Limit\n💳 Tabungan\n🥤 Potion\n🗑️ Sampah\n💎 Diamond\n📦 Common\n🛍️ Uncommon\n🎁 Mythic\n🧰 Legendary\n🕸️ String\n🪵 Kayu\n🪨 Batu\n⛓️ Iron`.trim(), m)
        }
    } catch (e) {
        conn.reply(m.chat, `Use format ${usedPrefix}tf <Type> <amount> <@tag>\📍 Example Useran: *${usedPrefix}tf money 100 @tag*\n\n*List which can di transfer :*\n💹 Money\n🏷 Limit\n💳 Tabungan\n🥤 Potion\n🗑️ Sampah\n💎 Diamond\n📦 Common\n🛍️ Uncommon\n🎁 Mythic\n🧰 Legendary\n🕸️ String\n🪵 Kayu\n🪨 Batu\n⛓ iron`.trim(), m)
        console.log(e)
        if (DevMode) {
            for (let jid of global.owner.map(v => v.replace(/[^0-9]/g, '') + '@s.whatsapp.net').filter(v => v != conn.user.jid)) {
                conn.reply(jid, 'Transfer.js error\nNo: *' + m.sender.split`@`[0] + '*\nCommand: *' + m.text + '*\n\n*' + e + '*', m)
            }
        }
    }
}
    
handler.help = ['transfer <Args>']
handler.tags = ['rpg']
handler.command = /^(transfer|tf)$/i
handler.owner = false
handler.mods = false
handler.premium = false
handler.group = true
handler.private = false
handler.rpg = true
handler.admin = false
handler.botAdmin = false

handler.fail = null
handler.money = 0

}

module.exports = handler

