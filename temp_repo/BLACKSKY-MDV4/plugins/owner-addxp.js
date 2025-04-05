const { getMessage } = require('../lib/languages');
const levelling = require('../lib/levelling');

let handler = async (m, { conn, text, args }) => {
    // Get user's preferred language
    const user = global.db.data.users[m.sender];
    const chat = global.db.data.chats[m.chat];
    const lang = user?.language || chat?.language || global.language;
 
  if (!text) {
    return m.reply(`Usage: .addxp @user amount\nExample: .addxp @user 1000`);
  }
    
  // Adding reaction for visual feedback
  await conn.sendMessage(m.chat, {
    react: {
      text: '⏳',
      key: m.key,
    }
  });

  // Parse mention
  let mentionedJid = m.mentionedJid[0];
  if (!mentionedJid) {
    return m.reply(`Please tag a user\nUsage: .addxp @user amount\nExample: .addxp @user 1000`);
  }

  // Parse amount
  let pointsToAdd = parseInt(text.split(' ')[1]);
  if (isNaN(pointsToAdd)) {
    return m.reply(`Amount must be a number\nUsage: .addxp @user amount\nExample: .addxp @user 1000`);
  }

  // Initialize user data if not exists
  let users = global.db.data.users;
  if (!users[mentionedJid]) {
    users[mentionedJid] = {
      exp: 0,
      limit: 10,
      level: 0,
      role: 'Beginner'
    };
  }

  // Store initial values for comparison
  const beforeLevel = users[mentionedJid].level;
  const beforeExp = users[mentionedJid].exp;

  // Add XP
  users[mentionedJid].exp += pointsToAdd;
  
  // Check if user leveled up and increment level if needed
  while (levelling.canLevelUp(users[mentionedJid].level, users[mentionedJid].exp, global.multiplier)) {
    users[mentionedJid].level++;
  }
  
  // Get user's name
  const username = conn.getName(mentionedJid);
  
  // Update reaction to signal completion
  await conn.sendMessage(m.chat, {
    react: {
      text: '✅',
      key: m.key,
    }
  });
  
  // Prepare and send response
  let response = `Successfully added *${pointsToAdd} XP* to ${username} (@${mentionedJid.split('@')[0]})`;
  
  // Add level up info if applicable
  if (users[mentionedJid].level > beforeLevel) {
    response += `\n\nThey leveled up! *${beforeLevel}* → *${users[mentionedJid].level}*`;
    
    // Note: If you want to add autodeadc role updates, you could trigger them here
  }
  
  conn.reply(m.chat, response, m, {
    mentions: [mentionedJid]
  });
}

handler.help = ['addxp @user <amount>'];
handler.tags = ['owner', 'xp'];
handler.command = /^(owneraddxp|addxpowner)$/i;
handler.owner = true;

module.exports = handler;