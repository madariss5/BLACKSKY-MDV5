/**
 * BLACKSKY-MD Premium Group Cuddle Command
 * Cuddle all members of a group, tagging them in a vertical list.
 * Supports both English and German language.
 */

const { sendMassReaction } = require('../lib/group-reactions');

let handler = async (m, { conn }) => {
  // Get user's language preference
  const user = global.db.data.users[m.sender];
  const chat = global.db.data.chats[m.chat];
  const lang = user?.language || chat?.language || global.language || 'en';
  
  // Send the mass cuddle reaction
  await sendMassReaction(m, conn, 'cuddle', lang);
};

handler.help = ['cuddleall', 'kuschelalle'];
handler.tags = ['group', 'fun', 'reaction'];
handler.command = /^(cuddleall|kuschelalle)$/i;
handler.group = true;

module.exports = handler;