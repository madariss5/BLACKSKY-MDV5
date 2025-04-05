const { getMessage } = require('../lib/languages');

let handler = async (m, {
        command,
        usedPrefix,
        DevMode,
        args
}) => {
        let Type = (args[0] || '').toLowerCase()
    let msk = (args[0] || '').toLowerCase()
    let user = global.db.data.users[m.sender]
    let author = global.author
let cok = `「 *C O O K I N G* 」


▧ roasted chicken 🍖
〉Need 2 chicken 🐓 & 1 Coal 🕳️
▧ fried chicken 🍗
〉Need 2 chicken 🐓 & 1 Coal 🕳️
▧ chicken soup 🍜
〉Need 2 chicken 🐓 & 1 Coal 🕳️
▧ steak 🥩
〉Need 2 cow 🐮 & 1 Coal 🕳️
▧ beef rendang 🥘
〉Need 2 cow 🐮 & 1 Coal 🕳️
▧ chicken curry 🍲
〉Need 2 chicken 🐓 & 1 Coal 🕳️
▧ roasted pork 🥠
〉Need 2 pig 🐖 & 1 Coal 🕳️
▧ grilled fish 🐟
〉Need 2 fish 🐟 & 1 Coal 🕳️
▧ grilled catfish 🐟
〉Need 2 catfish 🐟 & 1 Coal 🕳️
▧ grilled tilapia 🐟
〉Need 2 tilapia 🐟 & 1 Coal 🕳️
▧ grilled pomfret 🐟
〉Need 2 pomfret 🐟 & 1 Coal 🕳️
▧ grilled shrimp 🦐
〉Need 2 shrimp 🦐 & 1 Coal 🕳️
▧ grilled whale 🐳
〉Need 2 whale 🐳 & 1 Coal 🕳️
▧ grilled crab 🦀
〉Need 2 crab 🦀 & 1 Coal 🕳️

• *Example :* .cook roastedchicken

`

try {
       if (/cook|cook/i.test(command)) {
            const count = args[1] && args[1].length > 0 ? Math.min(5, Math.max(parseInt(args[1]), 1)) : !args[1] || args.length < 3 ? 1 : Math.min(1, count)
            switch (Type) {
                case 'roastedchicken':
                case 'ayambakar': // Keep for backward compatibility
            if (user.ayam < count * 2 || user.coal < 1 * count) {
                           user.ayam >= count * 1
                            user.ayam -= count * 2
                            user.coal -= count * 1
                            user.ayambakar += count * 1
                            conn.reply(m.chat, `Successfully cooked ${count} roasted chicken 🍖`, m)
                       } else conn.reply(m.chat, `You don't have the materials to cook roasted chicken\nYou need 2 chicken and 1 coal to cook`, m)
                                        break
                                  case 'chickencurry':
                                  case 'gulaiayam': // Keep for backward compatibility
            if (user.ayam < count * 2 || user.coal < 1 * count) {
                            user.ayam >= count * 1
                            user.ayam -= count * 2
                            user.coal -= count * 1
                            user.gulai += count * 1
                            conn.reply(m.chat, `Successfully cooked ${ count } chicken curry 🍲`, m)
                       } else conn.reply(m.chat, `You don't have the materials to cook chicken curry\nYou need 2 chicken and 1 coal to cook`, m)
                                        break
                  case 'rendang':
            if (user.sapi < count * 2 || user.coal < 1 * count) {
                            user.sapi >= count * 1
                            user.sapi -= count * 2
                            user.coal -= count * 1
                            user.rendang += count * 1
                            conn.reply(m.chat, `Successfully cooked ${ count } beef rendang 🥘`, m)
                       } else conn.reply(m.chat, `You don't have the materials to cook beef rendang\nYou need 2 cow and 1 coal to cook`, m)
                                        break
                   case 'friedchicken':
                   case 'ayamgoreng': // Keep for backward compatibility
            if (user.ayam < count * 2 || user.coal < 1 * count) {
                           user.ayam >= count * 1
                            user.ayam -= count * 2
                            user.coal -= count * 1
                            user.ayamgoreng += count * 1
                            conn.reply(m.chat, `Successfully cooked ${ count } fried chicken 🍗`, m)
                       } else conn.reply(m.chat, `You don't have the materials to cook fried chicken\nYou need 2 chicken and 1 coal to cook`, m)
                                        break
                        case 'chickensoup':
                        case 'oporayam': // Keep for backward compatibility
            if (user.ayam < count * 2 || user.coal < 1 * count) {
                          user.ayam >= count * 1
                            user.ayam -= count * 2
                            user.coal -= count * 1
                            user.oporayam += count * 1
                            conn.reply(m.chat, `Successfully cooked ${ count } chicken soup 🍜`, m)
                       } else conn.reply(m.chat, `You don't have the materials to cook chicken soup\nYou need 2 chicken and 1 coal to cook`, m)
                                        break
                        case 'steak':
            if (user.sapi < count * 2 || user.coal < 1 * count) {
                            user.sapi >= count * 1
                            user.sapi -= count * 2
                            user.coal -= count * 1
                            user.steak += count * 1
                            conn.reply(m.chat, `Successfully cooked ${ count } steak 🥩`, m)
                       } else conn.reply(m.chat, `You don't have the materials to cook steak\nYou need 2 cow and 1 coal to cook`, m)
                                break
             case 'roastedpork':
             case 'babipanggang': // Keep for backward compatibility
            if (user.babi < count * 2 || user.coal < 1 * count) {
                            user.babi >= count * 1
                            user.babi -= count * 2
                            user.coal -= count * 1
                            user.babipanggang += count * 1
                            conn.reply(m.chat, `Successfully cooked ${ count } roasted pork 🥠`, m)
                       } else conn.reply(m.chat, `You don't have the materials to cook roasted pork\nYou need 2 pig and 1 coal to cook`, m)
                                break
                                case 'grilledfish':
                                case 'ikanbakar': // Keep for backward compatibility
            if (user.ikan < count * 2 || user.coal < 1 * count) {
                           user.ikan >= count * 1
                            user.ikan -= count * 2
                            user.coal -= count * 1
                            user.ikanbakar += count * 1
                            conn.reply(m.chat, `Successfully cooked ${count} grilled fish 🍖`, m)
                       } else conn.reply(m.chat, `You don't have the materials to cook grilled fish\nYou need 2 fish and 1 coal to cook`, m)
                                        break
                                        case 'lelebakar':
            if (user.lele < count * 2 || user.coal < 1 * count) {
                           user.lele >= count * 1
                            user.lele -= count * 2
                            user.coal -= count * 1
                            user.lelebakar += count * 1
                            conn.reply(m.chat, `Successfully cooked ${count} grilled catfish 🐟`, m)
                       } else conn.reply(m.chat, `You don't have the materials to cook grilled catfish\nYou need 2 catfish and 1 coal to cook`, m)
                                        break
                                        case 'nilabakar':
            if (user.nila < count * 2 || user.coal < 1 * count) {
                           user.nila >= count * 1
                            user.nila -= count * 2
                            user.coal -= count * 1
                            user.nilabakar += count * 1
                            conn.reply(m.chat, `Successfully cooked ${count} grilled tilapia 🐟`, m)
                       } else conn.reply(m.chat, `You don't have the materials to cook grilled tilapia\nYou need 2 tilapia and 1 coal to cook`, m)
                                        break
                                        case 'bawalbakar':
            if (user.bawal < count * 2 || user.coal < 1 * count) {
                           user.bawal >= count * 1
                            user.bawal -= count * 2
                            user.coal -= count * 1
                            user.bawalbakar += count * 1
                            conn.reply(m.chat, `Successfully cooked ${count} grilled pomfret 🐟`, m)
                       } else conn.reply(m.chat, `You don't have the materials to cook grilled pomfret\nYou need 2 pomfret and 1 coal to cook`, m)
                                        break
                                        case 'udangbakar':
            if (user.udang < count * 2 || user.coal < 1 * count) {
                           user.udang >= count * 1
                            user.udang -= count * 2
                            user.coal -= count * 1
                            user.udangbakar += count * 1
                            conn.reply(m.chat, `Successfully cooked ${count} grilled shrimp 🦐`, m)
                       } else conn.reply(m.chat, `You don't have the materials to cook grilled shrimp\nYou need 2 shrimp and 1 coal to cook`, m)
                                        break
                                        case 'pausbakar':
            if (user.paus < count * 2 || user.coal < 1 * count) {
                           user.paus >= count * 1
                            user.paus -= count * 2
                            user.coal -= count * 1
                            user.pausbakar += count * 1
                            conn.reply(m.chat, `Successfully cooked ${count} grilled whale 🐳`, m)
                       } else conn.reply(m.chat, `You don't have the materials to cook grilled whale\nYou need 2 whale and 1 coal to cook`, m)
                                        break
                                        case 'kepitingbakar':
            if (user.kepiting < count * 2 || user.coal < 1 * count) {
                           user.kepiting >= count * 1
                            user.kepiting -= count * 2
                            user.coal -= count * 1
                            user.kepitingbakar += count * 1
                            conn.reply(m.chat, `Successfully cooked ${count} grilled crab 🦀`, m)
                       } else conn.reply(m.chat, `You don't have the materials to cook grilled crab\nYou need 2 crab and 1 coal to cook`, m)
                                        break
                default:
                await conn.reply(m.chat, cok, m)
        
        //              })
            }
        }
    } catch (e) {
        conn.reply(m.chat, `There seems to be an error, please report it to the owner`, m)
        console.log(e)
        if (DevMode) {
            for (let jid of global.owner.map(v => v.replace(/[^0-9]/g, '') + '@s.whatsapp.net').filter(v => v != conn.user.jid)) {
                conn.reply(jid, 'shop.js error\nNo: *' + m.sender.split`@`[0] + '*\nCommand: *' + m.text + '*\n\n*' + e + '*', MessageType.text)
            }
        }
    }
}

handler.help = ['cook <food> <amount>', 'cook <food> <amount>']
handler.tags = ['rpg']
handler.group = true
handler.command = /^(cook|cook)$/i
handler.rpg = true
module.exports = handler