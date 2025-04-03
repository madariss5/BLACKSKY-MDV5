const { getMessage } = require('../lib/languages');

let handler = async (m, {
	command,
	usedPrefix,
	args
}) => {
	let user = global.db.data.users[m.sender]
	let author = global.author
	let upgrd = (args[0] || '').toLowerCase()
    let Type = (args[0] || '').toLowerCase()
    let _type = (args[1] || '').toLowerCase()
    let jualbeli = (args[0] || '').toLowerCase()
    const list = `「 *E A T I N G* 」
╭──『 ғᴏᴏᴅ 』
│⬡ typing command↓
│   ${usedPrefix + command } rendang
│
│⬡ 🍖 *Ayambakar* : ${user.ayambakar}
│⬡ 🍗 *Ayamgoreng* : ${user.ayamgoreng}
│⬡ 🥘 *Rendang* : ${user.rendang}
│⬡ 🥩 *Steak* : ${user.steak}
│⬡ 🥠 *Babipanggang* : ${user.babipanggang}
│⬡ 🍲 *Gulaiayam* : ${user.gulai}
│⬡ 🍜 *Oporayam* : ${user.oporayam}
│⬡ 🍷 *Vodka* : ${user.vodka}
│⬡ 🍣 *Sushi* : ${user.sushi}
│⬡ 💉 *Byouge* : ${user.byouge}
│⬡ ☘️ *Ganja* : ${user.ganja}
│⬡ 🍺 *Soda* : ${user.soda}
│⬡  🍞 *Roti* : ${user.roti}
│⬡ 🍖 *ikan bakar* : ${user.ikanbakar}
│⬡ 🍖 *lele bakar* : ${user.lelebakar}
│⬡ 🍖 *nila bakar* : ${user.nilabakar}
│⬡ 🍖 *bawal bakar* : ${user.bawalbakar}
│⬡ 🍖 *udang bakar* : ${user.udangbakar}
│⬡ 🍖 *paus bakar* : ${user.pausbakar}
│⬡ 🍖 *kepiting bakar* : ${user.kepitingbakar}
╰───────────────
• *Example :* .eat ayamgoreng 

gunwill spasi
`.trim()
    //try {
    if (/eat|eat/i.test(command)) {
      const count = args[1] && args[1].length > 0 ? Math.min(99999999, Math.max(parseInt(args[1]), 1)) : !args[1] || args.length < 3 ? 1 : Math.min(1, count)
        switch (Type) {
          case 'ayamgoreng':
        if (user.stamina < 100) {
        	if (user.ayamgoreng >= count * 1) {
                            user.ayamgoreng -= count * 1
                            user.stamina += 20 * count
                            conn.reply(m.chat, `Nyam nyam`, m)
                            } else conn.reply(m.chat, ` Ayam goreng you lacking` ,m)
        } else conn.reply( m.chat, `stamina you already full`, m)
        break
        case 'ayambakar':
        if (user.stamina < 100) {
        	if (user.ayambakar >= count * 1) {
                            user.ayambakar -= count * 1
                            user.stamina += 20 * count
                            conn.reply(m.chat, `Nyam nyam`, m)
                            } else conn.reply(m.chat, ` Ayam bakar you lacking` ,m)
        } else conn.reply( m.chat, `stamina you already full`, m)
        break
        case 'oporayam':
        if (user.stamina < 100) {
        	if (user.oporayam >= count * 1) {
                            user.oporayam -= count * 1
                            user.stamina += 20 * count
                            conn.reply(m.chat, `Nyam nyam`, m)
                            } else conn.reply(m.chat, ` Opor ayam you lacking` ,m)
        } else conn.reply( m.chat, `stamina you already full`, m)
        break
        case 'rendang':
        if (user.stamina < 100) {
        	if (user.rendang >= count * 1) {
                            user.rendang -= count * 1
                            user.stamina += 20 * count
                            conn.reply(m.chat, `Nyam nyam`, m)
                            } else conn.reply(m.chat, ` Rendang you lacking` ,m)
        } else conn.reply( m.chat, `stamina you already full`, m)
        break
        case 'steak':
        if (user.stamina < 100) {
        	if (user.steak >= count * 1) {
                            user.steak -= count * 1
                            user.stamina += 20 * count
                            conn.reply(m.chat, `Nyam nyam`, m)
                            } else conn.reply(m.chat, ` Steak you lacking` ,m)
        } else conn.reply( m.chat, `stamina you already full`, m)
        break
        case 'gulaiayam':
        if (user.stamina < 100) {
        	if (user.gulai >= count * 1) {
                            user.gulai -= count * 1
                            user.stamina += 20 * count
                            conn.reply(m.chat, `Nyam nyam`, m)
                            } else conn.reply(m.chat, ` Gulai ayam you lacking` ,m)
        } else conn.reply( m.chat, `stamina you already full`, m)
        break
        case 'babipanggang':
        if (user.stamina < 100) {
        	if (user.babipanggang >= count * 1) {
                            user.babipanggang -= count * 1
                            user.stamina += 20 * count
                            conn.reply(m.chat, `Nyam nyam`, m)
                            } else conn.reply(m.chat, ` Babi panggang you lacking` ,m)
        } else conn.reply( m.chat, `stamina you already full`, m)
        break
        case 'soda':
        if (user.stamina < 100) {
        	if (user.soda >= count * 1) {
                            user.soda -= count * 1
                            user.stamina += 20 * count
                            conn.reply(m.chat, `Glek glek glek`, m)
                            } else conn.reply(m.chat, ` Soda you lacking` ,m)
        } else conn.reply( m.chat, `stamina you already full`, m)
        break
        case 'vodka':
        if (user.stamina < 100) {
        	if (user.vodka >= count * 1) {
                            user.vodka -= count * 1
                            user.stamina += 25 * count
                            conn.reply(m.chat, `Glek Glek Glek`, m)
                            } else conn.reply(m.chat, ` Vodka you lacking` ,m)
        } else conn.reply( m.chat, `stamina you already full`, m)
        break
        case 'ganja':
        if (user.stamina < 100) {
        	if (user.ganja >= count * 1) {
                            user.ganja -= count * 1
                            user.healt += 90 * count
                            conn.reply(m.chat, `ngefly`, m)
                            } else conn.reply(m.chat, ` Ganja you lacking` ,m)
        } else conn.reply( m.chat, `stamina you already full`, m)
        break
        case 'byouge':
        if (user.stamina < 100) {
        	if (user.bandage >= count * 1) {
                            user.bandage -= count * 1
                            user.healt += 25 * count
                            conn.reply(m.chat, `Sretset`, m)
                            } else conn.reply(m.chat, ` Byouge you lacking` ,m)
        } else conn.reply( m.chat, `Healt you already full`, m)
        break
        case 'sushi':
        if (user.stamina < 100) {
        	if (user.sushi >= count * 1) {
                            user.sushi -= count * 1
                            user.stamina += 20 * count
                            conn.reply(m.chat, `Nyam nyam`, m)
                            } else conn.reply(m.chat, ` Sushi you lacking` ,m)
        } else conn.reply( m.chat, `stamina you already full`, m)
        break
        break
        case 'roti':
        if (user.stamina < 100) {
        	if (user.roti >= count * 1) {
                            user.roti -= count * 1
                            user.stamina += 20 * count
                            conn.reply(m.chat, `Nyam nyam`, m)
                            } else conn.reply(m.chat, ` Roti you lacking` ,m)
        } else conn.reply( m.chat, `stamina you already full`, m)
        break
        case 'ikanbakar':
        if (user.stamina < 100) {
        	if (user.ikanbakar >= count * 1) {
                            user.ikanbakar -= count * 1
                            user.stamina += 20 * count
                            conn.reply(m.chat, `Nyam nyam`, m)
                            } else conn.reply(m.chat, ` ikan bakar you lacking` ,m)
        } else conn.reply( m.chat, `stamina you already full`, m)
        break
        case 'lelebakar':
        if (user.stamina < 100) {
        	if (user.lelebakar >= count * 1) {
                            user.lelebakar -= count * 1
                            user.stamina += 20 * count
                            conn.reply(m.chat, `Nyam nyam`, m)
                            } else conn.reply(m.chat, ` lele bakar you lacking` ,m)
        } else conn.reply( m.chat, `stamina you already full`, m)
        break
        case 'nilabakar':
        if (user.stamina < 100) {
        	if (user.nilabakar >= count * 1) {
                            user.nilabakar -= count * 1
                            user.stamina += 20 * count
                            conn.reply(m.chat, `Nyam nyam`, m)
                            } else conn.reply(m.chat, ` nila bakar you lacking` ,m)
        } else conn.reply( m.chat, `stamina you already full`, m)
        break
        case 'bawalbakar':
        if (user.stamina < 100) {
        	if (user.bawalbakar >= count * 1) {
                            user.bawalbakar -= count * 1
                            user.stamina += 20 * count
                            conn.reply(m.chat, `Nyam nyam`, m)
                            } else conn.reply(m.chat, ` bawal bakar you lacking` ,m)
        } else conn.reply( m.chat, `stamina you already full`, m)
        break
        case 'udangbakar':
        if (user.stamina < 100) {
        	if (user.udangbakar >= count * 1) {
                            user.udangbakar -= count * 1
                            user.stamina += 20 * count
                            conn.reply(m.chat, `Nyam nyam`, m)
                            } else conn.reply(m.chat, ` udang bakar you lacking` ,m)
        } else conn.reply( m.chat, `stamina you already full`, m)
        break
        case 'pausbakar':
        if (user.stamina < 100) {
        	if (user.pausbakar >= count * 1) {
                            user.pausbakar -= count * 1
                            user.stamina += 20 * count
                            conn.reply(m.chat, `Nyam nyam`, m)
                            } else conn.reply(m.chat, ` paus bakar you lacking` ,m)
        } else conn.reply( m.chat, `stamina you already full`, m)
        break
        case 'kepitingbakar':
        if (user.stamina < 100) {
        	if (user.kepitingbakar >= count * 1) {
                            user.kepitingbakar -= count * 1
                            user.stamina += 20 * count
                            conn.reply(m.chat, `Nyam nyam`, m)
                            } else conn.reply(m.chat, ` kepiting bakar you lacking` ,m)
        } else conn.reply( m.chat, `stamina you already full`, m)
        break
          default:
       await conn.reply(m.chat, list, m)
            }
    } else if (/p/i.test(command)) {
      const count = args[2] && args[2].length > 0 ? Math.min(99999999, Math.max(parseInt(args[2]), 1)) : !args[2] || args.length < 4 ? 1 :Math.min(1, count)
      switch (_type) {
        case 'p':
         break
         default:
		return conn.reply(m.chat, list,m)
         }
                            
        console.log(e)
        if (DevMode) {
            for (let jid of global.owner.map(v => v.replace(/[^0-9]/g, '') + '@s.whatsapp.net').filter(v => v != conn.user.jid)) {
            conn.reply(jid, 'shop.js error\nNo: *' + m.sender.split`@`[0] + '*\nCommand: *' + m.text + '*\n\n*' + e + '*',m)
                
            }
        }
    }
}

handler.help = ['eat', 'eat']
handler.tags = ['rpg']
handler.register = true
handler.command = /^(eat|eat)$/i
handler.rpg = true
module.exports = handler