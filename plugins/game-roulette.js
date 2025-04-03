/**
 * Roulette Game for WhatsApp Bot
 * Bet on numbers, colors or odds/evens
 */

const { randomInt, checkCooldown, formatMoney } = require('../lib/game-utils');
const { getGameTranslation } = require('../lib/game-translations');

let handler = async (m, { conn, args, usedPrefix, command }) => {
  try {
    // Get user data and language preference
    const user = global.db.data.users[m.sender];
    const lang = user?.language || 'en';
    
    // Default values for roulette game
    const MIN_BET = 100;
    const MAX_BET = 50000;
    const COOLDOWN = 10 * 1000; // 10 seconds
    
    // Check if user is on cooldown
    const cooldownInfo = checkCooldown(user, 'lastroulette', COOLDOWN);
    if (cooldownInfo.onCooldown) {
      return m.reply(getGameTranslation('game_cooldown', lang, { 
        time: cooldownInfo.timeLeftSeconds + 's' 
      }));
    }
    
    // Check arguments - bet amount and prediction
    if (args.length < 2) {
      return m.reply(`${getGameTranslation('roulette_usage', lang, { prefix: usedPrefix })}\n${getGameTranslation('game_balance', lang, { balance: formatMoney(user.money) })}`);
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
    
    // Deduct bet
    user.money -= amount;
    
    // Send initial message
    await m.reply(getGameTranslation('roulette_spinning', lang));
    
    // Define roulette wheel
    const wheel = [
      { number: 0, color: 'green' },
      { number: 32, color: 'red' }, { number: 15, color: 'black' }, { number: 19, color: 'red' }, { number: 4, color: 'black' },
      { number: 21, color: 'red' }, { number: 2, color: 'black' }, { number: 25, color: 'red' }, { number: 17, color: 'black' },
      { number: 34, color: 'red' }, { number: 6, color: 'black' }, { number: 27, color: 'red' }, { number: 13, color: 'black' },
      { number: 36, color: 'red' }, { number: 11, color: 'black' }, { number: 30, color: 'red' }, { number: 8, color: 'black' },
      { number: 23, color: 'red' }, { number: 10, color: 'black' }, { number: 5, color: 'red' }, { number: 24, color: 'black' },
      { number: 16, color: 'red' }, { number: 33, color: 'black' }, { number: 1, color: 'red' }, { number: 20, color: 'black' },
      { number: 14, color: 'red' }, { number: 31, color: 'black' }, { number: 9, color: 'red' }, { number: 22, color: 'black' },
      { number: 18, color: 'red' }, { number: 29, color: 'black' }, { number: 7, color: 'red' }, { number: 28, color: 'black' },
      { number: 12, color: 'red' }, { number: 35, color: 'black' }, { number: 3, color: 'red' }, { number: 26, color: 'black' }
    ];
    
    // Spin the wheel
    const result = wheel[randomInt(0, wheel.length - 1)];
    
    // Get color emoji
    const colorEmoji = {
      'red': '🔴',
      'black': '⚫',
      'green': '🟢'
    };
    
    // Normalize prediction
    let betType = '';
    let multiplier = 0;
    
    // Check number bet (0-36)
    if (!isNaN(prediction) && parseInt(prediction) >= 0 && parseInt(prediction) <= 36) {
      betType = 'number';
      prediction = parseInt(prediction);
      multiplier = 35; // 35x payout for exact number
    } 
    // Check color bet (red/black)
    else if (prediction === 'red' || prediction === 'rot' || prediction === 'r') {
      betType = 'color';
      prediction = 'red';
      multiplier = 2; // 2x payout for correct color
    } 
    else if (prediction === 'black' || prediction === 'schwarz' || prediction === 'b') {
      betType = 'color';
      prediction = 'black';
      multiplier = 2; // 2x payout for correct color
    }
    // Check even/odd bet
    else if (prediction === 'even' || prediction === 'gerade' || prediction === 'e') {
      betType = 'parity';
      prediction = 'even';
      multiplier = 2; // 2x payout for correct parity
    }
    else if (prediction === 'odd' || prediction === 'ungerade' || prediction === 'o') {
      betType = 'parity';
      prediction = 'odd';
      multiplier = 2; // 2x payout for correct parity
    }
    else {
      // Invalid prediction
      // Refund bet
      user.money += amount;
      return m.reply(getGameTranslation('roulette_invalid_prediction', lang));
    }
    
    // Determine if player won
    let playerWon = false;
    
    if (betType === 'number') {
      playerWon = result.number === prediction;
    } 
    else if (betType === 'color') {
      playerWon = result.color === prediction;
    }
    else if (betType === 'parity') {
      // 0 is neither even nor odd in roulette rules
      if (result.number === 0) {
        playerWon = false;
      } else {
        const isEven = result.number % 2 === 0;
        playerWon = (prediction === 'even' && isEven) || (prediction === 'odd' && !isEven);
      }
    }
    
    // Format winning number display
    const numberDisplay = result.number.toString().padStart(2, '0');
    const colorDisplay = colorEmoji[result.color];
    
    // Format roulette display
    const wheelSegment = `${colorDisplay} ${numberDisplay} ${colorDisplay}`;
    let rouletteDisplay = `┏━━━[ 🎡 ${lang === 'de' ? 'ROULETTE' : 'ROULETTE'} 🎡 ]━━━┓\n┃\n`;
    
    // Create visually appealing wheel display
    rouletteDisplay += `┃   ┌───┬───┬───┐  \n`;
    rouletteDisplay += `┃   │ ${wheel[(result.number + 1) % wheel.length].number.toString().padStart(2, '0')} │ ${wheel[(result.number + 2) % wheel.length].number.toString().padStart(2, '0')} │ ${wheel[(result.number + 3) % wheel.length].number.toString().padStart(2, '0')} │  \n`;
    rouletteDisplay += `┃   ├───┼───┼───┤  \n`;
    rouletteDisplay += `┃ ➡️ │ ${wheelSegment} │ ⬅️\n`;
    rouletteDisplay += `┃   ├───┼───┼───┤  \n`;
    rouletteDisplay += `┃   │ ${wheel[(result.number - 1 + wheel.length) % wheel.length].number.toString().padStart(2, '0')} │ ${wheel[(result.number - 2 + wheel.length) % wheel.length].number.toString().padStart(2, '0')} │ ${wheel[(result.number - 3 + wheel.length) % wheel.length].number.toString().padStart(2, '0')} │  \n`;
    rouletteDisplay += `┃   └───┴───┴───┘  \n`;
    
    // Add bet information
    let betDisplay;
    if (betType === 'number') {
      betDisplay = `${lang === 'de' ? 'Zahl' : 'Number'}: ${prediction}`;
    } else if (betType === 'color') {
      const colorName = prediction === 'red' ? (lang === 'de' ? 'Rot' : 'Red') : (lang === 'de' ? 'Schwarz' : 'Black');
      const emoji = prediction === 'red' ? '🔴' : '⚫';
      betDisplay = `${lang === 'de' ? 'Farbe' : 'Color'}: ${colorName} ${emoji}`;
    } else {
      const parityName = prediction === 'even' ? (lang === 'de' ? 'Gerade' : 'Even') : (lang === 'de' ? 'Ungerade' : 'Odd');
      betDisplay = `${lang === 'de' ? 'Parität' : 'Parity'}: ${parityName}`;
    }
    
    rouletteDisplay += `┃   ${lang === 'de' ? 'Dein Einsatz' : 'Your bet'}: ${betDisplay}\n`;
    rouletteDisplay += `┃\n┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛`;
    
    // Calculate winnings
    const winAmount = playerWon ? amount * multiplier : 0;
    
    // Update user's money if they won
    if (playerWon) {
      user.money += winAmount;
    }
    
    // Prepare result message
    let resultMessage;
    
    if (playerWon) {
      resultMessage = getGameTranslation('roulette_win', lang, { amount: formatMoney(winAmount - amount) });
    } else {
      resultMessage = getGameTranslation('roulette_lose', lang, { amount: formatMoney(amount) });
    }
    
    // Send result with a delay for anticipation
    setTimeout(() => {
      m.reply(getGameTranslation('roulette_result', lang, {
        number: numberDisplay,
        color: colorEmoji[result.color],
        outcome: resultMessage
      }));
      
      // Send the visual display separately
      m.reply(rouletteDisplay);
    }, 2000);
    
    // Update user stats
    if (!user.roulette) {
      user.roulette = {
        wins: 0,
        losses: 0,
        total: 0
      };
    }
    
    if (playerWon) {
      user.roulette.wins = (user.roulette.wins || 0) + 1;
    } else {
      user.roulette.losses = (user.roulette.losses || 0) + 1;
    }
    user.roulette.total = (user.roulette.total || 0) + 1;
    
  } catch (e) {
    console.error('Error in roulette game:', e);
    return m.reply('Error: ' + e.message);
  }
};

handler.help = ['roulette'];
handler.tags = ['game'];
handler.command = /^(roulette|roulete|ruleta|rulette)$/i;
handler.group = true;
handler.register = true;

module.exports = handler;