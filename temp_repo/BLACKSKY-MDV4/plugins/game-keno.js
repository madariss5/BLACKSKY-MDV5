/**
 * Keno Game for WhatsApp Bot
 * Pick numbers and see how many match the draw
 */

const { randomInt, checkCooldown, formatMoney } = require('../lib/game-utils');
const { getGameTranslation } = require('../lib/game-translations');

let handler = async (m, { conn, args, usedPrefix, command }) => {
  try {
    // Get user data and language preference
    const user = global.db.data.users[m.sender];
    const lang = user?.language || 'en';
    
    // Default values for keno game
    const MIN_BET = 100;
    const MAX_BET = 50000;
    const COOLDOWN = 10 * 1000; // 10 seconds
    const MAX_PICKS = 10; // Maximum numbers to pick
    const KENO_RANGE = 80; // Numbers 1-80
    
    // Check if user is on cooldown
    const cooldownInfo = checkCooldown(user, 'lastkeno', COOLDOWN);
    if (cooldownInfo.onCooldown) {
      return m.reply(getGameTranslation('game_cooldown', lang, { 
        time: cooldownInfo.timeLeftSeconds + 's' 
      }));
    }
    
    // Check if we have enough arguments
    if (args.length < 2) {
      return m.reply(`${getGameTranslation('keno_usage', lang, { prefix: usedPrefix })}\n${getGameTranslation('game_balance', lang, { balance: formatMoney(user.money) })}`);
    }
    
    // Parse bet amount
    let amount = parseInt(args[0]);
    
    // Validate bet
    if (!amount || isNaN(amount)) {
      return m.reply(getGameTranslation('game_invalid_bet', lang, { min: MIN_BET, max: MAX_BET }));
    }
    
    if (amount < MIN_BET) {
      return m.reply(getGameTranslation('game_bet_too_small', lang, { amount: formatMoney(MIN_BET) }));
    }
    
    if (amount > MAX_BET) {
      return m.reply(getGameTranslation('game_bet_too_large', lang, { amount: formatMoney(MAX_BET) }));
    }
    
    if (user.money < amount) {
      return m.reply(getGameTranslation('game_not_enough_money', lang, { amount: formatMoney(amount) }));
    }
    
    // Parse player's picks
    const picksInput = args.slice(1).join(' ').split(/[,\s]+/).map(n => parseInt(n.trim())).filter(n => !isNaN(n));
    
    // Validate picks
    if (picksInput.length === 0 || picksInput.length > MAX_PICKS) {
      return m.reply(getGameTranslation('keno_invalid_picks', lang));
    }
    
    // Check if all numbers are in range
    const validPicks = picksInput.filter(n => n >= 1 && n <= KENO_RANGE);
    
    // Check for duplicates
    const uniquePicks = [...new Set(validPicks)];
    
    if (uniquePicks.length !== validPicks.length || validPicks.length !== picksInput.length) {
      return m.reply(getGameTranslation('keno_invalid_picks', lang));
    }
    
    // Deduct bet
    user.money -= amount;
    
    // Send initial message
    await m.reply(getGameTranslation('keno_start', lang));
    await m.reply(getGameTranslation('keno_picks', lang, { picks: uniquePicks.join(', ') }));
    
    // Draw numbers
    const drawSize = 20; // Standard keno draws 20 numbers
    const drawnNumbers = [];
    
    while (drawnNumbers.length < drawSize) {
      const num = randomInt(1, KENO_RANGE);
      if (!drawnNumbers.includes(num)) {
        drawnNumbers.push(num);
      }
    }
    
    // Sort for display
    drawnNumbers.sort((a, b) => a - b);
    
    // Send drawing message
    await m.reply(getGameTranslation('keno_drawing', lang));
    
    // Add a delay for anticipation
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Find matches
    const matches = uniquePicks.filter(pick => drawnNumbers.includes(pick));
    
    // Format keno board display
    const kenoDisplay = formatKenoBoard(drawnNumbers, uniquePicks, matches, lang);
    
    // Calculate payout based on matches and number of picks
    // Standard keno paytable (multiplier values)
    const payTable = {
      1: [0, 3],           // 1 pick: 0 matches = 0x, 1 match = 3x
      2: [0, 1, 9],        // 2 picks: 0 matches = 0x, 1 match = 1x, 2 matches = 9x
      3: [0, 0, 2, 16],    // and so on...
      4: [0, 0, 1, 6, 22],
      5: [0, 0, 0, 3, 13, 42],
      6: [0, 0, 0, 1.5, 6, 19, 90],
      7: [0, 0, 0, 1, 3, 13, 44, 160],
      8: [0, 0, 0, 0.5, 2, 8, 20, 80, 300],
      9: [0, 0, 0, 0.5, 1, 4, 10, 30, 100, 400],
      10: [0, 0, 0, 0, 0.5, 2, 5, 20, 80, 300, 1000]
    };
    
    // Get the right pay table based on number of picks
    const numPicks = uniquePicks.length;
    const numMatches = matches.length;
    
    // Calculate winnings
    const multiplier = payTable[numPicks][numMatches] || 0;
    const winnings = Math.floor(amount * multiplier);
    
    // Add winnings if any
    if (winnings > 0) {
      user.money += winnings;
    }
    
    // Determine the message based on winnings
    let resultMessage;
    if (winnings > 0) {
      resultMessage = getGameTranslation('keno_win', lang, { amount: formatMoney(winnings - amount) });
    } else {
      resultMessage = getGameTranslation('keno_lose', lang, { amount: formatMoney(amount) });
    }
    
    // Send final message
    const matchesMessage = getGameTranslation('keno_matches', lang, { count: numMatches });
    const drawnMessage = getGameTranslation('keno_drawn', lang, { numbers: drawnNumbers.join(', ') });
    
    // Format full result message
    const fullMessage = `${kenoDisplay}\n\n${drawnMessage}\n${matchesMessage}\n\n${resultMessage}`;
    
    m.reply(fullMessage);
    
    // Update user stats
    if (!user.keno) {
      user.keno = {
        wins: 0,
        losses: 0,
        total: 0
      };
    }
    
    if (winnings > amount) {
      user.keno.wins = (user.keno.wins || 0) + 1;
    } else {
      user.keno.losses = (user.keno.losses || 0) + 1;
    }
    user.keno.total = (user.keno.total || 0) + 1;
    
  } catch (e) {
    console.error('Error in keno game:', e);
    return m.reply('Error: ' + e.message);
  }
};

// Format the keno board display
function formatKenoBoard(drawnNumbers, playerPicks, matches, lang) {
  // Create a visual representation of the keno board
  const BOARD_SIZE = 80;
  const COLS = 10;
  
  let display = `┏━━━[ 🎲 ${lang === 'de' ? 'KENO' : 'KENO'} 🎲 ]━━━┓\n┃\n`;
  
  // Create the number board
  for (let i = 0; i < BOARD_SIZE; i += COLS) {
    display += '┃  ';
    
    for (let j = 0; j < COLS; j++) {
      const num = i + j + 1;
      
      // Format based on number status
      let numStr;
      
      if (matches.includes(num)) {
        // Number was picked and matched (win)
        numStr = `[${num.toString().padStart(2, ' ')}]`;
      } else if (playerPicks.includes(num)) {
        // Number was picked but didn't match
        numStr = `<${num.toString().padStart(2, ' ')}>`;
      } else if (drawnNumbers.includes(num)) {
        // Number was drawn but not picked
        numStr = ` ${num.toString().padStart(2, ' ')}*`;
      } else {
        // Regular number
        numStr = ` ${num.toString().padStart(2, ' ')} `;
      }
      
      display += numStr + ' ';
    }
    
    display += '\n';
  }
  
  // Add legend
  display += '┃\n';
  display += `┃  ${lang === 'de' ? 'Legende' : 'Legend'}:\n`;
  display += `┃  [XX] = ${lang === 'de' ? 'Gewählt und getroffen' : 'Picked and matched'}\n`;
  display += `┃  <XX> = ${lang === 'de' ? 'Gewählt aber nicht getroffen' : 'Picked but not matched'}\n`;
  display += `┃  XX* = ${lang === 'de' ? 'Gezogen aber nicht gewählt' : 'Drawn but not picked'}\n`;
  display += '┃\n';
  display += '┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛';
  
  return display;
}

handler.help = ['keno'];
handler.tags = ['game'];
handler.command = /^(keno)$/i;
handler.group = true;
handler.register = true;

module.exports = handler;