const { getMessage } = require('../lib/languages');
const gunshopTranslations = require('../gunshop-translations');
const cooldown = 30000;


const items = {
    buygun: {
        tombak: { money: 50000000 },
        busur: { money: 10000000 },
        anakpanah: { money: 8000000 },
        glock: { dana: 3000000 },
        ammo: { gopay: 3500000 },
        ak47: { dana: 6400000 },
        m4: { dana: 3400000 },
        m16: { dana: 8400000 },
        ar15: { ovo: 7700000 },
        scar: { gopay: 9000000 },
        famas: { ovo: 9000000 },
        aug: { dana: 9400000 },
        uzi: { dana: 5500000 },
        mp5: { ovo: 5000000 },
        p90: { money: 6400000 },
        mac10: { money: 4000000 },
        vector: { gopay: 4200000 },
        barrettm82: { money: 19900000 },
        remington700: { ovo: 2000000 },
        dragunovsvd: { dana: 88000000 },
        m40: { ovo: 40000000 },
        m24: { ovo: 40000000 }
    },
    sellgun: {
        tombak: { money: 2500000 },
        busur: { money: 500000 },
        anakpanah: { money: 400000 },
        glock: { money: 1500000 },
        ammo: { money: 1750000 },
        ak47: { money: 3200000 },
        m4: { money: 170000 },
        m16: { money: 420000 },
        ar15: { money: 385000 },
        scar: { money: 450000 },
        famas: { money: 450000 },
        aug: { money: 470000 },
        uzi: { money: 275000 },
        mp5: { money: 250000 },
        p90: { money: 320000 },
        mac10: { money: 200000 },
        vector: { money: 210000 },
        barrettm82: { money: 9950000 },
        remington700: { money: 100000 },
        dragunovsvd: { money: 4400000 },
        m40: { money: 200000 },
        m24: { money: 200000 }
    }
};

const handler = async (m, { conn, command, usedPrefix, args, text, isPrems }) => {
    global.db.users = global.db.users || {}; // Ensure the users object is initialized
    let user = global.db.users[m.sender] = global.db.users[m.sender] || {};

    // Get user language preference or default to English
    const userLang = (user.language || conn.language || 'en').toLowerCase();
    
    if (user.jail === true) {
        throw getMessage(gunshopTranslations, userLang, 'gunshop_jail_warning');
    }

    if (new Date() - user.pekerjaantiga < cooldown) {
        const remainingTime = new Date(user.pekerjaantiga + cooldown) - new Date();
        const formattedTime = new Date(remainingTime).toISOString().substr(11, 8);
        throw getMessage(gunshopTranslations, userLang, 'gunshop_recent_visit').replace('%time%', formattedTime);
    }

    if (command.toLowerCase() == 'gunshop') {
    let gunshopTitle = getMessage(gunshopTranslations, userLang, 'gunshop_title');
    let gunshopDesc = getMessage(gunshopTranslations, userLang, 'gunshop_description');
    
    let text = `
*${gunshopTitle}*

${gunshopDesc}
    `.trim();
    conn.reply(m.chat, text, m);
    return;
}

const listItems = Object.fromEntries(Object.entries(items[command.toLowerCase()])
    .filter(([v, { money, dana, gopay, ovo }]) => {
        if (money && user.money < money) return false;
        if (dana && user.dana < dana) return false;
        if (gopay && user.gopay < gopay) return false;
        if (ovo && user.ovo < ovo) return false;
        return v && v in user;
    }));

const info = `
*${getMessage(gunshopTranslations, userLang, 'gunshop_usage_example').replace('%prefix%', usedPrefix).replace('%command%', command)}*
    
*${getMessage(gunshopTranslations, userLang, 'gunshop_list_weapons')}* 
${Object.keys(items[command.toLowerCase()]).map((v) => {
        let paymentMethod = Object.keys(items[command.toLowerCase()][v])[0];
        return `${emojis(v)}${capitalizeFirstLetter(v)} | ${toSimple(items[command.toLowerCase()][v][paymentMethod])} ${emojis(paymentMethod)}${capitalizeFirstLetter(paymentMethod)}`.trim();
    }).join('\n')}
`.trim();

const item = (args[0] || '').toLowerCase();

if (!items[command.toLowerCase()][item]) {
    return m.reply(info);
}

if (!args[1]) {
    m.reply(info);
    return;
}

let total = Math.floor(isNumber(args[1]) ? Math.min(Math.max(parseInt(args[1]), 1)) : 1) * ({"K": 1e3, "M": 1e6, "B": 1e9, "T": 1e12, "QA": 1e15, "QI": 1e18, "SX": 1e21, "SP": 1e24, "OC": 1e27, "N": 1e30, "DC": 1e33, "UD": 1e36, "DD": 1e39, "TD": 1e42, "QUA": 1e45, "QUI": 1e48, "SXD": 1e51, "SPD": 1e54, "OCD": 1e57, "NOD": 1e60, "VG": 1e63}[args[1].toUpperCase().replace(/[^KMBTQAISXONDCUP]/g, '')] || 1);

if (command.toLowerCase() == 'buygun') {
    const paymentMethods = ['money', 'dana', 'gopay', 'ovo'];
    const paymentMethod = paymentMethods[Math.floor(Math.random() * paymentMethods.length)];
    if (user[paymentMethod] < items[command.toLowerCase()][item][paymentMethod] * total) {
        const needed = (items[command.toLowerCase()][item][paymentMethod] * total) - user[paymentMethod];
        return m.reply(
            getMessage(gunshopTranslations, userLang, 'gunshop_buy_not_enough')
                .replace('%payment%', paymentMethod)
                .replace('%amount%', toSimple(total))
                .replace('%item%', `${emojis(item)}${capitalizeFirstLetter(item)}`)
                .replace('%needed%', toSimple(needed))
        );
    }

    user[paymentMethod] -= items[command.toLowerCase()][item][paymentMethod] * total;
    user[item] = (user[item] || 0) + total;
    user.pekerjaantiga = new Date() * 1;

    return m.reply(
        getMessage(gunshopTranslations, userLang, 'gunshop_buy_success')
            .replace('%amount%', toSimple(total))
            .replace('%item%', `${emojis(item)}${capitalizeFirstLetter(item)}`)
            .replace('%payment%', `${emojis(paymentMethod)}${paymentMethod}`)
    );
} else if (command.toLowerCase() == 'sellgun') {
    if (isPrems && /all/i.test(args[1])) {
        total = user[item];
    }
    if (user[item] < total) {
        return m.reply(
            getMessage(gunshopTranslations, userLang, 'gunshop_sell_not_enough')
                .replace('%item%', `${emojis(item)}${capitalizeFirstLetter(item)}`)
                .replace('%available%', toSimple(user[item]))
        );
    }
    const reward = items[command.toLowerCase()][item];
    const rewardKey = Object.keys(reward)[0];
    if (!(rewardKey in user)) {
        throw new Error(
            getMessage(gunshopTranslations, userLang, 'gunshop_db_error')
                .replace('%reward%', rewardKey)
        );
    }

    user[item] -= total;
    user[rewardKey] += items[command.toLowerCase()][item][rewardKey] * total;
    user.pekerjaantiga = new Date() * 1;

    return m.reply(
        getMessage(gunshopTranslations, userLang, 'gunshop_sell_success')
            .replace('%amount%', toSimple(total))
            .replace('%item%', `${emojis(item)}${capitalizeFirstLetter(item)}`)
            .replace('%reward%', toSimple(items[command.toLowerCase()][item][rewardKey] * total))
            .replace('%payment%', `${emojis(rewardKey)}${rewardKey}`)
    );
}
return;
};

handler.help = ['gunshop', 'buygun', 'sellgun'].map(v => v + '');
handler.tags = ['rpg'];
handler.command = /^(gunshop|buygun|sellgun)$/i;
handler.cooldown = cooldown;
handler.rpg = true;
handler.disabled = false;
module.exports = handler;

function isNumber(number) {
    if (!number) return number;
    number = parseInt(number);
    return typeof number == 'number' && !isNaN(number);
}

function toSimple(number) {
    if (isNaN(parseFloat(number))) return number;
    if (parseFloat(number) === 0) return '0';
    number = parseFloat(number).toFixed(0);
    const suffixes = ['', 'K', 'JT', 'M', 'T'];
    const base = 1000;
    const exponent = Math.floor(Math.log10(Math.abs(number)) / 3);
    const suffix = suffixes[exponent] || '';
    const simplified = number / Math.pow(base, exponent);
    const formatter = Intl.NumberFormat('en', { maximumFractionDigits: 1 });
    return formatter.format(simplified) + suffix;
}

function emojis(item) {
    switch (item.toLowerCase()) {
        case 'spear': return '🪓';
        case 'bow': return '🏹';
        case 'anakarrow': return '🏹';
        case 'glock': return '🔫';
        case 'ammo': return '🔫';
        case 'ak47': return '🔫';
        case 'm4': return '🔫';
        case 'm16': return '🔫';
        case 'ar15': return '🔫';
        case 'scar': return '🔫';
        case 'famas': return '🔫';
        case 'aug': return '🔫';
        case 'uzi': return '🔫';
        case 'mp5': return '🔫';
        case 'p90': return '🔫';
        case 'mac10': return '🔫';
        case 'vector': return '🔫';
        case 'barrettm82': return '🔫';
        case 'remington700': return '🔫';
        case 'dragunovsvd': return '🔫';
        case 'm40': return '🔫';
        case 'm24': return '🔫';
        case 'money': return '💵';
        case 'dana': return '💰';
        case 'gopay': return '💳';
        case 'ovo': return '📱';
        default: return '';
    }
}

function capitalizeFirstLetter(str) {
    let words = str.split(" ");
    for (let i = 0; i < words.length; i++) {
        words[i] = words[i].charAt(0).toUpperCase() + words[i].slice(1).toLowerCase();
    }
    return words.join(" ");
}