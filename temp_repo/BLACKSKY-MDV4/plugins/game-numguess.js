/**
 * Number Guessing Game for WhatsApp Bot
 * Guess a number between 1 and 100
 */

const { randomInt, checkCooldown, formatMoney } = require('../lib/game-utils');
const { getGameTranslation } = require('../lib/game-translations');

// Store active games
const activeGames = {};

let handler = async (m, { conn, args, usedPrefix, command }) => {
  try {
    // Get user data and language preference
    const user = global.db.data.users[m.sender];
    const lang = user?.language || 'en';
    
    // Default values for number guessing game
    const MIN_BET = 200;
    const MAX_BET = 20000;
    const COOLDOWN = 30 * 1000; // 30 seconds after game ends
    const MAX_GUESSES = 7; // Max guesses allowed
    
    // Check if user already has an active game
    if (activeGames[m.sender]) {
      const game = activeGames[m.sender];
      
      // If this is a guess
      const guess = parseInt(m.text);
      
      if (!isNaN(guess)) {
        // Validate guess
        if (guess < 1 || guess > 100) {
          return m.reply(getGameTranslation('numguess_invalid_guess', lang));
        }
        
        // Count this guess
        game.guesses++;
        game.guessedNumbers.push(guess);
        
        // Check if correct
        if (guess === game.number) {
          // Player won!
          const winAmount = Math.floor(game.bet * (1 + (game.maxGuesses - game.guesses + 1) * 0.2));
          user.money += winAmount;
          
          // Send win message
          const winMessage = getGameTranslation('numguess_win', lang, {
            number: game.number,
            amount: formatMoney(winAmount)
          });
          
          // Delete the game
          delete activeGames[m.sender];
          
          // Update user stats
          if (!user.numguess) {
            user.numguess = { wins: 0, losses: 0, total: 0 };
          }
          user.numguess.wins = (user.numguess.wins || 0) + 1;
          user.numguess.total = (user.numguess.total || 0) + 1;
          
          return m.reply(winMessage);
        }
        
        // Check if out of guesses
        if (game.guesses >= game.maxGuesses) {
          // Player lost
          const loseMessage = getGameTranslation('numguess_lose', lang, {
            number: game.number,
            amount: formatMoney(game.bet)
          });
          
          // Delete the game
          delete activeGames[m.sender];
          
          // Update user stats
          if (!user.numguess) {
            user.numguess = { wins: 0, losses: 0, total: 0 };
          }
          user.numguess.losses = (user.numguess.losses || 0) + 1;
          user.numguess.total = (user.numguess.total || 0) + 1;
          
          return m.reply(loseMessage);
        }
        
        // Give hint
        let hintMessage;
        if (guess < game.number) {
          hintMessage = getGameTranslation('numguess_higher', lang, { guess });
        } else {
          hintMessage = getGameTranslation('numguess_lower', lang, { guess });
        }
        
        // Show guesses left
        const guessesLeft = game.maxGuesses - game.guesses;
        const guessesMessage = getGameTranslation('numguess_guesses', lang, { guesses: guessesLeft });
        
        // Format guessed numbers
        const guessedNumbersFormatted = game.guessedNumbers.join(', ');
        
        return m.reply(`${hintMessage}\n${guessesMessage}\n${lang === 'de' ? 'Geratene Zahlen' : 'Guessed numbers'}: ${guessedNumbersFormatted}`);
      }
      
      // If not a number guess, show game status
      const guessesLeft = game.maxGuesses - game.guesses;
      const guessesMessage = getGameTranslation('numguess_guesses', lang, { guesses: guessesLeft });
      const guessedNumbersFormatted = game.guessedNumbers.length > 0 ? game.guessedNumbers.join(', ') : (lang === 'de' ? 'Keine' : 'None');
      
      return m.reply(`${guessesMessage}\n${lang === 'de' ? 'Geratene Zahlen' : 'Guessed numbers'}: ${guessedNumbersFormatted}`);
    }
    
    // Not a continuation of a game, so must be starting a new game
    
    // Check if user is on cooldown
    const cooldownInfo = checkCooldown(user, 'lastnumguess', COOLDOWN);
    if (cooldownInfo.onCooldown) {
      return m.reply(getGameTranslation('game_cooldown', lang, { 
        time: cooldownInfo.timeLeftSeconds + 's' 
      }));
    }
    
    // Check bet amount
    let amount = parseInt(args[0]);
    if (!amount || isNaN(amount)) {
      return m.reply(`${getGameTranslation('numguess_usage', lang, { prefix: usedPrefix })}\n${getGameTranslation('game_balance', lang, { balance: formatMoney(user.money) })}`);
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
    
    // Deduct the bet
    user.money -= amount;
    
    // Create a new game
    const number = randomInt(1, 100);
    activeGames[m.sender] = {
      number,
      bet: amount,
      guesses: 0,
      guessedNumbers: [],
      maxGuesses: MAX_GUESSES,
      startTime: Date.now()
    };
    
    // Set cooldown when game starts (will be updated when game ends)
    user.lastnumguess = Date.now();
    
    // Send initial message
    const startMessage = getGameTranslation('numguess_start', lang);
    const guessesMessage = getGameTranslation('numguess_guesses', lang, { guesses: MAX_GUESSES });
    
    return m.reply(`${startMessage}\n${guessesMessage}\n${lang === 'de' ? 'Rate eine Zahl zwischen 1 und 100' : 'Guess a number between 1 and 100'}!`);
    
  } catch (e) {
    console.error('Error in number guess game:', e);
    return m.reply('Error: ' + e.message);
  }
};

handler.help = ['numguess'];
handler.tags = ['game'];
handler.command = /^(numguess|numberguess|zahlenraten|ratenumber|numbergame|zahlspiel)$/i;
handler.group = true;
handler.register = true;

// Also handle number inputs for active games
handler.before = async (m, { conn }) => {
  if (m.isBaileys || !m.text) return false;
  
  // Check if this is a number and the player has an active game
  const guess = parseInt(m.text);
  if (!isNaN(guess) && activeGames[m.sender]) {
    // This is a valid guess for an active game
    await handler(m, { conn, args: [], usedPrefix: '', command: 'numguess' });
    return true; // Handled
  }
  
  return false; // Not handled
};

module.exports = handler;