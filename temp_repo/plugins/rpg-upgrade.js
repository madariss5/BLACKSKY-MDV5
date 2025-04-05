const { getMessage } = require('../lib/languages');
const handler = async (m, {
    conn,
    command,
    args,
    usedPrefix
}) => {
    try {
        let user = global.db.data.users[m.sender];
        let fishingrod = user.fishingrod * 1;
        let pickaxe = user.pickaxe * 1;
        let sword = user.sword * 1;
        let armor = user.armor * 1;
        let katana = user.katana * 1;
        let axe = user.axe * 1;
        let bow = user.bow * 1;
        let knife = user.knife * 1;

        let Type = (args[0] || '').toLowerCase();
        let prefix = usedPrefix;

        let lmao1 = `乂 *U P G R A D E*

乂 *L I S T - U P G R A D E*
*[ 🎣 ]* • FishingRod
*[ ⛏️ ]* • Pickaxe
*[ 🗡 ]* • Sword
*[ 🛡 ]* • Armor
*[ 🦯 ]* • Katana
*[ 🏹 ]* • Bow
*[ 🪓 ]* • Axe
*[ 🔪 ]* • Pisau

乂 *H O W - U P G R A D E*
• _Example_ :
.uptool _sword_
`.trim();

        switch (Type) {
            case 'fishingrod':
                if (fishingrod == 0) {
                    m.reply(`you not yet memiliki *🎣FishingRod*\nuntuk getnya ketik *${usedPrefix}craft fishingrod*`);
                } else if (fishingrod > 9) {
                    m.reply(`*🎣FishingRod* you already level max`);
                } else {
                    let _wood = fishingrod * 25;
                    let _string = fishingrod * 15;
                    let _money = fishingrod * 10000;
                    if (user.wood < _wood || user.string < _string || user.money < _money) {
                        m.reply(`Material you lacking!!${user.wood < _wood ? `\n🪵Kayu Kamu lacking *${_wood - user.wood}*` : ''}${user.string < _string ? `\n🧶String Kamu lacking *${_string - user.string}*` : ''}${user.money < _money ? `\n💰money Kamu lacking *${_money - user.money}*` : ''}`);
                    } else {
                        user.fishingrod += 1;
                        user.wood -= _wood;
                        user.string -= _string;
                        user.money -= _money;
                        user.fishingroddurability = 0;
                        user.fishingroddurability += fishingrod * 50;
                        m.reply(`Succes mengupgrade *🎣FishingRod*`);
                    }
                }
                break;
            case 'pickaxe':
                if (pickaxe == 0) {
                    m.reply(`you not yet memiliki *⛏Pickaxe*\nuntuk memilikinya ketik *${usedPrefix}craft pickaxe*`);
                } else if (pickaxe > 9) {
                    m.reply(`*⛏Pickaxe* you already level max`);
                } else {
                    let __stone = pickaxe * 25;
                    let __wood = pickaxe * 15;
                    let __money = pickaxe * 15000;
                    if (user.stone < __stone || user.wood < __wood || user.money < __money) {
                        m.reply(`Material Anda lacking!!${user.stone < __stone ? `\n🪨Batu kamu subtract *${__stone - user.stone}*` : ''}${user.wood < __wood ? `\n🪵Kayu kamu subtract *${__wood - user.wood}*` : ''}${user.money < __money ? `\n💰money kamu subtract *${__money - user.money}*` : ''}`);
                    } else {
                        user.pickaxe += 1;
                        user.wood -= __wood;
                        user.stone -= __stone;
                        user.money -= __money;
                        user.pickaxedurability = 0;
                        user.pickaxedurability += pickaxe * 50;
                        m.reply(`Succes mengupgrade *⛏Pickaxe*`);
                    }
                }
                break;
                case 'axe':
                if (axe == 0) {
                    m.reply(`you not yet memiliki *🪓 Axe*\nuntuk memilikinya ketik *${usedPrefix}craft axe*`);
                } else if (axe > 9) {
                    m.reply(`*🪓 axe* you already level max`);
                } else {
                    let __stone = axe * 25;
                    let __wood = axe * 15;
                    let __money = axe * 15000;
                    if (user.stone < __stone || user.wood < __wood || user.money < __money) {
                        m.reply(`Material Anda lacking!!${user.stone < __stone ? `\n🪨Batu kamu subtract *${__stone - user.stone}*` : ''}${user.wood < __wood ? `\n🪵Kayu kamu subtract *${__wood - user.wood}*` : ''}${user.money < __money ? `\n💰money kamu subtract *${__money - user.money}*` : ''}`);
                    } else {
                        user.axe += 1;
                        user.wood -= __wood;
                        user.stone -= __stone;
                        user.money -= __money;
                        user.axedurability = 0;
                        user.axedurability += axe * 50;
                        m.reply(`Succes mengupgrade *🪓 Axe*`);
                    }
                }
                break;
                case 'bow':
                if (bow == 0) {
                    m.reply(`you not yet memiliki *🏹 Bow*\nuntuk memilikinya ketik *${usedPrefix}craft bow*`);
                } else if (bow > 9) {
                    m.reply(`*🏹 bow* you already level max`);
                } else {
                    let __stone = bow * 25;
                    let __wood = bow * 15;
                    let __money = bow * 15000;
                    if (user.stone < __stone || user.wood < __wood || user.money < __money) {
                        m.reply(`Material Anda lacking!!${user.stone < __stone ? `\n🪨Batu kamu subtract *${__stone - user.stone}*` : ''}${user.wood < __wood ? `\n🪵Kayu kamu subtract *${__wood - user.wood}*` : ''}${user.money < __money ? `\n💰money kamu subtract *${__money - user.money}*` : ''}`);
                    } else {
                        user.bow += 1;
                        user.wood -= __wood;
                        user.stone -= __stone;
                        user.money -= __money;
                        user.bowdurability = 0;
                        user.bowdurability += axe * 50;
                        m.reply(`Succes mengupgrade *🏹 Bow*`);
                    }
                }
                break;
            case 'sword':
                if (sword == 0) {
                    m.reply(`you not yet memiliki *🗡Sword*\nuntuk memilikinya ketik *${usedPrefix}craft sword*`);
                } else if (sword > 9) {
                    m.reply(`*🗡Sword* you already level max`);
                } else {
                    let _iron = sword * 25;
                    let ___wood = sword * 15;
                    let ___money = sword * 10000;
                    if (user.iron < _iron || user.wood < ___wood || user.money < ___money) {
                        m.reply(`Material Anda lacking!!${user.iron < _iron ? `\n🔩Iron kamu subtract *${_iron - user.iron}*` : ''}${user.wood < ___wood ? `\n🪵Kayu kamu subtract *${___wood - user.wood}*` : ''}${user.money < ___money ? `\n💰money kamu subtract *${___money - user.money}*` : ''}`);
                    } else {
                        user.sword += 1;
                        user.iron -= _iron;
                        user.wood -= ___wood;
                        user.money -= ___money;
                        user.sworddurability = 0;
                        user.sworddurability += sword * 50;
                        m.reply(`Succes mengupgrade *🗡Sword*`);
                    }
                }
                break;
                case 'knife':
                if (knife == 0) {
                    m.reply(`you not yet memiliki *🔪Pisau*\nuntuk memilikinya ketik *${usedPrefix}craft knife*`);
                } else if (knife > 9) {
                    m.reply(`*🔪Pisau* you already level max`);
                } else {
                    let _iron = knife * 25;
                    let ___wood = knife * 15;
                    let ___money = knife * 10000;
                    if (user.iron < _iron || user.wood < ___wood || user.money < ___money) {
                        m.reply(`Material Anda lacking!!${user.iron < _iron ? `\n🔩Iron kamu subtract *${_iron - user.iron}*` : ''}${user.wood < ___wood ? `\n🪵Kayu kamu subtract *${___wood - user.wood}*` : ''}${user.money < ___money ? `\n💰money kamu subtract *${___money - user.money}*` : ''}`);
                    } else {
                        user.knife += 1;
                        user.iron -= _iron;
                        user.wood -= ___wood;
                        user.money -= ___money;
                        user.knifedurability = 0;
                        user.knifedurability += knife * 50;
                        m.reply(`Succes mengupgrade *🔪Pisau*`);
                    }
                }
                break;
            case 'katana':
                if (katana == 0) {
                    m.reply(`you not yet memiliki *🦯Katana*\nuntuk memilikinya ketik *${usedPrefix}craft katana`);
                } else if (katana > 9) {
                    m.reply(`*🦯Katana* you already level max`);
                } else {
                    let _iron = katana * 30;
                    let ___wood = katana * 15;
                    let ___diamond = katana * 10;
                    let ___emerald = katana * 5;
                    let ___money = katana * 50000;
                    if (user.iron < _iron || user.wood < ___wood || user.diamond < ___diamond || user.emerald < ___emerald || user.money < ___money) {
                        m.reply(`Material Anda lacking!!${user.iron < _iron ? `\n🔩Iron kamu subtract *${_iron - user.iron}*` : ''}${user.wood < ___wood ? `\n🪵Kayu kamu subtract *${___wood - user.wood}*` : ''}${user.diamond < ___diamond ? `\n💎Diamond kamu subtract *${___diamond - user.diamond}*` : ''}${user.emerald < ___emerald ? `\n🟩Emerald kamu subtract *${___emerald - user.emerald}*` : ''}${user.money < ___money ? `\n💰money kamu subtract *${___money - user.money}*` : ''}`);
                    } else {
                        user.katana += 1;
                        user.iron -= _iron;
                        user.wood -= ___wood;
                        user.diamond -= ___diamond;
                        user.emerald -= ___emerald;
                        user.money -= ___money;
                        user.katanadurability = 0;
                        user.katanadurability += katana * 50;
                        m.reply(`Succes mengupgrade *🦯Katana*`);
                    }
                }
                break;
            case 'armor':
                if (armor == 0) {
                    m.reply(`you not yet memiliki *🛡armor*\nuntuk memilikinya ketik *${usedPrefix}craft armor*`);
                } else if (armor > 9) {
                    m.reply(`*🛡 Armor* you already level max`);
                } else {
                    let __iron = armor * 10;
                    let ___diamond = armor * 5;
                    let ___money = armor * 30000;
                    if (user.iron < __iron || user.diamond < ___diamond || user.money < ___money) {
                        m.reply(`Material Anda lacking!!${user.iron < __iron ? `\n🔩 iron kamu subtract *${__iron - user.iron}*` : ''}${user.diamond < ___diamond ? `\n💎 Diamond kamu subtract *${___diamond - user.diamond}*` : ''}${user.money < ___money ? `\n💰money kamu subtract *${___money - user.money}*` : ''}`);
                    } else {
                        user.armor += 1;
                        user.iron -= __iron;
                        user.diamond -= ___diamond;
                        user.money -= ___money;
                        user.armordurability = 0;
                        user.armordurability += armor * 50;
                        m.reply(`Succes mengupgrade *🛡Armor*`);
                    }
                }
                break;
            default:
                await conn.reply(m.chat, lmao1, m, {
                    contextInfo: {
                        externalAdReply: {
                            mediaType: 1,
                            title: 'BETABOTZ RPG',
                            thumbnailUrl: 'https://telegra.ph/file/97dba25a7bd8084913166.jpg',
                            renderLargerThumbnail: true,
                            sourceUrl: ''
                        }
                    }
                });
        }
    } catch (e) {
        console.log(e);
        throw e;
    }
};

handler.help = ['uptool'];
handler.tags = ['rpg'];
handler.command = /^(up(tool)?)$/i;
handler.fail = null;
handler.group = true;
handler.rpg = true

module.exports = handler;