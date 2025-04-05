/**
 * Dice Game for WhatsApp Bot
 * Roll a dice and bet on high or low numbers
 */

const { randomInt, checkCooldown, formatMoney } = require('../lib/game-utils');
const { getGameTranslation } = require('../lib/game-translations');

let handler = async (m, { conn, args, usedPrefix, command }) => {
  try {
    // Get user data and language preference
    const user = global.db.data.users[m.sender];
    const lang = user?.language || 'en';
    
    // Default values for dice game
    const MIN_BET = 100;
    const MAX_BET = 50000;
    const COOLDOWN = 5 * 1000; // 5 seconds
    
    // Check if user is on cooldown
    const cooldownInfo = checkCooldown(user, 'lastdice', COOLDOWN);
    if (cooldownInfo.onCooldown) {
      return m.reply(getGameTranslation('game_cooldown', lang, { 
        time: cooldownInfo.timeLeftSeconds + 's' 
      }));
    }
    
    // Check arguments - bet amount and prediction
    if (args.length < 2) {
      return m.reply(`${getGameTranslation('dice_usage', lang, { prefix: usedPrefix })}\n${getGameTranslation('game_balance', lang, { balance: formatMoney(user.money) })}`);
    }
    
    let amount = parseInt(args[0]);
    let prediction = args[1].toLowerCase();
    
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
    
    // Validate prediction
    if (prediction !== 'hi' && prediction !== 'lo' && 
        prediction !== 'high' && prediction !== 'low' &&
        prediction !== 'h' && prediction !== 'l') {
      return m.reply(getGameTranslation('dice_invalid_prediction', lang));
    }
    
    // Normalize prediction
    prediction = prediction.startsWith('h') ? 'hi' : 'lo';
    
    // Send initial message
    await m.reply(getGameTranslation('dice_rolling', lang));
    
    // Roll the dice (1-6)
    const roll = randomInt(1, 6);
    
    // Determine if player won (high: 4-6, low: 1-3)
    const isHigh = roll >= 4;
    const playerWon = (prediction === 'hi' && isHigh) || (prediction === 'lo' && !isHigh);
    
    // Create dice emoji based on roll
    const diceEmojis = ['⚀', '⚁', '⚂', '⚃', '⚄', '⚅'];
    const diceEmoji = diceEmojis[roll - 1];
    
    // Format result message
    let resultDisplay = `┏━━━[ 🎲 DICE 🎲 ]━━━┓\n┃\n`;
    resultDisplay += `┃   ${diceEmoji}  ${roll}\n`;
    resultDisplay += `┃\n┗━━━━━━━━━━━━━━━━┛`;
    
    // Calculate winnings (2x bet)
    const winAmount = playerWon ? amount * 2 : 0;
    
    // Update user's money
    if (playerWon) {
      user.money = (user.money - amount) + winAmount;
      
      // Send result with a delay for anticipation
      setTimeout(() => {
        m.reply(getGameTranslation('dice_result', lang, {
          result: resultDisplay,
          outcome: getGameTranslation('dice_win', lang, { amount: formatMoney(winAmount - amount) })
        }));
      }, 1000);
    } else {
      // Player lost
      user.money -= amount;
      
      // Send result with a delay for anticipation
      setTimeout(() => {
        m.reply(getGameTranslation('dice_result', lang, {
          result: resultDisplay,
          outcome: getGameTranslation('dice_lose', lang, { amount: formatMoney(amount) })
        }));
      }, 1000);
    }
    
    // Update user stats
    if (!user.dice) {
      user.dice = {
        wins: 0,
        losses: 0,
        total: 0
      };
    }
    
    if (playerWon) {
      user.dice.wins = (user.dice.wins || 0) + 1;
    } else {
      user.dice.losses = (user.dice.losses || 0) + 1;
    }
    user.dice.total = (user.dice.total || 0) + 1;
    
  } catch (e) {
    console.error('Error in dice game:', e);
    return m.reply('Error: ' + e.message);
  }
};

handler.help = ['dice'];
handler.tags = ['game'];
handler.command = /^(dice|dadu)$/i;
handler.group = true;
handler.register = true;

module.exports = handler;