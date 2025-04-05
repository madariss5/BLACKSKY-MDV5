let { MessageType } = require('@adiwajshing/baileys');
const { getMessage } = require('../lib/languages.js');
const marketTranslations = require('../market-translations')
const Scrab = 7000          // Kepiting -> Crab
const Slobster = 7000
const Sprawn = 7000         // Udang -> Prawn
const Ssquid = 7000         // Cumi -> Squid
const Soctopus = 7000       // Gurita -> Octopus
const Spufferfish = 7000    // Buntal -> Pufferfish
const Sdory = 7000
const Sorca = 7000          // Orca
const Sdolphin = 7000       // Lumba -> Dolphin
const Swhale = 7000         // Paus -> Whale
const Sfish = 7000          // Ikan -> Fish
const Sshark = 7000         // Hiu -> Shark
const Sbanteng = 9000       // Wild ox
const Stiger = 9000         // Harimau -> Tiger
const Selephant = 9000      // Gajah -> Elephant
const Sgoat = 9000          // Kambing -> Goat
const Spyou = 9000
const Scrocodile = 9000     // Buaya -> Crocodile
const Sbuffalo = 9000       // Kerbau -> Buffalo
const Scow = 9000           // Sapi -> Cow
const Smonkey = 9000        // Monyet -> Monkey
const Swildboar = 9000      // Babi hutan -> Wild Boar
const Spig = 9000           // Babi -> Pig
const Schicken = 9000       // Ayam -> Chicken
let handler  = async (m, { conn, command, args, usedPrefix, DevMode }) => {
    let user = global.db.data.users[m.sender];
    const lang = user.language || 'en';
    // Get the appropriate market translations
    let translations = marketTranslations[lang] || marketTranslations['en'];
    const _armor = user.armor
    const armor = (_armor == 0 ? 20000 : '' || _armor == 1 ? 49999 : '' || _armor == 2 ? 99999 : '' || _armor == 3 ? 149999 : '' || _armor == 4 ? 299999 : '')
    let Type = (args[0] || '').toLowerCase()
    let _type = (args[1] || '').toLowerCase()
    let jualbuy = (args[0] || '').toLowerCase()
    const Kchat = getMessage('rpg_market_animals_list', lang, {
        crab: Scrab,
        lobster: Slobster,
        prawn: Sprawn,
        squid: Ssquid,
        octopus: Soctopus,
        pufferfish: Spufferfish,
        dory: Sdory,
        orca: Sorca,
        dolphin: Sdolphin,
        whale: Swhale,
        shark: Sshark,
        banteng: Sbanteng,
        tiger: Stiger,
        elephant: Selephant,
        goat: Sgoat,
        panda: Spyou,
        buffalo: Sbuffalo,
        crocodile: Scrocodile,
        cow: Scow,
        monkey: Smonkey,
        wildboar: Swildboar,
        pig: Spig,
        chicken: Schicken
     || {}})
    try {
        if (/market|shop/i.test(command)) {
            const count = args[2] && args[2].length > 0 ? Math.min(99999999, Math.max(parseInt(args[2]), 1)) : !args[2] || args.length < 4 ? 1 :Math.min(1, count)
            const sampah = global.db.data.users[m.sender].sampah
            switch (jualbuy) {
           /* case 'buy':
                switch (_type) {
                    case 'potion':
                            if (global.db.data.users[m.sender].money >= potion * count) {
                                global.db.data.users[m.sender].money -= potion * count
                                global.db.data.users[m.sender].potion += count * 1
                                conn.reply(m.chat, getMessage("rpg_market_buy_success", lang, {
                count: count,
                item: "Potion",
                price: potion * count,
                prefix: usedPrefix
             || {}}), m)
                            } else conn.reply(m.chat, getMessage("rpg_market_buy_not_enough", lang, {
                item: "Potion",
                count: count,
                price: potion * count
             || {}}), m)
                        break
                    case 'diamond':
                            if (global.db.data.users[m.sender].money >= Bdiamond * count) {
                                global.db.data.users[m.sender].diamond += count * 1
                                global.db.data.users[m.sender].money -= Bdiamond * count
                                conn.reply(m.chat, getMessage("rpg_market_buy_success", lang, {
                count: count,
                item: "Diamond",
                price: Bdiamond * count
             || {}}), m)
                            } else conn.reply(m.chat, getMessage("rpg_market_money_not_enough", lang), m)
                        
                        break
                    case 'common':
                            if (global.db.data.users[m.sender].money >= Bcommon * count) {
                                global.db.data.users[m.sender].common += count * 1
                                global.db.data.users[m.sender].money -= Bcommon * count
                                conn.reply(m.chat, getMessage("rpg_market_buy_success", lang, {
                count: count,
                item: "Common Crate",
                price: Bcommon * count
             || {}}), m)
                            } else conn.reply(m.chat, getMessage("rpg_market_buy_not_enough", lang, {
                item: "Common Crate",
                count: count,
                price: Bcommon * count
             || {}}), m)
                        
                        break
                    case 'uncommon':
                            if (global.db.data.users[m.sender].money >= Buncommon * count) {
                                global.db.data.users[m.sender].uncommon += count * 1
                                global.db.data.users[m.sender].money -= Buncommon * count
                                conn.reply(m.chat, getMessage("rpg_market_buy_success", lang, {
                count: count,
                item: "Uncommon Crate",
                price: Buncommon * count
             || {}}), m)
                            } else conn.reply(m.chat, getMessage("rpg_market_buy_not_enough", lang, {
                item: "Uncommon Crate",
                count: count,
                price: Buncommon * count
             || {}}), m)
                        
                        break
                    case 'mythic':
                            if (global.db.data.users[m.sender].money >= Bmythic * count) {
                                    global.db.data.users[m.sender].mythic += count * 1
                                global.db.data.users[m.sender].money -= Bmythic * count
                                conn.reply(m.chat, getMessage("rpg_market_buy_success", lang, {
                count: count,
                item: "Mythic Crate",
                price: Bmythic * count
             || {}}), m)
                            } else conn.reply(m.chat, getMessage("rpg_market_mythic_not_enough", lang, {
                count: count,
                price: Bmythic * count,
                prefix: usedPrefix
             || {}}), m)
                        
                        break
                    case 'legendary':
                            if (global.db.data.users[m.sender].money >= Blegendary * count) {
                                global.db.data.users[m.sender].legendary += count * 1
                                global.db.data.users[m.sender].money -= Blegendary * count
                                conn.reply(m.chat, getMessage("rpg_market_buy_success", lang, {
                count: count,
                item: "Legendary Crate",
                price: Blegendary * count
             || {}}), m)
                            } else conn.reply(m.chat, getMessage("rpg_market_buy_not_enough", lang, {
                item: "Legendary Crate",
                count: count,
                price: Blegendary * count
             || {}}), m)
                        
                        break
                    case 'sampah':
                            if (global.db.data.users[m.sender].money >= Bsampah * count) {
                                global.db.data.users[m.sender].sampah += count * 1
                                global.db.data.users[m.sender].money -= Bsampah * count
                                conn.reply(m.chat, getMessage("rpg_market_buy_success", lang, {
                count: count,
                item: "Sampah",
                price: Bsampah * count,
                prefix: usedPrefix
             || {}}), m)
                            } else conn.reply(m.chat, getMessage("rpg_market_trash_not_enough", lang, {
                count: count,
                price: Bsampah * count
             || {}}).trim(), m)
                        
                        break
                    case 'armor':
                            if (global.db.data.users[m.sender].armor == 5) return conn.reply(m.chat, getMessage('rpg_market_armor_max_level', lang) || 'Your armor is already at *Maximum Level*', m)
                            if (global.db.data.users[m.sender].money > armor) {
                                global.db.data.users[m.sender].armor += 1
                                global.db.data.users[m.sender].money -= armor * 1
                                conn.reply(m.chat, getMessage("rpg_market_buy_success", lang, {
                count: 1,
                item: "Armor",
                price: armor,
                prefix: usedPrefix
             || {}}), m)
                            } else conn.reply(m.chat, getMessage("rpg_market_armor_not_enough", lang, {
                price: armor
             || {}}), m)
                        
                        break
                    default:
                        return conn.reply(m.chat, Kchat, m)
                }
                break*/
            case 'sell': 
                switch (_type) {                  
                     case 'banteng': // Wild ox/Bull
                        if (global.db.data.users[m.sender].banteng >= count * 1) {
                            global.db.data.users[m.sender].money += Sbanteng * count
                            global.db.data.users[m.sender].banteng -= count * 1
                            conn.reply(m.chat, getMessage('rpg_market_sell_success', lang, {
                                count: count,
                                animal: getMessage('rpg_animal_banteng', lang),
                                price: Sbanteng * count
                             || {}}).trim(), m)
                        } else conn.reply(m.chat, getMessage('rpg_market_not_enough', lang, {
                                animal: getMessage('rpg_animal_banteng', lang)
                             || {}}).trim(), m)
                        break
                        case 'daysmau':
                        if (global.db.data.users[m.sender].harimau >= count * 1) {
                            global.db.data.users[m.sender].money += Sharimau * count
                            global.db.data.users[m.sender].harimau -= count * 1
                            conn.reply(m.chat, getMessage("rpg_market_sell_success", lang, {
                                count,
                                animal: getMessage("rpg_animal_daysmau", lang),
                                price: Sdaysmau * count
                             || {}}).trim(), m)
                        } else conn.reply(m.chat, getMessage("rpg_market_not_enough", lang, {
                                animal: getMessage("rpg_animal_gajah", lang)
                             || {}}).trim(), m)
                        break
                        case 'gajah':
                        if (global.db.data.users[m.sender].gajah >= count * 1) {
                            global.db.data.users[m.sender].money += Sgajah * count
                            global.db.data.users[m.sender].gajah -= count * 1
                            conn.reply(m.chat, getMessage("rpg_market_sell_success", lang, {
                                count,
                                animal: getMessage("rpg_animal_gajah", lang),
                                price: Sgajah * count
                             || {}}).trim(), m)
                        } else conn.reply(m.chat, getMessage("rpg_market_not_enough", lang, {
                                animal: getMessage("rpg_animal_gajah", lang)
                             || {}}).trim(), m)
                        break
                        case 'kambing':
                        if (global.db.data.users[m.sender].kambing >= count * 1) {
                            global.db.data.users[m.sender].money += Skambing * count
                            global.db.data.users[m.sender].kambing -= count * 1
                            conn.reply(m.chat, getMessage("rpg_market_sell_success", lang, {
                                count,
                                animal: getMessage("rpg_animal_kambing", lang),
                                price: Skambing * count
                             || {}}).trim(), m)
                        } else conn.reply(m.chat, getMessage("rpg_market_not_enough", lang, {
                                animal: getMessage("rpg_animal_gajah", lang)
                             || {}}).trim(), m)
                        break
                        case 'pyou':
                        if (global.db.data.users[m.sender].panda >= count * 1) {
                            global.db.data.users[m.sender].money += Spanda * count
                            global.db.data.users[m.sender].panda -= count * 1
                            conn.reply(m.chat, getMessage("rpg_market_sell_success", lang, {
                                count,
                                animal: getMessage("rpg_animal_buaya", lang),
                                price: Sbuaya * count
                             || {}}).trim(), m)
                        } else conn.reply(m.chat, getMessage("rpg_market_not_enough", lang, {
                                animal: getMessage("rpg_animal_gajah", lang)
                             || {}}).trim(), m)
                        break
                        case 'buaya':
                        if (global.db.data.users[m.sender].buaya >= count * 1) {
                            global.db.data.users[m.sender].money += Sbuaya * count
                            global.db.data.users[m.sender].buaya -= count * 1
                            conn.reply(m.chat, getMessage("rpg_market_sell_success", lang, {
                                count,
                                animal: getMessage("rpg_animal_buaya", lang),
                                price: Sbuaya * count
                             || {}}).trim(), m)
                        } else conn.reply(m.chat, getMessage("rpg_market_not_enough", lang, {
                                animal: getMessage("rpg_animal_gajah", lang)
                             || {}}).trim(), m)
                        break
                        case 'kerbau':
                        if (global.db.data.users[m.sender].kerbau >= count * 1) {
                            global.db.data.users[m.sender].money += Skerbau * count
                            global.db.data.users[m.sender].kerbau -= count * 1
                            conn.reply(m.chat, getMessage("rpg_market_sell_success", lang, {
                                count,
                                animal: getMessage("rpg_animal_kerbau", lang),
                                price: Skerbau * count
                             || {}}).trim(), m)
                        } else conn.reply(m.chat, getMessage("rpg_market_not_enough", lang, {
                                animal: getMessage("rpg_animal_gajah", lang)
                             || {}}).trim(), m)
                        break
                        case 'sapi':
                        if (global.db.data.users[m.sender].sapi >= count * 1) {
                            global.db.data.users[m.sender].money += Ssapi * count
                            global.db.data.users[m.sender].sapi -= count * 1
                            conn.reply(m.chat, getMessage("rpg_market_sell_success", lang, {
                                count,
                                animal: getMessage("rpg_animal_sapi", lang),
                                price: Ssapi * count
                             || {}}).trim(), m)
                        } else conn.reply(m.chat, getMessage("rpg_market_not_enough", lang, {
                                animal: getMessage("rpg_animal_gajah", lang)
                             || {}}).trim(), m)
                        break
                        case 'monyet':
                        if (global.db.data.users[m.sender].monyet >= count * 1) {
                            global.db.data.users[m.sender].money += Smonyet * count
                            global.db.data.users[m.sender].monyet -= count * 1
                            conn.reply(m.chat, getMessage("rpg_market_sell_success", lang, {
                                count,
                                animal: getMessage("rpg_animal_monyet", lang),
                                price: Smonyet * count
                             || {}}).trim(), m)
                        } else conn.reply(m.chat, getMessage("rpg_market_not_enough", lang, {
                                animal: getMessage("rpg_animal_gajah", lang)
                             || {}}).trim(), m)
                        break
                        case 'babi':
                        if (global.db.data.users[m.sender].babi >= count * 1) {
                            global.db.data.users[m.sender].money += Skepiting * count
                            global.db.data.users[m.sender].babi -= count * 1
                            conn.reply(m.chat, getMessage("rpg_market_sell_success", lang, {
                                count,
                                animal: getMessage("rpg_animal_babi", lang),
                                price: Sbabi * count
                             || {}}).trim(), m)
                        } else conn.reply(m.chat, getMessage("rpg_market_not_enough", lang, {
                                animal: getMessage("rpg_animal_gajah", lang)
                             || {}}).trim(), m)
                        break
                        case 'babiforest':
                        if (global.db.data.users[m.sender].babihutan >= count * 1) {
                            global.db.data.users[m.sender].money += Sbabihutan * count
                            global.db.data.users[m.sender].babihutan -= count * 1
                            conn.reply(m.chat, getMessage("rpg_market_sell_success", lang, {
                                count,
                                animal: getMessage("rpg_animal_babiforest", lang),
                                price: Sbabiforest * count
                             || {}}).trim(), m)
                        } else conn.reply(m.chat, getMessage("rpg_market_not_enough", lang, {
                                animal: getMessage("rpg_animal_gajah", lang)
                             || {}}).trim(), m)
                        break
                        case 'ayam':
                        if (global.db.data.users[m.sender].ayam >= count * 1) {
                            global.db.data.users[m.sender].money += Sayam * count
                            global.db.data.users[m.sender].ayam -= count * 1
                            conn.reply(m.chat, getMessage("rpg_market_sell_success", lang, {
                                count,
                                animal: getMessage("rpg_animal_ayam", lang),
                                price: Sayam * count
                             || {}}).trim(), m)
                        } else conn.reply(m.chat, getMessage("rpg_market_not_enough", lang, {
                                animal: getMessage("rpg_animal_gajah", lang)
                             || {}}).trim(), m)
                        break
                        //fishing
                        case 'kepiting':
                        if (global.db.data.users[m.sender].kepiting >= count * 1) {
                            global.db.data.users[m.sender].money += Skepiting * count
                            global.db.data.users[m.sender].kepiting -= count * 1
                            conn.reply(m.chat, getMessage("rpg_market_sell_success", lang, {
                                count,
                                animal: getMessage("rpg_animal_kepiting", lang),
                                price: Skepiting * count
                             || {}}).trim(), m)
                        } else conn.reply(m.chat, getMessage("rpg_market_not_enough", lang, {
                                animal: getMessage("rpg_animal_gajah", lang)
                             || {}}).trim(), m)
                        break
                        case 'ikan':
                        if (global.db.data.users[m.sender].ikan >= count * 1) {
                            global.db.data.users[m.sender].money += Sgurita * count
                            global.db.data.users[m.sender].ikan -= count * 1
                            conn.reply(m.chat, getMessage("rpg_market_sell_success", lang, {
                                count,
                                animal: getMessage("rpg_animal_ikan", lang),
                                price: Sikan * count
                             || {}}).trim(), m)
                        } else conn.reply(m.chat, getMessage("rpg_market_not_enough", lang, {
                                animal: getMessage("rpg_animal_gajah", lang)
                             || {}}).trim(), m)
                        break
                        case 'dory':
                        if (global.db.data.users[m.sender].dory >= count * 1) {
                            global.db.data.users[m.sender].money += Sdory * count
                            global.db.data.users[m.sender].dory -= count * 1
                            conn.reply(m.chat, getMessage("rpg_market_sell_success", lang, {
                                count,
                                animal: getMessage("rpg_animal_dory", lang),
                                price: Sdory * count
                             || {}}).trim(), m)
                        } else conn.reply(m.chat, getMessage("rpg_market_not_enough", lang, {
                                animal: getMessage("rpg_animal_gajah", lang)
                             || {}}).trim(), m)
                        break
                        case 'gurita':
                        if (global.db.data.users[m.sender].gurita >= count * 1) {
                            global.db.data.users[m.sender].money += Skepiting * count
                            global.db.data.users[m.sender].gurita -= count * 1
                            conn.reply(m.chat, getMessage("rpg_market_sell_success", lang, {
                                count,
                                animal: getMessage("rpg_animal_gurita", lang),
                                price: Sgurita * count
                             || {}}).trim(), m)
                        } else conn.reply(m.chat, getMessage("rpg_market_not_enough", lang, {
                                animal: getMessage("rpg_animal_gajah", lang)
                             || {}}).trim(), m)
                        break
                        case 'buntal':
                        if (global.db.data.users[m.sender].buntal >= count * 1) {
                            global.db.data.users[m.sender].money += Sbuntal * count
                            global.db.data.users[m.sender].buntal -= count * 1
                            conn.reply(m.chat, getMessage("rpg_market_sell_success", lang, {
                                count,
                                animal: getMessage("rpg_animal_buntal", lang),
                                price: Sbuntal * count
                             || {}}).trim(), m)
                        } else conn.reply(m.chat, getMessage("rpg_market_not_enough", lang, {
                                animal: getMessage("rpg_animal_gajah", lang)
                             || {}}).trim(), m)
                        break
                        case 'hiu':
                        if (global.db.data.users[m.sender].hiu >= count * 1) {
                            global.db.data.users[m.sender].money += Shiu * count
                            global.db.data.users[m.sender].hiu -= count * 1
                            conn.reply(m.chat, getMessage("rpg_market_sell_success", lang, {
                                count,
                                animal: getMessage("rpg_animal_hiu", lang),
                                price: Shiu * count
                             || {}}).trim(), m)
                        } else conn.reply(m.chat, getMessage("rpg_market_not_enough", lang, {
                                animal: getMessage("rpg_animal_gajah", lang)
                             || {}}).trim(), m)
                        break
                        case 'orca':
                        if (global.db.data.users[m.sender].orca >= count * 1) {
                            global.db.data.users[m.sender].money += Sorca * count
                            global.db.data.users[m.sender].orca -= count * 1
                            conn.reply(m.chat, getMessage("rpg_market_sell_success", lang, {
                                count,
                                animal: getMessage("rpg_animal_orca", lang),
                                price: Sorca * count
                             || {}}).trim(), m)
                        } else conn.reply(m.chat, getMessage("rpg_market_not_enough", lang, {
                                animal: getMessage("rpg_animal_gajah", lang)
                             || {}}).trim(), m)
                        break
                        case 'lumba':
                        if (global.db.data.users[m.sender].lumba >= count * 1) {
                            global.db.data.users[m.sender].money += Skepiting * count
                            global.db.data.users[m.sender].lumba -= count * 1
                            conn.reply(m.chat, getMessage("rpg_market_sell_success", lang, {
                                count,
                                animal: getMessage("rpg_animal_lumba", lang),
                                price: Slumba * count
                             || {}}).trim(), m)
                        } else conn.reply(m.chat, getMessage("rpg_market_not_enough", lang, {
                                animal: getMessage("rpg_animal_gajah", lang)
                             || {}}).trim(), m)
                        break
                        case 'paus':
                        if (global.db.data.users[m.sender].paus >= count * 1) {
                            global.db.data.users[m.sender].money += Spaus * count
                            global.db.data.users[m.sender].paus -= count * 1
                            conn.reply(m.chat, getMessage("rpg_market_sell_success", lang, {
                                count,
                                animal: getMessage("rpg_animal_paus", lang),
                                price: Spaus * count
                             || {}}).trim(), m)
                        } else conn.reply(m.chat, getMessage("rpg_market_not_enough", lang, {
                                animal: getMessage("rpg_animal_gajah", lang)
                             || {}}).trim(), m)
                        break
                  case 'lobster':
                        if (global.db.data.users[m.sender].lobster >= count * 1) {
                            global.db.data.users[m.sender].money += Slobster * count
                            global.db.data.users[m.sender].lobster -= count * 1
                            conn.reply(m.chat, getMessage("rpg_market_sell_success", lang, {
                                count,
                                animal: getMessage("rpg_animal_lobster", lang),
                                price: Slobster * count
                             || {}}).trim(), m)
                        } else conn.reply(m.chat, getMessage("rpg_market_not_enough", lang, {
                                animal: getMessage("rpg_animal_gajah", lang)
                             || {}}).trim(), m)
                        break
                     case 'udang':
                        if (global.db.data.users[m.sender].udang >= count * 1) {
                            global.db.data.users[m.sender].money += Sudang * count
                            global.db.data.users[m.sender].udang -= count * 1
                            conn.reply(m.chat, getMessage("rpg_market_sell_success", lang, {
                                count,
                                animal: getMessage("rpg_animal_udang", lang),
                                price: Sudang * count
                             || {}}).trim(), m)
                        } else conn.reply(m.chat, getMessage("rpg_market_not_enough", lang, {
                                animal: getMessage("rpg_animal_gajah", lang)
                             || {}}).trim(), m)
                        break
                      case 'cumi':
                        if (global.db.data.users[m.sender].cumi >= count * 1) {
                            global.db.data.users[m.sender].money += Scumi * count
                            global.db.data.users[m.sender].cumi -= count * 1
                            conn.reply(m.chat, getMessage("rpg_market_sell_success", lang, {
                                count,
                                animal: getMessage("rpg_animal_cumi", lang),
                                price: Scumi * count
                             || {}}).trim(), m)
                        } else conn.reply(m.chat, getMessage("rpg_market_not_enough", lang, {
                                animal: getMessage("rpg_animal_gajah", lang)
                             || {}}).trim(), m)
                        break
                    default:
                        return conn.reply(m.chat, Kchat, m)
                }
                break
            default:
                return conn.sendFile(m.chat, thumb, 'market.jpg', `${Kchat}`, m)
            }
      /*  } else if (/buy|buy/i.test(command)) {
            const count = args[1] && args[1].length > 0 ? Math.min(99999999, Math.max(parseInt(args[1]), 1)) : !args[1] || args.length < 3 ? 1 : Math.min(1, count)
            switch (Type) {
                case 'potion':
                        if (global.db.data.users[m.sender].money >= potion * count) {
                            global.db.data.users[m.sender].money -= potion * count
                            global.db.data.users[m.sender].potion += count * 1
                            conn.reply(m.chat, `Sukses membuy ${count} Potion Dengan Harga ${potion * count} Money \n\nUse Potion Dengan Type: *${usedPrefix}use potion <amount>*`, m)
                        } else conn.reply(m.chat, getMessage("rpg_market_buy_not_enough", lang, {
                item: "Potion",
                count: count,
                price: potion * count
             || {}}), mm)
                    
                    break
                case 'diamond':
                        if (global.db.data.users[m.sender].money >= Bdiamond * count) {
                            global.db.data.users[m.sender].diamond += count * 1
                            global.db.data.users[m.sender].money -= Bdiamond * count
                            conn.reply(m.chat, getMessage("rpg_market_buy_success", lang, {
                count: count,
                item: "Diamond",
                price: Bdiamond * count,
                prefix: usedPrefix
             || {}}), m)
                        } else conn.reply(m.chat, getMessage("rpg_market_money_not_enough", lang), m)
                    
                    break
                case 'common':
                        if (global.db.data.users[m.sender].money >= Bcommon * count) {
                            global.db.data.users[m.sender].common += count * 1
                            global.db.data.users[m.sender].money -= Bcommon * count
                            conn.reply(m.chat, getMessage("rpg_market_buy_success", lang, {
                count: count,
                item: "Common Crate",
                price: Bcommon * count,
                prefix: usedPrefix
             || {}}), m)
                        } else conn.reply(m.chat, getMessage("rpg_market_buy_not_enough", lang, {
                item: "Common Crate",
                count: count,
                price: Bcommon * count
             || {}}), m)
                    
                    break
                case 'uncommon':
                        if (global.db.data.users[m.sender].money >= Buncommon * count) {
                            global.db.data.users[m.sender].uncommon += count * 1
                            global.db.data.users[m.sender].money -= Buncommon * count
                            conn.reply(m.chat, getMessage("rpg_market_buy_success", lang, {
                count: count,
                item: "Uncommon Crate",
                price: Buncommon * count,
                prefix: usedPrefix
             || {}}), m)
                        } else conn.reply(m.chat, getMessage("rpg_market_buy_not_enough", lang, {
                item: "Uncommon Crate",
                count: count,
                price: Buncommon * count
             || {}}), m)
                   
                    break
                case 'mythic':
                        if (global.db.data.users[m.sender].money >= Bmythic * count) {
                            global.db.data.users[m.sender].mythic += count * 1
                            global.db.data.users[m.sender].money -= Bmythic * count
                            conn.reply(m.chat, getMessage("rpg_market_buy_success", lang, {
                count: count,
                item: "Mythic Crate",
                price: Bmythic * count,
                prefix: usedPrefix
             || {}}), m)
                        } else conn.reply(m.chat, getMessage("rpg_market_mythic_not_enough", lang, {
                                count: count,
                                price: Bmythic * count,
                                prefix: usedPrefix
                             || {}}), m)
                    
                    break
                case 'legendary':
                        if (global.db.data.users[m.sender].money >= Blegendary * count) {
                            global.db.data.users[m.sender].legendary += count * 1
                            global.db.data.users[m.sender].money -= Blegendary * count
                            conn.reply(m.chat, getMessage("rpg_market_buy_success", lang, {
                count: count,
                item: "Legendary Crate",
                price: Blegendary * count
             || {}}), m)
                        } else conn.reply(m.chat, getMessage("rpg_market_buy_not_enough", lang, {
                item: "Legendary Crate",
                count: count,
                price: Blegendary * count
             || {}}), m)
                    
                    break
                case 'sampah':
                        if (global.db.data.users[m.sender].money >= Bsampah * count) {
                            global.db.data.users[m.sender].sampah += count * 1
                            global.db.data.users[m.sender].money -= Bsampah * count
                            conn.reply(m.chat, getMessage("rpg_market_buy_success", lang, {
                count: count,
                item: "Sampah",
                price: Bsampah * count,
                prefix: usedPrefix
             || {}}), m)
                        } else conn.reply(m.chat, getMessage("rpg_market_trash_not_enough", lang, {
                count: count,
                price: Bsampah * count
             || {}}).trim(), m)
                    
                    break
                case 'armor':
                        if (global.db.data.users[m.sender].armor == 5) return conn.reply(m.chat, getMessage('rpg_market_armor_max_level', lang) || 'Your armor is already at *Maximum Level*', m)
                        if (global.db.data.users[m.sender].money > armor * 1) {
                            global.db.data.users[m.sender].armor += 1
                            global.db.data.users[m.sender].money -= armor * 1
                            conn.reply(m.chat, getMessage("rpg_market_buy_success", lang, {
                count: 1,
                item: "Armor",
                price: armor,
                prefix: usedPrefix
             || {}}), m)
                          
                        } else conn.reply(m.chat, getMessage("rpg_market_armor_not_enough", lang, {
                price: armor
             || {}}), m)
                    
                    break
                default:
                    return conn.reply(m.chat, Kchat, m)
            }*/
        } else if (/sell|/i.test(command)) {
            const count = args[1] && args[1].length > 0 ? Math.min(99999999, Math.max(parseInt(args[1]), 1)) : !args[1] || args.length < 3 ? 1 : Math.min(1, count)
            switch (Type) { 
                       case 'banteng':
                        if (global.db.data.users[m.sender].banteng >= count * 1) {
                            global.db.data.users[m.sender].money += Spaus * count
                            global.db.data.users[m.sender].banteng -= count * 1
                            conn.reply(m.chat, getMessage('rpg_market_sell_success', lang, {
                                count: count,
                                animal: getMessage('rpg_animal_banteng', lang),
                                price: Sbanteng * count
                             || {}}).trim(), m)
                        } else conn.reply(m.chat, getMessage('rpg_market_not_enough', lang, {
                                animal: getMessage('rpg_animal_banteng', lang)
                             || {}}).trim(), m)
                        break
                        case 'daysmau':
                        if (global.db.data.users[m.sender].harimau >= count * 1) {
                            global.db.data.users[m.sender].money += Sharimau * count
                            global.db.data.users[m.sender].harimau -= count * 1
                            conn.reply(m.chat, getMessage("rpg_market_sell_success", lang, {
                                count,
                                animal: getMessage("rpg_animal_daysmau", lang),
                                price: Sdaysmau * count
                             || {}}).trim(), m)
                        } else conn.reply(m.chat, getMessage("rpg_market_not_enough", lang, {
                                animal: getMessage("rpg_animal_gajah", lang)
                             || {}}).trim(), m)
                        break
                        case 'gajah':
                        if (global.db.data.users[m.sender].gajah >= count * 1) {
                            global.db.data.users[m.sender].money += Sgajah * count
                            global.db.data.users[m.sender].gajah -= count * 1
                            conn.reply(m.chat, getMessage("rpg_market_sell_success", lang, {
                                count,
                                animal: getMessage("rpg_animal_gajah", lang),
                                price: Sgajah * count
                             || {}}).trim(), m)
                        } else conn.reply(m.chat, getMessage("rpg_market_not_enough", lang, {
                                animal: getMessage("rpg_animal_gajah", lang)
                             || {}}).trim(), m)
                        break
                        case 'kambing':
                        if (global.db.data.users[m.sender].kambing >= count * 1) {
                            global.db.data.users[m.sender].money += Skambing * count
                            global.db.data.users[m.sender].kambing -= count * 1
                            conn.reply(m.chat, getMessage("rpg_market_sell_success", lang, {
                                count,
                                animal: getMessage("rpg_animal_kambing", lang),
                                price: Skambing * count
                             || {}}).trim(), m)
                        } else conn.reply(m.chat, getMessage("rpg_market_not_enough", lang, {
                                animal: getMessage("rpg_animal_gajah", lang)
                             || {}}).trim(), m)
                        break
                        case 'pyou':
                        if (global.db.data.users[m.sender].panda >= count * 1) {
                            global.db.data.users[m.sender].money += Spanda * count
                            global.db.data.users[m.sender].panda -= count * 1
                            conn.reply(m.chat, getMessage("rpg_market_sell_success", lang, {
                                count,
                                animal: getMessage("rpg_animal_buaya", lang),
                                price: Sbuaya * count
                             || {}}).trim(), m)
                        } else conn.reply(m.chat, getMessage("rpg_market_not_enough", lang, {
                                animal: getMessage("rpg_animal_gajah", lang)
                             || {}}).trim(), m)
                        break
                        case 'buaya':
                        if (global.db.data.users[m.sender].buaya >= count * 1) {
                            global.db.data.users[m.sender].money += Sbuaya * count
                            global.db.data.users[m.sender].buaya -= count * 1
                            conn.reply(m.chat, getMessage("rpg_market_sell_success", lang, {
                                count,
                                animal: getMessage("rpg_animal_buaya", lang),
                                price: Sbuaya * count
                             || {}}).trim(), m)
                        } else conn.reply(m.chat, getMessage("rpg_market_not_enough", lang, {
                                animal: getMessage("rpg_animal_gajah", lang)
                             || {}}).trim(), m)
                        break
                        case 'kerbau':
                        if (global.db.data.users[m.sender].kerbau >= count * 1) {
                            global.db.data.users[m.sender].money += Skerbau * count
                            global.db.data.users[m.sender].kerbau -= count * 1
                            conn.reply(m.chat, getMessage("rpg_market_sell_success", lang, {
                                count,
                                animal: getMessage("rpg_animal_kerbau", lang),
                                price: Skerbau * count
                             || {}}).trim(), m)
                        } else conn.reply(m.chat, getMessage("rpg_market_not_enough", lang, {
                                animal: getMessage("rpg_animal_gajah", lang)
                             || {}}).trim(), m)
                        break
                        case 'sapi':
                        if (global.db.data.users[m.sender].sapi >= count * 1) {
                            global.db.data.users[m.sender].money += Ssapi * count
                            global.db.data.users[m.sender].sapi -= count * 1
                            conn.reply(m.chat, getMessage("rpg_market_sell_success", lang, {
                                count,
                                animal: getMessage("rpg_animal_sapi", lang),
                                price: Ssapi * count
                             || {}}).trim(), m)
                        } else conn.reply(m.chat, getMessage("rpg_market_not_enough", lang, {
                                animal: getMessage("rpg_animal_gajah", lang)
                             || {}}).trim(), m)
                        break
                        case 'monyet':
                        if (global.db.data.users[m.sender].monyet >= count * 1) {
                            global.db.data.users[m.sender].money += Smonyet * count
                            global.db.data.users[m.sender].monyet -= count * 1
                            conn.reply(m.chat, getMessage("rpg_market_sell_success", lang, {
                                count,
                                animal: getMessage("rpg_animal_monyet", lang),
                                price: Smonyet * count
                             || {}}).trim(), m)
                        } else conn.reply(m.chat, getMessage("rpg_market_not_enough", lang, {
                                animal: getMessage("rpg_animal_gajah", lang)
                             || {}}).trim(), m)
                        break
                        case 'babi':
                        if (global.db.data.users[m.sender].babi >= count * 1) {
                            global.db.data.users[m.sender].money += Sbabi * count
                            global.db.data.users[m.sender].babi -= count * 1
                            conn.reply(m.chat, getMessage("rpg_market_sell_success", lang, {
                                count,
                                animal: getMessage("rpg_animal_babi", lang),
                                price: Sbabi * count
                             || {}}).trim(), m)
                        } else conn.reply(m.chat, getMessage("rpg_market_not_enough", lang, {
                                animal: getMessage("rpg_animal_gajah", lang)
                             || {}}).trim(), m)
                        break
                        case 'babiforest':
                        if (global.db.data.users[m.sender].babihutan >= count * 1) {
                            global.db.data.users[m.sender].money += Sbabihutan * count
                            global.db.data.users[m.sender].babihutan -= count * 1
                            conn.reply(m.chat, getMessage("rpg_market_sell_success", lang, {
                                count,
                                animal: getMessage("rpg_animal_babiforest", lang),
                                price: Sbabiforest * count
                             || {}}).trim(), m)
                        } else conn.reply(m.chat, getMessage("rpg_market_not_enough", lang, {
                                animal: getMessage("rpg_animal_gajah", lang)
                             || {}}).trim(), m)
                        break
                        case 'ayam':
                        if (global.db.data.users[m.sender].ayam >= count * 1) {
                            global.db.data.users[m.sender].money += Sayam * count
                            global.db.data.users[m.sender].ayam -= count * 1
                            conn.reply(m.chat, getMessage("rpg_market_sell_success", lang, {
                                count,
                                animal: getMessage("rpg_animal_ayam", lang),
                                price: Sayam * count
                             || {}}).trim(), m)
                        } else conn.reply(m.chat, getMessage("rpg_market_not_enough", lang, {
                                animal: getMessage("rpg_animal_gajah", lang)
                             || {}}).trim(), m)
                        break
                        //fishing
                        case 'kepiting':
                        if (global.db.data.users[m.sender].kepiting >= count * 1) {
                            global.db.data.users[m.sender].money += Skepiting * count
                            global.db.data.users[m.sender].kepiting -= count * 1
                            conn.reply(m.chat, getMessage("rpg_market_sell_success", lang, {
                                count,
                                animal: getMessage("rpg_animal_kepiting", lang),
                                price: Skepiting * count
                             || {}}).trim(), m)
                        } else conn.reply(m.chat, getMessage("rpg_market_not_enough", lang, {
                                animal: getMessage("rpg_animal_gajah", lang)
                             || {}}).trim(), m)
                        break
                        case 'ikan':
                        if (global.db.data.users[m.sender].ikan >= count * 1) {
                            global.db.data.users[m.sender].money += Skepiting * count
                            global.db.data.users[m.sender].ikan -= count * 1
                            conn.reply(m.chat, getMessage("rpg_market_sell_success", lang, {
                                count,
                                animal: getMessage("rpg_animal_ikan", lang),
                                price: Sikan * count
                             || {}}).trim(), m)
                        } else conn.reply(m.chat, getMessage("rpg_market_not_enough", lang, {
                                animal: getMessage("rpg_animal_gajah", lang)
                             || {}}).trim(), m)
                        break
                        case 'dory':
                        if (global.db.data.users[m.sender].dory >= count * 1) {
                            global.db.data.users[m.sender].money += Sdory * count
                            global.db.data.users[m.sender].dory -= count * 1
                            conn.reply(m.chat, getMessage("rpg_market_sell_success", lang, {
                                count,
                                animal: getMessage("rpg_animal_dory", lang),
                                price: Sdory * count
                             || {}}).trim(), m)
                        } else conn.reply(m.chat, getMessage("rpg_market_not_enough", lang, {
                                animal: getMessage("rpg_animal_gajah", lang)
                             || {}}).trim(), m)
                        break
                        case 'gurita':
                        if (global.db.data.users[m.sender].gurita >= count * 1) {
                            global.db.data.users[m.sender].money += Skepiting * count
                            global.db.data.users[m.sender].gurita -= count * 1
                            conn.reply(m.chat, getMessage("rpg_market_sell_success", lang, {
                                count,
                                animal: getMessage("rpg_animal_gurita", lang),
                                price: Sgurita * count
                             || {}}).trim(), m)
                        } else conn.reply(m.chat, getMessage("rpg_market_not_enough", lang, {
                                animal: getMessage("rpg_animal_gajah", lang)
                             || {}}).trim(), m)
                        break
                        case 'buntal':
                        if (global.db.data.users[m.sender].buntal >= count * 1) {
                            global.db.data.users[m.sender].money += Sbuntal * count
                            global.db.data.users[m.sender].buntal -= count * 1
                            conn.reply(m.chat, getMessage("rpg_market_sell_success", lang, {
                                count,
                                animal: getMessage("rpg_animal_buntal", lang),
                                price: Sbuntal * count
                             || {}}).trim(), m)
                        } else conn.reply(m.chat, getMessage("rpg_market_not_enough", lang, {
                                animal: getMessage("rpg_animal_gajah", lang)
                             || {}}).trim(), m)
                        break
                        case 'hiu':
                        if (global.db.data.users[m.sender].hiu >= count * 1) {
                            global.db.data.users[m.sender].money += Shiu * count
                            global.db.data.users[m.sender].hiu -= count * 1
                            conn.reply(m.chat, getMessage("rpg_market_sell_success", lang, {
                                count,
                                animal: getMessage("rpg_animal_hiu", lang),
                                price: Shiu * count
                             || {}}).trim(), m)
                        } else conn.reply(m.chat, getMessage("rpg_market_not_enough", lang, {
                                animal: getMessage("rpg_animal_gajah", lang)
                             || {}}).trim(), m)
                        break
                        case 'orca':
                        if (global.db.data.users[m.sender].orca >= count * 1) {
                            global.db.data.users[m.sender].money += Sorca * count
                            global.db.data.users[m.sender].orca -= count * 1
                            conn.reply(m.chat, getMessage("rpg_market_sell_success", lang, {
                                count,
                                animal: getMessage("rpg_animal_orca", lang),
                                price: Sorca * count
                             || {}}).trim(), m)
                        } else conn.reply(m.chat, getMessage("rpg_market_not_enough", lang, {
                                animal: getMessage("rpg_animal_gajah", lang)
                             || {}}).trim(), m)
                        break
                        case 'lumba':
                        if (global.db.data.users[m.sender].lumba >= count * 1) {
                            global.db.data.users[m.sender].money += Skepiting * count
                            global.db.data.users[m.sender].lumba -= count * 1
                            conn.reply(m.chat, getMessage("rpg_market_sell_success", lang, {
                                count,
                                animal: getMessage("rpg_animal_lumba", lang),
                                price: Slumba * count
                             || {}}).trim(), m)
                        } else conn.reply(m.chat, getMessage("rpg_market_not_enough", lang, {
                                animal: getMessage("rpg_animal_gajah", lang)
                             || {}}).trim(), m)
                        break
                        case 'paus':
                        if (global.db.data.users[m.sender].paus >= count * 1) {
                            global.db.data.users[m.sender].money += Spaus * count
                            global.db.data.users[m.sender].paus -= count * 1
                            conn.reply(m.chat, getMessage("rpg_market_sell_success", lang, {
                                count,
                                animal: getMessage("rpg_animal_paus", lang),
                                price: Spaus * count
                             || {}}).trim(), m)
                        } else conn.reply(m.chat, getMessage("rpg_market_not_enough", lang, {
                                animal: getMessage("rpg_animal_gajah", lang)
                             || {}}).trim(), m)
                        break
                  case 'lobster':
                        if (global.db.data.users[m.sender].lobster >= count * 1) {
                            global.db.data.users[m.sender].money += Slobster * count
                            global.db.data.users[m.sender].lobster -= count * 1
                            conn.reply(m.chat, getMessage("rpg_market_sell_success", lang, {
                                count,
                                animal: getMessage("rpg_animal_lobster", lang),
                                price: Slobster * count
                             || {}}).trim(), m)
                        } else conn.reply(m.chat, getMessage("rpg_market_not_enough", lang, {
                                animal: getMessage("rpg_animal_gajah", lang)
                             || {}}).trim(), m)
                        break
                     case 'udang':
                        if (global.db.data.users[m.sender].udang >= count * 1) {
                            global.db.data.users[m.sender].money += Sudang * count
                            global.db.data.users[m.sender].udang -= count * 1
                            conn.reply(m.chat, getMessage("rpg_market_sell_success", lang, {
                                count,
                                animal: getMessage("rpg_animal_udang", lang),
                                price: Sudang * count
                             || {}}).trim(), m)
                        } else conn.reply(m.chat, getMessage("rpg_market_not_enough", lang, {
                                animal: getMessage("rpg_animal_gajah", lang)
                             || {}}).trim(), m)
                        break
                      case 'cumi':
                        if (global.db.data.users[m.sender].cumi >= count * 1) {
                            global.db.data.users[m.sender].money += Scumi * count
                            global.db.data.users[m.sender].cumi -= count * 1
                            conn.reply(m.chat, getMessage("rpg_market_sell_success", lang, {
                                count,
                                animal: getMessage("rpg_animal_cumi", lang),
                                price: Scumi * count
                             || {}}).trim(), m)
                        } else conn.reply(m.chat, getMessage("rpg_market_not_enough", lang, {
                                animal: getMessage("rpg_animal_gajah", lang)
                             || {}}).trim(), m)
                        break                                        
                default:
                    return conn.reply(m.chat, Kchat, m)
            }
        }
    } catch (e) {
        conn.reply(m.chat, Kchat, m)
        console.log(e)
        if (DevMode) {
            for (let jid of global.owner.map(v => v.replace(/[^0-9]/g, '') + '@s.whatsapp.net').filter(v => v != conn.user.jid)) {
                conn.sendMessage(jid, getMessage('rpg_market_error', lang, {
                    user: m.sender.split`@`[0],
                    command: m.text,
                    error: e
                 || {}}) || `Market error\nUser: *${m.sender.split`@`[0]}*\nCommand: *${m.text}*\n\n*${e}*`, MessageType.text)
            }
        }
    }
}

handler.help = ['market *<sell>|<args>*']
handler.tags = ['rpg']
    
handler.command = /^(market|sell)$/i
handler.rpg = true
module.exports = handler