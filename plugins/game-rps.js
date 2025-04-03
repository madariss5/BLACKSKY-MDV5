/**
 * Rock Paper Scissors Game for WhatsApp Bot
 * Play rock-paper-scissors against the bot
 */

const { randomInt, checkCooldown, formatMoney } = require('../lib/game-utils');
const { getGameTranslation } = require('../lib/game-translations');

let handler = async (m, { conn, args, usedPrefix, command }) => {
  try {
    // Get user data and language preference
    const user = global.db.data.users[m.sender];
    const lang = user?.language || 'en';
    
    // Default values for RPS game
    const MIN_BET = 100;
    const MAX_BET = 25000;
    const COOLDOWN = 5 * 1000; // 5 seconds
    
    // Check if user is on cooldown
    const cooldownInfo = checkCooldown(user, 'lastrps', COOLDOWN);
    if (cooldownInfo.onCooldown) {
      return m.reply(getGameTranslation('game_cooldown', lang, { 
        time: cooldownInfo.timeLeftSeconds + 's' 
      }));
    }
    
    // Check arguments - bet amount and choice
    if (args.length < 2) {
      return m.reply(`${getGameTranslation('rps_usage', lang, { prefix: usedPrefix })}\n${getGameTranslation('game_balance', lang, { balance: formatMoney(user.money) })}`);
    }
    
    let amount = parseInt(args[0]);
    let playerChoice = args[1].toLowerCase();
    
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
    
    // Validate and normalize player choice
    const choices = {
      // English options
      'rock': 'rock',
      'r': 'rock',
      'stone': 'rock',
      
      'paper': 'paper',
      'p': 'paper',
      
      'scissors': 'scissors',
      's': 'scissors',
      'scissor': 'scissors',
      
      // German options
      'stein': 'rock',
      'st': 'rock',
      
      'papier': 'paper',
      'p': 'paper',
      
      'schere': 'scissors',
      'sch': 'scissors'
    };
    
    if (!choices[playerChoice]) {
      return m.reply(getGameTranslation('rps_invalid_choice', lang));
    }
    
    // Normalize player choice
    playerChoice = choices[playerChoice];
    
    // Send initial message
    await m.reply(getGameTranslation('rps_thinking', lang));
    
    // Bot chooses randomly
    const options = ['rock', 'paper', 'scissors'];
    const botChoice = options[randomInt(0, 2)];
    
    // Determine winner
    let result;
    if (playerChoice === botChoice) {
      result = 'tie';
    } else if (
      (playerChoice === 'rock' && botChoice === 'scissors') ||
      (playerChoice === 'paper' && botChoice === 'rock') ||
      (playerChoice === 'scissors' && botChoice === 'paper')
    ) {
      result = 'win';
    } else {
      result = 'lose';
    }
    
    // Get choice emojis
    const emojis = {
      'rock': '🪨',
      'paper': '📄',
      'scissors': '✂️'
    };
    
    // Format the choices in user's language
    const getChoiceName = (choice, language) => {
      if (language === 'de') {
        const germanNames = {
          'rock': 'Stein',
          'paper': 'Papier',
          'scissors': 'Schere'
        };
        return germanNames[choice];
      }
      // Default to English
      return choice.charAt(0).toUpperCase() + choice.slice(1);
    };
    
    const playerChoiceName = getChoiceName(playerChoice, lang);
    const botChoiceName = getChoiceName(botChoice, lang);
    
    // Format result message
    let resultDisplay = `┏━━━[ ✂️ ${lang === 'de' ? 'SCHERE STEIN PAPIER' : 'ROCK PAPER SCISSORS'} 🪨 ]━━━┓\n┃\n`;
    resultDisplay += `┃   ${lang === 'de' ? 'Du' : 'You'}: ${emojis[playerChoice]} ${playerChoiceName}\n`;
    resultDisplay += `┃   ${lang === 'de' ? 'Bot' : 'Bot'}: ${emojis[botChoice]} ${botChoiceName}\n`;
    resultDisplay += `┃\n┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛`;
    
    // Calculate results
    let outcomeMessage;
    
    if (result === 'win') {
      // Player wins (2x bet)
      user.money = (user.money - amount) + (amount * 2);
      outcomeMessage = getGameTranslation('rps_win', lang, { amount: formatMoney(amount) });
    } else if (result === 'lose') {
      // Player loses
      user.money -= amount;
      outcomeMessage = getGameTranslation('rps_lose', lang, { amount: formatMoney(amount) });
    } else {
      // Tie - return bet
      outcomeMessage = getGameTranslation('rps_tie', lang);
    }
    
    // Send result with a delay for anticipation
    setTimeout(() => {
      m.reply(getGameTranslation('rps_result', lang, {
        playerChoice: playerChoiceName,
        botChoice: botChoiceName,
        outcome: outcomeMessage
      }));
    }, 1000);
    
    // Update user stats
    if (!user.rps) {
      user.rps = {
        wins: 0,
        losses: 0,
        ties: 0,
        total: 0
      };
    }
    
    if (result === 'win') {
      user.rps.wins = (user.rps.wins || 0) + 1;
    } else if (result === 'lose') {
      user.rps.losses = (user.rps.losses || 0) + 1;
    } else {
      user.rps.ties = (user.rps.ties || 0) + 1;
    }
    user.rps.total = (user.rps.total || 0) + 1;
    
  } catch (e) {
    console.error('Error in RPS game:', e);
    return m.reply('Error: ' + e.message);
  }
};

handler.help = ['rps'];
handler.tags = ['game'];
handler.command = /^(rps|rockpaperscissors|scissorspaperrock|schere|stein|papier)$/i;
handler.group = true;
handler.register = true;

module.exports = handler;