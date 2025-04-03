const { getMessage } = require('../lib/languages');

function handler(m, { conn, participants, groupMetadata }) {
  const { id, subject, size, desc, creation } = groupMetadata;
  
  // Get user's preferred language
  const user = global.db.data.users[m.sender];
  const chat = global.db.data.chats[m.chat];
  const lang = user?.language || chat?.language || 'en'; // Default to English
  
  // Count admins and calculate time
  const owner = groupMetadata.owner || participants.find(p => p.admin === 'superadmin')?.id || id.split`-`[0] + '@s.whatsapp.net';
  const adminList = participants.filter(p => p.admin);
  const totalAdmins = adminList.length;
  const botAdmin = participants.find(p => p.id === conn.user.jid)?.admin === 'admin';
  const timeCreated = formatCreationTime(creation, lang);
  
  // Format output
  const info = `*${getMessage('group_info_title', lang)}*
  
*${getMessage('group_info_name', lang)}:* ${subject}
*${getMessage('group_info_id', lang)}:* ${id}
*${getMessage('group_info_owner', lang)}:* @${owner.split('@')[0]}
*${getMessage('group_info_members', lang)}:* ${size}
*${getMessage('group_info_admins', lang)}:* ${totalAdmins}
*${getMessage('group_info_bot_status', lang)}:* ${botAdmin ? getMessage('group_info_admin', lang) : getMessage('group_info_member', lang)}
*${getMessage('group_info_creation', lang)}:* ${timeCreated}
*${getMessage('group_info_desc', lang)}:*
${desc || getMessage('group_info_no_desc', lang)}`.trim();

  conn.reply(m.chat, info, m, {
    mentions: [owner, ...adminList.map(p => p.id)].filter(v => v)
  });
}

// Helper function to format creation time
function formatCreationTime(timestamp, lang) {
  const now = new Date();
  const creationDate = new Date(timestamp);
  const diff = now - creationDate;
  
  // Calculate time components
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  
  // Format with translations
  const daysText = getMessage('time_days', lang, { count: days });
  const hoursText = getMessage('time_hours', lang, { count: hours });
  const minutesText = getMessage('time_minutes', lang, { count: minutes });
  
  return `${days} ${daysText} ${hours} ${hoursText} ${minutes} ${minutesText}`;
}

handler.help = ['groupinfo', 'infogrup', 'groupstats'];
handler.tags = ['group'];
handler.command = /^(group(info|stats)|info(group|grup))$/i;
handler.group = true;

module.exports = handler;