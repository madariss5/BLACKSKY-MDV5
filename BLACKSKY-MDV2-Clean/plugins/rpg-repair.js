const { getMessage } = require('../lib/languages');

let handler  = async (m, { conn, command, args, usedPrefix, DevMode }) => {
  let Type = (args[0] || '').toLowerCase()
  let _type = (args[0] || '').toLowerCase()
  let user = global.db.data.users[m.sender]
  global.db.data.users[m.sender].pickaxe = global.db.data.users[m.sender].pickaxe || 0
  global.db.data.users[m.sender].pedang = global.db.data.users[m.sender].pedang || 0
  global.db.data.users[m.sender].fishingrod = global.db.data.users[m.sender].fishingrod || 0
  global.db.data.users[m.sender].bow = global.db.data.users[m.sender].bow || 0
  global.db.data.users[m.sender].katana = global.db.data.users[m.sender].katana || 0
  global.db.data.users[m.sender].axe = global.db.data.users[m.sender].axe || 0
  global.db.data.users[m.sender].armor = global.db.data.users[m.sender].armor || 0

  let caption = `
乂 *R E P A I R*

乂 *L I S T - R E P A I R*
*[ ⛏️ ]* • Pickaxe 
*[ ⚔️ ]* • Sword 
*[ 🎣 ]* • Fishingrod 
*[ 🥼 ]* • Armor 
*[ 🦯 ]* • Katana 
*[ 🪓 ]* • Axe 
*[ 🏹 ]* • Bow 

乂 *M A T E R I A L*
*[ ⛏️ ]* • _Pickaxe_
 • _5_ || *Wood*
• _3_ || *Stone*
• _3_ || *Iron*
• _1_ || *Diamond*

*[ 🦯 ]* • _Katana_
 • _5_ || *Wood*
• _10_ || *Stone*
• _20_ || *Iron*
• _10_ || *Diamond*

*[ ⚔️ ]* • _Sword_
• _5_ || Wood
• _9_ || Iron
• _1_ || Diamond

*[ 🥼 ]* • _Armor_
• _15_ || Iron
• _3_ || Diamond

*[ 🪓 ]* • _Axe_
• _15_ || Iron
• _10_ || Wood

*[ 🎣 ]* • _FishingRod_
 • _10_ || *Wood*
• _15_ || *Stone*
• _5_ || *Iron*

*[ 🏹 ]* • _Bow_
 • _15_ || *Wood*
• _5_ || *Iron*
• _10_ || *String*

_Example_ :
.repair _bow_
`
  try {
    if (/repair|perbaiki/i.test(command)) {
      const count = args[1] && args[1].length > 0 ? Math.min(99999999, Math.max(parseInt(args[1]), 1)) : !args[1] || args.length < 3 ? 1 : Math.min(1, count)
        switch (Type) {
          case 'pickaxe':
          if (user.pickaxedurability > 99) return m.reply('Your Pickaxe has no damage')
          if (user.pickaxe == 0) return m.reply('You do not have a Pickaxe')
            if(user.diamond < 1 || user.batu < 3 || user.kayu < 5 || user.iron < 3 ) return m.reply(`Not enough materials for repair!`)
             user.batu -= 3
             user.kayu -= 5
             user.iron -= 3
             user.diamond -= 1
             user.pickaxedurability = 100
            m.reply("Successfully repaired Pickaxe")
            break
            case 'katana':
          if (user.katanadurability > 99) return m.reply('Your Katana has no damage')
          if (user.katana == 0) return m.reply('You do not have a Katana')
            if(user.diamond < 10 || user.batu < 10 || user.kayu < 5 || user.iron < 20 ) return m.reply(`Not enough materials for repair!`)
             user.batu -= 10
             user.kayu -= 5
             user.iron -= 20
             user.diamond -= 10
             user.katanadurability = 100
            m.reply("Successfully repaired Katana")
            break
          case 'sword':
          if (user.sworddurability > 99) return m.reply('Your Sword has no damage')
          if (user.sword == 0) return m.reply('You do not have a Sword')
            if(user.diamond < 1 || user.kayu < 5 || user.iron < 9 ) return m.reply(`Not enough materials for repair!`)
             user.kayu -= 5
             user.iron -= 9
             user.diamond -= 1
             user.sworddurability = 100
            m.reply("Successfully repaired Sword")
            break
            case 'fishingrod':
          if (user.fishingroddurability > 99) return m.reply('Your Fishingrod has no damage')
          if (user.fishingrod == 0) return m.reply('You do not have a Fishingrod')
            if(user.kayu < 10 || user.batu < 15 || user.iron < 5 ) return m.reply(`Not enough materials for repair!`)
             user.kayu -= 10
             user.batu -= 15
             user.iron -= 5
             user.fishingroddurability = 100
            m.reply("Successfully repaired Fishingrod")
            break
            case 'bow':
          if (user.bowdurability > 99) return m.reply('Your Bow has no damage')
          if (user.bow == 0) return m.reply('You do not have a Bow')
            if(user.kayu < 15 || user.iron < 5 || user.string < 10 ) return m.reply(`Not enough materials for repair!`)
             user.kayu -= 10
             user.iron -= 5
             user.string -= 5
             user.bowdurability = 100
            m.reply("Successfully repaired Bow")
            break
            case 'armor':
          if (user.armordurability > 99) return m.reply('Your Armor has no damage')
          if (user.armor == 0) return m.reply('You do not have an Armor')
            if(user.diamond < 3 || user.iron < 15 ) return m.reply(`Not enough materials to repair Armor!`)
             user.iron -= 15
             user.diamond -= 3
             user.armordurability = 100
            m.reply("Successfully repaired Armor")
            break
            case 'axe':
          if (user.axedurability > 99) return m.reply('Your Axe has no damage')
          if (user.axe == 0) return m.reply('You do not have an Axe')
            if(user.kayu < 10 || user.iron < 15 ) return m.reply(`Not enough materials to repair Axe!`)
             user.iron -= 15
             user.kayu -= 10
             user.axedurability = 100
            m.reply("Successfully repaired Axe")
            break
          default:
                    await conn.reply(m.chat, caption, m, {
                        contextInfo: {
                            externalAdReply: {
                                mediaType: 1,
                                title: 'BETABOTZ RPG',
                                thumbnailUrl: 'https://telegra.ph/file/f329ce46c24b0d7e0837e.jpg',
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
        m.reply(getMessage('error', lang) + err.stack);
    }
};

handler.help = ['repair', 'pergoodi']
handler.tags = ['rpg']
handler.group = true
handler.command = /^(repair|perbaiki)/i
handler.rpg = true
module.exports = handler