const { getMessage } = require('../lib/languages');

let handler = async (m, { conn, command, args, usedPrefix }) => {
    // Get user's preferred language
    const user = global.db.data.users[m.sender];
    const chat = global.db.data.chats[m.chat];
    const lang = user?.language || chat?.language || global.language;
 {
    let Type = (args[0] || '').toLowerCase();
    let _type = (args[0] || '').toLowerCase();
    let user = global.db.data.users[m.sender];

    let caption = `*B L A C K S M I T H*

> *L I S T - C R A F T*
*[ ⛏️ ]* • Pickaxe 
*[ ⚔️ ]* • Sword 
*[ 🎣 ]* • Fishingrod 
*[ 🥼 ]* • Armor 
*[ 🦯 ]* • Katana 
*[ 🪓 ]* • Axe 
*[ 🏹 ]* • Bow 
*[ 🔪 ]* • Pisau 

> *R E C E I P T*
*[ ⛏️ ]* • _Pickaxe_
• _10_ || *Kayu*
• _5_ || *Batu*
• _5_ || *Iron*
• _20_ || *String*

*[ 🪓 ]* • _Axe_
• _15_ || *Kayu*
• _10_ || *Batu*
• _15_ || *Iron*
• _10_ || *String*

*[ ⚔️ ]* • _Sword_
• _10_ || *Kayu*
• _15_ || *Iron*

*[ 🔪 ]* • _Pisau_
• _15_ || *Kayu*
• _20_ || *Iron*

*[ 🏹 ]* • _Bow_
• _10_ || *Kayu*
• _5_ || *Iron*
• _10_ || *String*

*[ 🎣 ]* • _Fishingrod_
• _10_ || *Kayu*
• _2_ || *Iron*
• _20_ || *String*

*[ 🥼 ]* • _Armor_
• _5_ || *Iron*
• _1_ || *Diamond*

*[ 🦯 ]* • _Katana_
• _10_ || *Kayu*
• _15_ || *Iron*
• _5_ || *Diamond*
• _3_ || *Emerald*

> *H O W - C R A F T*
• _Example_ :
.craft _sword_
`.trim();

    try {
        if (/craft|Crafting|blacksmith/i.test(command)) {
            const count = args[1] && args[1].length > 0 ? Math.min(99999999, Math.max(parseInt(args[1]), 1)) : !args[1] || args.length < 3 ? 1 : Math.min(1, count);
            switch (Type) {
                case 'pickaxe':
                    if (user.pickaxe > 0) return m.reply('Kamu already memilik this');
                    if (user.stone < 5 || user.wood < 10 || user.iron < 5 || user.string < 20) return m.reply(`items not enough!\nUntuk make pickaxe. Kamu memerlukan : ${user.wood < 10 ? `\n${10 - user.wood} wood🪵` : ''} ${user.iron < 5 ? `\n${5 - user.iron} iron⛓` : ''}${user.string < 20 ? `\n${20 - user.string} String🕸️` : ''}${user.stone < 5 ? `\n${5 - user.stone} Batu 🪨` : ''}`);
                    user.wood -= 10;
                    user.iron -= 5;
                    user.stone -= 5;
                    user.string -= 20;
                    user.pickaxe += 1;
                    user.pickaxedurability = 40;
                    m.reply("Sukses make 1 pickaxe 🔨");
                    break;                  
                case 'sword':
                    if (user.sword > 0) return m.reply('Kamu already memilik this');
                    if (user.wood < 10 || user.iron < 15) return m.reply(`items not enough!\nUntuk make sword. Kamu memerlukan :${user.wood < 10 ? `\n${10 - user.wood} wood🪵` : ''}${user.iron < 15 ? `\n${15 - user.iron} iron⛓️` : ''}`);
                    user.wood -= 10;
                    user.iron -= 15;
                    user.sword += 1;
                    user.sworddurability = 40;
                    m.reply("Sukses make 1 sword 🗡️");
                    break;
                    case 'knife':
                    if (user.knife > 0) return m.reply('Kamu already memilik this');
                    if (user.wood < 15 || user.iron < 20) return m.reply(`items not enough!\nUntuk make knife. Kamu memerlukan :${user.wood < 15 ? `\n${15 - user.wood} wood🪵` : ''}${user.iron < 20 ? `\n${20 - user.iron} iron⛓️` : ''}`);
                    user.wood -= 15;
                    user.iron -= 20;
                    user.knife += 1;
                    user.knifedurability = 40;
                    m.reply("Sukses make 1 knife 🔪");
                    break;
                    case 'axe':
                    if (user.axe > 0) return m.reply('Kamu already memilik this');
                    if (user.stone < 10 || user.wood < 15 || user.iron < 15 || user.string < 10) return m.reply(`items not enough!\nUntuk make axe. Kamu memerlukan : ${user.wood < 10 ? `\n${10 - user.wood} wood🪵` : ''} ${user.iron < 5 ? `\n${5 - user.iron} iron⛓` : ''}${user.string < 20 ? `\n${20 - user.string} String🕸️` : ''}${user.stone < 5 ? `\n${5 - user.stone} Batu 🪨` : ''}`);
                    user.wood -= 15;
                    user.iron -= 15;
                    user.stone -= 10;
                    user.string -= 10;
                    user.axe += 1;
                    user.axedurability = 40;
                    m.reply("Sukses make 1 axe 🪓");
                    break;
                case 'fishingrod':
                    if (user.fishingrod > 0) return m.reply('Kamu already memilik this');
                    if (user.wood < 20 || user.iron < 5 || user.string < 20) return m.reply(`items not enough!\nUntuk make pancingan. Kamu memerlukan :${user.wood < 20 ? `\n${20 - user.wood} wood🪵` : ''}${user.iron < 5 ? `\n${5 - user.iron} iron⛓` : ''}${user.string < 20 ? `\n${20 - user.string} String🕸️` : ''}`);
                    user.wood -= 10;
                    user.iron -= 2;
                    user.string -= 20;
                    user.fishingrod += 1;
                    user.fishingroddurability = 40;
                    m.reply("Sukses make 1 Pancingan 🎣");
                    break;
                    case 'bow':
                    if (user.bow > 0) return m.reply('Kamu already memilik this');
                    if (user.wood < 10 || user.iron < 5 || user.string < 10) return m.reply(`items not enough!\nUntuk make bow. Kamu memerlukan :${user.wood < 20 ? `\n${20 - user.wood} wood🪵` : ''}${user.iron < 5 ? `\n${5 - user.iron} iron⛓` : ''}${user.string < 20 ? `\n${20 - user.string} String🕸️` : ''}`);
                    user.wood -= 10;
                    user.iron -= 5;
                    user.string -= 10;
                    user.bow += 1;
                    user.bowdurability = 40;
                    m.reply("Sukses make 1 Bow 🏹");
                    break;
                case 'katana':
                    if (user.katana > 0) return m.reply('Kamu already memilik this');
                    if (user.wood < 10 || user.iron < 15 || user.diamond < 5 || user.emerald < 3) return m.reply(`items not enough!\nUntuk make katana. Kamu memerlukan :${user.wood < 10 ? `\n${10 - user.wood} wood🪵` : ''}${user.iron < 15 ? `\n${15 - user.iron} iron⛓` : ''}${user.diamond < 5 ? `\n${5 - user.diamond} Diamond💎` : ''}${user.emerald < 3 ? `\n${3 - user.emerald} Emerald 🟩` : ''}`);
                    user.wood -= 10;
                    user.iron -= 15;
                    user.diamond -= 5;
                    user.emerald -= 3;
                    user.katana += 1;
                    user.katanadurability = 40;
                    m.reply("Sukses make 1 Katana 🦯");
                    break;
                case 'armor':
                    if (user.armor > 0) return m.reply('Kamu already memilik this');
                    if (user.iron < 5 || user.diamond < 1) return m.reply(`items not enough!\nUntuk make armor. Kamu memerlukan :${user.iron < 5 ? `\n${5 - user.iron} Iron ⛓️` : ''}${user.diamond < 1 ? `\n${1 - user.diamond} Diamond 💎` : ''}`);
                    user.iron -= 5;
                    user.diamond -= 1;
                    user.armor += 1;
                    user.armordurability = 50;
                    m.reply("Sukses make 1 Armor 🥼");
                    break;
                default:
                    await conn.reply(m.chat, caption, m, {
                        contextInfo: {
                            externalAdReply: {
                                mediaType: 1,
                                title: 'BETABOTZ RPG',
                                thumbnailUrl: 'https://telegra.ph/file/ed878d04e7842407c2b89.jpg',
                                renderLargerThumbnail: true,
                                sourceUrl: ''
                            }
                        }
                    });
            }
        } else if (/enchant|enchan/i.test(command)) {
            const count = args[2] && args[2].length > 0 ? Math.min(99999999, Math.max(parseInt(args[2]), 1)) : !args[2] || args.length < 4 ? 1 : Math.min(1, count);
            switch (_type) {
                case 't':
                    break;
                case '':
                    break;
                default:
                    m.reply(caption);
            }
        }
    } catch (err) {
        m.reply("Error\n\n\n" + err.stack);
    }
};

handler.help = ['craft', 'blacksmith'];
handler.tags = ['rpg'];
handler.command = /^(craft|crafting|chant|blacksmith)/i;
handler.register = true;
handler.group = true;
handler.rpg = true

}

module.exports = handler;