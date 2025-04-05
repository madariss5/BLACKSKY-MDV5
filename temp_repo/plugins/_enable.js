const { getMessage } = require('../lib/languages');

let handler = async (m, { conn, usedPrefix, command, args, isOwner, isAdmin, isROwner }) => {
  let isEnable = /true|enable|(turn)?on|1/i.test(command)
  let chat = global.db.data.chats[m.chat]
  let user = global.db.data.users[m.sender]
  let userLang = user?.language || global.language || 'en'
  let chatLang = chat?.language || global.language || 'en'
  let Type = (args[0] || '').toLowerCase()
  let isAll = false
  let isUser = false
  switch (Type) {
    case 'notifgempa':
      if (m.isGroup) {
          if (!(isAdmin || isOwner)) {
              global.dfail('admin', m, conn)
              return false
          }
          chat.notifgempa = isEnable
      } else return global.dfail('group', m, conn)
      break
    case 'notifcuaca':
      if (m.isGroup) {
          if (!(isAdmin || isOwner)) {
              global.dfail('admin', m, conn)
              return false
          }
          chat.notifcuaca = isEnable
      } else return global.dfail('group', m, conn)
      break
    case 'notifsholat':
      if (m.isGroup) {
          if (!(isAdmin || isOwner)) {
              global.dfail('admin', m, conn)
              return false
          }
          chat.notifsholat = isEnable
      } else return global.dfail('group', m, conn)
      break
    case 'welcome':
      if (!m.isGroup) {
        if (!isOwner) {
          global.dfail('group', m, conn)
          throw false
        }
      } else if (!isAdmin) {
        global.dfail('admin', m, conn)
        throw false
      }
      chat.welcome = isEnable
      break
    case 'detect':
      if (!m.isGroup) {
        if (!isOwner) {
          global.dfail('group', m, conn)
          throw false
        }
      } else if (!isAdmin) {
        global.dfail('admin', m, conn)
        throw false
      }
      chat.detect = isEnable
      break
    case 'delete':
      if (m.isGroup) {
        if (!(isAdmin || isOwner)) {
          global.dfail('admin', m, conn)
          throw false
        }
      }
      chat.delete = isEnable
      break
    case 'antidelete':
      if (m.isGroup) {
        if (!(isAdmin || isOwner)) {
          global.dfail('admin', m, conn)
          throw false
        }
      }
      chat.delete = !isEnable
      break
    case 'autodelvn':
      if (m.isGroup) {
        if (!(isAdmin || isOwner)) {
          global.dfail('admin', m, conn)
          throw false
        }
      }
      chat.autodelvn = isEnable
      break
    case 'document':
      chat.useDocument = isEnable
      break
    case 'public':
      isAll = true
      if (!isROwner) {
        global.dfail('rowner', m, conn)
        throw false
      }
      global.opts['self'] = !isEnable
      break
    case 'antilink':
      if (m.isGroup) {
        if (!(isAdmin || isOwner)) {
          global.dfail('admin', m, conn)
          throw false
        }
      }
      chat.antiLink = isEnable
      break 
    case 'autosticker':
      if (m.isGroup) {
        if (!(isAdmin || isOwner)) {
          global.dfail('admin', m, conn)
          throw false
        }
      }
      chat.autosticker = isEnable
      break
    case 'antibot':
      if (m.isGroup) {
        if (!(isAdmin || isOwner)) {
          global.dfail('admin', m, conn)
          throw false
        }
      }
      chat.antiBot = isEnable
      break
    case 'toxic':
      if (m.isGroup) {
        if (!(isAdmin || isOwner)) {
          global.dfail('admin', m, conn)
          throw false
        }
      }
      chat.antiToxic = !isEnable
      break
    case 'antitoxic':
      if (m.isGroup) {
        if (!(isAdmin || isOwner)) {
          global.dfail('admin', m, conn)
          throw false
        }
      }
      chat.antiToxic = isEnable
      break
    case 'autolevelup':
      isUser = true
      user.autolevelup = isEnable
      
      // Use translation system for autolevelup messages
      if (isEnable) {
        m.reply(getMessage('autolevelup_enabled', userLang))
      } else {
        m.reply(getMessage('autolevelup_disabled', userLang))
      }
      
      return true // Prevent the generic success message
      break
    case 'mycontact':
    case 'mycontacts':
    case 'whitelistcontact':
    case 'whitelistcontacts':
    case 'whitelistmycontact':
    case 'whitelistmycontacts':
      if (!isOwner) {
        global.dfail('owner', m, conn)
        throw false
      }
      conn.callWhitelistMode = isEnable
      break
    case 'restrict':
      isAll = true
      if (!isROwner) {
        global.dfail('rowner', m, conn)
        throw false
      }
      global.opts['restrict'] = isEnable
      break
    case 'nyimak':
      isAll = true
      if (!isROwner) {
        global.dfail('rowner', m, conn)
        throw false
      }
      global.opts['nyimak'] = isEnable
      break
    case 'autoread':
      isAll = true
      if (!isROwner) {
        global.dfail('rowner', m, conn)
        throw false
      }
      global.opts['autoread'] = isEnable
      break
    case 'pconly':
    case 'privateonly':
      isAll = true
      if (!isROwner) {
        global.dfail('rowner', m, conn)
        throw false
      }
      global.opts['pconly'] = isEnable
      break
    case 'gconly':
    case 'grouponly':
      isAll = true
      if (!isROwner) {
        global.dfail('rowner', m, conn)
        throw false
      }
      global.opts['gconly'] = isEnable
      break
    case 'swonly':
    case 'statusonly':
      isAll = true
      if (!isROwner) {
        global.dfail('rowner', m, conn)
        throw false
      }
      global.opts['swonly'] = isEnable
      break
    case 'antifoto':
      if (m.isGroup) {
      if (!(isAdmin || isOwner)) {
        global.dfail('admin', m, conn)
        throw false
      }
    }
      chat.antiFoto = isEnable
      break
    case 'antisticker':
    if (m.isGroup) {
      if (!(isAdmin || isOwner)) {
        global.dfail('admin', m, conn)
        throw false
      }
    }
    chat.antiSticker = isEnable
    break
    case 'viewonce':
      if (m.isGroup) {
        if (!(isAdmin || isOwner)) {
          global.dfail('admin', m, conn)
          throw false
        }
      }
      chat.viewonce = isEnable
    break
    case 'antifile':
      if (m.isGroup) {
        if (!(isAdmin || isOwner)) {
          global.dfail('admin', m, conn)
          throw false
        }
      }
      chat.antifile = isEnable
    break
  case 'autobackup':
      if (!isROwner) {
          global.dfail('rowner', m, conn)
          throw false
        }
        chat.autobackup = isEnable
      break 
    case 'antivideo':
      if (m.isGroup) {
        if (!(isAdmin || isOwner)) {
          global.dfail('admin', m, conn)
          throw false
        }
      }
      chat.antivideo = isEnable
      break
      case 'antiporn':
      if (!m.isGroup) {
        if (!isOwner) {
          global.dfail('group', m, conn)
          throw false
        }
      } else if (!isAdmin) {
        global.dfail('admin', m, conn)
        throw false
      }
      chat.antiporn = isEnable
      break
      case 'autohd':
        if (m.isGroup) {
          if (!(isAdmin || isOwner)) {
            global.dfail('admin', m, conn)
            throw false
          }
        }
        chat.autohd = isEnable
        break
        case 'autobio':
      if (m.isGroup) {
          if (!(isAdmin || isOwner)) {
              global.dfail('admin', m, conn)
              return false
          }
          chat.autobio = isEnable
      } else return global.dfail('group', m, conn)
      break
      case 'nsfw':
        if (m.isGroup) {
          if (!(isAdmin || isOwner)) {
            global.dfail('admin', m, conn)
            throw false
          }
        }
        chat.nsfw = isEnable
        
        // Add debug logging for NSFW toggle
        console.log(`[NSFW] Setting NSFW to ${isEnable ? 'enabled' : 'disabled'} for chat ${m.chat} through enable/disable command`);
        
        // Return a custom message for NSFW toggle
        const nsfwLang = user?.language || chat?.language || global.language || 'en';
        if (nsfwLang === 'de') {
          m.reply(isEnable 
            ? '✅ NSFW-Befehle wurden in diesem Chat aktiviert' 
            : '❌ NSFW-Befehle wurden in diesem Chat deaktiviert');
        } else {
          m.reply(isEnable 
            ? '✅ NSFW commands have been enabled in this chat' 
            : '❌ NSFW commands have been disabled in this chat');
        }
        
        break
      case 'rpg':
        if (m.isGroup) {
          if (!(isAdmin || isOwner)) {
            global.dfail('admin', m, conn)
            throw false
          }
        }
        chat.rpg = isEnable
        break
    case 'autodl':
      if (m.isGroup) {
        if (!(isAdmin || isOwner)) {
          global.dfail('admin', m, conn)
          throw false
        }
      }
      chat.autodl = isEnable
      break
    case 'autotranslate':
      if (m.isGroup) {
          if (!(isAdmin || isOwner)) {
              global.dfail('admin', m, conn)
              return false
          }
          chat.autotranslate = isEnable
      } else return global.dfail('group', m, conn)
      break
    default:
      if (!/[01]/.test(command)) return m.reply(getMessage('enable_options_list', userLang, {
        prefix: usedPrefix
      }))
      throw 'error'
  }
  
  // Use translation system for success message
  const targetLang = isUser ? userLang : chatLang
  m.reply(getMessage('enable_success', targetLang, {
    option: Type,
    status: isEnable ? getMessage('enabled', targetLang) : getMessage('disabled', targetLang),
    target: isAll ? getMessage('for_bot', targetLang) : 
             isUser ? getMessage('for_user', targetLang) : 
             getMessage('for_chat', targetLang)
  }))
}
handler.help = ['en', 'dis'].map(v => v + 'able <option>')
handler.tags = ['group', 'owner']
handler.command = /^((en|dis)able|(tru|fals)e|(turn)?o(n|ff)|[01])$/i

module.exports = handler