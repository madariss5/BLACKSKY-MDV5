const { getMessage } = require('../lib/languages');

let handler = async (m, { conn, args, usedPrefix, command }) => {
  // Get user's preferred language
  const user = global.db.data.users[m.sender];
  const chat = global.db.data.chats[m.chat];
  const lang = user?.language || chat?.language || global.language;
  
  // Check if user is registered
  if (!user.registered) {
    return m.reply(`⚠️ You need to register first!\nUse command: ${usedPrefix}register name.age`);
  }
  
  // Check if user has already claimed boost
  if (user.boosted) {
    return m.reply('⚠️ You have already claimed your one-time money boost!');
  }
  
  // Define boost amount
  const BOOST_AMOUNT = 5000;
  
  // Give money boost
  user.money = (user.money || 0) + BOOST_AMOUNT;
  user.boosted = true;
  
  // Send success message
  return m.reply(`
💰 *Money Boost Received!*
You've received a one-time boost of ${BOOST_AMOUNT} money.

Current balance: ${user.money}

💡 You can earn more money daily with:
• .daily - Get daily rewards
• .slot - Play slot machine
• .rps - Play rock paper scissors
`);
};

handler.help = ['boost', 'moneyboost'];
handler.tags = ['econ'];
handler.command = /^(boost|moneyboost)$/i;

module.exports = handler;