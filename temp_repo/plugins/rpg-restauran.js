const { getMessage } = require('../lib/languages');
const Hab = 20000
const Hag = 15000
const Hr = 15000
const Hs = 20000
const Hbp = 50000
const Hga = 15000
const Hoa = 15000
const Hv = 50000
const Hsu = 30000
const Hb = 20000
const Hg = 100000
const Hso = 50000
const Hro = 10000
const Hib = 15000
const Hlb = 15000
const Hnb = 15000
const Hbb = 15000
const Hub = 15000
const Hpb = 200000
const Hkb = 20000
let handler  = async (m, { conn, command, args, usedPrefix, DevMode }) => {
    const _armor = global.db.data.users[m.sender].armor
    const armor = (_armor == 0 ? 20000 : '' || _armor == 1 ? 49999 : '' || _armor == 2 ? 99999 : '' || _armor == 3 ? 149999 : '' || _armor == 4 ? 299999 : '')
    let Type = (args[0] || '').toLowerCase()
    let _type = (args[1] || '').toLowerCase()
    let jualbuy = (args[0] || '').toLowerCase()
    const Kchat = `━━━━━━━━━━━━━━━━━\n
╭──『 ғᴏᴏᴅ 』
│⬡ *ayambakar* : ${Hab}
│⬡ *ayamgoreng* : ${Hag} 
│⬡ *rendang* : ${Hr} 
│⬡ *steak* : ${Hs} 
│⬡ *babipanggang* : ${Hbp} 
│⬡ *gulaiayam* : ${Hga} 
│⬡ *oporayam* : ${Hoa} 
│⬡ *vodka* : ${Hv} 
│⬡ *sushi* : ${Hsu} 
│⬡ *byouge* : ${Hb} 
│⬡ *ganja* : ${Hg} 
│⬡ *soda* : ${Hso} 
│⬡  *roti* : ${Hro}
│⬡ *ikanbakar* : ${Hib}
│⬡ *lelebakar* : ${Hlb}
│⬡ *nilabakar* : ${Hnb}
│⬡ *bawalbakar* : ${Hbb}
│⬡ *udangbakar* : ${Hub}
│⬡ *pausbakar* : ${Hpb}
│⬡ *kepitingbakar* : ${Hkb}
╰───────────────
━━━━━━━━━━━━━━━━━

> *Example pembuyan :*
#resto buy food amount
#resto buy ayambakar 2
`.trim()
    try {
        if (/resto/i.test(command)) {
            const count = args[2] && args[2].length > 0 ? Math.min(99999999, Math.max(parseInt(args[2]), 1)) : !args[2] || args.length < 4 ? 1 :Math.min(1, count)
            const sampah = global.db.data.users[m.sender].sampah
            switch (jualbuy) {
            case 'buy':
                switch (_type) {
                    case 'ayambakar':
                            if (global.db.data.users[m.sender].money >= Hab * count) {
                                global.db.data.users[m.sender].money -= Hab * count
                                global.db.data.users[m.sender].ayambakar += count * 1
                                conn.reply(m.chat, `Succes membuy ${count} Ayam Bakar dengan harga ${Hab * count} money`, m)
                            } else conn.reply(m.chat, `Money Tidak enough`,)
                        break
                    case 'ayamgoreng':
                            if (global.db.data.users[m.sender].money >= Hag * count) {
                                global.db.data.users[m.sender].ayamgoreng += count * 1
                                global.db.data.users[m.sender].money -= Hag * count
                                conn.reply(m.chat, `Succes membuy ${count} Ayam Goreng dengan harga ${Hag * count} money`, m)
                            } else conn.reply(m.chat, `Money you not enough`, m)                       
                        break
                    case 'rendang':
                            if (global.db.data.users[m.sender].money >= Hr * count) {
                                global.db.data.users[m.sender].rendang += count * 1
                                global.db.data.users[m.sender].money -= Hr * count
                                conn.reply(m.chat, `Succes membuy ${count} Rendang dengan harga ${Hr * count} money`, m)
                            } else conn.reply(m.chat, `Money you not enough`, m)                       
                        break
                    case 'steak':
                            if (global.db.data.users[m.sender].money >= Hs * count) {
                                global.db.data.users[m.sender].steak += count * 1
                                global.db.data.users[m.sender].money -= Hs * count
                                conn.reply(m.chat, `Succes membuy ${count} Steak dengan harga ${Hs * count} money`, m)
                            } else conn.reply(m.chat, `Money you not enough`, m)                       
                        break
                   case 'babipanggang':
                            if (global.db.data.users[m.sender].money >= Hbp * count) {
                                global.db.data.users[m.sender].babipanggang += count * 1
                                global.db.data.users[m.sender].money -= Hbp * count
                                conn.reply(m.chat, `Succes membuy ${count} Babi Panggang dengan harga ${Hbp * count} money`, m)
                            } else conn.reply(m.chat, `Money you not enough`, m)                       
                        break
                   case 'gulaiayam':
                            if (global.db.data.users[m.sender].money >= Hga * count) {
                                global.db.data.users[m.sender].money -= Hga * count
                                global.db.data.users[m.sender].gulai += count * 1
                                conn.reply(m.chat, `Succes membuy ${count} Gulai Ayam dengan harga ${Hga * count} money`, m)
                            } else conn.reply(m.chat, `Money Tidak enough`,)
                        break
                    case 'oporayam':
                            if (global.db.data.users[m.sender].money >= Hoa * count) {
                                global.db.data.users[m.sender].oporayam += count * 1
                                global.db.data.users[m.sender].money -= Hoa * count
                                conn.reply(m.chat, `Succes membuy ${count} Opor Ayam dengan harga ${Hoa * count} money`, m)
                            } else conn.reply(m.chat, `Money you not enough`, m)                       
                        break
                    case 'vodka':
                            if (global.db.data.users[m.sender].money >= Hv * count) {
                                global.db.data.users[m.sender].vodka += count * 1
                                global.db.data.users[m.sender].money -= Hv * count
                                conn.reply(m.chat, `Succes membuy ${count} Vodka dengan harga ${Hv * count} money`, m)
                            } else conn.reply(m.chat, `Money you not enough`, m)                       
                        break
                    case 'sushi':
                            if (global.db.data.users[m.sender].money >= Hsu * count) {
                                global.db.data.users[m.sender].sushi += count * 1
                                global.db.data.users[m.sender].money -= Hsu * count
                                conn.reply(m.chat, `Succes membuy ${count} Sushi dengan harga ${Hsu * count} money`, m)
                            } else conn.reply(m.chat, `Money you not enough`, m)                       
                        break
                   case 'byouge':
                            if (global.db.data.users[m.sender].money >= Hb * count) {
                                global.db.data.users[m.sender].bandage += count * 1
                                global.db.data.users[m.sender].money -= Hb * count
                                conn.reply(m.chat, `Succes membuy ${count} Byouge dengan harga ${Hb * count} money`, m)
                            } else conn.reply(m.chat, `Money you not enough`, m)                       
                        break
                   case 'ganja':
                            if (global.db.data.users[m.sender].money >= Hg * count) {
                                global.db.data.users[m.sender].money -= Hg * count
                                global.db.data.users[m.sender].ganja += count * 1
                                conn.reply(m.chat, `Succes membuy ${count} Ganja dengan harga ${Hg * count} money`, m)
                            } else conn.reply(m.chat, `Money Tidak enough`,)
                        break
                    case 'soda':
                            if (global.db.data.users[m.sender].money >= Hso * count) {
                                global.db.data.users[m.sender].soda += count * 1
                                global.db.data.users[m.sender].money -= Hso * count
                                conn.reply(m.chat, `Succes membuy ${count} Soda dengan harga ${Hso * count} money`, m)
                            } else conn.reply(m.chat, `Money you not enough`, m)                       
                        break
                    case 'roti':
                            if (global.db.data.users[m.sender].money >= Hro * count) {
                                global.db.data.users[m.sender].roti += count * 1
                                global.db.data.users[m.sender].money -= Hro * count
                                conn.reply(m.chat, `Succes membuy ${count} Roti dengan harga ${Hro * count} money`, m)
                            } else conn.reply(m.chat, `Money you not enough`, m)                       
                        break
                    case 'ikanbakar':
                            if (global.db.data.users[m.sender].money >= Hib * count) {
                                global.db.data.users[m.sender].ikanbakar += count * 1
                                global.db.data.users[m.sender].money -= Hib * count
                                conn.reply(m.chat, `Succes membuy ${count} Ikan Bakar dengan harga ${Hib * count} money`, m)
                            } else conn.reply(m.chat, `Money you not enough`, m)                       
                        break
                   case 'lelebakar':
                            if (global.db.data.users[m.sender].money >= Hlb * count) {
                                global.db.data.users[m.sender].lelebakar += count * 1
                                global.db.data.users[m.sender].money -= Hlb * count
                                conn.reply(m.chat, `Succes membuy ${count} Lele Bakar dengan harga ${Hlb * count} money`, m)
                            } else conn.reply(m.chat, `Money you not enough`, m)                       
                        break
                   case 'nilabakar':
                            if (global.db.data.users[m.sender].money >= Hnb * count) {
                                global.db.data.users[m.sender].money -= Hnb * count
                                global.db.data.users[m.sender].nilabakar += count * 1
                                conn.reply(m.chat, `Succes membuy ${count} Nila Bakar dengan harga ${Hnb * count} money`, m)
                            } else conn.reply(m.chat, `Money Tidak enough`,)
                        break
                    case 'bawalbakar':
                            if (global.db.data.users[m.sender].money >= Hbb * count) {
                                global.db.data.users[m.sender].bawalbakar += count * 1
                                global.db.data.users[m.sender].money -= Hbb * count
                                conn.reply(m.chat, `Succes membuy ${count} Bawal Bakar dengan harga ${Hbb * count} money`, m)
                            } else conn.reply(m.chat, `Money you not enough`, m)                       
                        break
                    case 'udangbakar':
                            if (global.db.data.users[m.sender].money >= Hub * count) {
                                global.db.data.users[m.sender].udangbakar += count * 1
                                global.db.data.users[m.sender].money -= Hub * count
                                conn.reply(m.chat, `Succes membuy ${count} Udang Bakar dengan harga ${Hub * count} money`, m)
                            } else conn.reply(m.chat, `Money you not enough`, m)                       
                        break
                    case 'pausbakar':
                            if (global.db.data.users[m.sender].money >= Hpb * count) {
                                global.db.data.users[m.sender].pausbakar += count * 1
                                global.db.data.users[m.sender].money -= Hpb * count
                                conn.reply(m.chat, `Succes membuy ${count} Paus Bakar dengan harga ${Hpb * count} money`, m)
                            } else conn.reply(m.chat, `Money you not enough`, m)                       
                        break
                   case 'kepitingbakar':
                            if (global.db.data.users[m.sender].money >= Hkb * count) {
                                global.db.data.users[m.sender].kepitingbakar += count * 1
                                global.db.data.users[m.sender].money -= Hkb * count
                                conn.reply(m.chat, `Succes membuy ${count} Kepiting Bakar dengan harga ${Hkb * count} money`, m)
                            } else conn.reply(m.chat, `Money you not enough`, m)                       
                        break
                    default:
                        return conn.reply(m.chat, Kchat, m)
                }
                break
            /*case 'jual': 
                switch (_type) {                  
                     case 'banteng':
                        if (global.db.data.users[m.sender].banteng >= count * 1) {
                            global.db.data.users[m.sender].money += Spaus * count
                            global.db.data.users[m.sender].banteng -= count * 1
                            conn.reply(m.chat, `Sukses sell ${count} Banteng Dengan Harga ${Sbanteng * count} Money `.trim(), m)
                        } else conn.reply(m.chat, `Banteng Kamu Tidak enough`.trim(), m)
                        break
                        case 'daysmau':
                        if (global.db.data.users[m.sender].daysmau >= count * 1) {
                            global.db.data.users[m.sender].money += Sdaysmau * count
                            global.db.data.users[m.sender].daysmau -= count * 1
                            conn.reply(m.chat, `Sukses sell ${count} daysmau Dengan Harga ${Sdaysmau * count} Money `.trim(), m)
                        } else conn.reply(m.chat, `daysmau Kamu Tidak enough`.trim(), m)
                        break
                        case 'gajah':
                        if (global.db.data.users[m.sender].gajah >= count * 1) {
                            global.db.data.users[m.sender].money += Sgajah * count
                            global.db.data.users[m.sender].gajah -= count * 1
                            conn.reply(m.chat, `Sukses sell ${count} Gajah Dengan Harga ${Sgajah * count} Money `.trim(), m)
                        } else conn.reply(m.chat, `Gajah Kamu Tidak enough`.trim(), m)
                        break
                        case 'kambing':
                        if (global.db.data.users[m.sender].kambing >= count * 1) {
                            global.db.data.users[m.sender].money += Skambing * count
                            global.db.data.users[m.sender].kambing -= count * 1
                            conn.reply(m.chat, `Sukses sell ${count} Kambing Dengan Harga ${Skambing * count} Money `.trim(), m)
                        } else conn.reply(m.chat, `Kambing Kamu Tidak enough`.trim(), m)
                        break
                        case 'pyou':
                        if (global.db.data.users[m.sender].pyou >= count * 1) {
                            global.db.data.users[m.sender].money += Spyou * count
                            global.db.data.users[m.sender].pyou -= count * 1
                            conn.reply(m.chat, `Sukses sell ${count} Pyou Dengan Harga ${Sbuaya * count} Money `.trim(), m)
                        } else conn.reply(m.chat, `Pyou Kamu Tidak enough`.trim(), m)
                        break
                        case 'buaya':
                        if (global.db.data.users[m.sender].buaya >= count * 1) {
                            global.db.data.users[m.sender].money += Sbuaya * count
                            global.db.data.users[m.sender].buaya -= count * 1
                            conn.reply(m.chat, `Sukses sell ${count} Buaya Dengan Harga ${Sbuaya * count} Money `.trim(), m)
                        } else conn.reply(m.chat, `Buaya Kamu Tidak enough`.trim(), m)
                        break
                        case 'kerbau':
                        if (global.db.data.users[m.sender].kerbau >= count * 1) {
                            global.db.data.users[m.sender].money += Skerbau * count
                            global.db.data.users[m.sender].kerbau -= count * 1
                            conn.reply(m.chat, `Sukses sell ${count} Kerbau Dengan Harga ${Skerbau * count} Money `.trim(), m)
                        } else conn.reply(m.chat, `Kerbau Kamu Tidak enough`.trim(), m)
                        break
                        case 'sapi':
                        if (global.db.data.users[m.sender].sapi >= count * 1) {
                            global.db.data.users[m.sender].money += Ssapi * count
                            global.db.data.users[m.sender].sapi -= count * 1
                            conn.reply(m.chat, `Sukses sell ${count} Sapi Dengan Harga ${Ssapi * count} Money `.trim(), m)
                        } else conn.reply(m.chat, `Sapi Kamu Tidak enough`.trim(), m)
                        break
                        case 'monyet':
                        if (global.db.data.users[m.sender].monyet >= count * 1) {
                            global.db.data.users[m.sender].money += Smonyet * count
                            global.db.data.users[m.sender].monyet -= count * 1
                            conn.reply(m.chat, `Sukses sell ${count} Monyet Dengan Harga ${Smonyet * count} Money `.trim(), m)
                        } else conn.reply(m.chat, `Monyet Kamu Tidak enough`.trim(), m)
                        break
                        case 'babi':
                        if (global.db.data.users[m.sender].babi >= count * 1) {
                            global.db.data.users[m.sender].money += Skepiting * count
                            global.db.data.users[m.sender].babi -= count * 1
                            conn.reply(m.chat, `Sukses sell ${count} Babi Dengan Harga ${Sbabi * count} Money `.trim(), m)
                        } else conn.reply(m.chat, `Babi Kamu Tidak enough`.trim(), m)
                        break
                        case 'babiforest':
                        if (global.db.data.users[m.sender].babiforest >= count * 1) {
                            global.db.data.users[m.sender].money += Sbabiforest * count
                            global.db.data.users[m.sender].babiforest -= count * 1
                            conn.reply(m.chat, `Sukses sell ${count} Babi forest Dengan Harga ${Sbabiforest * count} Money `.trim(), m)
                        } else conn.reply(m.chat, `Babi forest Kamu Tidak enough`.trim(), m)
                        break
                        case 'ayam':
                        if (global.db.data.users[m.sender].ayam >= count * 1) {
                            global.db.data.users[m.sender].money += Sayam * count
                            global.db.data.users[m.sender].ayam -= count * 1
                            conn.reply(m.chat, `Sukses sell ${count} Ayam Dengan Harga ${Sayam * count} Money `.trim(), m)
                        } else conn.reply(m.chat, `Ayam Kamu Tidak enough`.trim(), m)
                        break
                        //fishing
                        case 'kepiting':
                        if (global.db.data.users[m.sender].kepiting >= count * 1) {
                            global.db.data.users[m.sender].money += Skepiting * count
                            global.db.data.users[m.sender].kepiting -= count * 1
                            conn.reply(m.chat, `Sukses sell ${count} Kepiting Dengan Harga ${Skepiting * count} Money `.trim(), m)
                        } else conn.reply(m.chat, `Kepiting Kamu Tidak enough`.trim(), m)
                        break
                        case 'ikan':
                        if (global.db.data.users[m.sender].ikan >= count * 1) {
                            global.db.data.users[m.sender].money += Skepiting * count
                            global.db.data.users[m.sender].ikan -= count * 1
                            conn.reply(m.chat, `Sukses sell ${count} Ikan Dengan Harga ${Sikan * count} Money `.trim(), m)
                        } else conn.reply(m.chat, `Ikan Kamu Tidak enough`.trim(), m)
                        break
                        case 'dory':
                        if (global.db.data.users[m.sender].dory >= count * 1) {
                            global.db.data.users[m.sender].money += Sdory * count
                            global.db.data.users[m.sender].dory -= count * 1
                            conn.reply(m.chat, `Sukses sell ${count} Ikan Dory Dengan Harga ${Sdory * count} Money `.trim(), m)
                        } else conn.reply(m.chat, `Ikan Dory Kamu Tidak enough`.trim(), m)
                        break
                        case 'gurita':
                        if (global.db.data.users[m.sender].gurita >= count * 1) {
                            global.db.data.users[m.sender].money += Skepiting * count
                            global.db.data.users[m.sender].gurita -= count * 1
                            conn.reply(m.chat, `Sukses sell ${count} Gurita Dengan Harga ${Sgurita * count} Money `.trim(), m)
                        } else conn.reply(m.chat, `Gurita Kamu Tidak enough`.trim(), m)
                        break
                        case 'buntal':
                        if (global.db.data.users[m.sender].buntal >= count * 1) {
                            global.db.data.users[m.sender].money += Sbuntal * count
                            global.db.data.users[m.sender].buntal -= count * 1
                            conn.reply(m.chat, `Sukses sell ${count} Ikan Buntal Dengan Harga ${Sbuntal * count} Money `.trim(), m)
                        } else conn.reply(m.chat, `Ikan Buntal Kamu Tidak enough`.trim(), m)
                        break
                        case 'hiu':
                        if (global.db.data.users[m.sender].hiu >= count * 1) {
                            global.db.data.users[m.sender].money += Shiu * count
                            global.db.data.users[m.sender].hiu -= count * 1
                            conn.reply(m.chat, `Sukses sell ${count} Hiu Dengan Harga ${Shiu * count} Money `.trim(), m)
                        } else conn.reply(m.chat, `Hiu Kamu Tidak enough`.trim(), m)
                        break
                        case 'orca':
                        if (global.db.data.users[m.sender].orca >= count * 1) {
                            global.db.data.users[m.sender].money += Sorca * count
                            global.db.data.users[m.sender].orca -= count * 1
                            conn.reply(m.chat, `Sukses sell ${count} Paus Orca Dengan Harga ${Sorca * count} Money `.trim(), m)
                        } else conn.reply(m.chat, `Paus Orca Kamu Tidak enough`.trim(), m)
                        break
                        case 'lumba':
                        if (global.db.data.users[m.sender].lumba >= count * 1) {
                            global.db.data.users[m.sender].money += Skepiting * count
                            global.db.data.users[m.sender].lumba -= count * 1
                            conn.reply(m.chat, `Sukses sell ${count} Lumba Lumba Dengan Harga ${Slumba * count} Money `.trim(), m)
                        } else conn.reply(m.chat, `Lumba Lumba Kamu Tidak enough`.trim(), m)
                        break
                        case 'paus':
                        if (global.db.data.users[m.sender].paus >= count * 1) {
                            global.db.data.users[m.sender].money += Spaus * count
                            global.db.data.users[m.sender].paus -= count * 1
                            conn.reply(m.chat, `Sukses sell ${count} Paus Dengan Harga ${Spaus * count} Money `.trim(), m)
                        } else conn.reply(m.chat, `Paus Kamu Tidak enough`.trim(), m)
                        break
                  case 'lobster':
                        if (global.db.data.users[m.sender].lobster >= count * 1) {
                            global.db.data.users[m.sender].money += Slobster * count
                            global.db.data.users[m.sender].lobster -= count * 1
                            conn.reply(m.chat, `Sukses sell ${count} Lobster Dengan Harga ${Slobster * count} Money `.trim(), m)
                        } else conn.reply(m.chat, `Lobster Kamu Tidak enough`.trim(), m)
                        break
                     case 'udang':
                        if (global.db.data.users[m.sender].udang >= count * 1) {
                            global.db.data.users[m.sender].money += Sudang * count
                            global.db.data.users[m.sender].udang -= count * 1
                            conn.reply(m.chat, `Sukses sell ${count} Udang Dengan Harga ${Sudang * count} Money `.trim(), m)
                        } else conn.reply(m.chat, `Udang Kamu Tidak enough`.trim(), m)
                        break
                      case 'cumi':
                        if (global.db.data.users[m.sender].cumi >= count * 1) {
                            global.db.data.users[m.sender].money += Scumi * count
                            global.db.data.users[m.sender].cumi -= count * 1
                            conn.reply(m.chat, `Sukses sell ${count} Cumi Dengan Harga ${Scumi * count} Money `.trim(), m)
                        } else conn.reply(m.chat, `Cumi Kamu Tidak enough`.trim(), m)
                        break
                    default:
                        return conn.reply(m.chat, Kchat, m)
                }
                break*/
            default:
                return conn.sendFile(m.chat, thumb, 'market.jpg', `${Kchat}`, m)
            }
        } else if (/buy/i.test(command)) {
            const count = args[1] && args[1].length > 0 ? Math.min(99999999, Math.max(parseInt(args[1]), 1)) : !args[1] || args.length < 3 ? 1 : Math.min(1, count)
            switch (Type) {
                case 'ayambakar':
                            if (global.db.data.users[m.sender].money >= Hab * count) {
                                global.db.data.users[m.sender].money -= Hab * count
                                global.db.data.users[m.sender].ayambakar += count * 1
                                conn.reply(m.chat, `Succes membuy ${count} Ayam Bakar dengan harga ${Hab * count} money`, m)
                            } else conn.reply(m.chat, `Money Tidak enough`,)
                        break
                    case 'ayamgoreng':
                            if (global.db.data.users[m.sender].money >= Hag * count) {
                                global.db.data.users[m.sender].ayamgoreng += count * 1
                                global.db.data.users[m.sender].money -= Hag * count
                                conn.reply(m.chat, `Succes membuy ${count} Ayam Goreng dengan harga ${Hag * count} money`, m)
                            } else conn.reply(m.chat, `Money you not enough`, m)                       
                        break
                    case 'rendang':
                            if (global.db.data.users[m.sender].money >= Hr * count) {
                                global.db.data.users[m.sender].rendang += count * 1
                                global.db.data.users[m.sender].money -= Hr * count
                                conn.reply(m.chat, `Succes membuy ${count} Rendang dengan harga ${Hr * count} money`, m)
                            } else conn.reply(m.chat, `Money you not enough`, m)                       
                        break
                    case 'steak':
                            if (global.db.data.users[m.sender].money >= Hs * count) {
                                global.db.data.users[m.sender].steak += count * 1
                                global.db.data.users[m.sender].money -= Hs * count
                                conn.reply(m.chat, `Succes membuy ${count} Steak dengan harga ${Hs * count} money`, m)
                            } else conn.reply(m.chat, `Money you not enough`, m)                       
                        break
                   case 'babipanggang':
                            if (global.db.data.users[m.sender].money >= Hbp * count) {
                                global.db.data.users[m.sender].babipanggang += count * 1
                                global.db.data.users[m.sender].money -= Hbp * count
                                conn.reply(m.chat, `Succes membuy ${count} Babi Panggang dengan harga ${Hbp * count} money`, m)
                            } else conn.reply(m.chat, `Money you not enough`, m)                       
                        break
                   case 'gulaiayam':
                            if (global.db.data.users[m.sender].money >= Hga * count) {
                                global.db.data.users[m.sender].money -= Hga * count
                                global.db.data.users[m.sender].gulai += count * 1
                                conn.reply(m.chat, `Succes membuy ${count} Gulai Ayam dengan harga ${Hga * count} money`, m)
                            } else conn.reply(m.chat, `Money Tidak enough`,)
                        break
                    case 'oporayam':
                            if (global.db.data.users[m.sender].money >= Hoa * count) {
                                global.db.data.users[m.sender].oporayam += count * 1
                                global.db.data.users[m.sender].money -= Hoa * count
                                conn.reply(m.chat, `Succes membuy ${count} Opor Ayam dengan harga ${Hoa * count} money`, m)
                            } else conn.reply(m.chat, `Money you not enough`, m)                       
                        break
                    case 'vodka':
                            if (global.db.data.users[m.sender].money >= Hv * count) {
                                global.db.data.users[m.sender].vodka += count * 1
                                global.db.data.users[m.sender].money -= Hv * count
                                conn.reply(m.chat, `Succes membuy ${count} Vodka dengan harga ${Hv * count} money`, m)
                            } else conn.reply(m.chat, `Money you not enough`, m)                       
                        break
                    case 'sushi':
                            if (global.db.data.users[m.sender].money >= Hsu * count) {
                                global.db.data.users[m.sender].sushi += count * 1
                                global.db.data.users[m.sender].money -= Hsu * count
                                conn.reply(m.chat, `Succes membuy ${count} Sushi dengan harga ${Hsu * count} money`, m)
                            } else conn.reply(m.chat, `Money you not enough`, m)                       
                        break
                   case 'byouge':
                            if (global.db.data.users[m.sender].money >= Hb * count) {
                                global.db.data.users[m.sender].bandage += count * 1
                                global.db.data.users[m.sender].money -= Hb * count
                                conn.reply(m.chat, `Succes membuy ${count} Byouge dengan harga ${Hb * count} money`, m)
                            } else conn.reply(m.chat, `Money you not enough`, m)                       
                        break
                   case 'ganja':
                            if (global.db.data.users[m.sender].money >= Hg * count) {
                                global.db.data.users[m.sender].money -= Hg * count
                                global.db.data.users[m.sender].ganja += count * 1
                                conn.reply(m.chat, `Succes membuy ${count} Ganja dengan harga ${Hg * count} money`, m)
                            } else conn.reply(m.chat, `Money Tidak enough`,)
                        break
                    case 'soda':
                            if (global.db.data.users[m.sender].money >= Hso * count) {
                                global.db.data.users[m.sender].soda += count * 1
                                global.db.data.users[m.sender].money -= Hso * count
                                conn.reply(m.chat, `Succes membuy ${count} Soda dengan harga ${Hso * count} money`, m)
                            } else conn.reply(m.chat, `Money you not enough`, m)                       
                        break
                    case 'roti':
                            if (global.db.data.users[m.sender].money >= Hro * count) {
                                global.db.data.users[m.sender].roti += count * 1
                                global.db.data.users[m.sender].money -= Hro * count
                                conn.reply(m.chat, `Succes membuy ${count} Roti dengan harga ${Hro * count} money`, m)
                            } else conn.reply(m.chat, `Money you not enough`, m)                       
                        break
                    case 'ikanbakar':
                            if (global.db.data.users[m.sender].money >= Hib * count) {
                                global.db.data.users[m.sender].ikanbakar += count * 1
                                global.db.data.users[m.sender].money -= Hib * count
                                conn.reply(m.chat, `Succes membuy ${count} Ikan Bakar dengan harga ${Hib * count} money`, m)
                            } else conn.reply(m.chat, `Money you not enough`, m)                       
                        break
                   case 'lelebakar':
                            if (global.db.data.users[m.sender].money >= Hlb * count) {
                                global.db.data.users[m.sender].lelebakar += count * 1
                                global.db.data.users[m.sender].money -= Hlb * count
                                conn.reply(m.chat, `Succes membuy ${count} Lele Bakar dengan harga ${Hlb * count} money`, m)
                            } else conn.reply(m.chat, `Money you not enough`, m)                       
                        break
                   case 'nilabakar':
                            if (global.db.data.users[m.sender].money >= Hnb * count) {
                                global.db.data.users[m.sender].money -= Hnb * count
                                global.db.data.users[m.sender].nilabakar += count * 1
                                conn.reply(m.chat, `Succes membuy ${count} Nila Bakar dengan harga ${Hnb * count} money`, m)
                            } else conn.reply(m.chat, `Money Tidak enough`,)
                        break
                    case 'bawalbakar':
                            if (global.db.data.users[m.sender].money >= Hbb * count) {
                                global.db.data.users[m.sender].bawalbakar += count * 1
                                global.db.data.users[m.sender].money -= Hbb * count
                                conn.reply(m.chat, `Succes membuy ${count} Bawal Bakar dengan harga ${Hbb * count} money`, m)
                            } else conn.reply(m.chat, `Money you not enough`, m)                       
                        break
                    case 'udangbakar':
                            if (global.db.data.users[m.sender].money >= Hub * count) {
                                global.db.data.users[m.sender].udangbakar += count * 1
                                global.db.data.users[m.sender].money -= Hub * count
                                conn.reply(m.chat, `Succes membuy ${count} Udang Bakar dengan harga ${Hub * count} money`, m)
                            } else conn.reply(m.chat, `Money you not enough`, m)                       
                        break
                    case 'pausbakar':
                            if (global.db.data.users[m.sender].money >= Hpb * count) {
                                global.db.data.users[m.sender].pausbakar += count * 1
                                global.db.data.users[m.sender].money -= Hpb * count
                                conn.reply(m.chat, `Succes membuy ${count} Paus Bakar dengan harga ${Hpb * count} money`, m)
                            } else conn.reply(m.chat, `Money you not enough`, m)                       
                        break
                   case 'kepitingbakar':
                            if (global.db.data.users[m.sender].money >= Hkb * count) {
                                global.db.data.users[m.sender].kepitingbakar += count * 1
                                global.db.data.users[m.sender].money -= Hkb * count
                                conn.reply(m.chat, `Succes membuy ${count} Kepiting Bakar dengan harga ${Hkb * count} money`, m)
                            } else conn.reply(m.chat, `Money you not enough`, m)                       
                        break
                default:
                    return conn.reply(m.chat, Kchat, m)
            }
      /*  } else if (/sell|jual|/i.test(command)) {
            const count = args[1] && args[1].length > 0 ? Math.min(99999999, Math.max(parseInt(args[1]), 1)) : !args[1] || args.length < 3 ? 1 : Math.min(1, count)
            switch (Type) { 
                       case 'banteng':
                        if (global.db.data.users[m.sender].banteng >= count * 1) {
                            global.db.data.users[m.sender].money += Spaus * count
                            global.db.data.users[m.sender].banteng -= count * 1
                            conn.reply(m.chat, `Sukses sell ${count} Banteng Dengan Harga ${Sbanteng * count} Money `.trim(), m)
                        } else conn.reply(m.chat, `Banteng Kamu Tidak enough`.trim(), m)
                        break
                        case 'daysmau':
                        if (global.db.data.users[m.sender].daysmau >= count * 1) {
                            global.db.data.users[m.sender].money += Sdaysmau * count
                            global.db.data.users[m.sender].daysmau -= count * 1
                            conn.reply(m.chat, `Sukses sell ${count} daysmau Dengan Harga ${Sdaysmau * count} Money `.trim(), m)
                        } else conn.reply(m.chat, `daysmau Kamu Tidak enough`.trim(), m)
                        break
                        case 'gajah':
                        if (global.db.data.users[m.sender].gajah >= count * 1) {
                            global.db.data.users[m.sender].money += Sgajah * count
                            global.db.data.users[m.sender].gajah -= count * 1
                            conn.reply(m.chat, `Sukses sell ${count} Gajah Dengan Harga ${Sgajah * count} Money `.trim(), m)
                        } else conn.reply(m.chat, `Gajah Kamu Tidak enough`.trim(), m)
                        break
                        case 'kambing':
                        if (global.db.data.users[m.sender].kambing >= count * 1) {
                            global.db.data.users[m.sender].money += Skambing * count
                            global.db.data.users[m.sender].kambing -= count * 1
                            conn.reply(m.chat, `Sukses sell ${count} Kambing Dengan Harga ${Skambing * count} Money `.trim(), m)
                        } else conn.reply(m.chat, `Kambing Kamu Tidak enough`.trim(), m)
                        break
                        case 'pyou':
                        if (global.db.data.users[m.sender].pyou >= count * 1) {
                            global.db.data.users[m.sender].money += Spyou * count
                            global.db.data.users[m.sender].pyou -= count * 1
                            conn.reply(m.chat, `Sukses sell ${count} Pyou Dengan Harga ${Sbuaya * count} Money `.trim(), m)
                        } else conn.reply(m.chat, `Pyou Kamu Tidak enough`.trim(), m)
                        break
                        case 'buaya':
                        if (global.db.data.users[m.sender].buaya >= count * 1) {
                            global.db.data.users[m.sender].money += Sbuaya * count
                            global.db.data.users[m.sender].buaya -= count * 1
                            conn.reply(m.chat, `Sukses sell ${count} Buaya Dengan Harga ${Sbuaya * count} Money `.trim(), m)
                        } else conn.reply(m.chat, `Buaya Kamu Tidak enough`.trim(), m)
                        break
                        case 'kerbau':
                        if (global.db.data.users[m.sender].kerbau >= count * 1) {
                            global.db.data.users[m.sender].money += Skerbau * count
                            global.db.data.users[m.sender].kerbau -= count * 1
                            conn.reply(m.chat, `Sukses sell ${count} Kerbau Dengan Harga ${Skerbau * count} Money `.trim(), m)
                        } else conn.reply(m.chat, `Kerbau Kamu Tidak enough`.trim(), m)
                        break
                        case 'sapi':
                        if (global.db.data.users[m.sender].sapi >= count * 1) {
                            global.db.data.users[m.sender].money += Ssapi * count
                            global.db.data.users[m.sender].sapi -= count * 1
                            conn.reply(m.chat, `Sukses sell ${count} Sapi Dengan Harga ${Ssapi * count} Money `.trim(), m)
                        } else conn.reply(m.chat, `Sapi Kamu Tidak enough`.trim(), m)
                        break
                        case 'monyet':
                        if (global.db.data.users[m.sender].monyet >= count * 1) {
                            global.db.data.users[m.sender].money += Smonyet * count
                            global.db.data.users[m.sender].monyet -= count * 1
                            conn.reply(m.chat, `Sukses sell ${count} Monyet Dengan Harga ${Smonyet * count} Money `.trim(), m)
                        } else conn.reply(m.chat, `Monyet Kamu Tidak enough`.trim(), m)
                        break
                        case 'babi':
                        if (global.db.data.users[m.sender].babi >= count * 1) {
                            global.db.data.users[m.sender].money += Sbabi * count
                            global.db.data.users[m.sender].babi -= count * 1
                            conn.reply(m.chat, `Sukses sell ${count} Babi Dengan Harga ${Sbabi * count} Money `.trim(), m)
                        } else conn.reply(m.chat, `Babi Kamu Tidak enough`.trim(), m)
                        break
                        case 'babiforest':
                        if (global.db.data.users[m.sender].babiforest >= count * 1) {
                            global.db.data.users[m.sender].money += Sbabiforest * count
                            global.db.data.users[m.sender].babiforest -= count * 1
                            conn.reply(m.chat, `Sukses sell ${count} Babi forest Dengan Harga ${Sbabiforest * count} Money `.trim(), m)
                        } else conn.reply(m.chat, `Babi forest Kamu Tidak enough`.trim(), m)
                        break
                        case 'ayam':
                        if (global.db.data.users[m.sender].ayam >= count * 1) {
                            global.db.data.users[m.sender].money += Sayam * count
                            global.db.data.users[m.sender].ayam -= count * 1
                            conn.reply(m.chat, `Sukses sell ${count} Ayam Dengan Harga ${Sayam * count} Money `.trim(), m)
                        } else conn.reply(m.chat, `Ayam Kamu Tidak enough`.trim(), m)
                        break
                        //fishing
                        case 'kepiting':
                        if (global.db.data.users[m.sender].kepiting >= count * 1) {
                            global.db.data.users[m.sender].money += Skepiting * count
                            global.db.data.users[m.sender].kepiting -= count * 1
                            conn.reply(m.chat, `Sukses sell ${count} Kepiting Dengan Harga ${Skepiting * count} Money `.trim(), m)
                        } else conn.reply(m.chat, `Kepiting Kamu Tidak enough`.trim(), m)
                        break
                        case 'ikan':
                        if (global.db.data.users[m.sender].ikan >= count * 1) {
                            global.db.data.users[m.sender].money += Skepiting * count
                            global.db.data.users[m.sender].ikan -= count * 1
                            conn.reply(m.chat, `Sukses sell ${count} Ikan Dengan Harga ${Sikan * count} Money `.trim(), m)
                        } else conn.reply(m.chat, `Ikan Kamu Tidak enough`.trim(), m)
                        break
                        case 'dory':
                        if (global.db.data.users[m.sender].dory >= count * 1) {
                            global.db.data.users[m.sender].money += Sdory * count
                            global.db.data.users[m.sender].dory -= count * 1
                            conn.reply(m.chat, `Sukses sell ${count} Ikan Dory Dengan Harga ${Sdory * count} Money `.trim(), m)
                        } else conn.reply(m.chat, `Ikan Dory Kamu Tidak enough`.trim(), m)
                        break
                        case 'gurita':
                        if (global.db.data.users[m.sender].gurita >= count * 1) {
                            global.db.data.users[m.sender].money += Skepiting * count
                            global.db.data.users[m.sender].gurita -= count * 1
                            conn.reply(m.chat, `Sukses sell ${count} Gurita Dengan Harga ${Sgurita * count} Money `.trim(), m)
                        } else conn.reply(m.chat, `Gurita Kamu Tidak enough`.trim(), m)
                        break
                        case 'buntal':
                        if (global.db.data.users[m.sender].buntal >= count * 1) {
                            global.db.data.users[m.sender].money += Sbuntal * count
                            global.db.data.users[m.sender].buntal -= count * 1
                            conn.reply(m.chat, `Sukses sell ${count} Ikan Buntal Dengan Harga ${Sbuntal * count} Money `.trim(), m)
                        } else conn.reply(m.chat, `Ikan Buntal Kamu Tidak enough`.trim(), m)
                        break
                        case 'hiu':
                        if (global.db.data.users[m.sender].hiu >= count * 1) {
                            global.db.data.users[m.sender].money += Shiu * count
                            global.db.data.users[m.sender].hiu -= count * 1
                            conn.reply(m.chat, `Sukses sell ${count} Hiu Dengan Harga ${Shiu * count} Money `.trim(), m)
                        } else conn.reply(m.chat, `Hiu Kamu Tidak enough`.trim(), m)
                        break
                        case 'orca':
                        if (global.db.data.users[m.sender].orca >= count * 1) {
                            global.db.data.users[m.sender].money += Sorca * count
                            global.db.data.users[m.sender].orca -= count * 1
                            conn.reply(m.chat, `Sukses sell ${count} Paus Orca Dengan Harga ${Sorca * count} Money `.trim(), m)
                        } else conn.reply(m.chat, `Paus Orca Kamu Tidak enough`.trim(), m)
                        break
                        case 'lumba':
                        if (global.db.data.users[m.sender].lumba >= count * 1) {
                            global.db.data.users[m.sender].money += Skepiting * count
                            global.db.data.users[m.sender].lumba -= count * 1
                            conn.reply(m.chat, `Sukses sell ${count} Lumba Lumba Dengan Harga ${Slumba * count} Money `.trim(), m)
                        } else conn.reply(m.chat, `Lumba Lumba Kamu Tidak enough`.trim(), m)
                        break
                        case 'paus':
                        if (global.db.data.users[m.sender].paus >= count * 1) {
                            global.db.data.users[m.sender].money += Spaus * count
                            global.db.data.users[m.sender].paus -= count * 1
                            conn.reply(m.chat, `Sukses sell ${count} Paus Dengan Harga ${Spaus * count} Money `.trim(), m)
                        } else conn.reply(m.chat, `Paus Kamu Tidak enough`.trim(), m)
                        break
                  case 'lobster':
                        if (global.db.data.users[m.sender].lobster >= count * 1) {
                            global.db.data.users[m.sender].money += Slobster * count
                            global.db.data.users[m.sender].lobster -= count * 1
                            conn.reply(m.chat, `Sukses sell ${count} Lobster Dengan Harga ${Slobster * count} Money `.trim(), m)
                        } else conn.reply(m.chat, `Lobster Kamu Tidak enough`.trim(), m)
                        break
                     case 'udang':
                        if (global.db.data.users[m.sender].udang >= count * 1) {
                            global.db.data.users[m.sender].money += Sudang * count
                            global.db.data.users[m.sender].udang -= count * 1
                            conn.reply(m.chat, `Sukses sell ${count} Udang Dengan Harga ${Sudang * count} Money `.trim(), m)
                        } else conn.reply(m.chat, `Udang Kamu Tidak enough`.trim(), m)
                        break
                      case 'cumi':
                        if (global.db.data.users[m.sender].cumi >= count * 1) {
                            global.db.data.users[m.sender].money += Scumi * count
                            global.db.data.users[m.sender].cumi -= count * 1
                            conn.reply(m.chat, `Sukses sell ${count} Cumi Dengan Harga ${Scumi * count} Money `.trim(), m)
                        } else conn.reply(m.chat, `Cumi Kamu Tidak enough`.trim(), m)
                        break                                        
                default:
                    return conn.reply(m.chat, Kchat, m)
            }*/
        }
    } catch (e) {
        conn.reply(m.chat, Kchat, m)
        console.log(e)
        if (DevMode) {
            for (let jid of global.owner.map(v => v.replace(/[^0-9]/g, '') + '@s.whatsapp.net').filter(v => v != conn.user.jid)) {
                conn.sendMessage(jid, 'shop.js error\nNo: *' + m.sender.split`@`[0] + '*\nCommand: *' + m.text + '*\n\n*' + e + '*', MessageType.text)
            }
        }
    }
}

handler.help = ['resto *<buy> <args>*']
handler.tags = ['rpg']    

handler.command = /^(resto|buy)$/i
handler.rpg = true
module.exports = handler