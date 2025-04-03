/**
 * BLACKSKY-MD Premium Group Kill Command
 * Kill all members of a group (virtually), tagging them in a vertical list.
 * Supports both English and German language.
 */

const { sendMassReaction } = require('../lib/group-reactions');

let handler = async (m, { conn }) => {
  // Get user's language preference
  const user = global.db.data.users[m.sender];
  const chat = global.db.data.chats[m.chat];
  const lang = user?.language || chat?.language || global.language || 'en';
  
  // Send the mass kill reaction
  await sendMassReaction(m, conn, 'kill', lang);
};

handler.help = ['killall', 'tötealle', 'toetealle'];
handler.tags = ['group', 'fun', 'reaction'];
handler.command = /^(killall|tötealle|toetealle)$/i;
handler.group = true;

module.exports = handler;