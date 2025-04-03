/**
 * Wheel of Fortune Game for WhatsApp Bot
 * Spin a wheel to win various multipliers
 */

const { randomInt, checkCooldown, formatMoney } = require('../lib/game-utils');
const { getGameTranslation } = require('../lib/game-translations');

let handler = async (m, { conn, args, usedPrefix, command }) => {
  try {
    // Get user data and language preference
    const user = global.db.data.users[m.sender];
    const lang = user?.language || 'en';
    
    // Default values for wheel game
    const MIN_BET = 100;
    const MAX_BET = 100000;
    const COOLDOWN = 10 * 1000; // 10 seconds
    
    // Check if user is on cooldown
    const cooldownInfo = checkCooldown(user, 'lastwheel', COOLDOWN);
    if (cooldownInfo.onCooldown) {
      return m.reply(getGameTranslation('game_cooldown', lang, { 
        time: cooldownInfo.timeLeftSeconds + 's' 
      }));
    }
    
    // Check bet amount
    let amount = parseInt(args[0]);
    if (!amount || isNaN(amount)) {
      return m.reply(`${getGameTranslation('wheel_usage', lang, { prefix: usedPrefix })}\n${getGameTranslation('game_balance', lang, { balance: formatMoney(user.money) })}`);
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
    await m.reply(getGameTranslation('wheel_spinning', lang));
    
    // Define wheel segments with multipliers
    const segments = [
      { multiplier: 0, weight: 30, text: '0x' },      // 30% chance
      { multiplier: 0.5, weight: 15, text: '0.5x' },  // 15% chance
      { multiplier: 1, weight: 20, text: '1x' },      // 20% chance
      { multiplier: 1.5, weight: 15, text: '1.5x' },  // 15% chance
      { multiplier: 2, weight: 10, text: '2x' },      // 10% chance
      { multiplier: 3, weight: 5, text: '3x' },       // 5% chance
      { multiplier: 5, weight: 3, text: '5x' },       // 3% chance
      { multiplier: 10, weight: 2, text: '10x' }      // 2% chance
    ];
    
    // Calculate total weight for randomization
    const totalWeight = segments.reduce((sum, segment) => sum + segment.weight, 0);
    
    // Pick a random segment based on weights
    let random = randomInt(1, totalWeight);
    let selectedSegment;
    
    for (const segment of segments) {
      random -= segment.weight;
      if (random <= 0) {
        selectedSegment = segment;
        break;
      }
    }
    
    // Calculate winnings
    const winAmount = Math.floor(amount * selectedSegment.multiplier);
    
    // Update user's money
    if (winAmount > 0) {
      user.money = (user.money - amount) + winAmount;
    } else {
      user.money -= amount;
    }
    
    // Check if it's a jackpot (10x multiplier)
    const isJackpot = selectedSegment.multiplier === 10;
    
    // Format wheel display
    const wheelSegments = segments.map(s => s.text);
    let wheelDisplay = `┏━━━[ 🎡 ${lang === 'de' ? 'GLÜCKSRAD' : 'WHEEL OF FORTUNE'} 🎡 ]━━━┓\n┃\n`;
    wheelDisplay += `┃   [${wheelSegments.join(' | ')}]\n`;
    wheelDisplay += `┃   ${lang === 'de' ? 'Drehung ergibt' : 'Landed on'}: ${selectedSegment.text} 🎯\n`;
    
    // Calculate net win/loss message
    let balanceChangeText;
    if (winAmount > amount) {
      balanceChangeText = `+${formatMoney(winAmount - amount)}`;
    } else if (winAmount === amount) {
      balanceChangeText = `±0`;
    } else {
      balanceChangeText = `-${formatMoney(amount - winAmount)}`;
    }
    
    wheelDisplay += `┃   ${lang === 'de' ? 'Ergebnis' : 'Result'}: ${balanceChangeText}\n`;
    wheelDisplay += `┃\n┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛`;
    
    // Prepare result message
    let resultMessage;
    
    if (isJackpot) {
      resultMessage = getGameTranslation('wheel_jackpot', lang, { amount: formatMoney(winAmount) });
    } else if (winAmount > 0) {
      if (winAmount > amount) {
        resultMessage = getGameTranslation('wheel_win', lang, { amount: formatMoney(winAmount - amount) });
      } else {
        resultMessage = getGameTranslation('wheel_lose', lang, { amount: formatMoney(amount - winAmount) });
      }
    } else {
      resultMessage = getGameTranslation('wheel_lose', lang, { amount: formatMoney(amount) });
    }
    
    // Send result with a delay for anticipation
    setTimeout(() => {
      m.reply(`${wheelDisplay}\n\n${resultMessage}`);
    }, 1500);
    
    // Update user stats
    if (!user.wheel) {
      user.wheel = {
        wins: 0,
        losses: 0,
        total: 0,
        jackpots: 0
      };
    }
    
    if (winAmount > amount) {
      user.wheel.wins = (user.wheel.wins || 0) + 1;
      if (isJackpot) {
        user.wheel.jackpots = (user.wheel.jackpots || 0) + 1;
      }
    } else {
      user.wheel.losses = (user.wheel.losses || 0) + 1;
    }
    user.wheel.total = (user.wheel.total || 0) + 1;
    
  } catch (e) {
    console.error('Error in wheel game:', e);
    return m.reply('Error: ' + e.message);
  }
};

handler.help = ['wheel'];
handler.tags = ['game'];
handler.command = /^(wheel|fortune|wheeloffortune|glücksrad|gluecksrad|rad)$/i;
handler.group = true;
handler.register = true;

module.exports = handler;