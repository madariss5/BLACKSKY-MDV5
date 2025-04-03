/**
 * Slot Machine Game for WhatsApp Bot
 * Play a slot machine game with emojis and win money based on the patterns
 */

const { randomEmojis, calculateWinAmount, checkCooldown, formatMoney } = require('../lib/game-utils');
const { getGameTranslation } = require('../lib/game-translations');

let handler = async (m, { conn, args, usedPrefix, command }) => {
  try {
    // Get user data and language preference
    const user = global.db.data.users[m.sender];
    const lang = user?.language || 'en';
    
    // Default values for slot game
    const MIN_BET = 100;
    const MAX_BET = 100000;
    const COOLDOWN = 10 * 1000; // 10 seconds
    
    // Check if user is on cooldown
    const cooldownInfo = checkCooldown(user, 'lastslot', COOLDOWN);
    if (cooldownInfo.onCooldown) {
      return m.reply(getGameTranslation('game_cooldown', lang, { 
        time: cooldownInfo.timeLeftSeconds + 's' 
      }));
    }
    
    // Check bet amount
    let amount = parseInt(args[0]);
    if (!amount || isNaN(amount)) {
      return m.reply(`${getGameTranslation('slot_usage', lang, { prefix: usedPrefix })}\n${getGameTranslation('game_balance', lang, { balance: formatMoney(user.money) })}`);
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
    await m.reply(getGameTranslation('slot_spinning', lang));
    
    // Create slot machine grid with emojis
    const SLOT_EMOJIS = ['🍋', '🍊', '🍒', '🍇', '🍉', '🍓', '🍎', '💎', '🎰'];
    
    // Create 3x3 slot grid
    const slots = [];
    for (let i = 0; i < 3; i++) {
      slots.push(randomEmojis(3, SLOT_EMOJIS));
    }
    
    // Format slot display with fancy formatting
    let slotDisplay = '┏━━━[ 🎰 SLOTS 🎰 ]━━━┓\n┃\n';
    for (let i = 0; i < 3; i++) {
      slotDisplay += `┃  ${slots[i].join(' | ')}\n`;
    }
    slotDisplay += '┃\n┗━━━━━━━━━━━━━━━━━━┛';
    
    // Check if user won (middle row is most important)
    const middleRow = slots[1];
    const multipliers = {
      jackpot: 10, // All symbols the same
      triple: 5,   // 3 consecutive same symbols
      double: 2    // 2 consecutive same symbols
    };
    
    const winAmount = calculateWinAmount(middleRow, amount, multipliers);
    
    // Update user's money
    if (winAmount > 0) {
      user.money = (user.money - amount) + winAmount;
      
      // Check if it's a jackpot (all symbols the same)
      const isJackpot = middleRow[0] === middleRow[1] && middleRow[1] === middleRow[2];
      const resultMessage = isJackpot ? 
        getGameTranslation('slot_jackpot', lang, { amount: formatMoney(winAmount) }) :
        getGameTranslation('slot_win', lang, { amount: formatMoney(winAmount) });
        
      // Send result with a delay for anticipation
      setTimeout(() => {
        m.reply(getGameTranslation('slot_result', lang, { 
          result: slotDisplay,
          outcome: resultMessage
        }));
      }, 1500);
    } else {
      // Player lost
      user.money -= amount;
      
      // Send result with a delay for anticipation
      setTimeout(() => {
        m.reply(getGameTranslation('slot_result', lang, { 
          result: slotDisplay,
          outcome: getGameTranslation('slot_lose', lang, { 
            amount: formatMoney(amount) 
          })
        }));
      }, 1500);
    }
    
    // Update user stats
    if (!user.slot) {
      user.slot = {
        wins: 0,
        losses: 0,
        total: 0
      };
    }
    
    if (winAmount > 0) {
      user.slot.wins = (user.slot.wins || 0) + 1;
    } else {
      user.slot.losses = (user.slot.losses || 0) + 1;
    }
    user.slot.total = (user.slot.total || 0) + 1;
    
  } catch (e) {
    console.error('Error in slot game:', e);
    return m.reply('Error: ' + e.message);
  }
};

handler.help = ['slot'];
handler.tags = ['game'];
handler.command = /^(slot|slots|slotmachine)$/i;
handler.group = true;
handler.register = true;

module.exports = handler;