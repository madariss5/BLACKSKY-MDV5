/**
 * Coin Flip Game for WhatsApp Bot
 * Bet on heads or tails and flip a coin
 */

const { randomInt, checkCooldown, formatMoney } = require('../lib/game-utils');
const { getGameTranslation } = require('../lib/game-translations');

let handler = async (m, { conn, args, usedPrefix, command }) => {
  try {
    // Get user data and language preference
    const user = global.db.data.users[m.sender];
    const lang = user?.language || 'en';
    
    // Default values for coinflip game
    const MIN_BET = 100;
    const MAX_BET = 50000;
    const COOLDOWN = 5 * 1000; // 5 seconds
    
    // Check if user is on cooldown
    const cooldownInfo = checkCooldown(user, 'lastcoinflip', COOLDOWN);
    if (cooldownInfo.onCooldown) {
      return m.reply(getGameTranslation('game_cooldown', lang, { 
        time: cooldownInfo.timeLeftSeconds + 's' 
      }));
    }
    
    // Check arguments - bet amount and prediction (heads/tails)
    if (args.length < 2) {
      return m.reply(`${getGameTranslation('coinflip_usage', lang, { prefix: usedPrefix })}\n${getGameTranslation('game_balance', lang, { balance: formatMoney(user.money) })}`);
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
    
    // Validate prediction (normalize input)
    const validPredictions = {
      'heads': 'heads',
      'head': 'heads',
      'h': 'heads',
      'kopf': 'heads', // German
      'tails': 'tails',
      'tail': 'tails',
      't': 'tails',
      'zahl': 'tails'  // German
    };
    
    if (!validPredictions[prediction]) {
      return m.reply(getGameTranslation('coinflip_invalid_side', lang));
    }
    
    // Normalize prediction
    prediction = validPredictions[prediction];
    
    // Send initial message
    await m.reply(getGameTranslation('coinflip_flipping', lang));
    
    // Flip the coin
    const result = randomInt(0, 1) === 0 ? 'heads' : 'tails';
    
    // Determine if player won
    const playerWon = prediction === result;
    
    // Create coin emoji based on result
    const coinEmoji = result === 'heads' ? '🪙' : '💰';
    
    // Format result message
    let resultDisplay = `┏━━━[ ${coinEmoji} COIN FLIP ${coinEmoji} ]━━━┓\n┃\n`;
    resultDisplay += `┃   ${result === 'heads' ? 'HEADS' : 'TAILS'} ${coinEmoji}\n`;
    resultDisplay += `┃   ${lang === 'de' ? 'Deine Wahl' : 'Your choice'}: ${prediction.toUpperCase()}\n`;
    resultDisplay += `┃\n┗━━━━━━━━━━━━━━━━━━━━━━━━━━━┛`;
    
    // Calculate winnings (2x bet)
    const winAmount = playerWon ? amount * 2 : 0;
    
    // Update user's money
    if (playerWon) {
      user.money = (user.money - amount) + winAmount;
      
      // Send result with a delay for anticipation
      setTimeout(() => {
        m.reply(getGameTranslation('coinflip_result', lang, {
          result: result.toUpperCase(),
          outcome: getGameTranslation('coinflip_win', lang, { amount: formatMoney(winAmount - amount) })
        }));
      }, 1000);
    } else {
      // Player lost
      user.money -= amount;
      
      // Send result with a delay for anticipation
      setTimeout(() => {
        m.reply(getGameTranslation('coinflip_result', lang, {
          result: result.toUpperCase(),
          outcome: getGameTranslation('coinflip_lose', lang, { amount: formatMoney(amount) })
        }));
      }, 1000);
    }
    
    // Update user stats
    if (!user.coinflip) {
      user.coinflip = {
        wins: 0,
        losses: 0,
        total: 0
      };
    }
    
    if (playerWon) {
      user.coinflip.wins = (user.coinflip.wins || 0) + 1;
    } else {
      user.coinflip.losses = (user.coinflip.losses || 0) + 1;
    }
    user.coinflip.total = (user.coinflip.total || 0) + 1;
    
  } catch (e) {
    console.error('Error in coinflip game:', e);
    return m.reply('Error: ' + e.message);
  }
};

handler.help = ['coinflip'];
handler.tags = ['game'];
handler.command = /^(coinflip|coin|flip|münze|muenze)$/i;
handler.group = true;
handler.register = true;

module.exports = handler;