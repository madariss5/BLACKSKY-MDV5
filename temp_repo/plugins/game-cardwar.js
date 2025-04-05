/**
 * Card War Game for WhatsApp Bot
 * A simple card game where the highest card wins
 */

const { randomInt, checkCooldown, formatMoney } = require('../lib/game-utils');
const { getGameTranslation } = require('../lib/game-translations');

let handler = async (m, { conn, args, usedPrefix, command }) => {
  try {
    // Get user data and language preference
    const user = global.db.data.users[m.sender];
    const lang = user?.language || 'en';
    
    // Default values for card war game
    const MIN_BET = 100;
    const MAX_BET = 50000;
    const COOLDOWN = 5 * 1000; // 5 seconds
    
    // Check if user is on cooldown
    const cooldownInfo = checkCooldown(user, 'lastcardwar', COOLDOWN);
    if (cooldownInfo.onCooldown) {
      return m.reply(getGameTranslation('game_cooldown', lang, { 
        time: cooldownInfo.timeLeftSeconds + 's' 
      }));
    }
    
    // Check bet amount
    let amount = parseInt(args[0]);
    if (!amount || isNaN(amount)) {
      return m.reply(`${getGameTranslation('cardwar_usage', lang, { prefix: usedPrefix })}\n${getGameTranslation('game_balance', lang, { balance: formatMoney(user.money) })}`);
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
    await m.reply(getGameTranslation('cardwar_dealing', lang));
    
    // Card definitions
    const suits = ['♠️', '♥️', '♦️', '♣️'];
    const values = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
    
    // Generate random cards
    const playerSuit = suits[randomInt(0, 3)];
    const playerValue = randomInt(0, 12);
    
    const botSuit = suits[randomInt(0, 3)];
    const botValue = randomInt(0, 12);
    
    // Create card strings
    const playerCard = `${playerSuit} ${values[playerValue]}`;
    const botCard = `${botSuit} ${values[botValue]}`;
    
    // Determine winner (higher value wins)
    let result;
    if (playerValue > botValue) {
      result = 'win';
    } else if (playerValue < botValue) {
      result = 'lose';
    } else {
      result = 'tie';
    }
    
    // Format result message
    let resultDisplay = `┏━━━[ 🃏 ${lang === 'de' ? 'KARTENKRIEG' : 'CARD WAR'} 🃏 ]━━━┓\n┃\n`;
    resultDisplay += `┃   ${lang === 'de' ? 'Deine Karte' : 'Your card'}: ${playerCard}\n`;
    resultDisplay += `┃   ${lang === 'de' ? 'Bot-Karte' : 'Bot card'}: ${botCard}\n`;
    resultDisplay += `┃\n┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛`;
    
    // Calculate results
    let outcomeMessage;
    
    if (result === 'win') {
      // Player wins (2x bet)
      user.money = (user.money - amount) + (amount * 2);
      outcomeMessage = getGameTranslation('cardwar_win', lang, { amount: formatMoney(amount) });
    } else if (result === 'lose') {
      // Player loses
      user.money -= amount;
      outcomeMessage = getGameTranslation('cardwar_lose', lang, { amount: formatMoney(amount) });
    } else {
      // Tie - return bet
      outcomeMessage = getGameTranslation('cardwar_tie', lang);
    }
    
    // Send result with a delay for anticipation
    setTimeout(() => {
      m.reply(getGameTranslation('cardwar_result', lang, {
        playerCard,
        botCard,
        outcome: outcomeMessage
      }));
    }, 1000);
    
    // Update user stats
    if (!user.cardwar) {
      user.cardwar = {
        wins: 0,
        losses: 0,
        ties: 0,
        total: 0
      };
    }
    
    if (result === 'win') {
      user.cardwar.wins = (user.cardwar.wins || 0) + 1;
    } else if (result === 'lose') {
      user.cardwar.losses = (user.cardwar.losses || 0) + 1;
    } else {
      user.cardwar.ties = (user.cardwar.ties || 0) + 1;
    }
    user.cardwar.total = (user.cardwar.total || 0) + 1;
    
  } catch (e) {
    console.error('Error in card war game:', e);
    return m.reply('Error: ' + e.message);
  }
};

handler.help = ['cardwar'];
handler.tags = ['game'];
handler.command = /^(cardwar|war|kartenkrieg|karten)$/i;
handler.group = true;
handler.register = true;

module.exports = handler;