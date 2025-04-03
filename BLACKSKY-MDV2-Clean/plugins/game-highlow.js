/**
 * Higher-Lower Card Game for WhatsApp Bot
 * Guess if the next card will be higher or lower than the current card
 */

const { randomInt, checkCooldown, formatMoney } = require('../lib/game-utils');
const { getGameTranslation } = require('../lib/game-translations');

let handler = async (m, { conn, args, usedPrefix, command }) => {
  try {
    // Get user data and language preference
    const user = global.db.data.users[m.sender];
    const lang = user?.language || 'en';
    
    // Default values for highlow game
    const MIN_BET = 100;
    const MAX_BET = 50000;
    const COOLDOWN = 5 * 1000; // 5 seconds
    
    // Check if user is on cooldown
    const cooldownInfo = checkCooldown(user, 'lasthighlow', COOLDOWN);
    if (cooldownInfo.onCooldown) {
      return m.reply(getGameTranslation('game_cooldown', lang, { 
        time: cooldownInfo.timeLeftSeconds + 's' 
      }));
    }
    
    // Check arguments - bet amount and prediction (higher/lower)
    if (args.length < 2) {
      return m.reply(`${getGameTranslation('highlow_usage', lang, { prefix: usedPrefix })}\n${getGameTranslation('game_balance', lang, { balance: formatMoney(user.money) })}`);
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
    
    // Validate and normalize prediction
    const validPredictions = {
      'higher': 'higher',
      'high': 'higher',
      'h': 'higher',
      'höher': 'higher', // German
      'hoch': 'higher',  // German
      
      'lower': 'lower',
      'low': 'lower',
      'l': 'lower',
      'niedriger': 'lower', // German
      'tiefer': 'lower',    // German
      'niedrig': 'lower'    // German
    };
    
    if (!validPredictions[prediction]) {
      return m.reply(getGameTranslation('highlow_invalid_prediction', lang));
    }
    
    // Normalize prediction
    prediction = validPredictions[prediction];
    
    // Send initial message
    await m.reply(getGameTranslation('highlow_drawing', lang));
    
    // Card definitions
    const suits = ['♠️', '♥️', '♦️', '♣️'];
    const values = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
    
    // Generate random cards
    const firstSuit = suits[randomInt(0, 3)];
    const firstValue = randomInt(0, 12);
    
    const nextSuit = suits[randomInt(0, 3)];
    const nextValue = randomInt(0, 12);
    
    // Create card strings
    const firstCard = `${firstSuit} ${values[firstValue]}`;
    const nextCard = `${nextSuit} ${values[nextValue]}`;
    
    // Show first card
    await m.reply(getGameTranslation('highlow_first_card', lang, { card: firstCard }));
    
    // Determine result
    let result;
    if (nextValue > firstValue) {
      result = 'higher';
    } else if (nextValue < firstValue) {
      result = 'lower';
    } else {
      result = 'tie';
    }
    
    // Check if player won
    const playerWon = prediction === result;
    
    // Format result message
    let resultDisplay = `┏━━━[ ⬆️⬇️ ${lang === 'de' ? 'HÖHER-TIEFER' : 'HIGHER-LOWER'} ⬆️⬇️ ]━━━┓\n┃\n`;
    resultDisplay += `┃   ${lang === 'de' ? 'Erste Karte' : 'First card'}: ${firstCard}\n`;
    resultDisplay += `┃   ${lang === 'de' ? 'Nächste Karte' : 'Next card'}: ${nextCard}\n`;
    resultDisplay += `┃   ${lang === 'de' ? 'Deine Vorhersage' : 'Your prediction'}: ${prediction}\n`;
    resultDisplay += `┃\n┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛`;
    
    // Calculate results
    let outcomeMessage;
    
    if (result === 'tie') {
      // Tie - return bet
      outcomeMessage = getGameTranslation('highlow_tie', lang);
    } else if (playerWon) {
      // Player wins (2x bet)
      user.money = (user.money - amount) + (amount * 2);
      outcomeMessage = getGameTranslation('highlow_win', lang, { amount: formatMoney(amount) });
    } else {
      // Player loses
      user.money -= amount;
      outcomeMessage = getGameTranslation('highlow_lose', lang, { amount: formatMoney(amount) });
    }
    
    // Send result with a delay for anticipation
    setTimeout(() => {
      m.reply(getGameTranslation('highlow_result', lang, {
        firstCard,
        nextCard,
        outcome: outcomeMessage
      }));
    }, 1500);
    
    // Update user stats
    if (!user.highlow) {
      user.highlow = {
        wins: 0,
        losses: 0,
        ties: 0,
        total: 0
      };
    }
    
    if (result === 'tie') {
      user.highlow.ties = (user.highlow.ties || 0) + 1;
    } else if (playerWon) {
      user.highlow.wins = (user.highlow.wins || 0) + 1;
    } else {
      user.highlow.losses = (user.highlow.losses || 0) + 1;
    }
    user.highlow.total = (user.highlow.total || 0) + 1;
    
  } catch (e) {
    console.error('Error in high-low game:', e);
    return m.reply('Error: ' + e.message);
  }
};

handler.help = ['highlow'];
handler.tags = ['game'];
handler.command = /^(highlow|hl|höher|hoeher|tiefer)$/i;
handler.group = true;
handler.register = true;

module.exports = handler;