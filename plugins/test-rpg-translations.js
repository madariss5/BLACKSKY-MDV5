/**
 * RPG Translation Test Command
 * This command tests the RPG translations system
 */

const { getMessage, applyReplacements } = require('../lib/message-utils');
const rpgTranslations = require('../rpg-translations');

let handler = async (m, { conn, args, isPrems }) => {
  // Get user language preference or default to English
  const user = global.db.users[m.sender];
  const userLang = (user?.language || conn.language || 'en').toLowerCase();
  
  // Display all available translations if no specific key is requested
  if (!args[0]) {
    let output = `*RPG Translations (${userLang.toUpperCase()})*\n\n`;
    
    // List translation categories
    output += `Available categories:\n`;
    output += `- common (common messages)\n`;
    output += `- work (work-related messages)\n`;
    output += `- trade (buy/sell related messages)\n`;
    output += `- status (inventory/status messages)\n`;
    output += `- jobs (job-specific messages)\n\n`;
    
    output += `Use: .testrpg <category>\n`;
    output += `Example: .testrpg work`;
    
    return m.reply(output);
  }
  
  // Show category translations
  const category = args[0].toLowerCase();
  
  if (category === 'common') {
    let output = `*Common RPG Messages (${userLang.toUpperCase()})*\n\n`;
    
    // Test cooldown message
    output += `Cooldown message:\n`;
    output += applyReplacements(
      getMessage(rpgTranslations, userLang, 'rpg_cooldown'),
      { time: '30m' }
    ) + `\n\n`;
    
    // Test jail warning
    output += `Jail warning:\n`;
    output += getMessage(rpgTranslations, userLang, 'rpg_jail_warning') + `\n\n`;
    
    // Test success/failure messages
    output += `Success message:\n`;
    output += applyReplacements(
      getMessage(rpgTranslations, userLang, 'rpg_success'),
      { message: 'You completed the quest!' }
    ) + `\n\n`;
    
    output += `Failure message:\n`;
    output += applyReplacements(
      getMessage(rpgTranslations, userLang, 'rpg_failed'),
      { message: 'Not enough resources.' }
    ) + `\n\n`;
    
    return m.reply(output);
  }
  
  if (category === 'work') {
    let output = `*Work-Related RPG Messages (${userLang.toUpperCase()})*\n\n`;
    
    // Test work start message
    output += `Work start message:\n`;
    output += getMessage(rpgTranslations, userLang, 'rpg_work_start') + `\n\n`;
    
    // Test work success message
    output += `Work success message:\n`;
    output += applyReplacements(
      getMessage(rpgTranslations, userLang, 'rpg_work_success'),
      { amount: '500', reward: '💵Money' }
    ) + `\n\n`;
    
    // Test work tired message
    output += `Work tired message:\n`;
    output += applyReplacements(
      getMessage(rpgTranslations, userLang, 'rpg_work_tired'),
      { time: '1 hour' }
    ) + `\n\n`;
    
    return m.reply(output);
  }
  
  if (category === 'trade') {
    let output = `*Trade-Related RPG Messages (${userLang.toUpperCase()})*\n\n`;
    
    // Test buy success message
    output += `Buy success message:\n`;
    output += applyReplacements(
      getMessage(rpgTranslations, userLang, 'rpg_buy_success'),
      { amount: '5', item: '🍖Meat', price: '200', currency: '💵Money' }
    ) + `\n\n`;
    
    // Test sell success message
    output += `Sell success message:\n`;
    output += applyReplacements(
      getMessage(rpgTranslations, userLang, 'rpg_sell_success'),
      { amount: '3', item: '💎Diamond', reward: '1,500', currency: '💵Money' }
    ) + `\n\n`;
    
    // Test buy not enough message
    output += `Buy not enough message:\n`;
    output += applyReplacements(
      getMessage(rpgTranslations, userLang, 'rpg_buy_not_enough'),
      { currency: '💵Money', amount: '2', item: '🗡️Sword', needed: '300' }
    ) + `\n\n`;
    
    return m.reply(output);
  }
  
  if (category === 'status') {
    let output = `*Status-Related RPG Messages (${userLang.toUpperCase()})*\n\n`;
    
    // Test inventory title
    output += `Inventory title:\n`;
    output += getMessage(rpgTranslations, userLang, 'rpg_inventory_title') + `\n\n`;
    
    // Test status title
    output += `Status title:\n`;
    output += getMessage(rpgTranslations, userLang, 'rpg_status_title') + `\n\n`;
    
    // Test not registered message
    output += `Not registered message:\n`;
    output += getMessage(rpgTranslations, userLang, 'rpg_not_registered') + `\n\n`;
    
    return m.reply(output);
  }
  
  if (category === 'jobs') {
    let output = `*Job-Specific RPG Messages (${userLang.toUpperCase()})*\n\n`;
    
    // Test taxi messages
    output += `Taxi messages:\n`;
    output += getMessage(rpgTranslations, userLang, 'rpg_taxi_start') + `\n`;
    output += applyReplacements(
      getMessage(rpgTranslations, userLang, 'rpg_taxi_success'),
      { amount: '350' }
    ) + `\n\n`;
    
    // Test mining messages
    output += `Mining messages:\n`;
    output += getMessage(rpgTranslations, userLang, 'rpg_mining_start') + `\n`;
    output += applyReplacements(
      getMessage(rpgTranslations, userLang, 'rpg_mining_success'),
      { amount: '2', item: '💎Diamond' }
    ) + `\n\n`;
    
    // Test farming messages
    output += `Farming messages:\n`;
    output += getMessage(rpgTranslations, userLang, 'rpg_farming_start') + `\n`;
    output += applyReplacements(
      getMessage(rpgTranslations, userLang, 'rpg_farming_success'),
      { amount: '10', item: '🌽Corn' }
    ) + `\n\n`;
    
    return m.reply(output);
  }
  
  return m.reply(`Unknown category: ${category}. Try 'common', 'work', 'trade', 'status', or 'jobs'.`);
};

handler.help = ['testrpg'];
handler.tags = ['developer'];
handler.command = /^(testrpg)$/i;

// Only owner can use this command
handler.owner = true;

module.exports = handler;