/**
 * BLACKSKY-MD Premium Group Slap Command
 * Slap all members of a group, tagging them in a vertical list.
 * Supports both English and German language.
 */

const { sendMassReaction } = require('../lib/group-reactions');

let handler = async (m, { conn }) => {
  // Get user's language preference
  const user = global.db.data.users[m.sender];
  const chat = global.db.data.chats[m.chat];
  const lang = user?.language || chat?.language || global.language || 'en';
  
  // Send the mass slap reaction
  await sendMassReaction(m, conn, 'slap', lang);
};

handler.help = ['slapall', 'klapsealle'];
handler.tags = ['group', 'fun', 'reaction'];
handler.command = /^(slapall|klapsealle)$/i;
handler.group = true;

module.exports = handler;