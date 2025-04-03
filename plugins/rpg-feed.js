const { getMessage } = require('../lib/languages');

let handler = async (m, { conn, args, usedPrefix }) => {
    // Get user's preferred language
    const user = global.db.data.users[m.sender];
    const chat = global.db.data.chats[m.chat];
    const lang = user?.language || chat?.language || global.language;
 {
        let info = `
乂 Pet List:
🐈 • cat
🐕 • dog
🦊 • fox
🐺 • wolf
🐦‍🔥 • phoenix

*➠ Example:* ${usedPrefix}feed cat
`.trim()
let message = pickRandom(['ɴʏᴜᴍᴍᴍ~', 'ᴛʜᴀɴᴋs', 'ᴛʜᴀɴᴋʏᴏᴜ ^-^', 'ᴛʜᴀɴᴋ ʏᴏᴜ~', 'ᴀʀɪɢᴀᴛᴏᴜ ^-^'])
    let Type = (args[0] || '').toLowerCase()
    let emo = (Type == 'fox' ? '🦊':'' || Type == 'cat' ? '🐈':'' || Type == 'dog' ? '🐕':'' || Type == 'wolf' ? '🐺':'' || Type == 'phoenix'? '🐦‍🔥':'' ) 
    let user = global.db.data.users[m.sender]
    // Get pet variables with English names and Indonesian database variables
    let fox = global.db.data.users[m.sender].rubah
    let cat = global.db.data.users[m.sender].kucing
    let dog = global.db.data.users[m.sender].anjing
    let wolf = global.db.data.users[m.sender].serigala
    let phoenix = global.db.data.users[m.sender].phonix
    switch (Type) {
        case 'fox':
            if (fox == 0) return m.reply('*You don\'t have any pet food*\n\n> Type .shop buy petfood\nto feed your pet')
            if (fox == 10) return m.reply('ʏᴏᴜʀ ᴘᴇᴛ ɪs ᴍᴀx ʟᴇᴠᴇʟ !')
            let __waktur = (new Date - user.rubahlastclaim)
            let _waktur = (600000 - __waktur)
            let waktur = clockString(_waktur)
            if (new Date - user.rubahlastclaim > 600000) {
                if (user.makananpet > 0) { // makananpet = petFood
                    user.makananpet -= 1
                    user.rubahexp += 20
                    user.rubahlastclaim = new Date * 1
                    m.reply(`ғᴇᴇᴅɪɴɢ *${Type}*...\n*${emo} :* ${message}`)
                    if (fox > 0) {
                        let naiklvl = ((fox * 100) - 1)
                        if (user.rubahexp > naiklvl) {
                            user.rubah += 1
                            user.rubahexp -= (fox * 100)
                            m.reply(`*ᴄᴏɴɢʀᴀᴛs!* , ʏᴏᴜʀ ᴘᴇᴛ ʟᴇᴠᴇʟᴜᴘ`)
                        }
                    }
                } else m.reply(`*You don't have any pet food*\n\n> Type .shop buy petfood\nto feed your pet`)
            } else m.reply(`ʏᴏᴜʀ ᴘᴇᴛ ɪs ғᴜʟʟ, ᴛʀʏ ғᴇᴇᴅɪɴɢ ɪᴛ ᴀɢᴀɪɴ ɪɴ\n➞ *${waktur}*`)
            break
        case 'cat':
            if (cat == 0) return m.reply('*You don\'t have any pet food*\n\n> Type .shop buy petfood\nto feed your pet')
            if (cat == 10) return m.reply('ʏᴏᴜʀ ᴘᴇᴛ ɪs ᴍᴀx ʟᴇᴠᴇʟ !')
            let __waktuc = (new Date - user.kucinglastclaim)
            let _waktuc = (600000 - __waktuc)
            let waktuc = clockString(_waktuc)
            if (new Date - user.kucinglastclaim > 600000) {
                if (user.makananpet > 0) {
                    user.makananpet -= 1
                    user.kucingexp += 20
                    user.kucinglastclaim = new Date * 1
                    m.reply(`ғᴇᴇᴅɪɴɢ *${Type}*...\n*${emo} :* ${message}`)
            
                    if (cat > 0) {
                        let naiklvl = ((cat * 100) - 1)
                        if (user.kucingexp > naiklvl) {
                            user.kucing += 1
                            user.kucingexp -= (cat * 100)
                            m.reply(`*ᴄᴏɴɢʀᴀᴛs!* , ʏᴏᴜʀ ᴘᴇᴛ ʟᴇᴠᴇʟᴜᴘ`)
                        }
                    }
                } else m.reply(`*You don't have any pet food*\n\n> Type .shop buy petfood\nto feed your pet`)
            } else m.reply(`ʏᴏᴜʀ ᴘᴇᴛ ɪs ғᴜʟʟ, ᴛʀʏ ғᴇᴇᴅɪɴɢ ɪᴛ ᴀɢᴀɪɴ ɪɴ\n➞ *${waktuc}*`)
            break
         case 'wolf':
            if (wolf == 0) return m.reply('*You don\'t have any pet food*\n\n> Type .shop buy petfood\nto feed your pet')
            if (wolf == 10) return m.reply('ʏᴏᴜʀ ᴘᴇᴛ ɪs ᴍᴀx ʟᴇᴠᴇʟ !')
            let __waktub = (new Date - user.serigalalastclaim)
            let _waktub = (600000 - __waktub)
            let waktub = clockString(_waktub)
            if (new Date - user.serigalalastclaim > 600000) {
                if (user.makananpet > 0) {
                    user.makananpet -= 1
                    user.serigalaexp += 20
                    user.serigalalastclaim = new Date * 1
                    m.reply(`ғᴇᴇᴅɪɴɢ *${Type}*...\n*${emo} :* ${message}`)
            
                    if (wolf > 0) {
                        let naiklvl = ((wolf * 100) - 1)
                        if (user.serigalaexp > naiklvl) {
                            user.serigala += 1
                            user.serigalaexp -= (wolf * 100)
                            m.reply(`*ᴄᴏɴɢʀᴀᴛs!* , ʏᴏᴜʀ ᴘᴇᴛ ʟᴇᴠᴇʟᴜᴘ`)
                        }
                    }
                } else m.reply(`*You don't have any pet food*\n\n> Type .shop buy petfood\nto feed your pet`)
            } else m.reply(`ʏᴏᴜʀ ᴘᴇᴛ ɪs ғᴜʟʟ, ᴛʀʏ ғᴇᴇᴅɪɴɢ ɪᴛ ᴀɢᴀɪɴ ɪɴ\n➞ *${waktub}*`)
            break
        case 'dog':
            if (dog == 0) return m.reply('*You don\'t have any pet food*\n\n> Type .shop buy petfood\nto feed your pet')
            if (dog == 10) return m.reply('ʏᴏᴜʀ ᴘᴇᴛ ɪs ᴍᴀx ʟᴇᴠᴇʟ !')
            let __waktua = (new Date - user.anjinglastclaim)
            let _waktua = (600000 - __waktua)
            let waktua = clockString(_waktua)
            if (new Date - user.anjinglastclaim > 600000) {
                if (user.makananpet > 0) {
                    user.makananpet -= 1
                    user.anjingexp += 20
                    user.anjinglastclaim = new Date * 1
                    m.reply(`ғᴇᴇᴅɪɴɢ *${Type}*...\n*${emo} :* ${message}`)
                    if (dog > 0) {
                        let naiklvl = ((dog * 100) - 1)
                        if (user.anjingexp > naiklvl) {
                            user.anjing += 1
                            user.anjingexp -= (dog * 100)
                            m.reply(`*ᴄᴏɴɢʀᴀᴛs!* , ʏᴏᴜʀ ᴘᴇᴛ ʟᴇᴠᴇʟᴜᴘ`)
                        }
                    }
                } else m.reply(`*You don't have any pet food*\n\n> Type .shop buy petfood\nto feed your pet`)
            } else m.reply(`ʏᴏᴜʀ ᴘᴇᴛ ɪs ғᴜʟʟ, ᴛʀʏ ғᴇᴇᴅɪɴɢ ɪᴛ ᴀɢᴀɪɴ ɪɴ\n➞ *${waktua}*`)
            break
        case 'phoenix':
            if (phoenix == 0) return m.reply('*You don\'t have any pet food*\n\n> Type .shop buy petfood\nto feed your pet')
            if (phoenix == 10) return m.reply('ʏᴏᴜʀ ᴘᴇᴛ ɪs ᴍᴀx ʟᴇᴠᴇʟ !')
            let __waktuk = (new Date - user.phonixlastclaim)
            let _waktuk = (600000 - __waktuk)
            let waktuk = clockString(_waktuk)
            if (new Date - user.phonixlastclaim > 600000) {
                if (user.makananpet > 0) {
                    user.makananpet -= 1
                    user.phonixexp += 20
                    user.phonixlastclaim = new Date * 1
                    m.reply(`ғᴇᴇᴅɪɴɢ *${Type}*...\n*${emo} :* ${message}`)
                    if (phoenix > 0) {
                        let naiklvl = ((phoenix * 100) - 1)
                        if (user.phonixexp > naiklvl) {
                            user.phonix += 1
                            user.phonixexp -= (phoenix * 100)
                            m.reply(`*ᴄᴏɴɢʀᴀᴛs!* , ʏᴏᴜʀ ᴘᴇᴛ ʟᴇᴠᴇʟᴜᴘ`)
                        }
                    }
                } else m.reply(`*You don't have any pet food*\n\n> Type .shop buy petfood\nto feed your pet`)
            } else m.reply(`ʏᴏᴜʀ ᴘᴇᴛ ɪs ғᴜʟʟ, ᴛʀʏ ғᴇᴇᴅɪɴɢ ɪᴛ ᴀɢᴀɪɴ ɪɴ\n➞ *${waktuk}*`)
            break
            case 'robot':
            if (robot == 0) return m.reply('*You don\'t have any pet food*\n\n> Type .shop buy petfood\nto feed your pet')
            if (robot == 10) return m.reply('ʏᴏᴜʀ ᴘᴇᴛ ɪs ᴍᴀx ʟᴇᴠᴇʟ !')
            let __wakturb = (new Date - user.robolastfeed)
            let _wakturb = (600000 - __wakturb)
            let wakturb = clockString(_wakturb)
            if (new Date - user.robolastfeed > 600000) {
                if (user.makananpet > 0) {
                    user.makananpet -= 1
                    user.roboexp += 20
                    user.robolastfeed = new Date * 1
                    m.reply(`ғᴇᴇᴅɪɴɢ *${Type}*...\n*${emo} :* ${message}`)
                    if (robot > 0) {
                        let naiklvl = ((robot * 100) - 1)
                        if (user.roboexp > naiklvl) {
                            user.robo += 1
                            user.roboexp -= (robot * 100)
                            m.reply(`*ᴄᴏɴɢʀᴀᴛs!* , ʏᴏᴜʀ ᴘᴇᴛ ʟᴇᴠᴇʟᴜᴘ`)
                        }
                    }
                } else m.reply(`*You don't have any pet food*\n\n> Type .shop buy petfood\nto feed your pet`)
            } else m.reply(`ʏᴏᴜʀ ᴘᴇᴛ ɪs ғᴜʟʟ, ᴛʀʏ ғᴇᴇᴅɪɴɢ ɪᴛ ᴀɢᴀɪɴ ɪɴ\n➞ *${wakturb}*`)
            break
        default:
            return m.reply(info)
    }
}
handler.help = ['feed']
handler.tags = ['rpg']
handler.command = /^(feed(ing)?)$/i

handler.register = true
handler.rpg = true
}

module.exports = handler

function clockString(ms) {
  let h = isNaN(ms) ? '--' : Math.floor(ms / 3600000)
  let m = isNaN(ms) ? '--' : Math.floor(ms / 60000) % 60
  let s = isNaN(ms) ? '--' : Math.floor(ms / 1000) % 60
  return [h, ' H ', m, ' M ', s, ' S'].map(v => v.toString().padStart(2, 0)).join('')
}
function pickRandom(list) {
  return list[Math.floor(Math.random() * list.length)]
}