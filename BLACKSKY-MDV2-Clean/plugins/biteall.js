/**
 * BLACKSKY-MD Premium Group Bite Command
 * Bite all members of a group, tagging them in a vertical list.
 * Supports both English and German language.
 */

const { sendMassReaction } = require('../lib/group-reactions');

let handler = async (m, { conn }) => {
  // Get user's language preference
  const user = global.db.data.users[m.sender];
  const chat = global.db.data.chats[m.chat];
  const lang = user?.language || chat?.language || global.language || 'en';
  
  // Send the mass bite reaction
  await sendMassReaction(m, conn, 'bite', lang);
};

handler.help = ['biteall', 'beißealle', 'beissealle'];
handler.tags = ['group', 'fun', 'reaction'];
handler.command = /^(biteall|beißealle|beissealle)$/i;
handler.group = true;

module.exports = handler;