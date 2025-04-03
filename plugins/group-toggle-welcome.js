const { getMessage } = require('../lib/languages');

let handler = async (m, { conn, args, usedPrefix, command }) => {
  // Get user's preferred language
  const user = global.db.data.users[m.sender];
  const chat = global.db.data.chats[m.chat];
  const lang = user?.language || chat?.language || global.language;
  
  // Check if user is admin or owner
  if (!m.isGroup) return m.reply(getMessage('group_only', lang));
  if (!conn.isAdmin && !conn.isBotAdmin) return m.reply(getMessage('bot_admin_required', lang));
  
  let isEnable = /true|enable|on|1/i.test(args[0]) || 
                 /aktif|activate/i.test(args[0]) ||
                 /ja|yes/i.test(args[0]);
                 
  let isDisable = /false|disable|off|0/i.test(args[0]) || 
                  /deaktivieren|deactivate/i.test(args[0]) ||
                  /nein|no/i.test(args[0]);
  
  if (!args[0] || (!isEnable && !isDisable)) {
    return m.reply(`
*${usedPrefix}${command}* <on/off>

${getMessage('welcome_current_status', lang).replace('%status%', 
  chat.welcome ? '✅ ' + getMessage('enabled', lang) : '❌ ' + getMessage('disabled', lang))}

Examples:
${usedPrefix}${command} on - ${getMessage('enable', lang)}
${usedPrefix}${command} off - ${getMessage('disable', lang)}
`);
  }
  
  // Update the setting
  chat.welcome = isEnable;
  
  // Reply with confirmation
  m.reply(
    isEnable 
      ? getMessage('welcome_enabled', lang)
      : getMessage('welcome_disabled', lang)
  );
};

handler.help = ['welcome <on/off>'];
handler.tags = ['group', 'admin'];
handler.command = /^(welcome)$/i;
handler.group = true;
handler.admin = true;

module.exports = handler;