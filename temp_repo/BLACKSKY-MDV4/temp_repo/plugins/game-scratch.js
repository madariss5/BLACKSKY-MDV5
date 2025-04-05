/**
 * Scratch Card Game for WhatsApp Bot
 * Buy a scratch card and try to match symbols
 */

const { randomEmojis, randomInt, checkCooldown, formatMoney } = require('../lib/game-utils');
const { getGameTranslation } = require('../lib/game-translations');

let handler = async (m, { conn, args, usedPrefix, command }) => {
  try {
    // Get user data and language preference
    const user = global.db.data.users[m.sender];
    const lang = user?.language || 'en';
    
    // Default values for scratch card game
    const MIN_BET = 100;
    const MAX_BET = 50000;
    const COOLDOWN = 5 * 1000; // 5 seconds
    
    // Check if user is on cooldown
    const cooldownInfo = checkCooldown(user, 'lastscratch', COOLDOWN);
    if (cooldownInfo.onCooldown) {
      return m.reply(getGameTranslation('game_cooldown', lang, { 
        time: cooldownInfo.timeLeftSeconds + 's' 
      }));
    }
    
    // Check bet amount
    let amount = parseInt(args[0]);
    if (!amount || isNaN(amount)) {
      return m.reply(`${getGameTranslation('scratch_usage', lang, { prefix: usedPrefix })}\n${getGameTranslation('game_balance', lang, { balance: formatMoney(user.money) })}`);
    }
    
    // Validate bet
    if (amount < MIN_BET) {
      return m.reply(getGameTranslation('game_bet_too_small', lang, { amount: formatMoney(MIN_BET) }));
    }
    
    if (amount > MAX_BET) {
      return m.reply(getGameTranslation('game_bet_too_large', lang, { amount: formatMoney(MAX_BET) }));
    }
    
    if (user.money < amount) {
      return m.reply(getGameTranslation('game_not_enough_money', lang, { amount: formatMoney(amount) }));
    }
    
    // Send initial message
    await m.reply(getGameTranslation('scratch_scratching', lang));
    
    // Deduct bet
    user.money -= amount;
    
    // Define scratch card symbols
    const SCRATCH_SYMBOLS = ['💎', '🍒', '🍊', '🍋', '🍉', '🍇', '🎰', '🍀', '⭐', '💰'];
    
    // Create a 3x3 scratch card
    const rows = 3;
    const cols = 3;
    
    // Initialize scratch card
    const card = [];
    
    // Choose symbols with weighted probabilities
    const chooseSymbol = () => {
      const random = Math.random() * 100;
      
      // Adjust these probabilities for game balance
      if (random < 30) return '🍋'; // Common symbols (30%)
      if (random < 55) return '🍊'; // Common symbols (25%)
      if (random < 75) return '🍒'; // Uncommon symbols (20%)
      if (random < 85) return '🍉'; // Uncommon symbols (10%)
      if (random < 93) return '🍇'; // Rare symbols (8%)
      if (random < 97) return '🍀'; // Rare symbols (4%)
      if (random < 99) return '⭐'; // Very rare symbols (2%)
      return '💎';                  // Extremely rare (1%)
    };
    
    // Create somewhat biased card
    // Jackpot probability is very low (all symbols matching is ~0.01%)
    for (let i = 0; i < rows; i++) {
      const row = [];
      for (let j = 0; j < cols; j++) {
        row.push(chooseSymbol());
      }
      card.push(row);
    }
    
    // Format scratch card for display
    let cardDisplay = `┏━━━[ 🎫 ${lang === 'de' ? 'RUBBELLOS' : 'SCRATCH CARD'} 🎫 ]━━━┓\n┃\n`;
    
    for (let i = 0; i < rows; i++) {
      cardDisplay += `┃   ${card[i].join(' | ')}\n`;
    }
    
    cardDisplay += `┃\n┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛`;
    
    // Count occurrences of each symbol
    const symbolCounts = {};
    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < cols; j++) {
        const symbol = card[i][j];
        symbolCounts[symbol] = (symbolCounts[symbol] || 0) + 1;
      }
    }
    
    // Check for matches
    let maxCount = 0;
    let matchedSymbol = '';
    
    for (const [symbol, count] of Object.entries(symbolCounts)) {
      if (count > maxCount) {
        maxCount = count;
        matchedSymbol = symbol;
      }
    }
    
    // Define win multipliers based on matches and symbol rarity
    const multipliers = {
      '💎': { 3: 20, 4: 50, 5: 100, 6: 200, 7: 500, 8: 1000, 9: 5000 },
      '⭐': { 3: 10, 4: 25, 5: 50, 6: 100, 7: 250, 8: 500, 9: 2500 },
      '🍀': { 3: 7, 4: 15, 5: 30, 6: 70, 7: 150, 8: 300, 9: 1500 },
      '🍇': { 3: 5, 4: 10, 5: 20, 6: 50, 7: 100, 8: 200, 9: 1000 },
      '🍉': { 3: 4, 4: 8, 5: 15, 6: 40, 7: 80, 8: 150, 9: 750 },
      '🍒': { 3: 3, 4: 6, 5: 12, 6: 30, 7: 60, 8: 120, 9: 500 },
      '🍊': { 3: 2, 4: 4, 5: 8, 6: 20, 7: 40, 8: 80, 9: 300 },
      '🍋': { 3: 1.5, 4: 3, 5: 6, 6: 15, 7: 30, 8: 60, 9: 200 },
      'default': { 3: 1, 4: 2, 5: 5, 6: 10, 7: 20, 8: 50, 9: 100 }
    };
    
    // Calculate win amount
    let winAmount = 0;
    const symbolMultipliers = multipliers[matchedSymbol] || multipliers['default'];
    
    if (maxCount >= 3) {
      winAmount = Math.floor(amount * symbolMultipliers[maxCount]);
    }
    
    // Update user's money if they won
    if (winAmount > 0) {
      user.money += winAmount;
    }
    
    // Check if it's a jackpot (all 9 symbols the same)
    const isJackpot = maxCount === 9;
    
    // Format result message
    let resultMessage;
    
    if (isJackpot) {
      resultMessage = getGameTranslation('scratch_jackpot', lang, { amount: formatMoney(winAmount) });
    } else if (winAmount > 0) {
      resultMessage = getGameTranslation('scratch_win', lang, { amount: formatMoney(winAmount) });
    } else {
      resultMessage = getGameTranslation('scratch_lose', lang, { amount: formatMoney(amount) });
    }
    
    // Result display including match information
    let resultDisplay = `${cardDisplay}\n\n`;
    
    if (maxCount >= 3) {
      resultDisplay += `${lang === 'de' ? 'Übereinstimmungen' : 'Matches'}: ${maxCount}x ${matchedSymbol}\n`;
    }
    
    resultDisplay += resultMessage;
    
    // Send final result
    setTimeout(() => {
      m.reply(resultDisplay);
    }, 1500);
    
    // Update user stats
    if (!user.scratch) {
      user.scratch = {
        wins: 0,
        losses: 0,
        jackpots: 0,
        total: 0
      };
    }
    
    if (winAmount > 0) {
      user.scratch.wins = (user.scratch.wins || 0) + 1;
      if (isJackpot) {
        user.scratch.jackpots = (user.scratch.jackpots || 0) + 1;
      }
    } else {
      user.scratch.losses = (user.scratch.losses || 0) + 1;
    }
    user.scratch.total = (user.scratch.total || 0) + 1;
    
  } catch (e) {
    console.error('Error in scratch card game:', e);
    return m.reply('Error: ' + e.message);
  }
};

handler.help = ['scratch'];
handler.tags = ['game'];
handler.command = /^(scratch|scratchy|scratchcard|rubbellos|rubbeln)$/i;
handler.group = true;
handler.register = true;

module.exports = handler;