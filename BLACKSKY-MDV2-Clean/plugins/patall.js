/**
 * BLACKSKY-MD Premium Group Pat Command
 * Pat all members of a group, tagging them in a vertical list.
 * Supports both English and German language.
 */

const { sendMassReaction } = require('../lib/group-reactions');

let handler = async (m, { conn }) => {
  // Get user's language preference
  const user = global.db.data.users[m.sender];
  const chat = global.db.data.chats[m.chat];
  const lang = user?.language || chat?.language || global.language || 'en';
  
  // Send the mass pat reaction
  await sendMassReaction(m, conn, 'pat', lang);
};

handler.help = ['patall', 'streichelalle'];
handler.tags = ['group', 'fun', 'reaction'];
handler.command = /^(patall|streichelalle)$/i;
handler.group = true;

module.exports = handler;