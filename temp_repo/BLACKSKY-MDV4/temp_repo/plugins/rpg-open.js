const { getMessage } = require('../lib/languages');

let handler = async (m, { conn, command, args, text, usedPrefix }) => {
    // Get user's preferred language
    const user = global.db.data.users[m.sender];
    const chat = global.db.data.chats[m.chat];
    const lang = user?.language || chat?.language || global.language;
 {
  try {
    let bruh = getMessage('rpg_open_usage', lang, {prefix: usedPrefix || {}}) || `${usedPrefix}open <crate name> <  10 | 100 | 1000 >\n\nExample usage: *${usedPrefix}open common 10*\n\nCrate types:\n*common*\n*uncommon*\n*mythic*\n*legendary*`
    let _lmao = args[0]
    let Lmao = getMessage('rpg_open_amount_error', lang, {prefix: usedPrefix, crate: args > 2 ? _lmao : pickRandom(['common', 'uncommon', 'mythic', 'legendary']) || {}}) || `Only supports 10, 100, 1000\nExample usage: *${usedPrefix}open ${args > 2 ? _lmao : pickRandom(['common', 'uncommon', 'mythic', 'legendary'])} 10*`
    let Type = (args[0] || '').toLowerCase()
    let amount = (args[1] || '').toLowerCase()
    switch (Type) {
        case 'common':
            switch (amount) { 
                case '10':
                case 'crate':
                    let _cm1 = `${Math.floor(Math.random() * 500)}`.trim()
                    let _cc1 = `${Math.floor(Math.random() * 5)}`.trim()
                    let _cp1 = `${Math.floor(Math.random() * 3)}`.trim()
                    let _ce1 = `${Math.floor(Math.random() * 700)}`.trim()
                    let _cu1 = `${Math.floor(Math.random() * 3)}`.trim()
                    let cm1 = (_cm1 * 1)
                    let cc1 = (_cc1 * 1)
                    let cp1 = (_cp1 * 1)
                    let ce1 = (_ce1 * 1)
                    let cu1 = (_cu1 * 1)
                    let Hcom1 = `
You have opened *📦Common crate* and received:${cm1 > 0 ? `\n💵Money: ${cm1}` : ''}${ce1 > 0 ? `\n⚜️Exp: ${ce1} *exp*` : ''}${cp1 > 0 ? `\n🥤Potion: ${cp1} *potion*` : ''}${cc1 > 0 ? `\n📦Common crate: ${cc1} *crate*` : ''}${cu1 > 0 ? `\n📦Uncommon crate: ${cu1} *crate*` : ''}
`.trim()
                    if (global.db.data.users[m.sender].common >= 10) {
                        global.db.data.users[m.sender].common -= 10
                        global.db.data.users[m.sender].money += cm1 * 1
                        global.db.data.users[m.sender].exp += ce1 * 1
                        global.db.data.users[m.sender].potion += cp1 * 1
                        global.db.data.users[m.sender].uncommon += cu1 * 1
                        global.db.data.users[m.sender].common += cc1 * 1
                        conn.reply(m.chat, Hcom1, m)
                    } else conn.reply(m.chat, getMessage('rpg_open_not_enough', lang, {crate: 'Common' || {}}) || '📦You don\'t have enough Common crates', m)
                    break
                case '100':
                    let _cm2 = `${Math.floor(Math.random() * 5000)}`.trim()
                    let _cc2 = `${Math.floor(Math.random() * 50)}`.trim()
                    let _cp2 = `${Math.floor(Math.random() * 20)}`.trim()
                    let _ce2 = `${Math.floor(Math.random() * 7500)}`.trim()
                    let _cu2 = `${Math.floor(Math.random() * 30)}`.trim()
                    let cm2 = (_cm2 * 1)
                    let cc2 = (_cc2 * 1)
                    let cp2 = (_cp2 * 1)
                    let ce2 = (_ce2 * 1)
                    let cu2 = (_cu2 * 1)
                    let Hcom2 = `
You have opened *📦Common crate* and received:${cm2 > 0 ? `\n💵Money: ${cm2}` : ''}${ce2 > 0 ? `\n⚜️Exp: ${ce2} *exp*` : ''}${cp2 > 0 ? `\n🥤Potion: ${cp2} *potion*` : ''}${cc2 > 0 ? `\n📦Common crate: ${cc2} *crate*` : ''}${cu2 > 0 ? `\n📦Uncommon crate: ${cu2} *crate*` : ''}
`.trim()
                    if (global.db.data.users[m.sender].common >= 100) {
                        global.db.data.users[m.sender].common -= 100
                        global.db.data.users[m.sender].money += cm2 * 1
                        global.db.data.users[m.sender].exp += ce2 * 1
                        global.db.data.users[m.sender].potion += cp2 * 1
                        global.db.data.users[m.sender].uncommon += cu2 * 1
                        global.db.data.users[m.sender].common += cc2 * 1
                        conn.reply(m.chat, Hcom2, m)
                    } else conn.reply(m.chat, getMessage('rpg_open_not_enough', lang, {crate: 'Common' || {}}) || '📦You don\'t have enough Common crates', m)
                    break
                case '1000':
                    let _cm3 = `${Math.floor(Math.random() * 50000)}`.trim()
                    let _cc3 = `${Math.floor(Math.random() * 350)}`.trim()
                    let _cp3 = `${Math.floor(Math.random() * 100)}`.trim()
                    let _ce3 = `${Math.floor(Math.random() * 80000)}`.trim()
                    let _cu3 = `${Math.floor(Math.random() * 200)}`.trim()
                    let cm3 = (_cm3 * 1)
                    let cc3 = (_cc3 * 1)
                    let cp3 = (_cp3 * 1)
                    let ce3 = (_ce3 * 1)
                    let cu3 = (_cu3 * 1)
                    let Hcom3 = `
You have opened *📦Common crate* and received:${cm3 > 0 ? `\n💵Money: ${cm3}` : ''}${ce3 > 0 ? `\n⚜️Exp: ${ce3} *exp*` : ''}${cp3 > 0 ? `\n🥤Potion: ${cp3} *potion*` : ''}${cc3 > 0 ? `\n📦Common crate: ${cc3} *crate*` : ''}${cu3 > 0 ? `\n📦Uncommon crate: ${cu3} *crate*` : ''}
`.trim()
                    if (global.db.data.users[m.sender].common >= 1000) {
                        global.db.data.users[m.sender].common -= 1000
                        global.db.data.users[m.sender].money += cm3 * 1
                        global.db.data.users[m.sender].exp += ce3 * 1
                        global.db.data.users[m.sender].potion += cp3 * 1
                        global.db.data.users[m.sender].uncommon += cu3 * 1
                        global.db.data.users[m.sender].common += cc3 * 1
                        conn.reply(m.chat, Hcom3, m)
                    } else conn.reply(m.chat, getMessage('rpg_open_not_enough', lang, {crate: 'Common' || {}}) || '📦You don\'t have enough Common crates', m)
                    break
                default:
                    return conn.reply(m.chat, Lmao, m)
            }
            break
        case 'uncommon':
            switch (amount) {
                case '10':
                case 'crate':
                    let _ud1 = `${Math.floor(Math.random() * 5)}`.trim()
                    let _ue1 = `${Math.floor(Math.random() * 750)}`.trim()
                    let _um1 = `${Math.floor(Math.random() * 400)}`.trim()
                    let _up1 = `${Math.floor(Math.random() * 7)}`.trim()
                    let _umc1 = `${Math.floor(Math.random() * 2)}`.trim()
                    let _uu1 = `${Math.floor(Math.random() * 4)}`.trim()
                    let _uc1 = `${Math.floor(Math.random() * 7)}`.trim()
                    let ud1 = (_ud1 * 1)
                    let ue1 = (_ue1 * 1)
                    let um1 = (_um1 * 1)
                    let up1 = (_up1 * 1)
                    let umc1 = (_umc1 * 1)
                    let uu1 = (_uu1 * 1)
                    let uc1 = (_uc1 * 1)
                    let Hun1 = getMessage('rpg_open_uncommon_results', lang, {
                        money: um1,
                        exp: ue1,
                        diamond: ud1,
                        potion: up1,
                        common: uc1,
                        uncommon: uu1
                     || {}}) || `
You have opened *📦Uncommon crate* and received:${um1 > 0 ? `\n💵Money: ${um1}` : ''}${ue1 > 0 ? `\n⚜️Exp: ${ue1} *exp*` : ''}${ud1 > 0 ? `\n💎Diamond: ${ud1} *diamond*` : ''}${up1 > 0 ? `\n🥤Potion: ${up1} *potion*` : ''}${uc1 > 0 ? `\n📦Common crate: ${uc1} *crate*` : ''}${uu1 > 0 ? `\n📦Uncommon crate: ${uu1} *crate*` : ''}
`.trim()
                    if (global.db.data.users[m.sender].uncommon >= 10) {
                        global.db.data.users[m.sender].uncommon -= 10
                        global.db.data.users[m.sender].money += um1 * 1
                        global.db.data.users[m.sender].diamond += ud1 * 1
                        global.db.data.users[m.sender].exp += ue1 * 1
                        global.db.data.users[m.sender].potion += up1 * 1
                        global.db.data.users[m.sender].common += uc1 * 1
                        global.db.data.users[m.sender].uncommon += uu1 * 1
                        conn.reply(m.chat, Hun1, m)
                    } else conn.reply(m.chat, getMessage('rpg_open_not_enough', lang, {crate: 'Uncommon' || {}}) || '📦You don\'t have enough Uncommon crates', m)
                    break
                case '100':
                    let _ud2 = `${Math.floor(Math.random() * 20)}`.trim()
                    let _ue2 = `${Math.floor(Math.random() * 8000)}`.trim()
                    let _um2 = `${Math.floor(Math.random() * 5000)}`.trim()
                    let _up2 = `${Math.floor(Math.random() * 20)}`.trim()
                    let _umc2 = `${Math.floor(Math.random() * 10)}`.trim()
                    let _uu2 = `${Math.floor(Math.random() * 25)}`.trim()
                    let _uc2 = `${Math.floor(Math.random() * 50)}`.trim()
                    let ud2 = (_ud2 * 1)
                    let ue2 = (_ue2 * 1)
                    let um2 = (_um2 * 1)
                    let up2 = (_up2 * 1)
                    let umc2 = (_umc2 * 1)
                    let uu2 = (_uu2 * 1)
                    let uc2 = (_uc2 * 1)
                    let Hun2 = getMessage('rpg_open_uncommon_results', lang, {
                        money: um2,
                        exp: ue2,
                        diamond: ud2,
                        potion: up2,
                        common: uc2,
                        uncommon: uu2
                     || {}}) || `
You have opened *📦Uncommon crate* and received:${um2 > 0 ? `\n💵Money: ${um2}` : ''}${ue2 > 0 ? `\n⚜️Exp: ${ue2} *exp*` : ''}${ud2 > 0 ? `\n💎Diamond: ${ud2} *diamond*` : ''}${up2 > 0 ? `\n🥤Potion: ${up2} *potion*` : ''}${uc2 > 0 ? `\n📦Common crate: ${uc2} *crate*` : ''}${uu2 > 0 ? `\n📦Uncommon crate: ${uu2} *crate*` : ''}
`.trim()
                    if (global.db.data.users[m.sender].uncommon >= 100) {
                        global.db.data.users[m.sender].uncommon -= 100
                        global.db.data.users[m.sender].money += um2 * 1
                        global.db.data.users[m.sender].diamond += ud2 * 1
                        global.db.data.users[m.sender].exp += ue2 * 1
                        global.db.data.users[m.sender].potion += up2 * 1
                        global.db.data.users[m.sender].common += uc2 * 1
                        global.db.data.users[m.sender].uncommon += uu2 * 1
                        conn.reply(m.chat, Hun2, m)
                    } else conn.reply(m.chat, getMessage('rpg_open_not_enough', lang, {crate: 'Uncommon' || {}}) || '📦You don\'t have enough Uncommon crates', m)
                    break
                case '1000':
                    let _ud3 = `${Math.floor(Math.random() * 50)}`.trim()
                    let _ue3 = `${Math.floor(Math.random() * 100000)}`.trim()
                    let _um3 = `${Math.floor(Math.random() * 50000)}`.trim()
                    let _up3 = `${Math.floor(Math.random() * 100)}`.trim()
                    let _umc3 = `${Math.floor(Math.random() * 100)}`.trim()
                    let _uu3 = `${Math.floor(Math.random() * 100)}`.trim()
                    let _uc3 = `${Math.floor(Math.random() * 200)}`.trim()
                    let ud3 = (_ud3 * 1)
                    let ue3 = (_ue3 * 1)
                    let um3 = (_um3 * 1)
                    let up3 = (_up3 * 1)
                    let umc3 = (_umc3 * 1)
                    let uu3 = (_uu3 * 1)
                    let uc3 = (_uc3 * 1)
                    let Hun3 = getMessage('rpg_open_uncommon_results', lang, {
                        money: um3,
                        exp: ue3,
                        diamond: ud3,
                        potion: up3,
                        common: uc3,
                        uncommon: uu3
                     || {}}) || `
You have opened *📦Uncommon crate* and received:${um3 > 0 ? `\n💵Money: ${um3}` : ''}${ue3 > 0 ? `\n⚜️Exp: ${ue3} *exp*` : ''}${ud3 > 0 ? `\n💎Diamond: ${ud3} *diamond*` : ''}${up3 > 0 ? `\n🥤Potion: ${up3} *potion*` : ''}${uc3 > 0 ? `\n📦Common crate: ${uc3} *crate*` : ''}${uu3 > 0 ? `\n📦Uncommon crate: ${uu3} *crate*` : ''}
`.trim()
                    if (global.db.data.users[m.sender].uncommon >= 1000) {
                        global.db.data.users[m.sender].uncommon -= 1000
                        global.db.data.users[m.sender].money += um3 * 1
                        global.db.data.users[m.sender].diamond += ud3 * 1
                        global.db.data.users[m.sender].exp += ue3 * 1
                        global.db.data.users[m.sender].potion += up3 * 1
                        global.db.data.users[m.sender].common += uc3 * 1
                        global.db.data.users[m.sender].uncommon += uu3 * 1
                        conn.reply(m.chat, Hun3, m)
                    } else conn.reply(m.chat, getMessage('rpg_open_not_enough', lang, {crate: 'Uncommon' || {}}) || '📦You don\'t have enough Uncommon crates', m)
                    break
                default:
                    return conn.reply(m.chat, Lmao ,m)
            }
            break
        case 'mythic':
            switch (amount) {
                case '10':
                case 'crate':
                    let _mm1 = `${Math.floor(Math.random() * 2000)}`.trim()
                    let _mmm1 = `${Math.floor(Math.random() * 4)}`.trim()
                    let _me1 = `${Math.floor(Math.random() * 3000)}`.trim()
                    let _mp1 = `${Math.floor(Math.random() * 6)}`.trim()
                    let _mu1 = `${Math.floor(Math.random() * 6)}`.trim()
                    let _mc1 = `${Math.floor(Math.random() * 11)}`.trim()
                    let _ml1 = `${Math.floor(Math.random() * 1)}`.trim()
                    let _md1 = `${Math.floor(Math.random() * 5)}`.trim()
                    let mm1 = (_mm1 * 1)
                    let mmm1 = (_mmm1 * 1)
                    let me1 = (_me1 * 1)
                    let mp1 = (_mp1 * 1)
                    let mu1 = (_mu1 * 1)
                    let mc1 = (_mc1 * 1)
                    let ml1 = (_ml1 * 1)
                    let md1 = (_md1 * 1)
                    let Mychat1 = getMessage('rpg_open_mythic_results', lang, {
                        money: mm1,
                        exp: me1,
                        diamond: md1,
                        potion: mp1,
                        common: mc1,
                        uncommon: mu1
                     || {}}) || `
You have opened *Mythic crate* and received:${mm1 > 0 ? `\n💵Money: ${mm1}` : ''}${me1 > 0 ? `\n⚜️Exp: ${me1} *exp*` : ''}${md1 > 0 ? `\n💎Diamond: ${md1} *diamond*` : ''}${mp1 > 0 ? `\n🥤Potion: ${mp1} *potion*` : ''}${mc1 > 0 ? `\n📦Common crate: ${mc1} *crate*` : ''}${mu1 > 0 ? `\n📦Uncommon crate: ${mu1} *crate*` : ''}
`.trim()
                    if (global.db.data.users[m.sender].mythic >= 10) {
                        global.db.data.users[m.sender].mythic -= 10
                        global.db.data.users[m.sender].money += mm1 * 1
                        global.db.data.users[m.sender].diamond += md1 * 1
                        global.db.data.users[m.sender].exp += me1 * 1
                        global.db.data.users[m.sender].potion += mp1 * 1
                        global.db.data.users[m.sender].common += mc1 * 1
                        global.db.data.users[m.sender].uncommon += mu1 * 1
                        conn.reply(m.chat, Mychat1, m)
                    } else conn.reply(m.chat, getMessage('rpg_open_not_enough', lang, {crate: 'Mythic' || {}}) || '📦You don\'t have enough Mythic crates', m)
                    break
                case '100':
                    let _mm2 = `${Math.floor(Math.random() * 25000)}`.trim()
                    let _mmm2 = `${Math.floor(Math.random() * 10)}`.trim()
                    let _me2 = `${Math.floor(Math.random() * 30000)}`.trim()
                    let _mp2 = `${Math.floor(Math.random() * 50)}`.trim()
                    let _mu2 = `${Math.floor(Math.random() * 80)}`.trim()
                    let _mc2 = `${Math.floor(Math.random() * 150)}`.trim()
                    let _ml2 = `${Math.floor(Math.random() * 6)}`.trim()
                    let _md2 = `${Math.floor(Math.random() * 20)}`.trim()
                    let mm2 = (_mm2 * 1)
                    let mmm2 = (_mmm2 * 1)
                    let me2 = (_me2 * 1)
                    let mp2 = (_mp2 * 1)
                    let mu2 = (_mu2 * 1)
                    let mc2 = (_mc2 * 1)
                    let ml2 = (_ml2 * 1)
                    let md2 = (_md2 * 1)
                    let Mychat2 = getMessage('rpg_open_mythic_results', lang, {
                        money: mm2,
                        exp: me2,
                        diamond: md2,
                        potion: mp2,
                        common: mc2,
                        uncommon: mu2
                     || {}}) || `
You have opened *Mythic crate* and received:${mm2 > 0 ? `\n💵Money: ${mm2}` : ''}${me2 > 0 ? `\n⚜️Exp: ${me2} *exp*` : ''}${md2 > 0 ? `\n💎Diamond: ${md2} *diamond*` : ''}${mp2 > 0 ? `\n🥤Potion: ${mp2} *potion*` : ''}${mc2 > 0 ? `\n📦Common crate: ${mc2} *crate*` : ''}${mu2 > 0 ? `\n📦Uncommon crate: ${mu2} *crate*` : ''}
`.trim()
                    if (global.db.data.users[m.sender].mythic >= 100) {
                        global.db.data.users[m.sender].mythic -= 100
                        global.db.data.users[m.sender].money += mm2 * 1
                        global.db.data.users[m.sender].diamond += md2 * 1
                        global.db.data.users[m.sender].exp += me2 * 1
                        global.db.data.users[m.sender].potion += mp2 * 1
                        global.db.data.users[m.sender].common += mc2 * 1
                        global.db.data.users[m.sender].uncommon += mu2 * 1
                        conn.reply(m.chat, Mychat2, m)
                    } else conn.reply(m.chat, getMessage('rpg_open_not_enough', lang, {crate: 'Mythic' || {}}) || '📦You don\'t have enough Mythic crates', m)
                    break
                case '1000':
                    let _mm3 = `${Math.floor(Math.random() * 500000)}`.trim()
                    let _mmm3 = `${Math.floor(Math.random() * 50)}`.trim()
                    let _me3 = `${Math.floor(Math.random() * 750000)}`.trim()
                    let _mp3 = `${Math.floor(Math.random() * 70)}`.trim()
                    let _mu3 = `${Math.floor(Math.random() * 250)}`.trim()
                    let _mc3 = `${Math.floor(Math.random() * 750)}`.trim()
                    let _ml3 = `${Math.floor(Math.random() * 10)}`.trim()
                    let _md3 = `${Math.floor(Math.random() * 50)}`.trim()
                    let mm3 = (_mm3 * 1)
                    let mmm3 = (_mmm3 * 1)
                    let me3 = (_me3 * 1)
                    let mp3 = (_mp3 * 1)
                    let mu3 = (_mu3 * 1)
                    let mc3 = (_mc3 * 1)
                    let ml3 = (_ml3 * 1)
                    let md3 = (_md3 * 1)
                    let Mychat3 = getMessage('rpg_open_mythic_results', lang, {
                        money: mm3,
                        exp: me3,
                        diamond: md3,
                        potion: mp3,
                        common: mc3,
                        uncommon: mu3
                     || {}}) || `
You have opened *Mythic crate* and received:${mm3 > 0 ? `\n💵Money: ${mm3}` : ''}${me3 > 0 ? `\n⚜️Exp: ${me3} *exp*` : ''}${md3 > 0 ? `\n💎Diamond: ${md3} *diamond*` : ''}${mp3 > 0 ? `\n🥤Potion: ${mp3} *potion*` : ''}${mc3 > 0 ? `\n📦Common crate: ${mc3} *crate*` : ''}${mu3 > 0 ? `\n📦Uncommon crate: ${mu3} *crate*` : ''}
`.trim()
                    if (global.db.data.users[m.sender].mythic >= 1000) {
                        global.db.data.users[m.sender].mythic -= 1000
                        global.db.data.users[m.sender].money += mm3 * 1
                        global.db.data.users[m.sender].diamond += md3 * 1
                        global.db.data.users[m.sender].exp += me3 * 1
                        global.db.data.users[m.sender].potion += mp3 * 1
                        global.db.data.users[m.sender].common += mc3 * 1
                        global.db.data.users[m.sender].uncommon += mu3 * 1
                        conn.reply(m.chat, Mychat3, m)
                    } else conn.reply(m.chat, getMessage('rpg_open_not_enough', lang, {crate: 'Mythic' || {}}) || '📦You don\'t have enough Mythic crates', m)
                    break
                default:
                    return conn.reply(m.chat, Lmao, m)
            }
            break
        case 'legendary':
            switch (amount) {            
                case '10':
                case 'crate':
                    let _lm1 = `${Math.floor(Math.random() * 10000)}`.trim()
                    let _le1 = `${Math.floor(Math.random() * 15000)}`.trim()
                    let _lp1 = `${Math.floor(Math.random() * 30)}`.trim()
                    let _lu1 = `${Math.floor(Math.random() * 50)}`.trim()
                    let _lc1 = `${Math.floor(Math.random() * 75)}`.trim()
                    let _ll1 = `${Math.floor(Math.random() * 2)}`.trim()
                    let _lpp1 = `${Math.floor(Math.random() * 6)}`.trim()
                    let _ld1 = `${Math.floor(Math.random() * 16)}`.trim()
                    let _lmm1 = `${Math.floor(Math.random() * 4)}`.trim()
                    let lm1 = (_lm1 * 1)
                    let le1 = (_le1 * 1)
                    let lp1 = (_lp1 * 1) 
                    let lu1 = (_lu1 * 1) 
                    let lc1 = (_lc1 * 1) 
                    let ll1 = (_ll1 * 1) 
                    let lpp1 = (_lpp1 * 1)       
                    let ld1 = (_ld1 * 1) 
                    let lmm1 = (_lmm1 * 1)
                    let Lechat1 = getMessage('rpg_open_legendary_results', lang, {
                        money: lm1,
                        exp: le1,
                        diamond: ld1,
                        potion: lp1,
                        common: lc1,
                        uncommon: lu1
                     || {}}) || `
You have opened *Legendary crate* and received:${lm1 > 0 ? `\n💵Money: ${lm1}` : ''}${le1 > 0 ? `\n⚜️Exp: ${le1} *exp*` : ''}${ld1 > 0 ? `\n💎Diamond: ${ld1} *diamond*` : ''}${lp1 > 0 ? `\n🥤Potion: ${lp1} *potion*` : ''}${lc1 > 0 ? `\n📦Common crate: ${lc1} *crate*` : ''}${lu1 > 0 ? `\n📦Uncommon crate: ${lu1} *crate*` : ''}
`.trim()  
                    if (global.db.data.users[m.sender].legendary >= 10) {
                        global.db.data.users[m.sender].legendary -= 10
                        global.db.data.users[m.sender].money += lm1 * 1
                        global.db.data.users[m.sender].diamond += ld1 * 1
                        global.db.data.users[m.sender].exp += le1 * 1
                        global.db.data.users[m.sender].potion += lp1 * 1
                        global.db.data.users[m.sender].common += lc1 * 1
                        global.db.data.users[m.sender].uncommon += lu1 * 1
                        conn.reply(m.chat, Lechat1, m)
                    } else conn.reply(m.chat, getMessage('rpg_open_not_enough', lang, {crate: 'Legendary' || {}}) || '📦You don\'t have enough Legendary crates', m)
                    break
                case '100':
                    let _lm2 = `${Math.floor(Math.random() * 100000)}`.trim()
                    let _le2 = `${Math.floor(Math.random() * 200000)}`.trim()
                    let _lp2 = `${Math.floor(Math.random() * 100)}`.trim()
                    let _lu2 = `${Math.floor(Math.random() * 250)}`.trim()
                    let _lc2 = `${Math.floor(Math.random() * 750)}`.trim()
                    let _ll2 = `${Math.floor(Math.random() * 11)}`.trim()
                    let _lpp2 = `${Math.floor(Math.random() * 51)}`.trim()
                    let _ld2 = `${Math.floor(Math.random() * 50)}`.trim()
                    let _lmm2 = `${Math.floor(Math.random() * 11)}`.trim()
                    let lm2 = (_lm2 * 1)
                    let le2 = (_le2 * 1)
                    let lp2 = (_lp2 * 1) 
                    let lu2 = (_lu2 * 1) 
                    let lc2 = (_lc2 * 1) 
                    let ll2 = (_ll2 * 1) 
                    let lpp2 = (_lpp2 * 1)       
                    let ld2 = (_ld2 * 1) 
                    let lmm2 = (_lmm2 * 1)
                    let Lechat2 = getMessage('rpg_open_legendary_results', lang, {
                        money: lm2,
                        exp: le2,
                        diamond: ld2,
                        potion: lp2,
                        common: lc2,
                        uncommon: lu2
                     || {}}) || `
You have opened *Legendary crate* and received:${lm2 > 0 ? `\n💵Money: ${lm2}` : ''}${le2 > 0 ? `\n⚜️Exp: ${le2} *exp*` : ''}${ld2 > 0 ? `\n💎Diamond: ${ld2} *diamond*` : ''}${lp2 > 0 ? `\n🥤Potion: ${lp2} *potion*` : ''}${lc2 > 0 ? `\n📦Common crate: ${lc2} *crate*` : ''}${lu2 > 0 ? `\n📦Uncommon crate: ${lu2} *crate*` : ''}
`.trim()  
                    if (global.db.data.users[m.sender].legendary >= 100) {
                        global.db.data.users[m.sender].legendary -= 100
                        global.db.data.users[m.sender].money += lm2 * 1
                        global.db.data.users[m.sender].diamond += ld2 * 1
                        global.db.data.users[m.sender].exp += le2 * 1
                        global.db.data.users[m.sender].potion += lp2 * 1
                        global.db.data.users[m.sender].common += lc2 * 1
                        global.db.data.users[m.sender].uncommon += lu2 * 1
                        conn.reply(m.chat, Lechat2, m)
                    } else conn.reply(m.chat, getMessage('rpg_open_not_enough', lang, {crate: 'Legendary' || {}}) || '📦You don\'t have enough Legendary crates', m)
                    break
                case '1000':
                    let _lm3 = `${Math.floor(Math.random() * 2000000)}`.trim()
                    let _le3 = `${Math.floor(Math.random() * 5000000)}`.trim()
                    let _lp3 = `${Math.floor(Math.random() * 500)}`.trim()
                    let _lu3 = `${Math.floor(Math.random() * 1000)}`.trim()
                    let _lc3 = `${Math.floor(Math.random() * 2500)}`.trim()
                    let _ll3 = `${Math.floor(Math.random() * 51)}`.trim()
                    let _lpp3 = `${Math.floor(Math.random() * 222)}`.trim()
                    let _ld3 = `${Math.floor(Math.random() * 250)}`.trim()
                    let _lmm3 = `${Math.floor(Math.random() * 111)}`.trim()
                    let lm3 = (_lm3 * 1)
                    let le3 = (_le3 * 1)
                    let lp3 = (_lp3 * 1) 
                    let lu3 = (_lu3 * 1) 
                    let lc3 = (_lc3 * 1) 
                    let ll3 = (_ll3 * 1) 
                    let lpp3 = (_lpp3 * 1)       
                    let ld3 = (_ld3 * 1) 
                    let lmm3 = (_lmm3 * 1)
                    let Lechat3 = getMessage('rpg_open_legendary_results', lang, {
                        money: lm3,
                        exp: le3,
                        diamond: ld3,
                        potion: lp3,
                        common: lc3,
                        uncommon: lu3
                     || {}}) || `
You have opened *Legendary crate* and received:${lm3 > 0 ? `\n💵Money: ${lm3}` : ''}${le3 > 0 ? `\n⚜️Exp: ${le3} *exp*` : ''}${ld3 > 0 ? `\n💎Diamond: ${ld3} *diamond*` : ''}${lp3 > 0 ? `\n🥤Potion: ${lp3} *potion*` : ''}${lc3 > 0 ? `\n📦Common crate: ${lc3} *crate*` : ''}${lu3 > 0 ? `\n📦Uncommon crate: ${lu3} *crate*` : ''}
`.trim()  
                    if (global.db.data.users[m.sender].legendary >= 1000) {
                        global.db.data.users[m.sender].legendary -= 1000
                        global.db.data.users[m.sender].money += lm3 * 1
                        global.db.data.users[m.sender].diamond += ld3 * 1
                        global.db.data.users[m.sender].exp += le3 * 1
                        global.db.data.users[m.sender].potion += lp3 * 1
                        global.db.data.users[m.sender].common += lc3 * 1
                        global.db.data.users[m.sender].uncommon += lu3 * 1
                        conn.reply(m.chat, Lechat3, m)
                    } else conn.reply(m.chat, getMessage('rpg_open_not_enough', lang, {crate: 'Legendary' || {}}) || '📦You don\'t have enough Legendary crates', m)
                    break
                default:
                    return conn.reply(m.chat, Lmao, m)
            }
            break
        case 'pet':
            let _mknp = pickRandom([1, 2, 1, 5, 3, 2, 1, 2, 4, 1, 3, 5, 2, 4, 3])
            let mknp = (_mknp * 1)
            let kucing = global.db.data.users[m.sender].kucing
            let rubah = global.db.data.users[m.sender].rubah
            let kuda = global.db.data.users[m.sender].kuda
            let anjing = global.db.data.users[m.sender].anjing
            // Use English pet names, but maintain backward compatibility with translations
            let _pet = `${pickRandom(['cat', 'fox', 'dog', 'horse'])}`.trim()
            let petMapping = {
                'cat': 'kucing',
                'fox': 'rubah',
                'dog': 'anjing',
                'horse': 'kuda'
            }
            let oldPetName = petMapping[_pet] || _pet
            if (global.db.data.users[m.sender].pet > 0) { 
                global.db.data.users[m.sender].pet -= 1
                if (_pet == 'cat' && kucing > 0) {
                    global.db.data.users[m.sender].potion += 2
                    global.db.data.users[m.sender].makananpet += mknp * 1
                    conn.reply(m.chat, getMessage('rpg_pet_already_have', lang, {pet: _pet, food: mknp || {}}) || `You already have a pet ${_pet}, your reward has been replaced with 2 potions${mknp > 0 ? ` And ${mknp} Pet Food` : ''}`, m)
                } else if (_pet == 'cat' && kucing == 0) {
                    global.db.data.users[m.sender].kucing += 1
                    global.db.data.users[m.sender].makananpet += mknp * 1
                    conn.reply(m.chat, getMessage('rpg_pet_obtained', lang, {pet: _pet, food: mknp || {}}) || `*Congratulations! You got a pet ${_pet}${mknp > 0 ? ` And ${mknp} Pet Food*` : '*'}`, m)
                } else if (_pet == 'fox' && rubah > 0) {
                    global.db.data.users[m.sender].potion += 2
                    global.db.data.users[m.sender].makananpet += mknp * 1
                    conn.reply(m.chat, getMessage('rpg_pet_already_have', lang, {pet: _pet, food: mknp || {}}) || `You already have a pet ${_pet}, your reward has been replaced with 2 potions${mknp > 0 ? ` And ${mknp} Pet Food` : ''}`, m)
                } else if (_pet == 'fox' && rubah == 0) {
                    global.db.data.users[m.sender].rubah += 1
                    global.db.data.users[m.sender].makananpet += mknp * 1
                    conn.reply(m.chat, getMessage('rpg_pet_obtained', lang, {pet: _pet, food: mknp || {}}) || `*Congratulations! You got a pet ${_pet}${mknp > 0 ? ` And ${mknp} Pet Food*` : '*'}`, m)
                } else if (_pet == 'dog' && anjing > 0) {
                    global.db.data.users[m.sender].potion += 2
                    global.db.data.users[m.sender].makananpet += mknp * 1
                    conn.reply(m.chat, getMessage('rpg_pet_already_have', lang, {pet: _pet, food: mknp || {}}) || `You already have a pet ${_pet}, your reward has been replaced with 2 potions${mknp > 0 ? ` And ${mknp} Pet Food` : ''}`, m)
                } else if (_pet == 'dog' && anjing == 0) {
                    global.db.data.users[m.sender].anjing += 1
                    global.db.data.users[m.sender].makananpet += mknp * 1
                    conn.reply(m.chat, getMessage('rpg_pet_obtained', lang, {pet: _pet, food: mknp || {}}) || `*Congratulations! You got a pet ${_pet}${mknp > 0 ? ` And ${mknp} Pet Food*` : '*'}`, m) 
                } else if (_pet == 'horse' && kuda > 0) {
                    global.db.data.users[m.sender].potion += 2
                    global.db.data.users[m.sender].makananpet += mknp * 1
                    conn.reply(m.chat, getMessage('rpg_pet_already_have', lang, {pet: _pet, food: mknp || {}}) || `You already have a pet ${_pet}, your reward has been replaced with 2 potions${mknp > 0 ? ` And ${mknp} Pet Food` : ''}`, m)
                } else if (_pet == 'horse' && kuda == 0) {
                    global.db.data.users[m.sender].kuda += 1
                    global.db.data.users[m.sender].makananpet += mknp * 1
                    conn.reply(m.chat, getMessage('rpg_pet_obtained', lang, {pet: _pet, food: mknp || {}}) || `*Congratulations! You got a pet ${_pet}${mknp > 0 ? ` And ${mknp} Pet Food*` : '*'}`, m)
                } else {
                    global.db.data.users[m.sender].makananpet += mknp * 1
                    m.reply((getMessage('rpg_pet_failed', lang) ? pickRandom(getMessage('rpg_pet_failed', lang)) : pickRandom(['You are not lucky', 'Try opening another one next time, you did not get a pet', 'Too bad, you did not get a pet', 'Maybe you are not lucky and did not get a pet', 'Better luck next time'])) + '. ' + (getMessage('rpg_pet_only_got', lang, {amount: mknp || {}}) || `You only got *${mknp}* pet food`))
                }
            } else m.reply(getMessage('rpg_open_not_enough', lang, {crate: 'Pet' || {}}) || '📦You don\'t have enough Pet Crates')
            break
        default:
            return conn.reply(m.chat, bruh, m)
    }
  } catch (e) {
      console.log(e)
      conn.reply(m.chat, getMessage('rpg_open_usage', lang, {prefix: usedPrefix || {}}) || `${usedPrefix}open <crate name> < 10 | 100 | 1000 >\n\nExample Usage: *${usedPrefix}open common 10*\n\nCrate list:\n*common*\n*uncommon*\n*mythic*\n*legendary*`, m)
      if (DevMode) {
        for (let jid of global.owner.map(v => v.replace(/[^0-9]/g, '') + '@s.whatsapp.net').filter(v => v != conn.user.jid)) {
            conn.sendMessage(jid, 'Open.js error\nNo: *' + m.sender.split`@`[0] + '*\nCommand: *' + m.text + '*\n\n*' + e + '*')
        }
    }
  }
}
handler.help = ['open <crate>']
handler.tags = ['rpg']
handler.command = /^(open|buka)$/i
handler.register = true
handler.rpg = true
handler.fail = null

}

module.exports = handler

function pickRandom(list) {
  return list[Math.floor(list.length * Math.random())]
}